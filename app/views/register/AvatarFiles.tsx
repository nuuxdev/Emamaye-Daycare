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

  //  const [previews, setPreviews] = useState<{
  //   childAvatar?: string;
  //   guardianAvatar?: string;
  // }>()

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
    <form className="neo-box grid-gap-1" style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2>ጉርድ ፎቶዎች</h2>

      <Controller
        name="childAvatar"
        control={control}
        // rules={{ required: true }}
        render={({ field }) => (
          <div className="mb-1">
            <label htmlFor="childAvatar" className="mb-1" style={{ display: "block", marginLeft: "1rem" }}>የልጅ ፎቶ</label>
            <div style={{
              background: "var(--background)",
              boxShadow: "var(--shadow-inset-dark), var(--shadow-inset-light)",
              borderRadius: "20px",
              padding: "2rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}>
              <input
                id="childAvatar"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  field.onChange(file);
                  // const reader = new FileReader();
                  // if (file) {
                  //   reader.onloadend = e => {
                  //     setPreviews((prev) => ({ ...prev, childAvatar: e.target?.result as string}));
                  //   }
                  //   reader.readAsDataURL(file);
                  // }
                }}
              />
              <label htmlFor="childAvatar" style={{ cursor: "pointer", display: "block" }}>
                {field.value ? (
                  <div style={{ color: "var(--primary-color)", fontWeight: 600 }}>
                    ✓ {(field.value as File).name}
                  </div>
                ) : (
                  <div style={{ opacity: 0.6 }}>
                    📷 ክሊክ ለማድረግ ፎቶ ለመምረጥ
                  </div>
                )}
              </label>
              {/* {previews?.childAvatar && (
                <img
                  src={previews.childAvatar}
                  alt="Child Avatar Preview"
                  style={{ width: "150px", height: "150px", objectFit: "cover" }}
                />
              )} */}
            </div>
          </div>
        )}
      />

      <Controller
        name="guardianAvatar"
        control={control}
        // rules={{ required: true }}
        render={({ field }) => (
          <div className="mb-1">
            <label htmlFor="guardianAvatar" className="mb-1" style={{ display: "block", marginLeft: "1rem" }}>የአሳዳጊ ፎቶ (ግዴታ ያልሆነ)</label>
            <div style={{
              background: "var(--background)",
              boxShadow: "var(--shadow-inset-dark), var(--shadow-inset-light)",
              borderRadius: "20px",
              padding: "2rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}>
              <input
                id="guardianAvatar"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={
                  (e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      field.onChange(file);
                      // const reader = new FileReader();
                      // reader.onloadend = e => {
                      //   setPreviews((prev) => ({ ...prev, guardianAvatar: e.target?.result as string}));
                      // }
                      // reader.readAsDataURL(file);
                    }
                  }
                }
              />
              <label htmlFor="guardianAvatar" style={{ cursor: "pointer", display: "block" }}>
                {field.value ? (
                  <div style={{ color: "var(--primary-color)", fontWeight: 600 }}>
                    ✓ {(field.value as File).name}
                  </div>
                ) : (
                  <div style={{ opacity: 0.6 }}>
                    📷 ክሊክ ለማድረግ ፎቶ ለመምረጥ
                  </div>
                )}
              </label>
              {/* {previews?.guardianAvatar && (
                <img
                  src={previews.guardianAvatar}
                  alt="Guardian Avatar Preview"
                  style={{ width: "150px", height: "150px", objectFit: "cover" }}
                />
              )} */}
            </div>
          </div>
        )}
      />

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
          type="button"
          className="neo-btn w-full"
          onClick={() => submitHandler("previous")}
        >
          ቀዳሚ
        </button>

        <button
          type="button"
          className="neo-btn primary w-full"
          onClick={() => submitHandler("next")}
        >
          ቀጣይ
        </button>
      </div>
    </form>
  );
}
