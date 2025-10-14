import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";

type TDefaultValues = {
  childAvatar: File;
  guardianAvatar: File;
};

export default function AvatarFiles({
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
    childAvatar: savedStep[step]?.childAvatar || null,
    guardianAvatar: savedStep[step]?.guardianAvatar || null,
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
      <h2>Profile Photos</h2>

      <input
        type="file"
        {...register("childAvatar", { required: true })}
        placeholder="Child Avatar"
      />

      <input
        type="file"
        {...register("guardianAvatar", { required: true })}
        placeholder="Guardian Avatar"
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
