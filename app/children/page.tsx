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
import { CallIcon, DeactivatedChildIcon, InfantIcon, InfoIcon, PreschoolerIcon, SortIcon, ToddlerIcon } from "@/components/Icons";
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
  | "reg-desc"
  | "reg-asc"
  | "name-az"
  | "name-za"
  | "age-asc"
  | "age-desc"
  | "sex-mf"
  | "sex-fm"
  | "birthdate";

const DEFAULT_SORT: SortKey = "reg-desc";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "reg-desc", label: "ምዝገባ ↓ (አዲስ መጀመሪያ)" },
  { value: "reg-asc", label: "ምዝገባ ↑ (ቀዳሚ መጀመሪያ)" },
  { value: "name-az", label: "ስም ሀ–ፐ  (A → Z)" },
  { value: "name-za", label: "ስም ፐ–ሀ  (Z → A)" },
  { value: "age-asc", label: "ዕድሜ ↑ (ታናሽ መጀመሪያ)" },
  { value: "age-desc", label: "ዕድሜ ↓ (ትልቅ መጀመሪያ)" },
  { value: "sex-mf", label: "ፆታ ወ → ሴ  (M → F)" },
  { value: "sex-fm", label: "ፆታ ሴ → ወ  (F → M)" },
  { value: "birthdate", label: "ልደት (ቅርብ ቀን መጀመሪያ)" },
];

function sortChildren(
  children: any[],
  sortKey: SortKey
): any[] {
  const sorted = [...children];
  switch (sortKey) {
    case "reg-desc":
      return sorted.sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0));
    case "reg-asc":
      return sorted.sort((a, b) => (a._creationTime ?? 0) - (b._creationTime ?? 0));
    case "name-az":
      return sorted.sort((a, b) =>
        (a.fullNameAmh || a.fullName).localeCompare(b.fullNameAmh || b.fullName)
      );
    case "name-za":
      return sorted.sort((a, b) =>
        (b.fullNameAmh || b.fullName).localeCompare(a.fullNameAmh || a.fullName)
      );
    case "age-asc":
      return sorted.sort(
        (a, b) => new Date(b.dateOfBirth).getTime() - new Date(a.dateOfBirth).getTime()
      );
    case "age-desc":
      return sorted.sort(
        (a, b) => new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime()
      );
    case "sex-mf":
      return sorted.sort((a, b) => a.gender.localeCompare(b.gender));
    case "sex-fm":
      return sorted.sort((a, b) => b.gender.localeCompare(a.gender));
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
    if (result) result = sortChildren(result, sortKey);

    setCounts(initCounts);
    setFilteredChildren(result);
  }, [tab, activeChildren, inactiveChildren, children, searchQuery, sortKey]);

  const handleSort = (key: SortKey) => {
    setSortKey(key);
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
              color: sortKey !== DEFAULT_SORT ? "var(--primary-color)" : undefined,
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
          <div className="select-list">
            {sortOptions.map((option, index) => (
              <Fragment key={option.value}>
                <label
                  className="select-option"
                  onClick={() => handleSort(option.value)}
                >
                  <input
                    type="radio"
                    name="sort-option"
                    value={option.value}
                    checked={sortKey === option.value}
                    readOnly
                  />
                  <span>{option.label}</span>
                </label>
                {index < sortOptions.length - 1 && <hr />}
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
