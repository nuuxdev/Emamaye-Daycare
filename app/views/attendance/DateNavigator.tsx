import { ChevronLeft, ChevronRight } from "@/components/Icons";
import { formatEthiopianDate, todayInEth } from "@/utils/calendar";
import { parseDate, EthiopicCalendar, GregorianCalendar, toCalendar } from "@internationalized/date";
import { TViewTab } from "@/app/attendance/types";

export default function DateNavigator({
    attendanceDate,
    viewTab,
    handleDateChange,
    startDate,
    endDate,
}: {
    attendanceDate: string;
    viewTab: TViewTab;
    handleDateChange: (newDate: string) => void;
    startDate: string;
    endDate: string;
}) {
    const getDateDisplayString = () => {
        if (viewTab === "daily") {
            return formatEthiopianDate(attendanceDate);
        } else if (viewTab === "weekly") {
            const formatShort = (dateStr: string) => {
                const ethDate = formatEthiopianDate(dateStr);
                const parts = ethDate.split(" ");
                return `${parts[0]} ${parts[1].replace(",", "")}`;
            };
            return `${formatShort(startDate)} - ${formatShort(endDate)}`;
        } else {
            const ethDate = formatEthiopianDate(startDate);
            const parts = ethDate.split(" ");
            return `${parts[0]} ${parts[2]}`;
        }
    };

    const isNextDisabled = () => {
        const currentDate = parseDate(attendanceDate);
        const currentEth = toCalendar(currentDate, new EthiopicCalendar());
        const today = todayInEth;

        if (viewTab === "daily") {
            const todayGreg = toCalendar(today, new GregorianCalendar());
            if (currentDate.compare(todayGreg) >= 0) return true;

            // Check if next weekday is in the future
            let nextWeekday = currentEth.add({ days: 1 });
            while (nextWeekday.toDate("UTC").getDay() === 0 || nextWeekday.toDate("UTC").getDay() === 6) {
                nextWeekday = nextWeekday.add({ days: 1 });
            }
            return toCalendar(nextWeekday, new GregorianCalendar()).compare(todayGreg) > 0;
        } else if (viewTab === "weekly") {
            const dayOfWeek = today.toDate("UTC").getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const thisMonday = today.subtract({ days: daysToMonday });

            const currentDayOfWeek = currentEth.toDate("UTC").getDay();
            const currentDaysToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
            const currentMonday = currentEth.subtract({ days: currentDaysToMonday });

            return currentMonday.compare(thisMonday) >= 0;
        } else {
            if (currentEth.year > today.year) return true;
            if (currentEth.year === today.year && currentEth.month >= today.month) return true;
            return false;
        }
    };

    const navigate = (direction: "prev" | "next") => {
        const currentDate = parseDate(attendanceDate);
        const currentEth = toCalendar(currentDate, new EthiopicCalendar());
        let newDateEth;

        if (viewTab === "daily") {
            newDateEth = direction === "prev" ? currentEth.subtract({ days: 1 }) : currentEth.add({ days: 1 });
            // Skip weekends (0 = Sunday, 6 = Saturday)
            while (newDateEth.toDate("UTC").getDay() === 0 || newDateEth.toDate("UTC").getDay() === 6) {
                newDateEth = direction === "prev" ? newDateEth.subtract({ days: 1 }) : newDateEth.add({ days: 1 });
            }
        } else if (viewTab === "weekly") {
            newDateEth = direction === "prev" ? currentEth.subtract({ weeks: 1 }) : currentEth.add({ weeks: 1 });
        } else {
            newDateEth = direction === "prev" ? currentEth.subtract({ months: 1 }) : currentEth.add({ months: 1 });
        }

        const newDateGreg = toCalendar(newDateEth, new GregorianCalendar());
        handleDateChange(newDateGreg.toString());
    };

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <button
                onClick={() => navigate("prev")}
                className="glass-pill"
                style={{ padding: "0.5rem", cursor: "pointer" }}
            >
                <ChevronLeft />
            </button>
            <h3 style={{ textAlign: "center", margin: 0, fontSize: viewTab !== "daily" ? "1rem" : undefined }}>
                {getDateDisplayString()}
            </h3>
            <button
                onClick={() => navigate("next")}
                className="glass-pill"
                style={{ padding: "0.5rem", cursor: "pointer" }}
                disabled={isNextDisabled()}
            >
                <ChevronRight />
            </button>
        </div>
    );
}
