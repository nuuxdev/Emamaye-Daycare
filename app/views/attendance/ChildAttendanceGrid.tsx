import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { parseDate, EthiopicCalendar, GregorianCalendar, toCalendar } from "@internationalized/date";
import MonthNavigator from "./MonthNavigator";
import { todayInEth } from "@/utils/calendar";

export default function ChildAttendanceGrid({
    childId,
    initialDate,
}: {
    childId: Id<"children">;
    initialDate: string;
}) {
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const current = parseDate(selectedDate);
    const ethDate = toCalendar(current, new EthiopicCalendar());

    // Calculate start and end of the month in Ethiopian calendar
    const startOfMonthEth = ethDate.set({ day: 1 });
    const daysInMonth = ethDate.calendar.getDaysInMonth(ethDate);
    const endOfMonthEth = ethDate.set({ day: daysInMonth });

    const attendances = useQuery(api.attendance.getAttendanceByDateRange, {
        startDate: toCalendar(startOfMonthEth, new GregorianCalendar()).toString(),
        endDate: toCalendar(endOfMonthEth, new GregorianCalendar()).toString(),
    });

    const childAttendances = attendances?.filter(att => att.childId === childId) || [];

    const dayOfWeek = startOfMonthEth.toDate("UTC").getDay();
    // Adjust to make Monday (1) the first day (index 0)
    // Sunday (0) becomes index 6
    const firstDayIndex = (dayOfWeek + 6) % 7;
    const emptyCells = Array.from({ length: firstDayIndex }, (_, i) => i);
    const dayLabels = ["ሰ", "ማ", "ረ", "ሐ", "አ", "ቅ", "እ"];
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="neo-box" style={{ gap: "1.5rem" }}>
            <MonthNavigator
                attendanceDate={selectedDate}
                handleDateChange={setSelectedDate}
            />

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
                        bgColor = attendance.status === "present" ? "var(--success-color)" : "var(--error-color)";
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
                    <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--success-color)" }} />
                    <span>Present</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--error-color)" }} />
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
