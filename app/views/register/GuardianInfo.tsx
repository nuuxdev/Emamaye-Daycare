import { TGuardianInfo, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";

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

  const { register, trigger, getValues } = useForm<TGuardianInfo>({
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
