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
    <form className="grid-gap-1" style={{ maxWidth: "100%", margin: "0 auto" }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Child Information</h2>

      <div className="mb-1">
        <label htmlFor="fullName" className="mb-1" style={{ display: "block", marginLeft: "0.5rem", fontWeight: 600, color: 'var(--foreground)' }}>Full Name</label>
        <input
          className="neo-input"
          id="fullName"
          {...register("fullName", { required: true })}
          placeholder="e.g. Dagim Askal"
        />
      </div>

      <fieldset style={{ border: "none", padding: 0, margin: '1.5rem 0' }}>
        <legend className="mb-1" style={{ marginLeft: "0.5rem", fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem' }}>Gender</legend>
        <div className="neo-radio-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label htmlFor="male" style={{ justifyContent: 'center' }}>
            <input
              type="radio"
              id="male"
              value="male"
              {...register("gender", { required: true })}
            />
            Male
          </label>
          <label htmlFor="female" style={{ justifyContent: 'center' }}>
            <input
              type="radio"
              id="female"
              value="female"
              {...register("gender", { required: true })}
            />
            Female
          </label>
        </div>
      </fieldset>

      <BirthdateInput register={register} setValue={setValue} />

      <div className="mb-1" style={{ marginTop: '1.5rem' }}>
        <label htmlFor="ageGroup" className="mb-1" style={{ display: "block", marginLeft: "0.5rem", fontWeight: 600, color: 'var(--foreground)' }}>Age Group</label>
        <div style={{ position: "relative" }}>
          <select
            id="ageGroup"
            className="neo-input"
            style={{ appearance: "none", cursor: "pointer" }}
            {...register("ageGroup", { required: true })}
            onChange={(e) => setPaymentAmount(e.target.value as TAgeGroup)}
          >
            <option value="">Select Age Group</option>
            <option value="infant">Infant (0-1 yr)</option>
            <option value="toddler">Toddler (1-3 yrs)</option>
            <option value="preschooler">Preschooler (3-6 yrs)</option>
          </select>
          <div style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5 }}>
            ▼
          </div>
        </div>
      </div>

      <div className="mb-1">
        <label htmlFor="paymentAmount" className="mb-1" style={{ display: "block", marginLeft: "0.5rem", fontWeight: 600, color: 'var(--foreground)' }}>Payment Amount</label>
        <div style={{ position: 'relative' }}>
          <input
            id="paymentAmount"
            type="number"
            className="neo-input"
            {...register("paymentAmount", { required: true, valueAsNumber: true })}
            placeholder="Amount in ETB"
            readOnly
            style={{ paddingLeft: '3rem' }}
          />
          <span style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 600, opacity: 0.6 }}>ETB</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <button
          type="button"
          className="neo-btn w-full"
          onClick={() => {
            submitHandler("previous");
          }}
          disabled={step === 0}
        >
          Previous
        </button>

        <button
          type="button"
          className="neo-btn primary w-full"
          onClick={() => {
            submitHandler("next");
          }}
        >
          Next
        </button>
      </div>
    </form>
  );
}
