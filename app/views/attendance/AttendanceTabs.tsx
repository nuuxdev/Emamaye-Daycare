import { TViewTab } from "@/app/attendance/types";

import { SwapIcon } from "@/components/Icons";

export default function AttendanceTabs({
    viewTab,
    setViewTab,
    sortOrder,
    onToggleSort,
}: {
    viewTab: TViewTab;
    setViewTab: (tab: TViewTab) => void;
    sortOrder?: "asc" | "desc";
    onToggleSort?: () => void;
}) {
    return (
        <div style={{ marginInline: "auto", display: "flex", width: "100%", alignItems: "center" }}>
            {viewTab !== "daily" && onToggleSort && (
                <button
                    onClick={onToggleSort}
                    className="glass-pill"
                    title="Toggle Sort"
                    style={{
                        flexShrink: 0,
                        marginInline: "0.5rem",
                    }}
                >
                    <SwapIcon direction={sortOrder === "asc" ? "up" : "down"} />
                </button>
            )}

            <div style={{ marginInline: "auto", display: "flex", overflowX: "auto", paddingBlock: "1rem", width: "100%", maskImage: "linear-gradient(to right, black 85%, transparent 100%)", WebkitMaskImage: "linear-gradient(to right, black 85%, transparent 100%)" }}>
                {(["daily", "weekly", "monthly"] as TViewTab[]).map((tab) => (
                    <button
                        key={tab}
                        disabled={viewTab === tab}
                        onClick={() => setViewTab(tab)}
                        className="tabs secondary"
                        style={{ textTransform: "capitalize", flexShrink: 0 }}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
}
