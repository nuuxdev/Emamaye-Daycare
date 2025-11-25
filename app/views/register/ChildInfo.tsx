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
    <form className="neo-box grid-gap-1" style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2>የልጅ መረጃዎች</h2>

      <div className="mb-1">
        <label htmlFor="fullName" className="mb-1" style={{ display: "block", marginLeft: "1rem" }}>ሙሉ ስም</label>
        <input
          className="neo-input"
          id="fullName"
          {...register("fullName", { required: true })}
          placeholder="ምሳሌ፡ ዳግማዊት አስካለች"
        />
      </div>

      <fieldset style={{ border: "none", padding: 0 }}>
        <legend className="mb-1" style={{ marginLeft: "1rem" }}>ፆታ</legend>
        <div className="neo-radio-group">
          <label htmlFor="male">
            <input
              type="radio"
              id="male"
              value="male"
              {...register("gender", { required: true })}
            />
            ወንድ
          </label>
          <label htmlFor="female">
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

      <BirthdateInput register={register} setValue={setValue} />

      <div className="mb-1">
        <label htmlFor="ageGroup" className="mb-1" style={{ display: "block", marginLeft: "1rem" }}>የእድሜ መደብ</label>
        <div style={{ position: "relative" }}>
          <select
            id="ageGroup"
            className="neo-input"
            style={{ appearance: "none", cursor: "pointer" }}
            {...register("ageGroup", { required: true })}
            onChange={(e) => setPaymentAmount(e.target.value as TAgeGroup)}
          >
            <option value="">እዚህ ጋር ይምረጡ</option>
            <option value="infant">ጨቅላ</option>
            <option value="toddler">ድክድክ</option>
            <option value="preschooler">ታዳጊ</option>
          </select>
          <div style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5 }}>
            ▼
          </div>
        </div>
      </div>

      <div className="mb-1">
        <label htmlFor="paymentAmount" className="mb-1" style={{ display: "block", marginLeft: "1rem" }}>የክፍያ መጠን</label>
        <input
          id="paymentAmount"
          type="number"
          className="neo-input"
          {...register("paymentAmount", { required: true, valueAsNumber: true })}
          placeholder="በብር"
          readOnly
        />
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
          type="button"
          className="neo-btn w-full"
          onClick={() => {
            submitHandler("previous");
          }}
          disabled={step === 0}
        >
          ቀዳሚ
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
