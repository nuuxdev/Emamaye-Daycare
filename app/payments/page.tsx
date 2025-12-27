"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import GlassHeader from "@/components/GlassHeader";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { formatEthiopianDate, todayInEth, EthiopianCalendar } from "@/utils/calendar";
import { CheckIcon, ChevronLeft, ChevronRight, SettingsIcon } from "@/components/Icons";
import { parseDate, toCalendar, GregorianCalendar } from "@internationalized/date";
import { ServerAvatar } from "@/app/components/ServerAvatar";

export default function PaymentsList() {
    const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");

    // Initialize to the closest payment date (15th or 30th)
    const getInitialPeriod = () => {
        const today = todayInEth;
        // If we are past the 22nd, show the 30th (upcoming or current)
        // Otherwise show the 15th
        if (today.day <= 22) {
            return today.set({ day: 15 });
        } else {
            return today.set({ day: 30 });
        }
    };

    const [currentPeriod, setCurrentPeriod] = useState(getInitialPeriod());

    // Convert Ethiopian period to Gregorian dueDate string for the query
    const dueDate = toCalendar(currentPeriod, new GregorianCalendar()).toString();

    const payments = useQuery(api.payments.getPayments, {
        status: filter === "all" ? undefined : filter,
        dueDate: dueDate
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

    // Navigate between 15th and 30th
    const navigatePeriod = (direction: "prev" | "next") => {
        let newPeriod;
        if (direction === "prev") {
            if (currentPeriod.day === 30) {
                newPeriod = currentPeriod.set({ day: 15 });
            } else {
                // Move to 30th of previous month
                newPeriod = currentPeriod.subtract({ months: 1 }).set({ day: 30 });
            }
        } else {
            if (currentPeriod.day === 15) {
                newPeriod = currentPeriod.set({ day: 30 });
            } else {
                // Move to 15th of next month
                newPeriod = currentPeriod.add({ months: 1 }).set({ day: 15 });
            }
        }
        setCurrentPeriod(newPeriod);
    };

    // Format display string (e.g., "ታህሳስ 15, 2017")
    const getPeriodDisplayString = () => {
        return formatEthiopianDate(toCalendar(currentPeriod, new GregorianCalendar()).toString());
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
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                        <button
                            onClick={() => navigatePeriod("prev")}
                            className="glass-pill"
                            style={{ padding: "0.5rem", cursor: "pointer" }}
                        >
                            <ChevronLeft />
                        </button>
                        <h3 style={{ textAlign: "center", margin: 0, fontSize: "1rem", width: "12rem", padding: "0.5rem" }}>
                            {getPeriodDisplayString()}
                        </h3>
                        <button
                            onClick={() => navigatePeriod("next")}
                            className="glass-pill"
                            style={{ padding: "0.5rem", cursor: "pointer" }}
                            disabled={currentPeriod.compare(todayInEth) >= 0}
                        >
                            <ChevronRight />
                        </button>
                    </div>
                    <span style={{
                        display: "inline-block",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        background: currentPeriod.day === 15 ? "var(--secondary-color)" : "var(--info-color)",
                        color: "white",
                    }}>
                        {currentPeriod.day === 15 ? "ወር አጋማሽ (15)" : "የወር መጨረሻ (30)"}
                    </span>
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
                                    <ServerAvatar
                                        src={payment.childAvatar}
                                        alt="Child"
                                        style={{ width: "3rem", height: "3rem", borderRadius: "50%" }}
                                    />
                                    <div>
                                        <h4 style={{ margin: 0 }}>{payment.childName}</h4>
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
