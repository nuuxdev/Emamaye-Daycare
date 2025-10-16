import { TChildInfo, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction, useRef } from "react";
import { useForm } from "react-hook-form";

const years: number[] = [];
const currentYear = new Date().getFullYear();
for (let year = currentYear; year > currentYear - 25; year--) {
  years.push(year);
}
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const days: number[] = [];
for (let day = 1; day <= 31; day++) {
  days.push(day);
}
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

  const dialogRef = useRef<HTMLDialogElement>(null);

  const { register, trigger, getValues } = useForm<TChildInfo>({
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
      <h2>Child Information</h2>
      <input
        {...register("fullName", { required: true })}
        placeholder="Full name"
      />
      <fieldset>
        <legend>Gender</legend>
        <input
          type="radio"
          id="male"
          value="male"
          {...register("gender", { required: true })}
        />
        <label htmlFor="male">Male</label>
        <input
          type="radio"
          id="female"
          value="female"
          {...register("gender", { required: true })}
        />
        <label htmlFor="female">Female</label>
      </fieldset>
      <input type="date" {...register("dateOfBirth", { required: true })} />
      <button type="button" onClick={() => dialogRef.current?.showModal()}>
        Birthdate
      </button>
      <dialog ref={dialogRef}>
        <div className="scroller-wrapper">
          <div className="scroller">
            <ul style={{ listStyle: "none" }}>
              {months.map((month) => (
                <li key={month}>{month}</li>
              ))}
            </ul>
          </div>
          <div className="scroller">
            <ul style={{ listStyle: "none" }}>
              {days.map((day) => {
                if (day < 10) {
                  return <li key={day}>0{day}</li>;
                }
                return <li key={day}>{day}</li>;
              })}
            </ul>
          </div>
          <div className="scroller">
            <ul style={{ listStyle: "none" }}>
              {years.map((year) => (
                <li key={year}>{year}</li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", marginBlock: "3rem" }}>
          <button
            style={{ flex: "1" }}
            type="button"
            onClick={() => dialogRef.current?.close()}
          >
            Cancel
          </button>
          <button
            style={{ flex: "1" }}
            type="button"
            onClick={() => dialogRef.current?.close()}
          >
            Set
          </button>
        </div>
      </dialog>
      <select {...register("ageGroup", { required: true })}>
        <option value="">Select Age Group</option>
        <option value="infant">Infant - 3,000Br</option>
        <option value="toddler">Toddler - 2,000Br</option>
        <option value="preschooler">Preschooler - 1,500Br</option>
      </select>

      <button
        type="button"
        onClick={() => {
          submitHandler("previous");
        }}
        disabled={step === 0}
      >
        Previous
      </button>

      <button
        type="button"
        onClick={() => {
          submitHandler("next");
        }}
      >
        Next
      </button>
    </form>
  );
}
