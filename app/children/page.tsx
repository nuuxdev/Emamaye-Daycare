"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TAgeGroup } from "@/convex/types/children";
import { Fragment, JSX, useEffect, useRef, useState } from "react";
import GlassHeader from "@/components/GlassHeader";
import SearchPill from "@/components/SearchPill";
import { parseDate } from "@internationalized/date";
import { calculateAge } from "@/utils/calculateAge";
import { CallIcon, DeactivatedChildIcon, InfantIcon, InfoIcon, PreschoolerIcon, SortIcon, SwapIcon, ToddlerIcon } from "@/components/Icons";
import { ServerAvatar } from "@/app/components/ServerAvatar";

const ageGroupsTabs: (TAgeGroup | "all children" | "inactive")[] = [
  "all children",
  "infant",
  "toddler",
  "preschooler",
  "inactive",
];

const ageGroupAmh: Record<TAgeGroup | "all children" | "inactive", string> = {
  "all children": "ሁሉም ልጆቼ",
  infant: "ጨቅላ",
  toddler: "ህፃን",
  preschooler: "ታዳጊ",
  inactive: "የለቀቁ",
};

const ageGroupIcons: Record<TAgeGroup, JSX.Element> = {
  infant: <InfantIcon />,
  toddler: <ToddlerIcon />,
  preschooler: <PreschoolerIcon />,
};

type SortKey =
  | "reg"
  | "name"
  | "age"
  | "sex"
  | "birthdate";

const DEFAULT_SORT: SortKey = "reg";
const DEFAULT_ORDER: "asc" | "desc" = "asc";

const sortOptions: { value: SortKey; label: string; hasOrder: boolean }[] = [
  { value: "reg", label: "ምዝገባ", hasOrder: true },
  { value: "name", label: "ስም", hasOrder: true },
  { value: "age", label: "ዕድሜ", hasOrder: true },
  { value: "sex", label: "ፆታ", hasOrder: true },
  { value: "birthdate", label: "ልደት", hasOrder: false },
];

