import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";

type TDefaultValues = {
  fullName: string;
  relationToChild: string;
  address: string;
  phoneNumber: string;
};

export default function GuardianInfo({
  saveStep,
  savedStep,
  setStep,
  step,
}: {
  saveStep: Dispatch<SetStateAction<Record<string, any>[]>>;
  savedStep: Record<string, any>[];
  setStep: Dispatch<SetStateAction<number>>;
  step: number;
}) {
  const defaultValues: TDefaultValues = {
    fullName: savedStep[step]?.fullName || "",
    relationToChild: savedStep[step]?.relationToChild || "",
    address: savedStep[step]?.address || "",
    phoneNumber: savedStep[step]?.phoneNumber || "",
  };

  const { register, trigger, getValues } = useForm<TDefaultValues>({
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

    const savedStateCopy = [...savedStep];
    savedStateCopy[step] = data;
    saveStep(savedStateCopy);
  };

  return (
    <form style={{ display: "grid", gap: "1rem" }}>
      <h2>Guardian Information</h2>

      <input
        type="text"
        {...register("fullName", { required: true })}
        placeholder="Full name"
      />

      <select {...register("relationToChild", { required: true })}>
        <option value="">Select Relation To Child</option>
        <option value="mother">Mother</option>
        <option value="father">Father</option>
        <option value="other">Other</option>
      </select>

      <input
        {...register("address", { required: true })}
        placeholder="Address"
      />

      <input
        type="tel"
        {...register("phoneNumber", { required: true })}
        placeholder="Phone number"
      />

      <button
        type="button"
        onClick={() => {
          submitHandler("previous");
        }}
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
