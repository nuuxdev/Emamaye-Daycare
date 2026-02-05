"use client";

import { useRef, useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import Select from "@/components/Select";
import { useForm } from "react-hook-form";

interface DeactivateChildModalProps {
    childId: Id<"children">;
    childName: string;
    isOpen: boolean;
    onClose: () => void;
    onDeactivated: () => void;
}

type FormData = {
    leaveType: string;
    leaveReason: string;
};

export default function DeactivateChildModal({
    childId,
    childName,
    isOpen,
    onClose,
    onDeactivated
}: DeactivateChildModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const deactivateChild = useMutation(api.children.deactivateChild);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const { register, setValue, watch, handleSubmit, reset } = useForm<FormData>({
        defaultValues: {
            leaveType: "graduated",
            leaveReason: "",
        }
    });

    const leaveType = watch("leaveType");

    // Sync dialog state with isOpen prop
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            if (!dialog.open) {
                dialog.showModal();
            }
        } else {
            if (dialog.open) {
                dialog.close();
            }
        }
    }, [isOpen]);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            await deactivateChild({
                childId,
                leaveType: data.leaveType,
                leaveReason: data.leaveReason || undefined,
            });
            toast.success(`${childName} deactivated successfully`);
            onDeactivated();
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to deactivate child");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = (e?: any) => {
        // Prevent child dialogs (like Select) from closing this modal
        if (e && e.target !== dialogRef.current) {
            return;
        }
        // When closing, reset for next time but ONLY if it's an actual close
        // If we just want to reset state, we can do it here.
        setStep(1);
        reset();
        onClose();
    };

    return (
        <dialog
            ref={dialogRef}
            onClose={handleClose}
            className="glass-bg"
            style={{
                padding: "2rem",
                borderRadius: "1.5rem",
                width: "min(400px, 90vw)",
                border: "none"
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {step === 1 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", textAlign: "center" }}>
                        <h2 style={{ color: "var(--primary-color)", margin: 0 }}>ልጁን ማሰናበት እርግጠኛ ነዎት?</h2>
                        <p style={{ opacity: 0.8 }}>
                            {childName} ን ማሰናበት ይፈልጋሉ? ይህ እንደ ምርቃት ወይም የመኖርያ አድራሻ መቀየር ያሉ ሁኔታዎችን ለመመዝገብ ያገለግላል።
                            አንዴ ካሰናበቱ በዋናው ዝርዝር ላይ አይታዩም።
                        </p>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => onClose()}>ተመለስ</button>
                            <button
                                type="button"
                                className="primary"
                                style={{ flex: 1 }}
                                onClick={() => setStep(2)}
                            >
                                ቀጥል
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <h2 style={{ textAlign: "center", margin: 0 }}>የመሰናበቻ ምክንያት</h2>

                        <Select
                            id="leaveType"
                            label="ምክንያት ይምረጡ"
                            register={register}
                            setValue={setValue}
                            options={[
                                { value: "graduated", label: "ተመርቋል (Graduated)" },
                                { value: "moved", label: "ቦታ ቀይሯል (Moved)" },
                                { value: "financial", label: "የገንዘብ ምክንያት (Financial)" },
                                { value: "other", label: "ሌላ (Other)" },
                            ]}
                            value={leaveType}
                            placeholder="ምክንያት ይምረጡ"
                        />

                        <div className="mb-1">
                            <label className="label-text">ተጨማሪ ማብራሪያ (ካለ)</label>
                            <div className="relative">
                                <textarea
                                    {...register("leaveReason")}
                                    className="neo-input"
                                    placeholder="ዝርዝር ሁኔታ እዚህ ይጥቀሱ..."
                                    style={{
                                        width: "100%",
                                        minHeight: "120px",
                                        resize: "none",
                                        fontFamily: "inherit"
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => onClose()} disabled={isSubmitting}>ተመለስ</button>
                            <button
                                type="submit"
                                className="primary"
                                style={{ flex: 1 }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "በመሰናበት ላይ..." : "አሰናብት"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </dialog>
    );
}
