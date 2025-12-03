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

const ageGroupsTabs: (TAgeGroup | "all children")[] = [
  "all children",
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

  const [tab, setTab] = useState<TAgeGroup | "all children">("all children");
  useEffect(() => {
    let result = children;

    // Filter by age group
    if (tab !== "all children") {
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
        <div style={{ marginInline: "auto", display: "flex", width: "100%", overflowX: "auto", paddingBlock: "1rem" }}>
          {ageGroupsTabs.map((ageGroupTab) => (
            <button
              key={ageGroupTab}
              disabled={tab === ageGroupTab}
              onClick={() => setTab(ageGroupTab)}
              className={`tabs secondary ${ageGroupTab}`}
            >
              {ageGroupTab !== "all children" ? ageGroupIcons[ageGroupTab] : ""}
              <span style={{ textWrap: "nowrap" }}>{ageGroupTab}</span>
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
                        borderRadius: "100vw",
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
                      <h4 style={{ fontSize: "inherit", margin: 0, textTransform: "capitalize" }}>{child.fullName}</h4>
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
                    <i className="hgi hgi-stroke hgi-call"></i>
                    {child.primaryGuardianFullName?.split(" ")[0]}
                  </Link>
                  <Link
                    href={`/children/${child._id}`}
                    className="glass-pill with-icon"
                    style={{ color: "var(--info-color)" }}
                  >
                    <i className="hgi hgi-stroke hgi-information-circle"></i>
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
