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
    <form className="neo-box grid-gap-1" style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2>የወላጅ መረጃዎች</h2>

      <div className="mb-1">
        <label htmlFor="fullName" className="mb-1" style={{ display: "block", marginLeft: "1rem" }}>ሙሉ ስም</label>
        <input
          id="fullName"
          type="text"
          className="neo-input"
          {...register("fullName", { required: true })}
          placeholder="ምሳሌ: Abebe Kebede"
        />
      </div>

      <div className="mb-1">
        <label htmlFor="relationToChild" className="mb-1" style={{ display: "block", marginLeft: "1rem" }}>ዝምድና</label>
        <div style={{ position: "relative" }}>
          <select
            id="relationToChild"
            className="neo-input"
            style={{ appearance: "none", cursor: "pointer" }}
            {...register("relationToChild", { required: true })}
          >
            <option value="">እዚህ ጋር ይምረጡ</option>
            <option value="mother">እናት</option>
            <option value="father">አባት</option>
            <option value="grandparent">አያት</option>
            <option value="aunt">አክስት</option>
            <option value="uncle">አጎት</option>
            <option value="other">ሌላ</option>
          </select>
          <div style={{ position: "absolute", right: "1.5rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.5 }}>
            ▼
          </div>
        </div>
      </div>

      <div className="mb-1">
        <label htmlFor="address" className="mb-1" style={{ display: "block", marginLeft: "1rem" }}>አድራሻ</label>
        <input
          id="address"
          className="neo-input"
          {...register("address", { required: true })}
          placeholder="ምሳሌ: debre abay"
        />
      </div>

      <div className="mb-1">
        <label htmlFor="phoneNumber" className="mb-1" style={{ display: "block", marginLeft: "1rem" }}>ስልክ ቁጥር</label>
        <input
          id="phoneNumber"
          type="tel"
          className="neo-input"
          {...register("phoneNumber", { required: true })}
          placeholder="ምሳሌ: 0911121314"
        />
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button
          type="button"
          className="neo-btn w-full"
          onClick={() => {
            submitHandler("previous");
          }}
        >
          ቀዳሚ
        </button>

        <button
          type="button"
          className="neo-btn primary w-full"
          onClick={() => {
            submitHandler("next");
          }}
        >
          ቀጣይ
        </button>
      </div>
    </form>
  );
}
