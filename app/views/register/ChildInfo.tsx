import { TChildInfo, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InputDate } from "./Calendar";
import { TAgeGroup } from "@/convex/types/children";
import Select from "@/components/Select";
import { calculateAge, getAgeGroup, getPaymentAmount } from "@/utils/calculateAge";
import { fromEthDateString, todayInEthString, todayInGreg } from "@/utils/calendar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { translateName } from "@/app/actions";
import { toast } from "sonner";
import { SpinnerIcon, CloseIcon, MoneyIcon } from "@/components/Icons";
import { regenerateIcon } from "@/components/Icons";
import { useLanguage } from "@/context/LanguageContext";

export default function ChildInfo({
  saveSteps,
  savedSteps,
  setStep,
  step,
}: {
  saveSteps: Dispatch<SetStateAction<TSavedSteps>>;
  savedSteps: TSavedSteps;
  setStep: Dispatch<SetStateAction<number>>;
  step: number;
}) {
  const { t, language } = useLanguage();
  const defaultValues: TChildInfo = savedSteps[step] as TChildInfo;

  const { register, trigger, getValues, setValue, watch, resetField } = useForm<TChildInfo>({
    defaultValues,
  });

  const ageGroup = watch("ageGroup");
  const fullNameAmh = watch("fullNameAmh");
  const fullName = watch("fullName");
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasAttemptedTranslation, setHasAttemptedTranslation] = useState(false);
  const [showDiscount, setShowDiscount] = useState(!!getValues("discount"));


  const paymentSettings = useQuery(api.payments.getPaymentSettings);

  const submitHandler = async (direction: "next" | "previous") => {
    const data = getValues();

    if (direction === "next") {
      const valid = await trigger();
      if (!valid) return;
      setStep((prev) => prev + 1);
    } else if (direction === "previous") {
      setStep((prev) => prev - 1);
    }

    const savedStateCopy = [...savedSteps] as TSavedSteps;
    savedStateCopy[step] = data;
    saveSteps(savedStateCopy);
  };

  const getDynamicPaymentAmount = (group: TAgeGroup) => {
    if (!paymentSettings) return 0;
    const setting = paymentSettings.find((s) => s.ageGroup === group);
    return setting ? setting.amount : 0;
  };

  const setPaymentAmount = (ageGroup: TAgeGroup) => {
    const amount = getDynamicPaymentAmount(ageGroup);
    if (amount > 0) {
      setValue("paymentAmount", amount);
    } else {
      // Fallback or keep existing logic if settings not loaded yet
      // But ideally we should wait or show loading.
      // For now let's fallback to hardcoded if API fails or returns nothing, 
      // OR just set 0 if not found.
      // Let's stick to the dynamic value only.
      setValue("paymentAmount", amount);
    }
  };

  useEffect(() => {
    if (ageGroup && paymentSettings) {
      setPaymentAmount(ageGroup);
    }
  }, [ageGroup, setValue, paymentSettings]);

  const handleFullNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (name && !getValues("fullNameAmh")) {
      setIsTranslating(true);
      try {
        const translated = await translateName(name);
        if (translated) {
          setValue("fullNameAmh", translated);
        }
      } catch (error) {
        console.error("Translation failed", error);
        toast.error(language === "am" ? "የስም ትርጉም አልተሳካም። እባክዎ በቀጥታ ያስገቡ።" : "Translation failed. Please enter manually.");
        setValue("fullNameAmh", "");
      } finally {
        setIsTranslating(false);
        setHasAttemptedTranslation(true);
      }
    }
  };

  const handleClearInput = () => {
    setValue("fullName", "");
    setValue("fullNameAmh", "");
    setHasAttemptedTranslation(false);
  };

  const handleRegenerateTranslation = async () => {
    const name = getValues("fullName");
    if (!name) return;
    setValue("fullNameAmh", "");
    setIsTranslating(true);
    try {
      const translated = await translateName(name);
      if (translated) setValue("fullNameAmh", translated);
    } catch (error) {
      console.error("Translation failed", error);
      toast.error(language === "am" ? "የስም ትርጉም አልተሳካም። እባክዎ በቀጥታ ያስገቡ።" : "Translation failed. Please enter manually.");
      setValue("fullNameAmh", "");
    } finally {
      setIsTranslating(false);
      setHasAttemptedTranslation(true);
    }
  };

  return (
    <form className="grid-gap-1 form-container">
      <h2 className="text-center mb-1">{t("registration.steps.child")}</h2>

      <div className="mb-1">
        <label htmlFor="fullName" className="label-text">{language === "am" ? "ሙሉ ስም (እንግሊዝኛ)" : "Full Name (English)"}</label>
        <div className="relative">
          <input
            className="neo-input"
            id="fullName"
            {...register("fullName", { required: true, onBlur: handleFullNameBlur })}
            placeholder={language === "am" ? "ምሳሌ፡ Dagim Askal" : "Example: Dagim Askal"}
          />
          {isTranslating && (
            <div style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <div className="animate-spin text-primary" style={{ height: "1.5rem", width: "1.5rem" }}>
                <SpinnerIcon />
              </div>
            </div>
          )}
          {!isTranslating && fullName && (
            <div style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "0.25rem", alignItems: "center" }}>
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleRegenerateTranslation();
                }}
                style={{ cursor: "pointer", color: "var(--color-primary)", height: "1.5rem", width: "1.5rem" }}
                title={language === "am" ? "ትርጉም እንደገና ፍጠር" : "Regenerate translation"}
              >
                {regenerateIcon()}
              </div>
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleClearInput();
                }}
                style={{ cursor: "pointer", opacity: 0.5, height: "1.5rem", width: "1.5rem" }}
                className="hover:opacity-100 transition-opacity"
              >
                <CloseIcon />
              </div>
            </div>
          )}
        </div>
      </div>

      {hasAttemptedTranslation && (
        <div className="mb-1 animate-fade-in">
          <label htmlFor="fullNameAmh" className="label-text">{language === "am" ? "ሙሉ ስም (አማርኛ)" : "Full Name (Amharic)"}</label>
          <input
            className="neo-input"
            id="fullNameAmh"
            {...register("fullNameAmh")}
            placeholder={language === "am" ? "ምሳሌ፡ ዳግም አስካል" : "Example: Dagim Askal"}
          />
        </div>
      )}


      <fieldset className="fieldset-reset">
        <legend className="label-text">{t("children.sort.gender")}</legend>
        <div className="neo-radio-group grid-2-col">
          <label htmlFor="male" className="justify-center">
            <input
              type="radio"
              id="male"
              value="male"
              {...register("gender", { required: true })}
            />
            {t("common.male")}
          </label>
          <label htmlFor="female" className="justify-center">
            <input
              type="radio"
              id="female"
              value="female"
              {...register("gender", { required: true })}
            />
            {t("common.female")}
          </label>
        </div>
      </fieldset>

      <InputDate
        inputId="dateOfBirth"
        label={t("childInfo.labels.birthDate")}
        value={!!getValues("dateOfBirth") ? fromEthDateString(getValues("dateOfBirth")) : todayInGreg.toString()}
        minDate={todayInGreg.subtract({ years: 5 }).toString()}
        maxDate={todayInGreg.toString()}
        register={register}
        onSelect={(dateInEt) => {
          const age = calculateAge(
            dateInEt
          );

          if (age) {
            const ageGroup = getAgeGroup(age.ageInYears);
            setValue("ageGroup", ageGroup);
            setValue("paymentAmount", getDynamicPaymentAmount(ageGroup));
          }
          const dateString = dateInEt.day < 10 ? `0${dateInEt.day}` : dateInEt.day;
          const monthString = dateInEt.month < 10 ? `0${dateInEt.month}` : dateInEt.month;
          setValue("dateOfBirth", `${monthString}-${dateString}-${dateInEt.year}`);
        }}
      />

      <Select
        id="ageGroup"
        label={t("childInfo.labels.ageGroup")}
        register={register}
        setValue={setValue}
        options={[
          { value: "infant", label: `${t("ageGroups.infant")} (0-1 ${t("childInfo.labels.year")})` },
          { value: "toddler", label: `${t("ageGroups.toddler")} (1-3 ${t("childInfo.labels.years")})` },
          { value: "preschooler", label: `${t("ageGroups.preschooler")} (3-6 ${t("childInfo.labels.years")})` },
        ]}
        defaultValue={defaultValues?.ageGroup}
        value={ageGroup}
        placeholder={t("childInfo.labels.ageGroupPlaceholder")}
      />

      {/* Watch for changes to update payment amount */}
      <div className="hidden">
        {/* This is a hack to trigger the effect when ageGroup changes via the custom Select */}
        <input type="hidden" {...register("ageGroup")} />
      </div>


      <InputDate
        inputId="startDate"
        label={t("childInfo.labels.startDate")}
        value={!!getValues("startDate") ? fromEthDateString(getValues("startDate")) : todayInGreg.toString()}
        minDate={todayInGreg.toString()}
        maxDate={todayInGreg.add({ days: 30 }).toString()}
        register={register}
        onSelect={(dateInEt) => {
          const dateString = dateInEt.day < 10 ? `0${dateInEt.day}` : dateInEt.day;
          const monthString = dateInEt.month < 10 ? `0${dateInEt.month}` : dateInEt.month;
          setValue("startDate", `${monthString}-${dateString}-${dateInEt.year}`);
        }}
      />
      {/* Hidden input to ensure form validation picks up the value */}
      <input type="hidden" {...register("startDate", { required: true })} value={watch("startDate") || todayInEthString} />

      <div className="mb-1">
        <label htmlFor="paymentDate" className="label-text">{t("childInfo.labels.paymentDate")}</label>
        <div className="relative">
          <input
            id="paymentDate"
            type="number"
            min={1}
            max={30}
            className="neo-input pl-3"
            {...register("paymentDate", { required: true, valueAsNumber: true, min: 1, max: 30 })}
            placeholder={t("childInfo.labels.paymentDatePlaceholder")}
          />
        </div>
      </div>

      <div className="mb-1">
        <label htmlFor="paymentAmount" className="label-text">{t("childInfo.labels.paymentAmount")}</label>
        <div className="relative">
          <input
            id="paymentAmount"
            type="number"
            className="neo-input pl-3"
            {...register("paymentAmount", { required: true, valueAsNumber: true })}
            placeholder=""
            readOnly
          />
          <span className="input-prefix">{language === "am" ? "ብር" : "ETB"}</span>
          <div style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "0.25rem", alignItems: "center" }}>
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setShowDiscount(prev => {
                  if (prev) {
                    setValue("discount", null as any);
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
              {...register("discount", { valueAsNumber: true })}
              placeholder={language === "am" ? "የቅናሽ መጠን (አማራጭ)" : "Discount amount (Optional)"}
            />
            <span className="input-prefix">{language === "am" ? "ብር" : "ETB"}</span>
          </div>
        </div>
      )}

      <div className="flex-gap-1 mt-2">
        <button
          type="button"
          className="secondary w-full"
          onClick={() => {
            submitHandler("previous");
          }}
          disabled={step === 0}
        >
          {t("common.back")}
        </button>

        <button
          type="button"
          className="primary w-full"
          onClick={() => {
            submitHandler("next");
          }}
        >
          {language === "am" ? "ቀጣይ" : "Next"}
        </button>
      </div>
    </form>
  );
}
