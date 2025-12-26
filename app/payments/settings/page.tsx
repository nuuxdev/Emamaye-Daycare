"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import GlassHeader from "@/components/GlassHeader";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { InfantIcon, ToddlerIcon, PreschoolerIcon, EditIcon } from "@/components/Icons";

const ageGroups = [
    { id: "infant", label: "ጨቅላ (0-1)", icon: <InfantIcon /> },
    { id: "toddler", label: "ህፃን (1-2)", icon: <ToddlerIcon /> },
    { id: "preschooler", label: "ታዳጊ (3-6)", icon: <PreschoolerIcon /> },
];

export default function PaymentSettings() {
    const settings = useQuery(api.payments.getPaymentSettings);
    const updateSettings = useMutation(api.payments.updatePaymentSettings);
    const [amounts, setAmounts] = useState<Record<string, number>>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (settings) {
            const newAmounts: Record<string, number> = {};
            settings.forEach((s) => {
                newAmounts[s.ageGroup] = s.amount;
            });
            setAmounts(newAmounts);
        }
    }, [settings]);

    const handleSave = async (ageGroup: string) => {
        const amount = amounts[ageGroup];
        if (amount === undefined) return;

        try {
            await updateSettings({ ageGroup, amount });
            toast.success("Price updated successfully");
            setEditingId(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update price");
        }
    };

    return (
        <>
            <GlassHeader title="የክፍያ ቅንብሮች" backHref="/payments" />
            <main className="animate-fade-in" style={{ maxWidth: "600px", marginInline: "auto", width: "100%" }}>
                <div className="neo-box">
                    <h3 style={{ margin: "0 0 1rem 0" }}>የወርሃዊ ክፍያ በእድሜ ክልል</h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
                        {ageGroups.map((group) => (
                            <div key={group.id} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "1rem",
                                background: "rgba(0,0,0,0.02)",
                                borderRadius: "12px",
                                border: "1px solid rgba(0,0,0,0.05)"
                            }}>
                                <div className={`${group.id}`} style={{ width: "2rem", height: "2rem", display: "grid", placeItems: "center", borderRadius: "50%" }}>
                                    {group.icon}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0, fontSize: "1rem" }}>{group.label}</h4>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <input
                                        type="number"
                                        value={amounts[group.id] || ""}
                                        onChange={(e) => setAmounts({ ...amounts, [group.id]: parseInt(e.target.value) || 0 })}
                                        placeholder="Amount"
                                        disabled={editingId !== group.id}
                                        style={{ width: "120px", padding: "1rem" }}
                                    />
                                    {editingId === group.id ? (
                                        <button
                                            onClick={() => handleSave(group.id)}
                                            className="primary"
                                            style={{
                                                padding: "0",
                                                width: "3rem",
                                                height: "3rem",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderRadius: "50%"
                                            }}
                                        >
                                            <EditIcon />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setEditingId(group.id)}
                                            className="secondary"
                                            style={{
                                                padding: "0",
                                                width: "3rem",
                                                height: "3rem",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderRadius: "50%"
                                            }}
                                        >
                                            <EditIcon />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
