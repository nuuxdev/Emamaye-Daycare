"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import GlassHeader from "@/components/GlassHeader";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitch from "@/components/LanguageSwitch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { InfantIcon, ToddlerIcon, PreschoolerIcon, EditIcon } from "@/components/Icons";

const ageGroups = [
    { id: "infant", label: "ጨቅላ (0-1)", icon: <InfantIcon /> },
    { id: "toddler", label: "ህፃን (1-2)", icon: <ToddlerIcon /> },
    { id: "preschooler", label: "ታዳጊ (3-6)", icon: <PreschoolerIcon /> },
];

export default function SettingsPage() {
    const { language, setLanguage, t } = useLanguage();

    // Payment settings state
    const settings = useQuery(api.payments.getPaymentSettings);
    const updateSettings = useMutation(api.payments.updatePaymentSettings);
    const [amounts, setAmounts] = useState<Record<string, number>>({});
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (settings) {
            const newAmounts: Record<string, number> = {};
            settings.forEach((s) => { newAmounts[s.ageGroup] = s.amount; });
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
            <GlassHeader title={t("settings.title")} backHref="/" />
            <main className="p-1" style={{ maxWidth: "600px", marginInline: "auto", width: "100%", paddingBottom: "5rem" }}>

                {/* ── Card 1: General ── */}
                <div className="neo-box" style={{ alignItems: "stretch" }}>
                    <div className="settings-section">
                        <span className="settings-section-title">General</span>

                        {/* Language row */}
                        <div className="settings-row">
                            <span className="settings-row-label">{t("settings.language")}</span>
                            <LanguageSwitch
                                language={language}
                                onToggle={() => setLanguage(language === "en" ? "am" : "en")}
                                compact
                            />
                        </div>
                    </div>
                </div>

                {/* ── Card 2: Payments ── */}
                <div className="neo-box" style={{ alignItems: "stretch", marginTop: "1rem" }}>
                    <div className="settings-section">
                        <span className="settings-section-title">የወርሃዊ ክፍያ በእድሜ ክልል</span>

                        {ageGroups.map((group) => (
                            <div key={group.id} className="settings-row">
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <div className={group.id} style={{ width: "2rem", height: "2rem", display: "grid", placeItems: "center", borderRadius: "50%", flexShrink: 0 }}>
                                        {group.icon}
                                    </div>
                                    <span className="settings-row-label">{group.label}</span>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <input
                                        type="number"
                                        value={amounts[group.id] || ""}
                                        onChange={(e) => setAmounts({ ...amounts, [group.id]: parseInt(e.target.value) || 0 })}
                                        placeholder="Amount"
                                        disabled={editingId !== group.id}
                                        style={{ width: "100px", padding: "0.6rem 0.75rem" }}
                                    />
                                    <button
                                        onClick={() => editingId === group.id ? handleSave(group.id) : setEditingId(group.id)}
                                        className={editingId === group.id ? "primary" : "secondary"}
                                        style={{ padding: 0, width: "2.5rem", height: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", flexShrink: 0 }}
                                    >
                                        <EditIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </>
    );
}
