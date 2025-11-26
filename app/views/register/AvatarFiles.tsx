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

      <Controller
        name="childAvatar"
        control={control}
        // rules={{ required: true }}
        render={({ field }) => (
          <div className="mb-1">
            <label htmlFor="childAvatar" className="mb-1 label-text">የልጅ ፎቶ</label>
            <div
              className="file-upload-box"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
                const file = e.dataTransfer.files?.[0];
                if (file) field.onChange(file);
              }}
            >
              <input
                id="childAvatar"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  field.onChange(file);
                }}
              />
              <label htmlFor="childAvatar" className="file-upload-label">
                {field.value ? (
                  <div className="animate-fade-in file-upload-success">
                    <div className="success-icon">✓</div>
                    <div className="file-name">
                      {(field.value as File).name}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>ለመቀየር ይጫኑ</div>
                  </div>
                ) : (
                  <div className="file-upload-placeholder">
                    <div className="camera-icon">📷</div>
                    <div>ይጫኑ ወይም ጎትተው ያስገቡ</div>
                  </div>
                )}
              </label>
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
            <label htmlFor="guardianAvatar" className="mb-1 label-text">የወላጅ ፎቶ (አማራጭ)</label>
            <div
              className="file-upload-box"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary-color)'; }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'; }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
                const file = e.dataTransfer.files?.[0];
                if (file) field.onChange(file);
              }}
            >
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
                    }
                  }
                }
              />
              <label htmlFor="guardianAvatar" className="file-upload-label">
                {field.value ? (
                  <div className="animate-fade-in file-upload-success">
                    <div className="success-icon">✓</div>
                    <div className="file-name">
                      {(field.value as File).name}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>ለመቀየር ይጫኑ</div>
                  </div>
                ) : (
                  <div className="file-upload-placeholder">
                    <div className="camera-icon">📷</div>
                    <div>ይጫኑ ወይም ጎትተው ያስገቡ</div>
                  </div>
                )}
              </label>
            </div>
          </div>
        )}
      />

      <div className="flex-gap-1 mt-2">
        <button
          type="button"
          className="neo-btn w-full"
          onClick={() => submitHandler("previous")}
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
