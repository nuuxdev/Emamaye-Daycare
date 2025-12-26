import { Fragment } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { parseDate } from "@internationalized/date";
import { TViewTab } from "@/app/attendance/page";
import { todayInEth } from "@/utils/calendar";
import Link from "next/link";

export default function SummaryView({
    childrenData,
    attendancesByRange,
    viewTab,
    startDate,
    endDate,
    attendanceDate,
}: {
    childrenData: Doc<"children">[];
    attendancesByRange: Doc<"attendance">[] | undefined;
    viewTab: TViewTab;
    startDate: string;
    endDate: string;
    attendanceDate: string;
}) {
    const getAttendanceCount = (childId: Id<"children">) => {
        if (!attendancesByRange) return { present: 0, total: 0 };
        const childAttendance = attendancesByRange.filter((att) => att.childId === childId);
        const presentCount = childAttendance.filter((att) => att.status === "present").length;

        const start = parseDate(startDate);
        const end = parseDate(endDate);
        const today = todayInEth;

        let weekdays = 0;
        let current = start;

        // Cap the end date at today if we are in the current month/week
        const effectiveEnd = end.compare(today) > 0 ? today : end;

        while (current.compare(effectiveEnd) <= 0) {
            const day = current.toDate("UTC").getDay();
            if (day !== 0 && day !== 6) weekdays++;
            current = current.add({ days: 1 });
        }

        return { present: presentCount, total: weekdays };
    };

    if (!attendancesByRange) return <div>Loading Summary...</div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
            {childrenData?.map((child, index) => {
                const { present, total } = getAttendanceCount(child._id);
                return (
                    <Fragment key={child._id}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0" }}>
                            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                <img
                                    src={child.avatar}
                                    alt={child.fullName}
                                    style={{
                                        width: "3rem",
                                        height: "3rem",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                                <h4 style={{ margin: 0, fontSize: "inherit", textTransform: "capitalize" }}>{child.fullName}</h4>
                            </div>
                            <Link
                                href={`/children/${child._id}?tab=attendance&date=${attendanceDate}`}
                                style={{ textDecoration: "none" }}
                            >
                                <span
                                    style={{
                                        padding: "0.4rem 0.6rem",
                                        borderRadius: "100vw",
                                        minWidth: "4.5rem",
                                        textAlign: "center",
                                        backgroundColor: present === total ? "var(--success-color)" : present === 0 ? "var(--error-color)" : "var(--info-color)",
                                        color: "white",
                                        fontWeight: "600",
                                        display: "inline-block",
                                        cursor: "pointer"
                                    }}
                                >
                                    {present}/{total}
                                </span>
                            </Link>
                        </div>
                        {index < (childrenData?.length ?? 0) - 1 && <hr />}
                    </Fragment>
                );
            })}
        </div>
    );
}
