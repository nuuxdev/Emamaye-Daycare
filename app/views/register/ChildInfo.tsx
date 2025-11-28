import { TChildInfo, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useForm } from "react-hook-form";
import BirthdateInput from "./BirthdateInput";
import { TAgeGroup } from "@/convex/types/children";
import Select from "@/components/Select";

export default function ChildInfo({
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
  const defaultValues: TChildInfo = savedSteps[step] as TChildInfo;

  const { register, trigger, getValues, setValue, watch } = useForm<TChildInfo>({
    defaultValues,
  });

  const ageGroup = watch("ageGroup");


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

  const setPaymentAmount = (ageGroup: TAgeGroup) => {
    switch (ageGroup) {
      case "infant":
        setValue("paymentAmount", 2500);
        break;
      case "toddler":
        setValue("paymentAmount", 2000);
        break;
      case "preschooler":
        setValue("paymentAmount", 1500);
        break;
    }
  };

  useEffect(() => {
    if (ageGroup) {
      setPaymentAmount(ageGroup);
    }
  }, [ageGroup, setValue]);

  return (
    <form className="grid-gap-1 form-container">
      <h2 className="text-center mb-1">የልጅ መረጃ</h2>

      <div className="mb-1">
        <label htmlFor="fullName" className="label-text">ሙሉ ስም</label>
        <input
          className="neo-input"
          id="fullName"
          {...register("fullName", { required: true })}
          placeholder="ምሳሌ፡ ዳግም አስካል"
        />
      </div>

      <fieldset className="fieldset-reset">
        <legend className="label-text">ጾታ</legend>
        <div className="neo-radio-group grid-2-col">
          <label htmlFor="male" className="justify-center">
            <input
              type="radio"
              id="male"
              value="male"
              {...register("gender", { required: true })}
            />
            ወንድ
          </label>
          <label htmlFor="female" className="justify-center">
            <input
              type="radio"
              id="female"
              value="female"
              {...register("gender", { required: true })}
            />
            ሴት
          </label>
        </div>
      </fieldset>

      <BirthdateInput register={register} setValue={setValue} />

      <Select
        id="ageGroup"
        label="የእድሜ ክልል"
        register={register}
        setValue={setValue}
        options={[
          { value: "infant", label: "ጨቅላ (0-1 ዓመት)" },
          { value: "toddler", label: "ታዳጊ (1-3 ዓመት)" },
          { value: "preschooler", label: "ቅድመ ትምህርት (3-6 ዓመት)" },
        ]}
        defaultValue={defaultValues?.ageGroup}
        value={ageGroup}
        placeholder="የእድሜ ክልል ይምረጡ"
      />

      {/* Watch for changes to update payment amount */}
      <div className="hidden">
        {/* This is a hack to trigger the effect when ageGroup changes via the custom Select */}
        <input type="hidden" {...register("ageGroup")} />
      </div>


      <div className="mb-1">
        <label htmlFor="paymentAmount" className="mb-1 label-text">የክፍያ መጠን</label>
        <div className="relative">
          <input
            id="paymentAmount"
            type="number"
            className="neo-input pl-3"
            {...register("paymentAmount", { required: true, valueAsNumber: true })}
            placeholder="መጠን በብር"
            readOnly
          />
          <span className="input-prefix">ብር</span>
        </div>
      </div>

      <div className="flex-gap-1 mt-2">
        <button
          type="button"
          className="secondary w-full"
          onClick={() => {
            submitHandler("previous");
          }}
          disabled={step === 0}
        >
          ወደኋላ
        </button>

        <button
          type="button"
          className="primary w-full"
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
