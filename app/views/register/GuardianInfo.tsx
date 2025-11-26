import { TGuardianInfo, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import Select from "@/components/Select";

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

  const { register, trigger, getValues, setValue } = useForm<TGuardianInfo>({
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
    <form className="grid-gap-1 form-container">
      <h2 className="text-center mb-1">የወላጅ መረጃ</h2>

      <div className="mb-1">
        <label htmlFor="fullName" className="mb-1 label-text">ሙሉ ስም</label>
        <input
          id="fullName"
          type="text"
          className="neo-input"
          {...register("fullName", { required: true })}
          placeholder="ምሳሌ፡ አበበ ከበደ"
        />
      </div>

      <Select
        id="relationToChild"
        label="ዝምድና"
        register={register}
        setValue={setValue}
        options={[
          { value: "mother", label: "እናት" },
          { value: "father", label: "አባት" },
          { value: "grandparent", label: "አያት" },
          { value: "aunt", label: "አክስት" },
          { value: "uncle", label: "አጎት" },
          { value: "other", label: "ሌላ" },
        ]}
        defaultValue={defaultValues?.relationToChild}
        placeholder="ዝምድና ይምረጡ"
      />

      <div className="mb-1">
        <label htmlFor="address" className="mb-1 label-text">አድራሻ</label>
        <input
          id="address"
          className="neo-input"
          {...register("address", { required: true })}
          placeholder="ምሳሌ፡ ቦሌ፣ አዲስ አበባ"
        />
      </div>

      <div className="mb-1">
        <label htmlFor="phoneNumber" className="mb-1 label-text">ስልክ ቁጥር</label>
        <input
          id="phoneNumber"
          type="tel"
          className="neo-input"
          {...register("phoneNumber", { required: true })}
          placeholder="ምሳሌ፡ 0911121314"
        />
      </div>

      <div className="flex-gap-1 mt-2">
        <button
          type="button"
          className="neo-btn w-full"
          onClick={() => {
            submitHandler("previous");
          }}
        >
          ወደኋላ
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
