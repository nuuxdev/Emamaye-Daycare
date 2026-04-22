"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import GlassHeader from "@/components/GlassHeader";
import Link from "next/link";
import { useState, useRef, Fragment } from "react";
import { toast } from "sonner";
import { todayInEth, EthiopianCalendar, todayInGreg, ethMonthNames, fromEthDateString, gregorianToEthDateString } from "@/utils/calendar";
import { CheckIcon, ChevronLeft, ChevronRight, SettingsIcon, CloseIcon } from "@/components/Icons";
import { parseDate, toCalendar } from "@internationalized/date";
import { ServerAvatar } from "@/app/components/ServerAvatar";
import { useLanguage } from "@/context/LanguageContext";
import { InputDate } from "@/app/views/register/Calendar";
import { useForm } from "react-hook-form";
import { MoneyIcon } from "@/components/Icons";

type PaymentCategory = "due_date" | "upcoming" | "unpaid" | "paid";

export default function PaymentsList() {
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState<PaymentCategory>("due_date");
    const [currentMonth, setCurrentMonth] = useState(todayInEth.set({ day: 1 }));
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Payment Dialog state
    const payDialogRef = useRef<HTMLDialogElement>(null);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    const { register, handleSubmit, setValue, getValues, watch, reset } = useForm({
        defaultValues: {
            paidAmount: 0,
            paidDate: todayInGreg.toString(),
        }
    });

    const payments = useQuery(api.payments.getPayments, {});
    const markAsPaid = useMutation(api.payments.markAsPaid);

    const navigateMonth = (direction: "prev" | "next") => {
        if (direction === "prev") {
            setCurrentMonth(currentMonth.subtract({ months: 1 }));
        } else {
            setCurrentMonth(currentMonth.add({ months: 1 }));
        }
        setExpandedId(null);
    };

    const getMonthDisplayString = () => {
        return `${ethMonthNames[currentMonth.month - 1]} ${currentMonth.year}`;
    };

    const filterLabels: Record<PaymentCategory, string> = {
        due_date: language === "am" ? "ዛሬ" : "Today",
        upcoming: language === "am" ? "በቅርቡ" : "Upcoming",
        unpaid: language === "am" ? "ያልተከፈለ" : "Unpaid",
        paid: language === "am" ? "የተከፈለ" : "Paid"
    };

    // Calculate categories and filter by month
    const processedPayments = (payments || []).filter(p => {
        const pDate = parseDate(p.dueDate);
        const ethDate = toCalendar(pDate, EthiopianCalendar);
        return ethDate.year === currentMonth.year && ethDate.month === currentMonth.month;
    }).map(p => {
        const jsDue = new Date(p.dueDate);
        const jsToday = new Date(todayInGreg.toString());
        const diffTime = jsDue.getTime() - jsToday.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let category: PaymentCategory = "upcoming";
        if (p.status === "paid") {
            category = "paid";
        } else if (diffDays < 0) {
            category = "unpaid";
        } else if (diffDays >= 0 && diffDays <= 5) {
            category = "due_date";
        } else {
            category = "upcoming";
        }

        // Add formatted Ethiopic date for display
        const pEthDate = toCalendar(parseDate(p.dueDate), EthiopianCalendar);
        const ethDateStr = `${ethMonthNames[pEthDate.month - 1]} ${pEthDate.day}, ${pEthDate.year}`;

        return { ...p, category, ethDateStr, diffDays };
    }).sort((a, b) => {
        // Sort from oldest to newest generally
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const filteredPayments = processedPayments.filter(p => p.category === filter);

    const openPayDialog = (payment: any) => {
        setSelectedPayment(payment);
        const appliedDiscount = payment.discount !== undefined ? payment.discount : (payment.childDiscount || 0);
        const expectedAmount = Math.max(0, payment.amount - appliedDiscount);
        reset({
            paidAmount: expectedAmount,
            paidDate: todayInGreg.toString()
        });
        payDialogRef.current?.showModal();
    };

    const closePayDialog = () => {
        payDialogRef.current?.close();
        setSelectedPayment(null);
    };

    const onSubmitPayment = async (data: any) => {
        if (!selectedPayment) return;
        try {
            await markAsPaid({
                paymentId: selectedPayment._id,
                paidAmount: Number(data.paidAmount),
                paidDate: data.paidDate
            });
            toast.success(language === "am" ? "ክፍያ ተመዝግቧል" : "Payment marked as paid");
            closePayDialog();
        } catch (error) {
            console.error(error);
            toast.error(language === "am" ? "ስህተት ተከስቷል" : "Failed to record payment");
        }
    };

    return (
        <>
            <GlassHeader
                title={t("payments.title")}
                backHref="/"
                transitionName="page-payments"
                icon={<MoneyIcon />}
                action={
                    <Link href="/settings" className="glass-pill">
                        <SettingsIcon />
                    </Link>
                }
            />
            <main style={{ maxWidth: "600px", marginInline: "auto", width: "100%", paddingBottom: "5rem", justifyContent: "start" }}>

                {/* Filters - Tabs */}
                <div style={{ marginInline: "auto", display: "flex", width: "100%", overflowX: "auto", paddingBlock: "1rem" }}>
                    {(["due_date", "upcoming", "unpaid", "paid"] as const).map((f) => (
                        <button
                            key={f}
                            disabled={filter === f}
                            onClick={() => { setFilter(f); setExpandedId(null); }}
                            className="tabs secondary"
                            style={{ flexGrow: 1, whiteSpace: "nowrap" }}
                        >
                            {filterLabels[f]}
                        </button>
                    ))}
                </div>

                {/* Month Navigation */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                        <button
                            onClick={() => navigateMonth("prev")}
                            className="glass-pill"
                            style={{ padding: "0.5rem", cursor: "pointer" }}
                        >
                            <ChevronLeft />
                        </button>
                        <h3 style={{ textAlign: "center", margin: 0, fontSize: "1.2rem", width: "12rem", padding: "0.5rem" }}>
                            {getMonthDisplayString()}
                        </h3>
                        <button
                            onClick={() => navigateMonth("next")}
                            className="glass-pill"
                            style={{ padding: "0.5rem", cursor: "pointer" }}
                        >
                            <ChevronRight />
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingInline: "1rem", width: "100%" }}>
                    {payments === undefined ? (
                        <p className="text-center mt-2">{t("common.loading")}</p>
                    ) : filteredPayments.length === 0 ? (
                        <div className="neo-box text-center" style={{ padding: "3rem 1rem", opacity: 0.6 }}>
                            <p>{language === "am" ? "ምንም ክፍያ የለም" : "No payments found"}</p>
                        </div>
                    ) : (
                        filteredPayments.map((payment) => {
                            const isExpanded = expandedId === payment._id;
                            const isUnpaidColor = filter === "unpaid";
                            const isPaidColor = filter === "paid";

                            const appliedDiscount = payment.discount !== undefined ? payment.discount : (payment.childDiscount || 0);
                            const expectedAmount = Math.max(0, payment.amount - appliedDiscount);

                            return (
                                <Fragment key={payment._id}>
                                    <details style={{ width: "100%", cursor: "pointer" }} name="payments-list-item">
                                        <summary style={{ display: "flex", gap: "1rem", alignItems: "start", padding: "0.5rem 0" }}>
                                            <div style={{
                                                width: "4rem",
                                                aspectRatio: "1/1",
                                                position: "relative",
                                            }}>
                                                <ServerAvatar
                                                    src={payment.childAvatar}
                                                    alt="child avatar"
                                                    style={{
                                                        borderRadius: "50%",
                                                        border: isUnpaidColor ? "2px solid var(--color-error)" : (isPaidColor ? "2px solid var(--color-success)" : "2px solid transparent")
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                                <div>
                                                    <h4 style={{ fontSize: "inherit", margin: 0, textTransform: "capitalize" }}>{language === "am" && payment.childNameAmh ? payment.childNameAmh : payment.childName}</h4>
                                                    <p style={{ margin: "0.25rem 0 0 0", color: "var(--foreground-light)", fontSize: "0.9rem" }}>{payment.ethDateStr}</p>
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", alignItems: "end" }}>
                                                    <p style={{ margin: "0", fontSize: "1.2rem", fontWeight: 700, color: "var(--color-primary)" }}>
                                                        {expectedAmount.toLocaleString()} <span style={{ fontSize: "0.8rem", fontWeight: "normal" }}>ETB</span>
                                                    </p>
                                                    {appliedDiscount > 0 ? (
                                                        <p style={{ margin: "0", fontSize: "0.9rem", color: "var(--color-danger)", textDecoration: "line-through", opacity: 0.7 }}>
                                                            {payment.amount.toLocaleString()} ETB
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </summary>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.25rem 0 2rem 0" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                {appliedDiscount > 0 ? (
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 0.5rem" }}>
                                                        <span className="label-text" style={{ fontSize: "0.9rem" }}>{language === "am" ? "የተደረገ ቅናሽ" : "Applied Discount"}</span>
                                                        <span style={{ fontWeight: 600, color: "var(--color-danger)" }}>-{appliedDiscount.toLocaleString()} ETB</span>
                                                    </div>
                                                ) : null}
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 0.5rem" }}>
                                                    <span className="label-text" style={{ fontSize: "0.9rem" }}>{language === "am" ? "ያለው ዕዳ ማካካሻ" : "Credit Applied"}</span>
                                                    <span style={{ fontWeight: 600, opacity: 0.5 }}>--</span>
                                                </div>
                                            </div>
                                            {payment.status !== "paid" && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openPayDialog(payment); }}
                                                    className="primary w-full"
                                                >
                                                    {language === "am" ? "ክፍያ ፈፅም" : "Pay Now"}
                                                </button>
                                            )}
                                        </div>
                                    </details>
                                    <hr />
                                </Fragment>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Payment Modal */}
            <dialog ref={payDialogRef} style={{ borderRadius: "1rem", padding: "1.5rem", maxWidth: "400px", width: "100%", border: "none" }}>
                {selectedPayment && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{language === "am" ? "ክፍያ" : "Payment"} - {language === "am" && selectedPayment.childNameAmh ? selectedPayment.childNameAmh : selectedPayment.childName}</h2>
                            <div style={{ cursor: "pointer", opacity: 0.5 }} onClick={closePayDialog}>
                                <CloseIcon />
                            </div>
                        </div>

                        <p style={{ opacity: 0.8, fontSize: "0.9rem", margin: 0 }}>
                            {language === "am" ? "ክፍያው ከሚጠበቀው በታች ከሆነ ቀሪው ለቀጣይ ወር እንደ እዳ ይተላለፋል::" : "If the paid amount is less than expected, the remaining balance will carry over as credit debt."}
                        </p>

                        <form onSubmit={handleSubmit(onSubmitPayment)} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <InputDate
                                    inputId="paidDate"
                                    label={language === "am" ? "የተከፈለበት ቀን" : "Paid Date"}
                                    value={!!getValues("paidDate") ? fromEthDateString(gregorianToEthDateString(getValues("paidDate"))) : todayInGreg.toString()}
                                    maxDate={todayInGreg.toString()}
                                    register={register as any}
                                    onSelect={(dateInEt) => {
                                        const dateString = dateInEt.day < 10 ? `0${dateInEt.day}` : dateInEt.day;
                                        const monthString = dateInEt.month < 10 ? `0${dateInEt.month}` : dateInEt.month;
                                        const gregString = fromEthDateString(`${monthString}-${dateString}-${dateInEt.year}`);
                                        setValue("paidDate", gregString);
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label className="label-text">{language === "am" ? "የተከፈለው መጠን" : "Paid Amount"}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="neo-input pl-3"
                                        {...register("paidAmount", { required: true, valueAsNumber: true })}
                                    />
                                    <span className="input-prefix">ETB</span>
                                </div>
                            </div>

                            <button className="primary" type="submit" style={{ marginTop: "1rem" }}>
                                {language === "am" ? "አስረክብ" : "Submit"}
                            </button>
                        </form>
                    </div>
                )}
            </dialog>
        </>
    );
}
