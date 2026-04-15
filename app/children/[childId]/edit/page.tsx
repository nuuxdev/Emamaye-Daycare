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
import { SpinnerIcon, CloseIcon, MoneyIcon } from "@/components/Icons";
import { regenerateIcon } from "@/components/Icons";
import { TAgeGroup, TGender } from "@/convex/types/children";
import { TRelationToChild } from "@/convex/types/guardians";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

type TChildForm = {
    fullName: string;
    fullNameAmh?: string;
    gender: TGender;
    dateOfBirth: string;
    ageGroup: TAgeGroup;
    paymentAmount: number | null;
    discount: number | null;
    paymentDate: number | null;
    startDate: string;
};

type TGuardianForm = {
    fullName: string;
    fullNameAmh?: string;
    relationToChild: TRelationToChild;
    address: string;
    phoneNumber: string;
};

export default function EditChildPage() {
    const { t, language } = useLanguage();
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
            discount: child.discount || null,
            paymentDate: child.paymentDate ?? null,
            startDate: child.startDate || gregorianToEthDateString(child.dateOfBirth),
        });
        if (child.discount) setShowDiscount(true);
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
    const [showDiscount, setShowDiscount] = useState(!!cGetValues("discount"));

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
            toast.error(t("common.fillAllFields"));
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
                    discount: cData.discount || undefined,
                    paymentDate: cData.paymentDate ?? 1,
                    startDate: cData.startDate,
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

            toast.success(t("common.updated"));
            router.back();
        } catch (err) {
            console.error(err);
            toast.error(t("childInfo.messages.photoUploadError")); // Reusing error toast key
        } finally {
            setIsSaving(false);
        }
    };

    if (!child) return null;

    const sectionTabs = [
        { id: "child" as const, label: t("registration.steps.child") },
        { id: "guardian" as const, label: t("registration.steps.guardian") },
    ];

    return (
        <>
            <GlassHeader
                title={t("common.edit")}
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
                        <h2 className="text-center mb-1">{t("registration.steps.child")}</h2>

                        {/* Full Name */}
                        <div className="mb-1">
                            <label htmlFor="c-fullName" className="label-text">{language === "am" ? "ሙሉ ስም (እንግሊዝኛ)" : "Full Name (English)"}</label>
                            <div className="relative">
                                <input
                                    className="neo-input"
                                    id="c-fullName"
                                    {...cReg("fullName", { required: true, onBlur: handleChildNameBlur })}
                                    placeholder={language === "am" ? "ምሳሌ፡ Dagim Askal" : "Example: Dagim Askal"}
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
                                            style={{ cursor: "pointer", color: "var(--color-primary)", height: "1.5rem", width: "1.5rem" }}
                                            title={language === "am" ? "ትርጉም እንደገና ፍጠር" : "Regenerate translation"}
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
                                <label htmlFor="c-fullNameAmh" className="label-text">{language === "am" ? "ሙሉ ስም (አማርኛ)" : "Full Name (Amharic)"}</label>
                                <input className="neo-input" id="c-fullNameAmh" {...cReg("fullNameAmh")} placeholder={language === "am" ? "ምሳሌ፡ ዳግም አስካል" : "Example: Dagim Askal"} />
                            </div>
                        )}

                        {/* Gender */}
                        <fieldset className="fieldset-reset">
                            <legend className="label-text">{t("children.sort.gender")}</legend>
                            <div className="neo-radio-group grid-2-col">
                                <label htmlFor="male" className="justify-center">
                                    <input type="radio" id="male" value="male" {...cReg("gender", { required: true })} />
                                    {t("common.male")}
                                </label>
                                <label htmlFor="female" className="justify-center">
                                    <input type="radio" id="female" value="female" {...cReg("gender", { required: true })} />
                                    {t("common.female")}
                                </label>
                            </div>
                        </fieldset>

                        {/* Date of Birth */}
                        <InputDate
                            label={t("childInfo.labels.birthDate")}
                            value={!!cGetValues("dateOfBirth") ? fromEthDateString(cGetValues("dateOfBirth")) : todayInGreg.toString()}
                            minDate={todayInGreg.subtract({ years: 5 }).toString()}
                            maxDate={todayInGreg.toString()}
                            inputId="dateOfBirth"
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
                            label={t("children.sort.age")}
                            register={cReg}
                            setValue={cSetValue}
                            options={[
                                { value: "infant", label: `${t("ageGroups.infant")} (0-1 ${t("childInfo.labels.year")})` },
                                { value: "toddler", label: `${t("ageGroups.toddler")} (1-3 ${t("childInfo.labels.years")})` },
                                { value: "preschooler", label: `${t("ageGroups.preschooler")} (3-6 ${t("childInfo.labels.years")})` },
                            ]}
                            value={childAgeGroup}
                            placeholder={t("settings.selectLanguage")}
                        />
                        <div className="hidden"><input type="hidden" {...cReg("ageGroup")} /></div>

                        {/* Starting Date */}
                        <InputDate
                            inputId="startDate"
                            label={t("childInfo.labels.startDate")}
                            value={!!cGetValues("startDate") ? fromEthDateString(cGetValues("startDate")) : todayInGreg.toString()}
                            minDate={todayInGreg.toString()}
                            maxDate={todayInGreg.add({ days: 30 }).toString()}
                            register={cReg}
                            onSelect={(dateInEt) => {
                                const dateString = dateInEt.day < 10 ? `0${dateInEt.day}` : dateInEt.day;
                                const monthString = dateInEt.month < 10 ? `0${dateInEt.month}` : dateInEt.month;
                                cSetValue("startDate", `${monthString}-${dateString}-${dateInEt.year}`);
                            }}
                        />
                        <input type="hidden" {...cReg("startDate", { required: true })} />

                        {/* Payment Date */}
                        <div className="mb-1">
                            <label htmlFor="editPaymentDate" className="label-text">{t("childInfo.labels.paymentDate")}</label>
                            <div className="relative">
                                <input
                                    id="editPaymentDate"
                                    type="number"
                                    min={1}
                                    max={30}
                                    className="neo-input pl-3"
                                    {...cReg("paymentDate", { required: true, valueAsNumber: true, min: 1, max: 30 })}
                                    placeholder={language === "am" ? "ቀን ያስገቡ" : "Enter day of the month"}
                                />
                            </div>
                        </div>

                        {/* Payment Amount */}
                        <div className="mb-1">
                            <label htmlFor="paymentAmount" className="mb-1 label-text">{t("kpi.categoryPayments")}</label>
                            <div className="relative">
                                <input
                                    id="paymentAmount"
                                    type="number"
                                    className="neo-input pl-3"
                                    {...cReg("paymentAmount", { required: true, valueAsNumber: true })}
                                    placeholder={language === "am" ? "መጠን በብር" : "Amount in ETB"}
                                    readOnly
                                />
                                <span className="input-prefix">{language === "am" ? "ብር" : "ETB"}</span>
                                <div style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "0.25rem", alignItems: "center" }}>
                                    <div
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setShowDiscount(prev => {
                                                if (prev) {
                                                    cSetValue("discount", null as any);
                                                }
                                                return !prev;
                                            });
                                        }}
                                        style={{ cursor: "pointer", color: "var(--color-primary)", height: "1.5rem", width: "1.5rem" }}
                                        title={language === "am" ? "ቅናሽ" : "Discount"}
                                    >
                                        {showDiscount ? <CloseIcon /> : <MoneyIcon />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {showDiscount && (
                            <div className="mb-1 animate-fade-in">
                                <label htmlFor="discount" className="label-text">{language === "am" ? "ቅናሽ" : "Discount"}</label>
                                <div className="relative">
                                    <input
                                        className="neo-input pl-3"
                                        id="discount"
                                        type="number"
                                        {...cReg("discount", { valueAsNumber: true })}
                                        placeholder={language === "am" ? "የቅናሽ መጠን (አማራጭ)" : "Discount amount (Optional)"}
                                    />
                                    <span className="input-prefix">{language === "am" ? "ብር" : "ETB"}</span>
                                </div>
                            </div>
                        )}
                    </form>
                )}

                {/* Guardian section */}
                {activeSection === "guardian" && (
                    <form className="grid-gap-1 form-container animate-fade-in">
                        <h2 className="text-center mb-1">{t("registration.steps.guardian")}</h2>

                        {/* Full Name */}
                        <div className="mb-1">
                            <label htmlFor="g-fullName" className="label-text">{language === "am" ? "ሙሉ ስም (እንግሊዝኛ)" : "Full Name (English)"}</label>
                            <div className="relative">
                                <input
                                    className="neo-input"
                                    id="g-fullName"
                                    {...gReg("fullName", { required: true, onBlur: handleGuardianNameBlur })}
                                    placeholder={language === "am" ? "ምሳሌ፡ Tigist Alemu" : "Example: Tigist Alemu"}
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
                                            style={{ cursor: "pointer", color: "var(--color-primary)", height: "1.5rem", width: "1.5rem" }}
                                            title={language === "am" ? "ትርጉም እንደገና ፍጠር" : "Regenerate translation"}
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
                                <label htmlFor="g-fullNameAmh" className="label-text">{language === "am" ? "ሙሉ ስም (አማርኛ)" : "Full Name (Amharic)"}</label>
                                <input className="neo-input" id="g-fullNameAmh" {...gReg("fullNameAmh")} placeholder={language === "am" ? "ምሳሌ፡ ጥጋስት አለሙ" : "Example: Dagim Askal"} />
                            </div>
                        )}

                        {/* Relation */}
                        <Select
                            id="relationToChild"
                            label={language === "am" ? "ከልጁ ጋር ያለው ዝምድና" : "Relation to Child"}
                            register={gReg}
                            setValue={gSetValue}
                            options={[
                                { value: "mother", label: language === "am" ? "እናት" : "Mother" },
                                { value: "father", label: language === "am" ? "አባት" : "Father" },
                                { value: "grandparent", label: language === "am" ? "አያት" : "Grandparent" },
                                { value: "aunt_uncle", label: language === "am" ? "አክስት / አጎት" : "Aunt / Uncle" },
                                { value: "sibling", label: language === "am" ? "ወንድም / እህት" : "Sibling" },
                                { value: "other", label: language === "am" ? "ሌላ" : "Other" },
                            ]}
                            value={gWatch("relationToChild")}
                            placeholder={language === "am" ? "ዝምድና ይምረጡ" : "Select relation"}
                        />

                        {/* Address */}
                        <div className="mb-1">
                            <label htmlFor="g-address" className="label-text">{language === "am" ? "አድራሻ" : "Address"}</label>
                            <input className="neo-input" id="g-address" {...gReg("address", { required: true })} placeholder={language === "am" ? "ሰፈር / ቀበሌ" : "Neighborhood / Kebele"} />
                        </div>

                        {/* Phone */}
                        <div className="mb-1">
                            <label htmlFor="g-phone" className="label-text">{language === "am" ? "ስልክ ቁጥር" : "Phone Number"}</label>
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
                        {isSaving ? t("common.save") + "..." : t("common.save")}
                    </button>
                </div>
            </main>
        </>
    );
}
