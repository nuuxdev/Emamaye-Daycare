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
      <h2>የወላጅ መረጃዎች</h2>
<label htmlFor="fullName">ሙሉ ስም</label>
      <input
      id="fullName"
        type="text"
        {...register("fullName", { required: true })}
        placeholder="ምሳሌ: Abebe Kebede"
      />
<label htmlFor="relationToChild">ዝምድና</label>
      <select id="relationToChild" {...register("relationToChild", { required: true })}>
        <option value="">እዚህ ጋር ይምረጡ</option>
        <option value="mother">እናት</option>
        <option value="father">አባት</option>
        <option value="grandparent">አያት</option>
        <option value="aunt">አክስት</option>
        <option value="uncle">አጎት</option>
        <option value="other">ሌላ</option>
      </select>
<label htmlFor="address">አድራሻ</label>
      <input
      id="address"
        {...register("address", { required: true })}
        placeholder="ምሳሌ: debre abay"
      />
<label htmlFor="phoneNumber">ስልክ ቁጥር</label>
      <input
      id="phoneNumber"
        type="tel"
        {...register("phoneNumber", { required: true })}
        placeholder="ምሳሌ: 0911121314"
      />

      <button
        type="button"
        onClick={() => {
          submitHandler("previous");
        }}
      >
        ቀዳሚ
      </button>

      <button
        type="button"
        onClick={() => {
          submitHandler("next");
        }}
      >
        ቀጣይ
      </button>
    </form>
  );
}
