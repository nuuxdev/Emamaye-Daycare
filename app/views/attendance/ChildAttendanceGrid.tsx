import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { parseDate, EthiopicCalendar, GregorianCalendar, toCalendar } from "@internationalized/date";
import MonthNavigator from "./MonthNavigator";
import { todayInEth } from "@/utils/calendar";
import { useLanguage } from "@/context/LanguageContext";

export default function ChildAttendanceGrid({
    childId,
    initialDate,
}: {
    childId: Id<"children">;
    initialDate: string;
}) {
    const { language } = useLanguage();
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const current = parseDate(selectedDate);
    const ethDate = toCalendar(current, new EthiopicCalendar());

    // Calculate start and end of the month in Ethiopian calendar
    const startOfMonthEth = ethDate.set({ day: 1 });
    const daysInMonth = ethDate.calendar.getDaysInMonth(ethDate);
    const endOfMonthEth = ethDate.set({ day: daysInMonth });

    const monthAttendances = useQuery(api.attendance.getAttendanceByDateRange, {
        startDate: toCalendar(startOfMonthEth, new GregorianCalendar()).toString(),
        endDate: toCalendar(endOfMonthEth, new GregorianCalendar()).toString(),
    });

    const childAttendances = monthAttendances?.filter(att => att.childId === childId) || [];

    // Weekly and Monthly Fixed Summaries (Always based on today)
    const currentTodayEth = todayInEth;

    // Fixed Monthly
    const startOfCurrentMonthEth = currentTodayEth.set({ day: 1 });
    const currentDaysInMonth = currentTodayEth.calendar.getDaysInMonth(currentTodayEth);
    const endOfCurrentMonthEth = currentTodayEth.set({ day: currentDaysInMonth });

    const currentMonthAttendancesQuery = useQuery(api.attendance.getAttendanceByDateRange, {
        startDate: toCalendar(startOfCurrentMonthEth, new GregorianCalendar()).toString(),
        endDate: toCalendar(endOfCurrentMonthEth, new GregorianCalendar()).toString(),
    });
    const childCurrentMonthAttendances = currentMonthAttendancesQuery?.filter(att => att.childId === childId) || [];

    // Fixed Weekly
    const dayOfWeekCurrentToday = currentTodayEth.toDate("UTC").getDay();
    const daysToMondayToday = dayOfWeekCurrentToday === 0 ? 6 : dayOfWeekCurrentToday - 1;
    const mondayEthToday = currentTodayEth.subtract({ days: daysToMondayToday });
    const fridayEthToday = mondayEthToday.add({ days: 4 });

    const currentWeeklyAttendancesQuery = useQuery(api.attendance.getAttendanceByDateRange, {
        startDate: toCalendar(mondayEthToday, new GregorianCalendar()).toString(),
        endDate: toCalendar(fridayEthToday, new GregorianCalendar()).toString(),
    });
    const childCurrentWeeklyAttendances = currentWeeklyAttendancesQuery?.filter(att => att.childId === childId) || [];

    // Calculate fractions
    const calculateFraction = (attendances: any[]) => {
        const uniquePresentDates = new Set(
            attendances
                .filter((a: any) => a.status === "present")
                .map((a: any) => a.date)
        );
        const present = uniquePresentDates.size;
        const uniqueTotalDates = new Set(
            attendances.map((a: any) => a.date)
        );
        const total = uniqueTotalDates.size;
        return { present, total };
    };

    const monthlySummary = calculateFraction(childCurrentMonthAttendances);
    const weeklySummary = calculateFraction(childCurrentWeeklyAttendances);

    const dayOfWeek = startOfMonthEth.toDate("UTC").getDay();
    // Adjust to make Monday (1) the first day (index 0)
    // Sunday (0) becomes index 6
    const firstDayIndex = (dayOfWeek + 6) % 7;
    const emptyCells = Array.from({ length: firstDayIndex }, (_, i) => i);
    const dayLabels = ["ሰ", "ማ", "ረ", "ሐ", "አ", "ቅ", "እ"];
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="neo-box" style={{ gap: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", width: "100%" }}>
                <div className="neo-box" style={{ padding: "0.75rem", alignItems: "center", gap: "0.25rem", background: "var(--glass-bg)" }}>
                    <span className="label-text" style={{ fontSize: "0.75rem" }}>{language === "am" ? "ይህ ሳምንት" : "This Week"}</span>
                    <span style={{ fontSize: "1.2rem", fontWeight: 700, color: weeklySummary.present === weeklySummary.total && weeklySummary.total > 0 ? "var(--color-success)" : weeklySummary.present === 0 && weeklySummary.total > 0 ? "var(--color-error)" : "var(--color-accent)" }}>
                        {weeklySummary.present}/{weeklySummary.total}
                    </span>
                </div>
                <div className="neo-box" style={{ padding: "0.75rem", alignItems: "center", gap: "0.25rem", background: "var(--glass-bg)" }}>
                    <span className="label-text" style={{ fontSize: "0.75rem" }}>{language === "am" ? "ይህ ወር" : "This Month"}</span>
                    <span style={{ fontSize: "1.2rem", fontWeight: 700, color: monthlySummary.present === monthlySummary.total && monthlySummary.total > 0 ? "var(--color-success)" : monthlySummary.present === 0 && monthlySummary.total > 0 ? "var(--color-error)" : "var(--color-accent)" }}>
                        {monthlySummary.present}/{monthlySummary.total}
                    </span>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <MonthNavigator
                    attendanceDate={selectedDate}
                    handleDateChange={setSelectedDate}
                />
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "0.5rem",
                width: "100%"
            }}>
                {dayLabels.map(label => (
                    <div key={label} style={{
                        textAlign: "center",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        opacity: 0.5,
                        paddingBottom: "0.5rem"
                    }}>
                        {label}
                    </div>
                ))}

                {emptyCells.map(i => (
                    <div key={`empty-${i}`} />
                ))}

                {days.map(day => {
                    const date = startOfMonthEth.set({ day });
                    const dateStr = toCalendar(date, new GregorianCalendar()).toString();
                    const attendance = childAttendances.find(att => att.date === dateStr);
                    const isWeekend = date.toDate("UTC").getDay() === 0 || date.toDate("UTC").getDay() === 6;
                    const isFuture = date.compare(todayInEth) > 0;

                    let bgColor = "rgba(0,0,0,0.05)";
                    let color = "var(--foreground)";
                    let opacity = 1;

                    if (isWeekend) {
                        opacity = 0.3;
                    } else if (attendance) {
                        bgColor = attendance.status === "present" ? "var(--color-success)" : "var(--color-error)";
                        color = "white";
                    } else if (isFuture) {
                        opacity = 0.3;
                    } else {
                        // Past weekday with no attendance
                        bgColor = "rgba(0,0,0,0.1)";
                    }

                    return (
                        <div
                            key={day}
                            style={{
                                aspectRatio: "1/1",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "8px",
                                backgroundColor: bgColor,
                                color: color,
                                fontSize: "0.875rem",
                                fontWeight: "600",
                                opacity: opacity,
                                transition: "all 0.2s"
                            }}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>

            <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", opacity: 0.7, justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--color-success)" }} />
                    <span>Present</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--color-error)" }} />
                    <span>Absent</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "rgba(0,0,0,0.1)" }} />
                    <span>No Record</span>
                </div>
            </div>
        </div>
    );
}
