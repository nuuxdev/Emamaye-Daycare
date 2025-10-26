import { TChildInfo, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import BirthdateInput from "./BirthdateInput";
import { TAgeGroup } from "@/convex/types/children";

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

  const { register, trigger, getValues, setValue } = useForm<TChildInfo>({
    defaultValues,
  });

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

  const setPaymentAmount = (ageGroup: TAgeGroup) => {
    switch (ageGroup) {
      case "infant":
        setValue("paymentAmount", 2500);
        break;
      case "toddler":
        setValue("paymentAmount", 2000);
        break;
      case "preschooler":
        setValue("paymentAmount", 1500);
        break;
    }
  };

  return (
    <form style={{ display: "grid", gap: "1rem" }}>
      <h2>የልጅ መረጃዎች</h2>
      <label htmlFor="fullName">ሙሉ ስም</label>
      <input
        {...register("fullName", { required: true })}
        placeholder="ምሳሌ፡ ዳግማዊት አስካለች"
      />
      <fieldset>
        <legend>ፆታ</legend>
        <input
          type="radio"
          id="male"
          value="male"
          {...register("gender", { required: true })}
        />
        <label htmlFor="male">ወንድ</label>
        <input
          type="radio"
          id="female"
          value="female"
          {...register("gender", { required: true })}
        />
        <label htmlFor="female">ሴት</label>
      </fieldset>
      <BirthdateInput register={register} setValue={setValue} />
      <label htmlFor="ageGroup">የእድሜ መደብ</label>
      <select
      id="ageGroup"
        {...register("ageGroup", { required: true })}
        onChange={(e) => setPaymentAmount(e.target.value as TAgeGroup)}
      >
        <option value="">እዚህ ጋር ይምረጡ </option>
        <option value="infant">ጨቅላ</option>
        <option value="toddler">ድክድክ</option>
        <option value="preschooler">ታዳጊ</option>
      </select>
      <label htmlFor="paymentAmount">የክፍያ መጠን</label>
      <input id="paymentAmount" type="number" {...register("paymentAmount", { required: true })} placeholder="በብር" />

      <button
        type="button"
        onClick={() => {
          submitHandler("previous");
        }}
        disabled={step === 0}
      >
        ቀዳሚ
      </button>

      <button
        type="button"
        onClick={() => {
          submitHandler("next");
        }}
      >
        ቀጣይ
      </button>
    </form>
  );
}
