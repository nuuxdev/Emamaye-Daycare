import { TGuardianInfo, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import Select from "@/components/Select";
import { translateName } from "@/app/actions";
import { SpinnerIcon, CloseIcon } from "@/components/Icons";
import { regenerateIcon } from "@/components/Icons";
import { useState } from "react";

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
  const defaultValues: TGuardianInfo = savedSteps[step] as TGuardianInfo;

  const { register, trigger, getValues, setValue, watch } = useForm<TGuardianInfo>({
    defaultValues,
  });

  const fullNameAmh = watch("fullNameAmh");
  const fullName = watch("fullName");
  const [isTranslating, setIsTranslating] = useState(false);


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
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleClearInput = () => {
    setValue("fullName", "");
    setValue("fullNameAmh", undefined);
  };

  const handleRegenerateTranslation = async () => {
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
      <h2 className="text-center mb-1">የወላጅ መረጃ</h2>

      <div className="mb-1">
        <label htmlFor="fullName">ሙሉ ስም (እንግሊዝኛ)</label>
        <div className="relative">
          <input
            id="fullName"
            type="text"
            className="neo-input"
            {...register("fullName", { required: true, onBlur: handleFullNameBlur })}
            placeholder="Example: Abebe Kebede"
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

      {fullNameAmh && (
        <div className="mb-1 animate-fade-in">
          <label htmlFor="fullNameAmh" className="label-text">ሙሉ ስም (አማርኛ)</label>
          <input
            className="neo-input"
            id="fullNameAmh"
            {...register("fullNameAmh")}
            placeholder="ምሳሌ፡ አበበ ከበደ"
          />
        </div>
      )}


      <Select
        id="relationToChild"
        label="ዝምድና"
        register={register}
        setValue={setValue}
        options={[
          { value: "mother", label: "እናት" },
          { value: "father", label: "አባት" },
          { value: "grandparent", label: "አያት" },
          { value: "aunt", label: "አክስት" },
          { value: "uncle", label: "አጎት" },
          { value: "other", label: "ሌላ" },
        ]}
        defaultValue={defaultValues?.relationToChild}
        placeholder="ዝምድና ይምረጡ"
      />

      <div className="mb-1">
        <label htmlFor="address">አድራሻ</label>
        <input
          id="address"
          className="neo-input"
          {...register("address", { required: true })}
          placeholder="ምሳሌ፡ ቦሌ፣ አዲስ አበባ"
        />
      </div>

      <div className="mb-1">
        <label htmlFor="phoneNumber">ስልክ ቁጥር</label>
        <input
          id="phoneNumber"
          type="tel"
          className="neo-input"
          {...register("phoneNumber", { required: true })}
          placeholder="ምሳሌ፡ 0911121314"
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
          ወደኋላ
        </button>

        <button
          type="button"
          className="neo-btn primary w-full"
          onClick={() => {
            submitHandler("next");
          }}
        >
          ቀጣይ
        </button>
      </div>
    </form>
  );
}
