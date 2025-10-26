import { TAvatarFiles, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction, useState } from "react";
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

  const [previews, setPreviews] = useState<{
    childAvatar?: string;
    guardianAvatar?: string;
  }>(
  //   {
  //   childAvatar: defaultValues.childAvatar
  //     ? URL.createObjectURL(defaultValues.childAvatar)
  //     : undefined,
  //   guardianAvatar: defaultValues.guardianAvatar
  //     ? URL.createObjectURL(defaultValues.guardianAvatar)
  //     : undefined,
  // }
);

  // Cleanup object URLs when files change or component unmounts
  // useEffect(() => {
  //   return () => {
  //     if (previews.childAvatar) URL.revokeObjectURL(previews.childAvatar);
  //     if (previews.guardianAvatar) URL.revokeObjectURL(previews.guardianAvatar);
  //   };
  // }, [previews]);

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
                
                const reader = new FileReader();
                if (file) {
                  reader.onloadend = e => {
                    setPreviews((prev) => ({ ...prev, childAvatar: e.target?.result as string}));
                  }
                  reader.readAsDataURL(file);
                }
                
              }}
            />
            {previews?.childAvatar && (
              <img
                src={previews.childAvatar}
                alt="Child Avatar Preview"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            )}
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
                // (e) => {
                // const file = e.target.files?.[0] || null;
                // field.onChange(file);
                // if (file) {
              //     const url = URL.createObjectURL(file);
              //     setPreviews((prev) => ({ ...prev, guardianAvatar: url }));
              //   }
              // }
              (e) => {
                const file = e.target.files?.[0] || null;
                const reader = new FileReader();
                if (file) {
                  reader.onloadend = e => {
                    setPreviews((prev) => ({ ...prev, guardianAvatar: e.target?.result as string}));
                  }
                  reader.readAsDataURL(file);
                }
                field.onChange(file);
              }
            }
            />
            {previews?.guardianAvatar && (
              <img
                src={previews.guardianAvatar}
                alt="Guardian Avatar Preview"
                style={{ width: "150px", height: "150px", objectFit: "cover" }}
              />
            )}
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
