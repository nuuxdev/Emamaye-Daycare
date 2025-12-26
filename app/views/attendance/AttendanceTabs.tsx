import { TViewTab } from "@/app/attendance/page";

export default function AttendanceTabs({
    viewTab,
    setViewTab,
    view,
}: {
    viewTab: TViewTab;
    setViewTab: (tab: TViewTab) => void;
    view: "card" | "list" | "preview";
}) {
    if (view === "card") return null;

    return (
        <div style={{ display: "flex", width: "100%", overflowX: "auto" }}>
            {(["daily", "weekly", "monthly"] as TViewTab[]).map((tab) => (
                <button
                    key={tab}
                    disabled={viewTab === tab}
                    onClick={() => setViewTab(tab)}
                    className="tabs secondary"
                    style={{ textTransform: "capitalize", flexGrow: 1 }}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}
