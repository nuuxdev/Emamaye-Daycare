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
    <form className="grid-gap-1" style={{ maxWidth: "100%", margin: "0 auto" }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Upload Photos</h2>

      <Controller
        name="childAvatar"
        control={control}
        // rules={{ required: true }}
        render={({ field }) => (
          <div className="mb-1">
            <label htmlFor="childAvatar" className="mb-1" style={{ display: "block", marginLeft: "0.5rem", fontWeight: 600, color: 'var(--foreground)' }}>Child's Photo</label>
            <div style={{
              background: "var(--background)",
              boxShadow: "var(--shadow-inset-dark), var(--shadow-inset-light)",
              borderRadius: "20px",
              padding: "2rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              border: "2px dashed rgba(0,0,0,0.1)",
              position: 'relative',
              overflow: 'hidden'
            }}
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
              <label htmlFor="childAvatar" style={{ cursor: "pointer", display: "block", height: '100%', width: '100%' }}>
                {field.value ? (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>✓</div>
                    <div style={{ color: "var(--primary-color)", fontWeight: 600 }}>
                      {(field.value as File).name}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Click to change</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.6 }}>
                    <div style={{ fontSize: '2rem' }}>📷</div>
                    <div>Click or Drag & Drop Photo</div>
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
            <label htmlFor="guardianAvatar" className="mb-1" style={{ display: "block", marginLeft: "0.5rem", fontWeight: 600, color: 'var(--foreground)' }}>Guardian's Photo (Optional)</label>
            <div style={{
              background: "var(--background)",
              boxShadow: "var(--shadow-inset-dark), var(--shadow-inset-light)",
              borderRadius: "20px",
              padding: "2rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              border: "2px dashed rgba(0,0,0,0.1)",
              position: 'relative',
              overflow: 'hidden'
            }}
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
              <label htmlFor="guardianAvatar" style={{ cursor: "pointer", display: "block", height: '100%', width: '100%' }}>
                {field.value ? (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>✓</div>
                    <div style={{ color: "var(--primary-color)", fontWeight: 600 }}>
                      {(field.value as File).name}
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Click to change</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.6 }}>
                    <div style={{ fontSize: '2rem' }}>📷</div>
                    <div>Click or Drag & Drop Photo</div>
                  </div>
                )}
              </label>
            </div>
          </div>
        )}
      />

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <button
          type="button"
          className="neo-btn w-full"
          onClick={() => submitHandler("previous")}
        >
          Previous
        </button>

        <button
          type="button"
          className="neo-btn primary w-full"
          onClick={() => submitHandler("next")}
        >
          Next
        </button>
      </div>
    </form>
  );
}