function sortChildren(
  children: any[],
  sortKey: SortKey,
  sortOrder: "asc" | "desc"
): any[] {
  const sorted = [...children];
  switch (sortKey) {
    case "reg":
      return sorted.sort((a, b) =>
        sortOrder === "desc"
          ? (b._creationTime ?? 0) - (a._creationTime ?? 0)
          : (a._creationTime ?? 0) - (b._creationTime ?? 0)
      );
    case "name":
      return sorted.sort((a, b) => {
        const nameA = a.fullNameAmh || a.fullName;
        const nameB = b.fullNameAmh || b.fullName;
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    case "age":
      return sorted.sort((a, b) => {
        const timeA = new Date(a.dateOfBirth).getTime();
        const timeB = new Date(b.dateOfBirth).getTime();
        return sortOrder === "asc"
          ? timeB - timeA // Ascending age = older birthdate (smaller time) first? No, younger first is asc age.
          : timeA - timeB; // Descending age = older first.
        // wait: age-asc (younger first) means birthdate is closer to today (larger time)
        // new Date("2020").getTime() > new Date("2010").getTime()
        // age-asc: larger time first.
      });
    case "sex":
      return sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.gender.localeCompare(b.gender)
          : b.gender.localeCompare(a.gender)
      );
    case "birthdate": {
      const today = new Date();
      const nextBirthday = (dob: string) => {
        const d = new Date(dob);
        const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
        if (next < today) next.setFullYear(today.getFullYear() + 1);
        return next.getTime() - today.getTime();
      };
      return sorted.sort((a, b) => nextBirthday(a.dateOfBirth) - nextBirthday(b.dateOfBirth));
    }
    default:
      return sorted;
  }
}

export default function ChildrenList() {
  const [tab, setTab] = useState<TAgeGroup | "all children" | "inactive">("all children");
  const [sortKey, setSortKey] = useState<SortKey>(DEFAULT_SORT);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(DEFAULT_ORDER);
  const sortDialogRef = useRef<HTMLDialogElement>(null);

  const activeChildren = useQuery(api.children.getChildrenWithPrimaryGuardian, { isActive: true });
  const inactiveChildren = useQuery(api.children.getChildrenWithPrimaryGuardian, { isActive: false });
  const children = tab === "inactive" ? inactiveChildren : activeChildren;

  const [filteredChildren, setFilteredChildren] = useState(children);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [counts, setCounts] = useState<{ [key in TAgeGroup | "all children" | "inactive"]: number }>({
    "all children": 0,
    infant: 0,
    toddler: 0,
    preschooler: 0,
    inactive: 0,
  });

  useEffect(() => {
    let result = children;
    let initCounts: { [key in TAgeGroup | "all children" | "inactive"]: number } = {
      "all children": activeChildren?.length || 0,
      infant: activeChildren?.filter((child) => child.ageGroup === "infant")?.length || 0,
      toddler: activeChildren?.filter((child) => child.ageGroup === "toddler")?.length || 0,
      preschooler: activeChildren?.filter((child) => child.ageGroup === "preschooler")?.length || 0,
      inactive: inactiveChildren?.length || 0,
    }

    // Filter by age group
    if (tab !== "all children" && tab !== "inactive") {
      result = result?.filter((child) => child.ageGroup === tab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = result?.filter((child) =>
        child.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.fullNameAmh?.includes(searchQuery)
      );
    }

    // Sort
    if (result) result = sortChildren(result, sortKey, sortOrder);

    setCounts(initCounts);
    setFilteredChildren(result);
  }, [tab, activeChildren, inactiveChildren, children, searchQuery, sortKey, sortOrder]);

  const handleSort = (key: SortKey | "asc" | "desc") => {
    if (key === "asc" || key === "desc") {
      setSortOrder(key);
    } else {
      setSortKey(key);
    }
    sortDialogRef.current?.close();
  };

  return (
    <>
      <GlassHeader
        title="ልጆቼ"
        backHref="/"
        isCompact={searchExpanded}
        action={<SearchPill onSearch={setSearchQuery} onExpandChange={setSearchExpanded} />}
      />
      <main style={{ justifyContent: "start", maxWidth: "610px", marginInline: "auto" }}>
        {/* Sort button + scrollable filter tabs */}
        <div style={{ marginInline: "auto", display: "flex", width: "100%", alignItems: "center" }}>
          {/* Sort button — sits outside the scroll area */}
          <button
            onClick={() => sortDialogRef.current?.showModal()}
            className="glass-pill"
            title="Sort"
            style={{
              flexShrink: 0,
              // marginBlock: "1rem",
              marginInline: "0.5rem",
              color: (sortKey !== DEFAULT_SORT || sortOrder !== DEFAULT_ORDER) ? "var(--primary-color)" : undefined,
            }}
          >
            <SortIcon />
          </button>

          {/* Scrollable filter tabs — same style as before */}
          <div style={{ marginInline: "auto", display: "flex", overflowX: "auto", paddingBlock: "1rem" }}>
            {ageGroupsTabs.map((ageGroupTab) => (
              <button
                key={ageGroupTab}
                disabled={tab === ageGroupTab}
                onClick={() => setTab(ageGroupTab)}
                className={`tabs secondary ${ageGroupTab}`}
              >
                {ageGroupTab === "inactive" ? (
                  <DeactivatedChildIcon />
                ) : ageGroupTab !== "all children" ? (
                  ageGroupIcons[ageGroupTab]
                ) : (
                  ""
                )}
                <span style={{ textWrap: "nowrap" }}>{ageGroupAmh[ageGroupTab]}</span>
                {counts[ageGroupTab]}
              </button>
            ))}
          </div>
        </div>

        {/* Sort dialog */}
        <dialog ref={sortDialogRef}>
          <h3 className="dialog-title">ደርድር</h3>

          {/* Direction Toggle Group */}
          <div style={{ display: "flex", justifyContent: "center", padding: "0.5rem 1rem", borderBottom: "1px solid var(--glass-border)" }}>
            <button
              onClick={() => handleSort("asc")}
              className="tabs secondary"
              style={{
                flex: 1,
                justifyContent: "center",
                color: sortOrder === "asc" ? "var(--primary-color)" : "inherit",
              }}
            >
              <SwapIcon direction="up" />
              {/* <span>ቀዳሚ</span> */}
            </button>
            <button
              onClick={() => handleSort("desc")}
              className="tabs secondary"
              style={{
                flex: 1,
                justifyContent: "center",
                color: sortOrder === "desc" ? "var(--primary-color)" : "inherit",
              }}
            >
              <SwapIcon direction="down" />
              {/* <span>ሰቃይ</span> */}
            </button>
          </div>

          <div className="select-list" style={{ margin: 0, paddingRight: 0 }}>
            {sortOptions.map((option) => (
              <Fragment key={option.value}>
                <div
                  className={`select-option ${sortKey === option.value ? "active" : ""}`}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBlock: "0.25rem" }}
                  onClick={() => handleSort(option.value)}
                >
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, cursor: "pointer", paddingBlock: "0.5rem" }}>
                    <input
                      type="radio"
                      name="sort-option"
                      value={option.value}
                      checked={sortKey === option.value}
                      readOnly
                    />
                    <span>{option.label}</span>
                  </label>
                </div>
              </Fragment>
            ))}
          </div>
        </dialog>

        <div style={{ display: "grid", gap: "0.5rem", width: "100%", paddingInline: "1rem" }}>
          {children === undefined && <p>Loading...</p>}
          {filteredChildren?.map((child) => (
            <Fragment key={child._id}>
              <details style={{ width: "100%", cursor: "pointer" }} name="children-list-item">
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
                    <ServerAvatar
                      src={child.avatar}
                      alt="child avatar"
                      style={{
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
                      {child.isActive ? ageGroupIcons[child.ageGroup as TAgeGroup] : <DeactivatedChildIcon />}
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
                      <h4 style={{ fontSize: "inherit", margin: 0, textTransform: "capitalize" }}>{child.fullNameAmh || child.fullName}</h4>
                      <p>{child.gender === "male" ? "ወንድ" : "ሴት"}</p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "end",
                      }}
                    >
                      <p dangerouslySetInnerHTML={{ __html: calculateAge(parseDate(child.dateOfBirth))?.ageShort || calculateAge(parseDate(child.dateOfBirth))?.age || "" }} />
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
                    <CallIcon />
                    {(child.primaryGuardianFullNameAmh || child.primaryGuardianFullName)?.split(" ")[0]}
                  </Link>
                  <Link
                    href={`/children/${child._id}`}
                    className="glass-pill with-icon"
                    style={{ color: "var(--info-color)" }}
                  >
                    <InfoIcon />
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
