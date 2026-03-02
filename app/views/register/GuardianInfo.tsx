import { TGuardianInfo, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Select from "@/components/Select";
import { translateName } from "@/app/actions";
import { SpinnerIcon, CloseIcon } from "@/components/Icons";
import { regenerateIcon } from "@/components/Icons";
import { useState } from "react";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useLanguage } from "@/context/LanguageContext";

export default function GuardianInfo({
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
  const defaultValues: TGuardianInfo = savedSteps[step] as TGuardianInfo;
  const convex = useConvex();

  const { register, trigger, getValues, setValue, watch, reset } = useForm<TGuardianInfo>({
    defaultValues,
  });

  const fullNameAmh = watch("fullNameAmh");
  const fullName = watch("fullName");
  const phoneNumber = watch("phoneNumber");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [existingGuardian, setExistingGuardian] = useState<Doc<"guardians"> | null>(null);
  const [existingChildren, setExistingChildren] = useState<string[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const guardianDialogRef = useRef<HTMLDialogElement>(null);

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
    // Also update storage IDs if guardian was accepted
    if (existingGuardian) {
      savedStateCopy[2] = {
        ...savedStateCopy[2],
        guardianStorageId: existingGuardian.avatar ? undefined : savedStateCopy[2].guardianStorageId,
      };
    }
    saveSteps(savedStateCopy);
  };

  const handleFullNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
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
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handlePhoneNumberBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    if (!phone || phone === defaultValues.phoneNumber) return;

    setIsCheckingPhone(true);
    try {
      const guardian = await convex.query(api.guardians.getGuardianByPhoneNumber, { phoneNumber: phone });
      if (guardian) {
        const children = await convex.query(api.children.getChildrenNamesByGuardian, { guardianId: guardian._id });
        setExistingGuardian(guardian);
        setExistingChildren(children);
        guardianDialogRef.current?.showModal();
      }
    } catch (error) {
      console.error("Phone check failed", error);
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handleAcceptGuardian = () => {
    if (existingGuardian) {
      setValue("fullName", existingGuardian.fullName);
      setValue("fullNameAmh", existingGuardian.fullNameAmh);
      setValue("address", existingGuardian.address);
      setValue("relationToChild", existingGuardian.relationToChild);
      setIsReadOnly(true);
    }
    guardianDialogRef.current?.close();
  };

  const handleChangePhone = () => {
    setValue("phoneNumber", "");
    setExistingGuardian(null);
    setExistingChildren([]);
    setIsReadOnly(false);
    guardianDialogRef.current?.close();
  };

  const handleClearInput = () => {
    if (isReadOnly) return;
    setValue("fullName", "");
    setValue("fullNameAmh", undefined);
  };

  const handleRegenerateTranslation = async () => {
    if (isReadOnly) return;
    const name = getValues("fullName");
    if (!name) return;
    setValue("fullNameAmh", undefined);
    setIsTranslating(true);
    try {
      const translated = await translateName(name);
      if (translated) setValue("fullNameAmh", translated);
    } catch (error) {
      console.error("Translation failed", error);
    } finally {
      setIsTranslating(false);
    }
  };


  return (
    <form className="grid-gap-1 form-container">
      <h2 className="text-center mb-1">{t("registration.steps.guardian")}</h2>

      <div className="neo-box secondary p-1 mb-1 text-center" style={{ fontSize: "0.9rem", color: "var(--primary-color)" }}>
        <p>{t("registration.guardianCheck.notice")}</p>
      </div>

      <div className="mb-1">
        <label htmlFor="phoneNumber">{language === "am" ? "ስልክ ቁጥር" : "Phone Number"}</label>
        <div className="relative">
          <input
            id="phoneNumber"
            type="tel"
            className="neo-input"
            {...register("phoneNumber", { required: true, onBlur: handlePhoneNumberBlur })}
            placeholder={language === "am" ? "ምሳሌ፡ 0911121314" : "Example: 0911121314"}
          />
          {isCheckingPhone && (
            <div style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <LoadingSpinner size="1.25rem" />
            </div>
          )}
        </div>
      </div>

      <div className="mb-1">
        <label htmlFor="fullName">{language === "am" ? "ሙሉ ስም (እንግሊዝኛ)" : "Full Name (English)"}</label>
        <div className="relative">
          <input
            id="fullName"
            type="text"
            className="neo-input"
            readOnly={isReadOnly}
            {...register("fullName", { required: true, onBlur: handleFullNameBlur })}
            placeholder={language === "am" ? "ምሳሌ፡ Abebe Kebede" : "Example: Abebe Kebede"}
          />
          {isTranslating && (
            <div style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <LoadingSpinner size="1.5rem" />
            </div>
          )}
          {!isTranslating && fullName && !isReadOnly && (
            <div style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "0.25rem", alignItems: "center" }}>
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleRegenerateTranslation();
                }}
                style={{ cursor: "pointer", color: "var(--primary-color)", height: "1.5rem", width: "1.5rem" }}
                title="ትርጉም እንደገና ፍጠር"
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

      {(fullNameAmh || isReadOnly) && (
        <div className="mb-1 animate-fade-in">
          <label htmlFor="fullNameAmh" className="label-text">{language === "am" ? "ሙሉ ስም (አማርኛ)" : "Full Name (Amharic)"}</label>
          <input
            className="neo-input"
            id="fullNameAmh"
            readOnly={isReadOnly}
            {...register("fullNameAmh")}
            placeholder={language === "am" ? "ምሳሌ፡ አበበ ከበደ" : "Example: Abebe Kebede"}
          />
        </div>
      )}


      <Select
        id="relationToChild"
        label={language === "am" ? "ዝምድና" : "Relation"}
        register={register}
        setValue={setValue}
        disabled={isReadOnly}
        value={watch("relationToChild")}
        options={[
          { value: "mother", label: language === "am" ? "እናት" : "Mother" },
          { value: "father", label: language === "am" ? "አባት" : "Father" },
          { value: "grandparent", label: language === "am" ? "አያት" : "Grandparent" },
          { value: "aunt", label: language === "am" ? "አክስት" : "Aunt" },
          { value: "uncle", label: language === "am" ? "አጎት" : "Uncle" },
          { value: "other", label: language === "am" ? "ሌላ" : "Other" },
        ]}
        defaultValue={defaultValues?.relationToChild}
        placeholder={language === "am" ? "ዝምድና ይምረጡ" : "Select relation"}
      />

      <div className="mb-1">
        <label htmlFor="address">{language === "am" ? "አድራሻ" : "Address"}</label>
        <input
          id="address"
          className="neo-input"
          readOnly={isReadOnly}
          {...register("address", { required: true })}
          placeholder={language === "am" ? "ምሳሌ፡ ቦሌ፣ አዲስ አበባ" : "Example: Bole, Addis Ababa"}
        />
      </div>

      <div className="flex-gap-1 mt-2">
        <button
          type="button"
          className="secondary w-full"
          onClick={() => {
            submitHandler("previous");
          }}
        >
          {t("common.back")}
        </button>

        <button
          type="button"
          className="neo-btn primary w-full"
          onClick={() => {
            submitHandler("next");
          }}
        >
          {language === "am" ? "ቀጣይ" : "Next"}
        </button>
      </div>

      <dialog ref={guardianDialogRef}>
        <div className="dialog-title">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t("registration.guardianCheck.foundTitle")}</h2>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
            {t("registration.guardianCheck.foundMessage")} <strong>{existingGuardian?.fullName}</strong>.
          </p>
          {existingChildren.length > 0 && (
            <p style={{ opacity: 0.8, fontSize: '0.8rem', marginTop: '0.5rem' }}>
              {language === "am" ? "ያሏቸው ልጆች" : "Existing children"}: {existingChildren.join(", ")}
            </p>
          )}
        </div>
        <div className="dialog-actions" style={{ flexDirection: 'column', gap: '0.75rem' }}>
          <button type="button" className="neo-btn primary w-full" onClick={handleAcceptGuardian}>
            {t("registration.guardianCheck.accept")}
          </button>
          <button type="button" className="secondary w-full" onClick={handleChangePhone}>
            {t("registration.guardianCheck.change")}
          </button>
        </div>
      </dialog>
    </form>
  );
}
