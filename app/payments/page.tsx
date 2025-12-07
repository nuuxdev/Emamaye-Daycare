"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import GlassHeader from "@/components/GlassHeader";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { formatEthiopianDate, todayInEth } from "@/utils/calendar";
import { CheckIcon, ChevronLeft, ChevronRight, SettingsIcon } from "@/components/Icons";
import { parseDate } from "@internationalized/date";

export default function PaymentsList() {
    const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");
    const [selectedDate, setSelectedDate] = useState(todayInEth.toString());

    const payments = useQuery(api.payments.getPayments, {
        status: filter === "all" ? undefined : filter
    });
    const markAsPaid = useMutation(api.payments.markAsPaid);

    const handleMarkAsPaid = async (paymentId: any) => {
        try {
            await markAsPaid({ paymentId });
            toast.success("Payment marked as paid");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update payment");
        }
    };

    // Navigate month
    const navigateMonth = (direction: "prev" | "next") => {
        const currentDate = parseDate(selectedDate);
        const newDate = direction === "prev"
            ? currentDate.subtract({ months: 1 })
            : currentDate.add({ months: 1 });
        setSelectedDate(newDate.toString());
    };

    // Format month display (Ethiopian month and year only)
    const getMonthDisplayString = () => {
        const ethDate = formatEthiopianDate(selectedDate);
        const parts = ethDate.split(" ");
        return `${parts[0]} ${parts[2]}`; // e.g., "ታህሳስ 2017"
    };

    // Filter tabs labels
    const filterLabels: Record<"all" | "pending" | "paid", string> = {
        all: "ሁሉም",
        pending: "ያልተከፈለ",
        paid: "የተከፈለ"
    };

    return (
        <>
            <GlassHeader
                title="ክፍያዎች"
                backHref="/"
                action={
                    <Link href="/payments/settings" className="glass-pill">
                        <SettingsIcon />
                    </Link>
                }
            />
            <main style={{ maxWidth: "600px", marginInline: "auto", width: "100%", paddingBottom: "5rem", justifyContent: "start" }}>

                {/* Filters - matching children list tabs style */}
                <div style={{ marginInline: "auto", display: "flex", width: "100%", overflowX: "auto", paddingBlock: "1rem" }}>
                    {(["all", "pending", "paid"] as const).map((f) => (
                        <button
                            key={f}
                            disabled={filter === f}
                            onClick={() => setFilter(f)}
                            className="tabs secondary"
                            style={{ flexGrow: 1 }}
                        >
                            {filterLabels[f]}
                        </button>
                    ))}
                </div>

                {/* Month Navigation */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "1rem" }}>
                    <button
                        onClick={() => navigateMonth("prev")}
                        className="glass-pill"
                        style={{ padding: "0.5rem", cursor: "pointer" }}
                    >
                        <ChevronLeft />
                    </button>
                    <h3 style={{ textAlign: "center", margin: 0, fontSize: "1rem" }}>
                        {getMonthDisplayString()}
                    </h3>
                    <button
                        onClick={() => navigateMonth("next")}
                        className="glass-pill"
                        style={{ padding: "0.5rem", cursor: "pointer" }}
                        disabled={parseDate(selectedDate).compare(todayInEth) >= 0}
                    >
                        <ChevronRight />
                    </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem" }}>
                    {payments === undefined ? (
                        <p>Loading...</p>
                    ) : payments.length === 0 ? (
                        <div className="neo-box" style={{ textAlign: "center", padding: "3rem 1rem" }}>
                            <p style={{ opacity: 0.6 }}>ምንም ክፍያ አልተገኘም</p>
                        </div>
                    ) : (
                        payments.map((payment) => (
                            <div key={payment._id} className="neo-box" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <img
                                        src={payment.childAvatar || "/profile.png"}
                                        alt="Child"
                                        style={{ width: "3rem", height: "3rem", borderRadius: "50%", objectFit: "cover" }}
                                    />
                                    <div>
                                        <h4 style={{ margin: 0 }}>{payment.childName}</h4>
                                        <span style={{
                                            display: "inline-block",
                                            padding: "0.2rem 0.5rem",
                                            borderRadius: "12px",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            background: payment.paymentSchedule === "month_half" ? "var(--warning-color)" : "var(--info-color)",
                                            color: "white",
                                            marginTop: "0.25rem"
                                        }}>
                                            {payment.paymentSchedule === "month_half" ? "ወር አጋማሽ" : "የወር መጨረሻ"}
                                        </span>
                                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.9rem", fontWeight: 600, color: "var(--primary-color)" }}>
                                            {payment.amount} ብር
                                        </p>
                                    </div>
                                </div>

                                {payment.status === "pending" ? (
                                    <button
                                        onClick={() => handleMarkAsPaid(payment._id)}
                                        className="secondary"
                                        style={{
                                            padding: "0.5rem",
                                            borderRadius: "50%",
                                            width: "3rem",
                                            height: "3rem",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "var(--success-color)"
                                        }}
                                    >
                                        <CheckIcon />
                                    </button>
                                ) : (
                                    <div style={{
                                        padding: "0.5rem 1rem",
                                        background: "var(--success-color)",
                                        color: "white",
                                        borderRadius: "20px",
                                        fontSize: "0.8rem",
                                        fontWeight: 600
                                    }}>
                                        ተከፍሏል
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </main>
        </>
    );
}
