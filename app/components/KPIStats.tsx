"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    PreschoolerIcon,
    AttendanceIcon,
    MoneyIcon,
    DeactivatedChildIcon,
    PlusIcon,
    CheckIcon,
    CloseIcon,
    InfoIcon,
    LockIcon
} from "@/components/Icons";
import { useState, useRef, useEffect, Fragment } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function KPIStats() {
    const stats = useQuery(api.stats.getSummary);
    const [activeTab, setActiveTab] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const index = Math.round(scrollLeft / clientWidth);
            setActiveTab(index);
        }
    };

    const scrollTo = (index: number) => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                left: index * scrollRef.current.clientWidth,
                behavior: "smooth",
            });
        }
    };

    const separatorStyle = {
        width: "1px",
        height: "24px",
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
        fontSize: "0.65rem",
        fontWeight: 600,
        opacity: 0.5,
        textTransform: "uppercase" as const,
        textAlign: "center" as const,
    };

    const valueStyle = {
        fontSize: "1rem",
        fontWeight: 700,
        color: "var(--color-primary)",
        minWidth: "1ch",
        textAlign: "center" as const,
    };

    const categoryLabelStyle = {
        position: "absolute" as const,
        top: "-10px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--background)",
        padding: "0 8px",
        fontSize: "0.7rem",
        fontWeight: 700,
        color: "var(--color-primary)",
        borderRadius: "10px",
        boxShadow: "var(--shadow-light)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        zIndex: 2,
    };

    const { t } = useLanguage();

    const renderStatGroup = (title: string, items: { label: string, value: any, icon: any, color?: string, isText?: boolean }[]) => (
        <div style={{ flexShrink: 0, width: "100%", padding: "0 4px", position: "relative", scrollSnapAlign: "start" }}>
            <span style={categoryLabelStyle}>{title}</span>
            <div className="neo-box" style={{
                flexDirection: "row",
                padding: "1.25rem 0.75rem 0.75rem 0.75rem",
                gap: "0.25rem",
                boxShadow: "var(--shadow-inset-light), var(--shadow-inset-dark)",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
            }}>
                {items.map((item, i) => {
                    const isNumberValue = !item.isText;
                    return (
                        <Fragment key={item.label}>
                            <div style={statItemStyle}>
                                <span style={labelStyle}>{item.label}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div style={{ color: item.color || "var(--color-primary)", opacity: 0.8 }}>{item.icon}</div>
                                    <span style={{
                                        ...valueStyle,
                                        fontSize: isNumberValue ? "1.5rem" : "1rem",
                                        fontWeight: isNumberValue ? 800 : 700,
                                        color: item.color || "var(--color-primary)",
                                    }}>{stats ? item.value : "—"}</span>
                                </div>
                            </div>
                            {i < items.length - 1 && <div style={separatorStyle} />}
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div style={{
            maxWidth: "500px",
            width: "100%",
            marginBottom: "4.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem"
        }}>
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                style={{
                    display: "flex",
                    overflowX: "auto",
                    scrollSnapType: "x mandatory",
                    width: "100%",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                    gap: "0",
                    padding: "10px 0",
                    WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
                    maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
                }}
                className="no-scrollbar"
            >
                {/* Slide 1: Children */}
                {renderStatGroup(t("kpi.categoryChildren"), [
                    { label: t("kpi.active"), value: stats?.children.active, icon: <PreschoolerIcon />, color: "var(--color-success)" },
                    { label: t("kpi.inactive"), value: stats?.children.inactive, icon: <DeactivatedChildIcon />, color: "var(--error-color)" },
                    { label: t("kpi.new"), value: stats?.children.new, icon: <PlusIcon /> },
                ])}

                {/* Slide 2: Attendance */}
                {renderStatGroup(t("kpi.categoryAttendance"), [
                    { label: t("kpi.present"), value: stats?.attendance.present, icon: <CheckIcon />, color: "var(--color-success)" },
                    { label: t("kpi.absent"), value: stats?.attendance.absent, icon: <CloseIcon />, color: "var(--error-color)" },
                    { label: t("kpi.status"), value: stats?.attendance.isFilled ? t("kpi.filled") : t("kpi.notFilled"), icon: <AttendanceIcon />, isText: true },
                ])}

                {/* Slide 3: Payments */}
                {renderStatGroup(t("kpi.categoryPayments"), [
                    { label: t("kpi.expected"), value: stats?.payments.expected.toLocaleString(), icon: <InfoIcon /> },
                    { label: t("kpi.paid"), value: stats?.payments.paid.toLocaleString(), icon: <MoneyIcon />, color: "var(--color-success)" },
                    { label: t("kpi.unpaid"), value: stats?.payments.unpaid.toLocaleString(), icon: <LockIcon />, color: "var(--error-color)" },
                ])}
            </div>

            {/* Dots Indicator */}
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                {[0, 1, 2].map((i) => (
                    <button
                        key={i}
                        onClick={() => scrollTo(i)}
                        style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            border: "none",
                            background: activeTab === i ? "var(--color-primary)" : "rgba(0,0,0,0.1)",
                            boxShadow: activeTab === i
                                ? "0 0 8px var(--color-primary)"
                                : "var(--shadow-inset-light), var(--shadow-inset-dark)",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            padding: 0
                        }}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
