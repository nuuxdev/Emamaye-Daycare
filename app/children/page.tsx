"use client";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TAgeGroup } from "@/convex/types/children";
import { Fragment, JSX, useCallback, useEffect, useRef, useState } from "react";
import GlassHeader from "@/components/GlassHeader";
import SearchPill from "@/components/SearchPill";
import { parseDate } from "@internationalized/date";
import { calculateAge, useAge } from "@/utils/calculateAge";
import { CallIcon, DeactivatedChildIcon, InfantIcon, InfoIcon, PreschoolerIcon, SortIcon, SwapIcon, ToddlerIcon } from "@/components/Icons";
import { ServerAvatar } from "@/app/components/ServerAvatar";
import { useLanguage } from "@/context/LanguageContext";

const ageGroupsTabs: (TAgeGroup | "all children" | "inactive")[] = [
  "all children",
  "infant",
  "toddler",
  "preschooler",
  "inactive",
];

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

function sortChildren(
  children: any[],
  sortKey: SortKey,
  sortOrder: "asc" | "desc"
): any[] {
  const sorted = [...children];
  switch (sortKey) {
    case "reg":
      return sorted.sort((a, b) =>
        sortOrder === "asc"
          ? (b._creationTime ?? 0) - (a._creationTime ?? 0)
          : (a._creationTime ?? 0) - (b._creationTime ?? 0)
      );
    case "name":
      return sorted.sort((a, b) => {
        const nameA = a.fullName;
        const nameB = b.fullName;
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB, "en", { sensitivity: "base" })
          : nameB.localeCompare(nameA, "en", { sensitivity: "base" });
      });
    case "age":
      return sorted.sort((a, b) => {
        const timeA = new Date(a.dateOfBirth).getTime();
        const timeB = new Date(b.dateOfBirth).getTime();
        return sortOrder === "asc"
          ? timeB - timeA
          : timeA - timeB;
      });
    case "sex":
      return sorted.sort((a, b) =>
        sortOrder === "asc"
          ? b.gender.localeCompare(a.gender)
          : a.gender.localeCompare(b.gender)
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
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateQueryParams = useCallback((updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) newParams.delete(key);
      else newParams.set(key, value);
    });
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const tab = (searchParams.get("tab") as TAgeGroup | "all children" | "inactive") || "all children";
  const sortKey = (searchParams.get("sortKey") as SortKey | null) || "reg";
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc" | null) || "desc";
  const searchQuery = searchParams.get("searchQuery") || "";

  const setTab = useCallback((newTab: string) => updateQueryParams({ tab: newTab }), [updateQueryParams]);
  const setSortKey = useCallback((newKey: string | null) => updateQueryParams({ sortKey: newKey }), [updateQueryParams]);
  const setSortOrder = useCallback((newOrder: string | null) => updateQueryParams({ sortOrder: newOrder }), [updateQueryParams]);
  const setSearchQuery = useCallback((newQuery: string) => updateQueryParams({ searchQuery: newQuery || null }), [updateQueryParams]);
  const [pendingKey, setPendingKey] = useState<SortKey | null>(null);
  const [pendingOrder, setPendingOrder] = useState<"asc" | "desc" | null>(null);
  const sortDialogRef = useRef<HTMLDialogElement>(null);

  const activeChildren = useQuery(api.children.getChildrenWithPrimaryGuardian, { isActive: true });
  const inactiveChildren = useQuery(api.children.getChildrenWithPrimaryGuardian, { isActive: false });
  const children = tab === "inactive" ? inactiveChildren : activeChildren;

  const [filteredChildren, setFilteredChildren] = useState(children);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [counts, setCounts] = useState<{ [key in TAgeGroup | "all children" | "inactive"]: number }>({
    "all children": 0,
    infant: 0,
    toddler: 0,
    preschooler: 0,
    inactive: 0,
  });

  const sortOptions: {
    value: SortKey;
    label: string;
    ascLabel: string;
    descLabel: string;
  }[] = [
      { value: "reg", label: t("children.sort.regDate"), ascLabel: t("children.sort.near"), descLabel: t("children.sort.far") },
      { value: "name", label: t("children.sort.name"), ascLabel: "A-Z", descLabel: "Z-A" },
      { value: "age", label: t("children.sort.age"), ascLabel: t("children.sort.youngest"), descLabel: t("children.sort.oldest") },
      { value: "sex", label: t("children.sort.gender"), ascLabel: t("common.male"), descLabel: t("common.female") },
      { value: "birthdate", label: t("children.sort.birthday"), ascLabel: t("children.sort.near"), descLabel: t("children.sort.far") },
    ];

  const ageGroupLabels: Record<TAgeGroup | "all children" | "inactive", string> = {
    "all children": t("ageGroups.all"),
    infant: t("ageGroups.infant"),
    toddler: t("ageGroups.toddler"),
    preschooler: t("ageGroups.preschooler"),
    inactive: t("ageGroups.inactive"),
  };

  useEffect(() => {
    let result = children;
    let initCounts: { [key in TAgeGroup | "all children" | "inactive"]: number } = {
      "all children": activeChildren?.length || 0,
      infant: activeChildren?.filter((child) => child.ageGroup === "infant")?.length || 0,
      toddler: activeChildren?.filter((child) => child.ageGroup === "toddler")?.length || 0,
      preschooler: activeChildren?.filter((child) => child.ageGroup === "preschooler")?.length || 0,
      inactive: inactiveChildren?.length || 0,
    }

    if (tab !== "all children" && tab !== "inactive") {
      result = result?.filter((child) => child.ageGroup === tab);
    }

    if (searchQuery.trim()) {
      result = result?.filter((child) =>
        child.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.fullNameAmh?.includes(searchQuery)
      );
    }

    if (result && sortKey && sortOrder) result = sortChildren(result, sortKey, sortOrder);

    setCounts(initCounts);
    setFilteredChildren(result);
  }, [tab, activeChildren, inactiveChildren, children, searchQuery, sortKey, sortOrder]);

  const handlePendingKey = (key: SortKey) => {
    if (key !== pendingKey) {
      setPendingKey(key);
      setPendingOrder(null);
    }
  };

  const handlePendingOrder = (order: "asc" | "desc") => {
    setPendingOrder(order);
    if (pendingKey) {
      setSortKey(pendingKey);
      setSortOrder(order);
      setPendingKey(null);
      setPendingOrder(null);
      sortDialogRef.current?.close();
    }
  };

  const openSortDialog = () => {
    setPendingKey(sortKey);
    setPendingOrder(sortOrder);
    sortDialogRef.current?.showModal();
  };

  const { formatAge, formatAgeShort } = useAge();

  return (
    <>
      <GlassHeader
        title={t("children.title")}
        backHref="/"
        isCompact={searchExpanded}
        action={<SearchPill initialValue={searchQuery} onSearch={setSearchQuery} onExpandChange={setSearchExpanded} placeholder={t("children.searchPlaceholder")} />}
      />
      <main style={{ justifyContent: "start", maxWidth: "610px", marginInline: "auto" }}>
        <div style={{ marginInline: "auto", display: "flex", width: "100%", alignItems: "center" }}>
          <button
            onClick={openSortDialog}
            className="glass-pill"
            title="Sort"
            style={{
              flexShrink: 0,
              marginInline: "0.5rem",
              color: (sortKey !== null) ? "var(--color-primary)" : undefined,
            }}
          >
            <SortIcon />
          </button>

          <div style={{ marginInline: "auto", display: "flex", overflowX: "auto", paddingBlock: "1rem" }}>
            {ageGroupsTabs.map((ageGroupTab) => (
              <button
                key={ageGroupTab}
                disabled={tab === ageGroupTab}
                onClick={() => setTab(ageGroupTab)}
                className={`tabs secondary ${ageGroupTab}`}
              >
                {ageGroupTab === "inactive" ? (
                  <div style={{ color: "var(--error-color)" }}><DeactivatedChildIcon /></div>
                ) : ageGroupTab !== "all children" ? (
                  ageGroupIcons[ageGroupTab]
                ) : (
                  ""
                )}
                <span style={{ textWrap: "nowrap" }}>{ageGroupLabels[ageGroupTab]}</span>
                {counts[ageGroupTab]}
              </button>
            ))}
          </div>
        </div>

        <dialog ref={sortDialogRef}>
          <h3 className="dialog-title">{t("common.sortDialogTitle")}</h3>

          {(() => {
            const active = sortOptions.find((o) => o.value === pendingKey);
            return (
              <div style={{ display: "flex", justifyContent: "center", padding: "0.5rem 1rem", borderBottom: "1px solid var(--glass-border)" }}>
                <button
                  onClick={() => handlePendingOrder("asc")}
                  className="tabs secondary"
                  style={{ flex: 1, justifyContent: "center", color: pendingOrder === "asc" ? "var(--color-primary)" : "inherit" }}
                >
                  <SwapIcon direction="up" />
                  {active && <span style={{ fontSize: "0.8rem" }}>{active.ascLabel}</span>}
                </button>
                <button
                  onClick={() => handlePendingOrder("desc")}
                  className="tabs secondary"
                  style={{ flex: 1, justifyContent: "center", color: pendingOrder === "desc" ? "var(--color-primary)" : "inherit" }}
                >
                  <SwapIcon direction="down" />
                  {active && <span style={{ fontSize: "0.8rem" }}>{active.descLabel}</span>}
                </button>
              </div>
            );
          })()}

          <div className="select-list" style={{ margin: 0, paddingRight: 0 }}>
            {sortOptions.map((option) => (
              <Fragment key={option.value}>
                <div
                  className={`select-option ${pendingKey === option.value ? "active" : ""}`}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBlock: "0.25rem", gap: "0.5rem" }}
                  onClick={() => handlePendingKey(option.value)}
                >
                  <label
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, cursor: "pointer", paddingBlock: "0.5rem" }}
                  >
                    <input
                      type="radio"
                      name="sort-option"
                      value={option.value}
                      checked={pendingKey === option.value}
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
          {children === undefined && <p>{t("common.loading")}</p>}
          {filteredChildren?.map((child) => {
            const displayName = (language === "am" && child.fullNameAmh) ? child.fullNameAmh : child.fullName;
            const guardianDisplayName = (language === "am" && child.primaryGuardianFullNameAmh) ? child.primaryGuardianFullNameAmh : child.primaryGuardianFullName;

            return (
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
                        {child.isActive ? ageGroupIcons[child.ageGroup as TAgeGroup] : <div style={{ color: "var(--error-color)" }}><DeactivatedChildIcon /></div>}
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
                        <h4 style={{ fontSize: "inherit", margin: 0, textTransform: "capitalize" }}>{displayName}</h4>
                        <p style={{ color: "var(--foreground-light)" }}>{child.gender === "male" ? t("common.male") : t("common.female")}</p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "end",
                        }}
                      >
                        <p dangerouslySetInnerHTML={{ __html: formatAgeShort(calculateAge(parseDate(child.dateOfBirth))) }} />
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
                      style={{ color: "var(--color-success)" }}
                    >
                      <CallIcon />
                      {guardianDisplayName?.split(" ")[0]}
                    </Link>
                    <Link
                      href={`/children/${child._id}`}
                      className="glass-pill with-icon"
                      style={{ color: "var(--color-accent)" }}
                    >
                      <InfoIcon />
                      {t("common.info")}
                    </Link>
                  </div>
                </details>
                <hr />
              </Fragment>
            );
          })}
          {filteredChildren?.length === 0 && <p>{t("children.noChildren")}</p>}
        </div>
      </main>
    </>
  );
}
