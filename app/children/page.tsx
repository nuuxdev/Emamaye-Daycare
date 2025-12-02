"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TAgeGroup } from "@/convex/types/children";
import { Fragment, JSX, useEffect, useState } from "react";
import GlassHeader from "@/components/GlassHeader";
import SearchPill from "@/components/SearchPill";
import { parseDate } from "@internationalized/date";
import { calculateAge } from "@/utils/calculateAge";

const ageGroupsTabs: (TAgeGroup | "all")[] = [
  "all",
  "infant",
  "toddler",
  "preschooler",
];

const ageGroupIcons: Record<TAgeGroup, JSX.Element> = {
  infant: <i className="hgi hgi-stroke hgi-baby-bottle"></i>,
  toddler: <i className="hgi hgi-stroke hgi-rubber-duck"></i>,
  preschooler: <i className="hgi hgi-stroke hgi-puzzle"></i>,
};

export default function ChildrenList() {
  const children = useQuery(api.children.getChildrenWithPrimaryGuardian);
  const [filteredChildren, setFilteredChildren] = useState(children);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);

  const [tab, setTab] = useState<TAgeGroup | "all">("all");
  useEffect(() => {
    let result = children;

    // Filter by age group
    if (tab !== "all") {
      result = result?.filter((child) => child.ageGroup === tab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = result?.filter((child) =>
        child.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredChildren(result);
  }, [tab, children, searchQuery]);

  return (
    <>
      <GlassHeader
        title="Children"
        backHref="/"
        isCompact={searchExpanded}
        action={<SearchPill onSearch={setSearchQuery} onExpandChange={setSearchExpanded} />}
      />
      <main style={{ justifyContent: "start", maxWidth: "570px", marginInline: "auto" }}>
        <div style={{ marginInline: "auto", display: "flex", gap: "1rem", width: "100%", overflowX: "auto", paddingBlock: "1rem" }}>
          {ageGroupsTabs.map((ageGroupTab) => (
            <button
              key={ageGroupTab}
              disabled={tab === ageGroupTab}
              onClick={() => setTab(ageGroupTab)}
              className={`secondary ${ageGroupTab}`}
              style={{ textTransform: "capitalize", padding: "0.5rem 1rem"}}
            >
              {ageGroupTab !== "all" ? ageGroupIcons[ageGroupTab] : ""}
              {ageGroupTab}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gap: "0.5rem", width: "100%", paddingInline: "1rem" }}>
          {children === undefined && <p>Loading...</p>}
          {filteredChildren?.map((child) => (
            <Fragment key={child._id}>
              <details style={{ width: "100%" }}>
                <summary
                  style={{ display: "flex", gap: "1rem", alignItems: "start" }}
                >
                  <Link
                    href={`/children/${child._id}`}
                    style={{
                      width: "5rem",
                      aspectRatio: "1/1",

                      position: "relative",
                    }}
                  >
                    <img
                      src={child.avatar}
                      alt="child avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                    <span
                      className={child.ageGroup}
                      style={{
                        position: "absolute",
                        bottom: "0",
                        right: "-0.5rem",
                        width: "2rem",
                        height: "2rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "100vw"
                      }}
                    >
                      {ageGroupIcons[child.ageGroup]}
                    </span>
                  </Link>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: "inherit", margin: 0 }}>{child.fullName}</h4>
                      <p>{child.gender}</p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "end",
                      }}
                    >
                      <p>{calculateAge(parseDate(child.dateOfBirth))?.age}</p>
                    </div>
                  </div>
                </summary>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1.25rem 1.25rem 2rem 1.25rem",
                  }}
                >
                  <Link
                    href={`tel:${child.primaryGuardianPhoneNumber}`}
                    className="glass-pill with-icon"
                    style={{ color: "var(--success-color)" }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 16.92V19.92C22.0011 20.1986 21.9441 20.4742 21.8325 20.7294C21.7209 20.9846 21.5573 21.2137 21.3521 21.4019C21.1468 21.5901 20.9046 21.7336 20.6407 21.8228C20.3769 21.912 20.0974 21.9449 19.82 21.92C16.7428 21.5857 13.787 20.5342 11.19 18.85C8.77382 17.2436 6.72159 15.161 5.15 12.71C3.49656 10.1537 2.46937 7.24076 2.14 4.18C2.11516 3.90272 2.14802 3.62335 2.23715 3.35957C2.32629 3.0958 2.46974 2.85367 2.65785 2.64846C2.84596 2.44325 3.07455 2.27967 3.32968 2.16812C3.58482 2.05657 3.86045 1.99958 4.139 2H7.139C7.62344 1.99596 8.0924 2.16912 8.45265 2.48496C8.8129 2.8008 9.03841 3.23661 9.085 3.72C9.17147 4.62686 9.38927 5.51794 9.73 6.36C9.86596 6.69956 9.8967 7.07452 9.81845 7.43226C9.74021 7.79 9.55689 8.11306 9.294 8.356L7.52 10.13C9.51347 13.6338 12.3662 16.4865 15.87 18.48L17.644 16.706C17.8869 16.4431 18.21 16.2598 18.5677 16.1816C18.9255 16.1033 19.3004 16.134 19.64 16.27C20.4821 16.6107 21.3731 16.8285 22.28 16.915C22.7686 16.9622 23.2081 17.1923 23.524 17.5574C23.8398 17.9225 24.0084 18.3957 24 18.88V16.92Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {child.primaryGuardianFullName?.split(" ")[0]}
                  </Link>
                  <Link
                    href={`/children/${child._id}`}
                    className="glass-pill with-icon"
                    style={{ color: "var(--info-color)" }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M12 16V12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 8H12.01"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    info
                  </Link>
                </div>
              </details>
              <hr />
            </Fragment>
          ))}
          {filteredChildren?.length === 0 && <p>No children found</p>}
        </div>
      </main>
    </>
  );
}
