import { Fragment } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { parseDate } from "@internationalized/date";
import { TViewTab } from "@/app/attendance/types";
import { todayInEth } from "@/utils/calendar";
import Link from "next/link";
import { ServerAvatar } from "@/app/components/ServerAvatar";

export default function SummaryView({
    childrenData,
    attendancesByRange,
    viewTab,
    startDate,
    endDate,
    attendanceDate,
    sortOrder,
}: {
    childrenData: Doc<"children">[];
    attendancesByRange: Doc<"attendance">[] | undefined;
    viewTab: TViewTab;
    startDate: string;
    endDate: string;
    attendanceDate: string;
    sortOrder?: "asc" | "desc";
}) {
    const getAttendanceCount = (childId: Id<"children">) => {
        if (!attendancesByRange) return { present: 0, total: 0 };
        const childAttendance = attendancesByRange.filter((att) => att.childId === childId);
        const uniquePresentDates = new Set(
            childAttendance.filter((att) => att.status === "present").map((att) => att.date)
        );
        const presentCount = uniquePresentDates.size;

        const uniqueTotalDates = new Set(
            childAttendance.map((att) => att.date)
        );
        const total = uniqueTotalDates.size;

        return { present: presentCount, total };
    };

    if (!attendancesByRange) return <div>Loading Summary...</div>;

    let childrenWithStats = childrenData?.map((child) => {
        const stats = getAttendanceCount(child._id);
        return { child, ...stats };
    }) || [];

    if (sortOrder) {
        childrenWithStats.sort((a, b) => {
            if (sortOrder === "asc") return a.present - b.present;
            return b.present - a.present;
        });
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
            {childrenWithStats.map(({ child, present, total }, index) => {
                return (
                    <Fragment key={child._id}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0" }}>
                            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                <ServerAvatar
                                    src={child.avatar}
                                    alt={child.fullName}
                                    style={{
                                        width: "3rem",
                                        height: "3rem",
                                        borderRadius: "50%",
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
                                        backgroundColor: present === total ? "var(--color-success)" : present === 0 ? "var(--color-error)" : "var(--color-accent)",
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
                        {index < childrenWithStats.length - 1 && <hr />}
                    </Fragment>
                );
            })}
        </div>
    );
}
