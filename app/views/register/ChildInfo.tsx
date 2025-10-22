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
      <h2>Child Information</h2>
      <input
        {...register("fullName", { required: true })}
        placeholder="Full name"
      />
      <fieldset>
        <legend>Gender</legend>
        <input
          type="radio"
          id="male"
          value="male"
          {...register("gender", { required: true })}
        />
        <label htmlFor="male">Male</label>
        <input
          type="radio"
          id="female"
          value="female"
          {...register("gender", { required: true })}
        />
        <label htmlFor="female">Female</label>
      </fieldset>
      <BirthdateInput register={register} setValue={setValue} />

      <select
        {...register("ageGroup", { required: true })}
        onChange={(e) => setPaymentAmount(e.target.value as TAgeGroup)}
      >
        <option value="">Select Age Group</option>
        <option value="infant">ጨቅላ</option>
        <option value="toddler">ድክድክ</option>
        <option value="preschooler">ታዳጊ</option>
      </select>

      <input type="number" {...register("paymentAmount", { required: true })} />

      <button
        type="button"
        onClick={() => {
          submitHandler("previous");
        }}
        disabled={step === 0}
      >
        Previous
      </button>

      <button
        type="button"
        onClick={() => {
          submitHandler("next");
        }}
      >
        Next
      </button>
    </form>
  );
}
