import { ChevronLeft, ChevronRight } from "@/components/Icons";
import { formatEthiopianDate, todayInEth } from "@/utils/calendar";
import { parseDate, EthiopicCalendar, GregorianCalendar, toCalendar } from "@internationalized/date";

export default function MonthNavigator({
    attendanceDate,
    handleDateChange,
}: {
    attendanceDate: string;
    handleDateChange: (newDate: string) => void;
}) {
    const current = parseDate(attendanceDate);
    const currentEth = toCalendar(current, new EthiopicCalendar());
    const startOfMonthEth = currentEth.set({ day: 1 });

    const getDateDisplayString = () => {
        const ethDate = formatEthiopianDate(toCalendar(startOfMonthEth, new GregorianCalendar()).toString());
        const parts = ethDate.split(" ");
        return `${parts[0]} ${parts[2]}`; // e.g., "ታህሳስ 2017"
    };

    const isNextDisabled = () => {
        const today = todayInEth;
        if (currentEth.year > today.year) return true;
        if (currentEth.year === today.year && currentEth.month >= today.month) return true;
        return false;
    };

    const navigate = (direction: "prev" | "next") => {
        const newDateEth = direction === "prev"
            ? currentEth.subtract({ months: 1 })
            : currentEth.add({ months: 1 });
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
            <h3 style={{ textAlign: "center", margin: 0 }}>
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
