"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PreschoolerIcon, AttendanceIcon, MoneyIcon } from "@/components/Icons";

export default function KPIStats() {
    const stats = useQuery(api.stats.getSummary);

    if (!stats) {
        return (
            <div className="neo-box" style={{ minHeight: "80px", justifyContent: "center" }}>
                <span className="opacity-50">Loading stats...</span>
            </div>
        );
    }

    const separatorStyle = {
        width: "1px",
        height: "32px",
        background: "rgba(0, 0, 0, 0.1)",
        flexShrink: 0,
    };

    const statItemStyle = {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: "4px",
        flex: 1,
    };

    const labelStyle = {
        fontSize: "0.75rem",
        fontWeight: 600,
        opacity: 0.6,
        textTransform: "uppercase" as const,
    };

    const valueStyle = {
        fontSize: "1.125rem",
        fontWeight: 700,
        color: "var(--primary-color)",
    };

    return (
        <div
            className="neo-box"
            style={{
                flexDirection: "row",
                padding: "1rem",
                gap: "0.5rem",
                marginBottom: "4.5rem",
                // to make the main navigation cards look centered
                maxWidth: "500px",
                width: "100%",
            }}
        >
            <div style={statItemStyle}>
                <span style={labelStyle}>ልጆች</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <PreschoolerIcon />
                    <span style={valueStyle}>{stats.totalActiveChildren}</span>
                </div>
            </div>

            <div style={separatorStyle} />

            <div style={statItemStyle}>
                <span style={labelStyle}>አቴንዳንስ</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <AttendanceIcon />
                    <span style={valueStyle}>{stats.presentToday}</span>
                </div>
            </div>

            <div style={separatorStyle} />

            <div style={statItemStyle}>
                <span style={labelStyle}>ክፍያ</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MoneyIcon />
                    <span style={valueStyle}>{stats.pendingPaymentsTotal.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}
