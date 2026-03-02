import { useRef, useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import Select from "@/components/Select";
import { useForm } from "react-hook-form";
import { useLanguage } from "@/context/LanguageContext";

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
    const { t } = useLanguage();
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
            toast.success(t("common.updated"));
            onDeactivated();
            handleClose();
        } catch (error) {
            console.error(error);
            toast.error(t("childInfo.messages.reactivateError")); // Generic error for now
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = (e?: any) => {
        if (e && e.target !== dialogRef.current) {
            return;
        }
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
                        <h2 style={{ color: "var(--primary-color)", margin: 0 }}>{t("deactivate.confirmTitle")}</h2>
                        <p style={{ opacity: 0.8 }}>
                            {t("deactivate.confirmMessage").replace("{name}", childName)}
                        </p>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => onClose()}>{t("common.back")}</button>
                            <button
                                type="button"
                                className="primary"
                                style={{ flex: 1 }}
                                onClick={() => setStep(2)}
                            >
                                {t("common.next")}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <h2 style={{ textAlign: "center", margin: 0 }}>{t("deactivate.reasonTitle")}</h2>

                        <Select
                            id="leaveType"
                            label={t("deactivate.selectReason")}
                            register={register}
                            setValue={setValue}
                            options={[
                                { value: "graduated", label: t("deactivate.reasons.graduated") },
                                { value: "moved", label: t("deactivate.reasons.moved") },
                                { value: "financial", label: t("deactivate.reasons.financial") },
                                { value: "other", label: t("deactivate.reasons.other") },
                            ]}
                            value={leaveType}
                            placeholder={t("deactivate.selectReason")}
                        />

                        <div className="mb-1">
                            <label className="label-text">{t("deactivate.explanation")}</label>
                            <div className="relative">
                                <textarea
                                    {...register("leaveReason")}
                                    className="neo-input"
                                    placeholder={t("deactivate.explanationPlaceholder")}
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
                            <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => onClose()} disabled={isSubmitting}>{t("common.back")}</button>
                            <button
                                type="submit"
                                className="primary"
                                style={{ flex: 1 }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? t("deactivate.deactivating") : t("deactivate.deactivate")}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </dialog>
    );
}
