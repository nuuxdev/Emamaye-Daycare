"use client";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import GlassHeader from "@/components/GlassHeader";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Select from "@/components/Select";
import { InputDate } from "@/app/views/register/Calendar";
import { calculateAge, getAgeGroup } from "@/utils/calculateAge";
import { fromEthDateString, gregorianToEthDateString, todayInGreg } from "@/utils/calendar";
import { translateName } from "@/app/actions";
import { SpinnerIcon, CloseIcon } from "@/components/Icons";
import { regenerateIcon } from "@/components/Icons";
import { TAgeGroup, TGender } from "@/convex/types/children";
import { TRelationToChild } from "@/convex/types/guardians";
import { toast } from "sonner";

type TChildForm = {
    fullName: string;
    fullNameAmh?: string;
    gender: TGender;
    dateOfBirth: string;
    ageGroup: TAgeGroup;
    paymentAmount: number | null;
    paymentSchedule: "month_end" | "month_half";
};

type TGuardianForm = {
    fullName: string;
    fullNameAmh?: string;
    relationToChild: TRelationToChild;
    address: string;
    phoneNumber: string;
};

export default function EditChildPage() {
    const { childId } = useParams<{ childId: string }>();
    const router = useRouter();

    const child = useQuery(api.children.getChild, {
        id: childId as Id<"children">,
    });

    const paymentSettings = useQuery(api.payments.getPaymentSettings);
    const updateChild = useMutation(api.children.updateChild);
    const updateGuardian = useMutation(api.guardians.updateGuardian);

    const [activeSection, setActiveSection] = useState<"child" | "guardian">("child");
    const [isSaving, setIsSaving] = useState(false);
    const [isTranslatingChild, setIsTranslatingChild] = useState(false);
    const [isTranslatingGuardian, setIsTranslatingGuardian] = useState(false);

    // Child form
    const {
        register: cReg,
        trigger: cTrigger,
        getValues: cGetValues,
        setValue: cSetValue,
        watch: cWatch,
        reset: cReset,
    } = useForm<TChildForm>();

    // Guardian form
    const {
        register: gReg,
        trigger: gTrigger,
        getValues: gGetValues,
        setValue: gSetValue,
        watch: gWatch,
        reset: gReset,
    } = useForm<TGuardianForm>();

    // Populate forms when data loads
    useEffect(() => {
        if (!child) return;
        cReset({
            fullName: child.fullName,
            fullNameAmh: child.fullNameAmh || "",
            gender: child.gender as TGender,
            dateOfBirth: gregorianToEthDateString(child.dateOfBirth),
            ageGroup: child.ageGroup as TAgeGroup,
            paymentAmount: child.paymentAmount,
            paymentSchedule: child.paymentSchedule as "month_end" | "month_half",
        });
        if (child.primaryGuardian) {
            gReset({
                fullName: child.primaryGuardian.fullName,
                fullNameAmh: child.primaryGuardian.fullNameAmh || "",
                relationToChild: child.primaryGuardian.relationToChild as TRelationToChild,
                address: child.primaryGuardian.address,
                phoneNumber: child.primaryGuardian.phoneNumber,
            });
        }
    }, [child]);

    const childAgeGroup = cWatch("ageGroup");
    const childFullName = cWatch("fullName");
    const childFullNameAmh = cWatch("fullNameAmh");
    const guardianFullName = gWatch("fullName");
    const guardianFullNameAmh = gWatch("fullNameAmh");

    const getDynamicPaymentAmount = (group: TAgeGroup) => {
        if (!paymentSettings) return 0;
        const setting = paymentSettings.find((s) => s.ageGroup === group);
        return setting ? setting.amount : 0;
    };

    useEffect(() => {
        if (childAgeGroup && paymentSettings) {
            cSetValue("paymentAmount", getDynamicPaymentAmount(childAgeGroup));
        }
    }, [childAgeGroup, paymentSettings]);

    const handleChildNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const name = e.target.value;
        if (name && !cGetValues("fullNameAmh")) {
            setIsTranslatingChild(true);
            try {
                const translated = await translateName(name);
                if (translated) cSetValue("fullNameAmh", translated);
            } finally {
                setIsTranslatingChild(false);
            }
        }
    };

    const handleRegenerateChildTranslation = async () => {
        const name = cGetValues("fullName");
        if (!name) return;
        cSetValue("fullNameAmh", "");
        setIsTranslatingChild(true);
        try {
            const translated = await translateName(name);
            if (translated) cSetValue("fullNameAmh", translated);
        } finally {
            setIsTranslatingChild(false);
        }
    };

    const handleGuardianNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const name = e.target.value;
        if (name && !gGetValues("fullNameAmh")) {
            setIsTranslatingGuardian(true);
            try {
                const translated = await translateName(name);
                if (translated) gSetValue("fullNameAmh", translated);
            } finally {
                setIsTranslatingGuardian(false);
            }
        }
    };

    const handleRegenerateGuardianTranslation = async () => {
        const name = gGetValues("fullName");
        if (!name) return;
        gSetValue("fullNameAmh", "");
        setIsTranslatingGuardian(true);
        try {
            const translated = await translateName(name);
            if (translated) gSetValue("fullNameAmh", translated);
        } finally {
            setIsTranslatingGuardian(false);
        }
    };

    const handleSave = async () => {
        const childValid = await cTrigger();
        const guardianValid = await gTrigger();
        if (!childValid || !guardianValid) {
            toast.error("እባክዎ ሁሉንም መስኮች ይሙሉ");
            return;
        }

        setIsSaving(true);
        try {
            const cData = cGetValues();
            const gData = gGetValues();

            await Promise.all([
                updateChild({
                    childId: childId as Id<"children">,
                    fullName: cData.fullName,
                    fullNameAmh: cData.fullNameAmh || undefined,
                    gender: cData.gender,
                    dateOfBirth: fromEthDateString(cData.dateOfBirth),
                    ageGroup: cData.ageGroup,
                    paymentAmount: cData.paymentAmount ?? 0,
                    paymentSchedule: cData.paymentSchedule,
                }),
                child?.primaryGuardian &&
                updateGuardian({
                    guardianId: child.primaryGuardian._id,
                    fullName: gData.fullName,
                    fullNameAmh: gData.fullNameAmh || undefined,
                    relationToChild: gData.relationToChild,
                    address: gData.address,
                    phoneNumber: gData.phoneNumber,
                }),
            ]);

            toast.success("መረጃ ተዘምኗ ✓");
            router.back();
        } catch (err) {
            console.error(err);
            toast.error("ማስቀመጥ አልተሳካም");
        } finally {
            setIsSaving(false);
        }
    };

    if (!child) return null;

    const sectionTabs = [
        { id: "child" as const, label: "ልጅ" },
        { id: "guardian" as const, label: "አሳዳጊ" },
    ];

    return (
        <>
            <GlassHeader
                title="አርም"
                onBack={() => router.back()}
            />
            <main style={{ maxWidth: "600px", marginInline: "auto", justifyContent: "start" }}>
                {/* Section tabs */}
                <div style={{ display: "flex", width: "100%", gap: "0", marginBlockEnd: "1rem" }}>
                    {sectionTabs.map((tab) => (
                        <button
                            key={tab.id}
                            disabled={activeSection === tab.id}
                            onClick={() => setActiveSection(tab.id)}
                            className="tabs secondary"
                            style={{ flex: 1 }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Child section */}
                {activeSection === "child" && (
                    <form className="grid-gap-1 form-container animate-fade-in">
                        <h2 className="text-center mb-1">የልጅ መረጃ</h2>

                        {/* Full Name */}
                        <div className="mb-1">
                            <label htmlFor="c-fullName" className="label-text">ሙሉ ስም (እንግሊዝኛ)</label>
                            <div className="relative">
                                <input
                                    className="neo-input"
                                    id="c-fullName"
                                    {...cReg("fullName", { required: true, onBlur: handleChildNameBlur })}
                                    placeholder="Example: Dagim Askal"
                                />
                                {isTranslatingChild && (
                                    <div style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                        <div className="animate-spin text-primary" style={{ height: "1.5rem", width: "1.5rem" }}><SpinnerIcon /></div>
                                    </div>
                                )}
                                {!isTranslatingChild && childFullName && (
                                    <div style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "0.25rem", alignItems: "center" }}>
                                        <div
                                            onMouseDown={(e) => { e.preventDefault(); handleRegenerateChildTranslation(); }}
                                            style={{ cursor: "pointer", color: "var(--primary-color)", height: "1.5rem", width: "1.5rem" }}
                                            title="ትርጉም እንደገና ፍጠር"
                                        >
                                            {regenerateIcon()}
                                        </div>
                                        <div
                                            onMouseDown={(e) => { e.preventDefault(); cSetValue("fullName", ""); cSetValue("fullNameAmh", ""); }}
                                            style={{ cursor: "pointer", opacity: 0.5, height: "1.5rem", width: "1.5rem" }}
                                        >
                                            <CloseIcon />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Amharic Name */}
                        {childFullNameAmh && (
                            <div className="mb-1 animate-fade-in">
                                <label htmlFor="c-fullNameAmh" className="label-text">ሙሉ ስም (አማርኛ)</label>
                                <input className="neo-input" id="c-fullNameAmh" {...cReg("fullNameAmh")} placeholder="ምሳሌ፡ ዳግም አስካል" />
                            </div>
                        )}

                        {/* Gender */}
                        <fieldset className="fieldset-reset">
                            <legend className="label-text">ጾታ</legend>
                            <div className="neo-radio-group grid-2-col">
                                <label htmlFor="male" className="justify-center">
                                    <input type="radio" id="male" value="male" {...cReg("gender", { required: true })} />
                                    ወንድ
                                </label>
                                <label htmlFor="female" className="justify-center">
                                    <input type="radio" id="female" value="female" {...cReg("gender", { required: true })} />
                                    ሴት
                                </label>
                            </div>
                        </fieldset>

                        {/* Date of Birth */}
                        <InputDate
                            value={!!cGetValues("dateOfBirth") ? fromEthDateString(cGetValues("dateOfBirth")) : todayInGreg.toString()}
                            register={cReg}
                            onSelect={(dateInEt) => {
                                const age = calculateAge(dateInEt);
                                if (age) {
                                    const group = getAgeGroup(age.ageInYears);
                                    cSetValue("ageGroup", group);
                                    cSetValue("paymentAmount", getDynamicPaymentAmount(group));
                                }
                                const d = dateInEt.day < 10 ? `0${dateInEt.day}` : dateInEt.day;
                                const m = dateInEt.month < 10 ? `0${dateInEt.month}` : dateInEt.month;
                                cSetValue("dateOfBirth", `${m}-${d}-${dateInEt.year}`);
                            }}
                        />

                        {/* Age Group */}
                        <Select
                            id="ageGroup"
                            label="የእድሜ ክልል"
                            register={cReg}
                            setValue={cSetValue}
                            options={[
                                { value: "infant", label: "ጨቅላ (0-1 ዓመት)" },
                                { value: "toddler", label: "ታዳጊ (1-3 ዓመት)" },
                                { value: "preschooler", label: "ቅድመ ትምህርት (3-6 ዓመት)" },
                            ]}
                            value={childAgeGroup}
                            placeholder="የእድሜ ክልል ይምረጡ"
                        />
                        <div className="hidden"><input type="hidden" {...cReg("ageGroup")} /></div>

                        {/* Payment Schedule */}
                        <Select
                            id="paymentSchedule"
                            label="የክፍያ ጊዜ"
                            register={cReg}
                            setValue={cSetValue}
                            options={[
                                { value: "month_end", label: "የወር መጨረሻ (30)" },
                                { value: "month_half", label: "ወር አጋማሽ (15)" },
                            ]}
                            value={cWatch("paymentSchedule")}
                            placeholder="የክፍያ ጊዜ ይምረጡ"
                        />

                        {/* Payment Amount */}
                        <div className="mb-1">
                            <label htmlFor="paymentAmount" className="mb-1 label-text">የክፍያ መጠን</label>
                            <div className="relative">
                                <input
                                    id="paymentAmount"
                                    type="number"
                                    className="neo-input pl-3"
                                    {...cReg("paymentAmount", { required: true, valueAsNumber: true })}
                                    placeholder="መጠን በብር"
                                    readOnly
                                />
                                <span className="input-prefix">ብር</span>
                            </div>
                        </div>
                    </form>
                )}

                {/* Guardian section */}
                {activeSection === "guardian" && (
                    <form className="grid-gap-1 form-container animate-fade-in">
                        <h2 className="text-center mb-1">የአሳዳጊ መረጃ</h2>

                        {/* Full Name */}
                        <div className="mb-1">
                            <label htmlFor="g-fullName" className="label-text">ሙሉ ስም (እንግሊዝኛ)</label>
                            <div className="relative">
                                <input
                                    className="neo-input"
                                    id="g-fullName"
                                    {...gReg("fullName", { required: true, onBlur: handleGuardianNameBlur })}
                                    placeholder="Example: Tigist Alemu"
                                />
                                {isTranslatingGuardian && (
                                    <div style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                                        <div className="animate-spin text-primary" style={{ height: "1.5rem", width: "1.5rem" }}><SpinnerIcon /></div>
                                    </div>
                                )}
                                {!isTranslatingGuardian && guardianFullName && (
                                    <div style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "0.25rem", alignItems: "center" }}>
                                        <div
                                            onMouseDown={(e) => { e.preventDefault(); handleRegenerateGuardianTranslation(); }}
                                            style={{ cursor: "pointer", color: "var(--primary-color)", height: "1.5rem", width: "1.5rem" }}
                                            title="ትርጉም እንደገና ፍጠር"
                                        >
                                            {regenerateIcon()}
                                        </div>
                                        <div
                                            onMouseDown={(e) => { e.preventDefault(); gSetValue("fullName", ""); gSetValue("fullNameAmh", ""); }}
                                            style={{ cursor: "pointer", opacity: 0.5, height: "1.5rem", width: "1.5rem" }}
                                        >
                                            <CloseIcon />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Amharic Name */}
                        {guardianFullNameAmh && (
                            <div className="mb-1 animate-fade-in">
                                <label htmlFor="g-fullNameAmh" className="label-text">ሙሉ ስም (አማርኛ)</label>
                                <input className="neo-input" id="g-fullNameAmh" {...gReg("fullNameAmh")} placeholder="ምሳሌ፡ ጥጋስት አለሙ" />
                            </div>
                        )}

                        {/* Relation */}
                        <Select
                            id="relationToChild"
                            label="ከልጁ ጋር ያለው ዝምድና"
                            register={gReg}
                            setValue={gSetValue}
                            options={[
                                { value: "mother", label: "እናት" },
                                { value: "father", label: "አባት" },
                                { value: "grandparent", label: "አያት" },
                                { value: "aunt_uncle", label: "አክስት / አጎት" },
                                { value: "sibling", label: "ወንድም / እህት" },
                                { value: "other", label: "ሌላ" },
                            ]}
                            value={gWatch("relationToChild")}
                            placeholder="ዝምድና ይምረጡ"
                        />

                        {/* Address */}
                        <div className="mb-1">
                            <label htmlFor="g-address" className="label-text">አድራሻ</label>
                            <input className="neo-input" id="g-address" {...gReg("address", { required: true })} placeholder="ሰፈር / ቀበሌ" />
                        </div>

                        {/* Phone */}
                        <div className="mb-1">
                            <label htmlFor="g-phone" className="label-text">ስልክ ቁጥር</label>
                            <input
                                className="neo-input"
                                id="g-phone"
                                type="tel"
                                {...gReg("phoneNumber", { required: true })}
                                placeholder="09xxxxxxxx"
                            />
                        </div>
                    </form>
                )}

                {/* Save button */}
                <div style={{ padding: "1rem", width: "100%" }}>
                    <button
                        type="button"
                        className="primary w-full"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "እየተቀመጠ..." : "አስቀምጥ"}
                    </button>
                </div>
            </main>
        </>
    );
}
