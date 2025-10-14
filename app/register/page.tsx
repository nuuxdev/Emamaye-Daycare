"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import Link from "next/link";
import { Dispatch, RefObject, SetStateAction, useRef, useState } from "react";

export default function Register() {
  const [step, setStep] = useState(0);
  const [savedStep, saveStep] = useState<Record<string, any>[]>([]);
  const addChild = useMutation(api.children.addChild);
  const uploadImage = useAction(api.images.uploadImage);

  const addChildHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName");
    const gender = formData.get("gender");

    // const avatarImg = formData.get("avatar") as File;

    // const avatarArrayBuffer = await avatarImg.arrayBuffer();

    // const storageId = await uploadImage({
    //   imageArrayBuffer: avatarArrayBuffer,
    // });

    // await addChild({
    //   fullName: fullName as string,
    //   gender: gender as "male" | "female",
    //   avatar: storageId as Id<"_storage">,
    // });
  };

  console.log(savedStep, step);

  const stepsData = [
    <ChildInformation
      saveStep={saveStep}
      savedStep={savedStep}
      setStep={setStep}
      step={step}
    />,
    <GuardianInformation
      saveStep={saveStep}
      savedStep={savedStep}
      setStep={setStep}
      step={step}
    />,
  ];
  const submitHandler = (
    action: "next" | "previous" | "submit",
    data: Record<string, any>,
  ) => {
    if (action === "submit" && step === stepsData.length - 1) {
      //submit here
    }
  };

  return (
    <>
      <header>
        <Link href="/">&lt;-</Link>
        Register
      </header>
      <main>
        <h1>Register</h1>
        {stepsData[step]}
      </main>
    </>
  );
}

function ChildInformation({
  saveStep,
  savedStep,
  setStep,
  step,
}: {
  saveStep: Dispatch<SetStateAction<Record<string, any>[]>>;
  savedStep: Record<string, any>[];
  setStep: Dispatch<SetStateAction<number>>;
  step: number;
}) {
  const [direction, setDirection] = useState<"next" | "previous">("next");

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName");
    const gender = formData.get("gender");
    const dateOfBirth = formData.get("dateOfBirth");
    const ageGroup = formData.get("ageGroup");
    //validate here
    if (direction === "next") {
      //validate
      setStep((prevStep) => prevStep + 1);
    } else if (direction === "previous") {
      setStep((prevStep) => prevStep - 1);
    }
    console.log(fullName, gender, dateOfBirth, ageGroup, direction);
    const newStepTobeSaved = { fullName, gender, dateOfBirth, ageGroup };
    const savedStateCopy = [...savedStep];
    savedStateCopy[step] = newStepTobeSaved;
    saveStep(savedStateCopy);
  };
  return (
    <form onSubmit={submitHandler} style={{ display: "grid", gap: "1rem" }}>
      <input type="text" name="fullName" placeholder="full name" required />
      <fieldset>
        <legend>Gender</legend>
        <input type="radio" name="gender" id="male" value="male" required />
        <label htmlFor="male">Male</label>
        <input type="radio" name="gender" id="female" value="female" required />
        <label htmlFor="female">Female</label>
      </fieldset>
      <input type="date" name="dateOfBirth" id="dateOfBirth" required />
      <select name="ageGroup" id="ageGroup" required>
        <option value="">Select Age Group</option>
        <option value="infant">Infant - 3,000Br</option>
        <option value="toddler">Toddler - 2,000Br</option>
        <option value="preschooler">Preschooler - 1,500Br</option>
      </select>
      <button type="submit" onClick={() => setDirection("previous")}>
        Previous
      </button>
      <button type="submit" onClick={() => setDirection("next")}>
        Next
      </button>
    </form>
  );
}

function GuardianInformation({
  saveStep,
  savedStep,
  setStep,
  step,
}: {
  saveStep: Dispatch<SetStateAction<Record<string, any>[]>>;
  savedStep: Record<string, any>[];
  setStep: Dispatch<SetStateAction<number>>;
  step: number;
}) {
  const [direction, setDirection] = useState<"next" | "previous">("next");

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName");
    const relationToChild = formData.get("relationToChild");
    const address = formData.get("address");
    const phoneNumber = formData.get("phoneNumber");
    //validate here
    if (direction === "next") {
      //validate
      setStep((prevStep) => prevStep + 1);
    } else if (direction === "previous") {
      setStep((prevStep) => prevStep - 1);
    }
    console.log(fullName, relationToChild, address, phoneNumber, direction);
    const newStepTobeSaved = {
      fullName,
      relationToChild,
      address,
      phoneNumber,
    };
    const savedStateCopy = [...savedStep];
    savedStateCopy[step] = newStepTobeSaved;
    saveStep(savedStateCopy);
  };
  return (
    <form onSubmit={submitHandler} style={{ display: "grid", gap: "1rem" }}>
      <h2>Guardian Information</h2>
      <input type="text" name="fullName" placeholder="full name" required />
      <select name="relationToChild" id="relationToChild" required>
        <option value="">Select Relation To Child</option>
        <option value="mother">Mother</option>
        <option value="father">Father</option>
        <option value="other">Other</option>
      </select>
      <input type="text" name="address" placeholder="address" required />
      <input
        type="tel"
        name="phoneNumber"
        placeholder="phone number"
        required
      />
      <button type="submit" onClick={() => setDirection("previous")}>
        Previous
      </button>
      <button type="submit" onClick={() => setDirection("next")}>
        Next
      </button>
    </form>
  );
}
