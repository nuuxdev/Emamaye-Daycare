import { TAvatarFiles, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction } from "react";
import { useForm, Controller } from "react-hook-form";

export default function AvatarFiles({
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
  const defaultValues: TAvatarFiles = savedSteps[step] as TAvatarFiles;

  const { control, trigger, getValues } = useForm<TAvatarFiles>({
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
      <h2>ጉርድ ፎቶዎች</h2>
      <Controller
        name="childAvatar"
        control={control}
        // rules={{ required: true }}
        render={({field}) => (
          <div style={{display:"flex", flexDirection:"column", padding: "2rem", border: "2px solid" }}>
          <label htmlFor="childAvatar">የልጅ ፎቶ</label>
            <input
              id="childAvatar"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                field.onChange(file);
              }}
            />
          </div>
        )}
      />
      <Controller
        name="guardianAvatar"
        control={control}
        // rules={{ required: true }}
        render={({field}) => (
          <div style={{display:"flex", flexDirection:"column", padding: "2rem", border: "2px solid" }}>
          <label htmlFor="guardianAvatar">የአሳዳጊ ፎቶ (ግዴታ ያልሆነ)</label>
            <input
              id="guardianAvatar"
              type="file"
              accept="image/*"
              onChange={
              (e) => {
                const file = e.target.files?.[0] || null;
                field.onChange(file);
              }
            }
            />
          </div>
        )}
      />

      <button type="button" onClick={() => submitHandler("previous")}>
        Previous
      </button>

      <button type="button" onClick={() => submitHandler("next")}>
        Next
      </button>
    </form>
  );
}
