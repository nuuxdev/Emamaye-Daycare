import { TChildInfo, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { InputDate } from "./Calendar";
import { TAgeGroup } from "@/convex/types/children";
import Select from "@/components/Select";
import { calculateAge, getAgeGroup, getPaymentAmount } from "@/utils/calculateAge";
import { fromEthDateString, todayInGreg } from "@/utils/calendar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { translateName } from "@/app/actions";
import { toast } from "sonner";
import { SpinnerIcon, CloseIcon } from "@/components/Icons";

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
  const defaultValues: TChildInfo = savedSteps[step] as TChildInfo;

  const { register, trigger, getValues, setValue, watch, resetField } = useForm<TChildInfo>({
    defaultValues,
  });

  const ageGroup = watch("ageGroup");
  const fullNameAmh = watch("fullNameAmh");
  const fullName = watch("fullName");
  const [isTranslating, setIsTranslating] = useState(false);


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
        // Optionally show a toast here, but silence might be better for UX on minor failures
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const handleClearInput = () => {
    setValue("fullName", "");
    setValue("fullNameAmh", undefined);
  }

  return (
    <form className="grid-gap-1 form-container">
      <h2 className="text-center mb-1">የልጅ መረጃ</h2>

      <div className="mb-1">
        <label htmlFor="fullName" className="label-text">ሙሉ ስም (እንግሊዝኛ)</label>
        <div className="relative">
          <input
            className="neo-input"
            id="fullName"
            {...register("fullName", { required: true, onBlur: handleFullNameBlur })}
            placeholder="Example: Dagim Askal"
          />
          {isTranslating && (
            <div style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <div className="animate-spin text-primary" style={{ height: "1.5rem", width: "1.5rem" }}>
                <SpinnerIcon />
              </div>
            </div>
          )}
          {!isTranslating && fullName && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                handleClearInput();
              }}
              style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", cursor: "pointer", opacity: 0.5 }} className="hover:opacity-100 transition-opacity">
              <div style={{ height: "1.5rem", width: "1.5rem" }}>
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
            placeholder="ምሳሌ፡ ዳግም አስካል"
          />
        </div>
      )}


      <fieldset className="fieldset-reset">
        <legend className="label-text">ጾታ</legend>
        <div className="neo-radio-group grid-2-col">
          <label htmlFor="male" className="justify-center">
            <input
              type="radio"
              id="male"
              value="male"
              {...register("gender", { required: true })}
            />
            ወንድ
          </label>
          <label htmlFor="female" className="justify-center">
            <input
              type="radio"
              id="female"
              value="female"
              {...register("gender", { required: true })}
            />
            ሴት
          </label>
        </div>
      </fieldset>

      <InputDate value={!!getValues("dateOfBirth") ? fromEthDateString(getValues("dateOfBirth")) : todayInGreg.toString()} register={register} onSelect={(dateInEt) => {
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
      }} />

      <Select
        id="ageGroup"
        label="የእድሜ ክልል"
        register={register}
        setValue={setValue}
        options={[
          { value: "infant", label: "ጨቅላ (0-1 ዓመት)" },
          { value: "toddler", label: "ታዳጊ (1-3 ዓመት)" },
          { value: "preschooler", label: "ቅድመ ትምህርት (3-6 ዓመት)" },
        ]}
        defaultValue={defaultValues?.ageGroup}
        value={ageGroup}
        placeholder="የእድሜ ክልል ይምረጡ"
      />

      {/* Watch for changes to update payment amount */}
      <div className="hidden">
        {/* This is a hack to trigger the effect when ageGroup changes via the custom Select */}
        <input type="hidden" {...register("ageGroup")} />
      </div>


      <Select
        id="paymentSchedule"
        label="የክፍያ ጊዜ"
        register={register}
        setValue={setValue}
        options={[
          { value: "month_end", label: "የወር መጨረሻ (30)" },
          { value: "month_half", label: "ወር አጋማሽ (15)" },
        ]}
        defaultValue={defaultValues?.paymentSchedule}
        value={watch("paymentSchedule")}
        placeholder="የክፍያ ጊዜ ይምረጡ"
      />

      <div className="mb-1">
        <label htmlFor="paymentAmount" className="mb-1 label-text">የክፍያ መጠን</label>
        <div className="relative">
          <input
            id="paymentAmount"
            type="number"
            className="neo-input pl-3"
            {...register("paymentAmount", { required: true, valueAsNumber: true })}
            placeholder="መጠን በብር"
            readOnly
          />
          <span className="input-prefix">ብር</span>
        </div>
      </div>

      <div className="flex-gap-1 mt-2">
        <button
          type="button"
          className="secondary w-full"
          onClick={() => {
            submitHandler("previous");
          }}
          disabled={step === 0}
        >
          ወደኋላ
        </button>

        <button
          type="button"
          className="primary w-full"
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
