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
    <form className="grid-gap-1" style={{ maxWidth: "100%", margin: "0 auto" }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', textAlign: 'center' }}>Guardian Information</h2>

      <div className="mb-1">
        <label htmlFor="fullName" className="mb-1" style={{ display: "block", marginLeft: "0.5rem", fontWeight: 600, color: 'var(--foreground)' }}>Full Name</label>
        <input
          id="fullName"
          type="text"
          className="neo-input"
          {...register("fullName", { required: true })}
          placeholder="e.g. Abebe Kebede"
        />
      </div>

      <div className="mb-1">
        <label htmlFor="relationToChild" className="mb-1" style={{ display: "block", marginLeft: "0.5rem", fontWeight: 600, color: 'var(--foreground)' }}>Relation to Child</label>
        <div style={{ position: "relative" }}>
          <select
            id="relationToChild"
            className="neo-input"
            style={{ appearance: "none", cursor: "pointer" }}
            {...register("relationToChild", { required: true })}
          >
            <option value="">Select Relation</option>
            <option value="mother">Mother</option>
            <option value="father">Father</option>
            <option value="grandparent">Grandparent</option>
            <option value="aunt">Aunt</option>
            <option value="uncle">Uncle</option>
            <option value="other">Other</option>
          </select>
          <div style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5 }}>
            ▼
          </div>
        </div>
      </div>

      <div className="mb-1">
        <label htmlFor="address" className="mb-1" style={{ display: "block", marginLeft: "0.5rem", fontWeight: 600, color: 'var(--foreground)' }}>Address</label>
        <input
          id="address"
          className="neo-input"
          {...register("address", { required: true })}
          placeholder="e.g. Bole, Addis Ababa"
        />
      </div>

      <div className="mb-1">
        <label htmlFor="phoneNumber" className="mb-1" style={{ display: "block", marginLeft: "0.5rem", fontWeight: 600, color: 'var(--foreground)' }}>Phone Number</label>
        <input
          id="phoneNumber"
          type="tel"
          className="neo-input"
          {...register("phoneNumber", { required: true })}
          placeholder="e.g. 0911121314"
        />
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
        <button
          type="button"
          className="neo-btn w-full"
          onClick={() => {
            submitHandler("previous");
          }}
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
