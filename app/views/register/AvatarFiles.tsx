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
    <form className="grid-gap-1 form-container">
      <h2 className="text-center mb-1">ፎቶ ይጫኑ</h2>

      <div className="avatar-files-container">
        {/* Child Avatar */}
        <Controller
          name="childAvatar"
          control={control}
          render={({ field }) => (
            <div className="mb-1">
              <label htmlFor="childAvatar" className="input-label">የልጅ ፎቶ</label>
              <div className="neo-box">
                <div className="avatar-preview-container">
                  <img
                    src={field.value ? URL.createObjectURL(field.value) : "/profile.png"}
                    alt="Child Avatar"
                    className="avatar-img"
                  />
                </div>

                <input
                  id="childAvatarInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    field.onChange(file);
                  }}
                />

                <button
                  type="button"
                  className="secondary"
                  onClick={() => document.getElementById('childAvatarInput')?.click()}
                >
                  ያስገቡ
                  <span style={{ fontSize: '1.1rem' }}>↑</span>
                </button>
              </div>
            </div>
          )}
        />

        {/* Guardian Avatar */}
        <Controller
          name="guardianAvatar"
          control={control}
          render={({ field }) => (
            <div className="mb-1">
              <label htmlFor="guardianAvatar" className="input-label">የወላጅ ፎቶ (አማራጭ)</label>
              <div className="neo-box">
                <div className="avatar-preview-container">
                  <img
                    src={field.value ? URL.createObjectURL(field.value) : "/profile.png"}
                    alt="Guardian Avatar"
                    className="avatar-img"
                  />
                </div>

                <input
                  id="guardianAvatarInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    field.onChange(file);
                  }}
                />

                <button
                  type="button"
                  className="secondary"
                  onClick={() => document.getElementById('guardianAvatarInput')?.click()}
                >
                  ያስገቡ
                  <span style={{ fontSize: '1.1rem' }}>↑</span>
                </button>
              </div>
            </div>
          )}
        />
      </div>

      <div className="flex-gap-1 mt-2">
        <button
          type="button"
          className="secondary w-full"
          onClick={() => {
            submitHandler("previous");
          }}
        >
          ወደኋላ
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
