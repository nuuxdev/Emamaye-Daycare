"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import Link from "next/link";
import { Dispatch, RefObject, SetStateAction, useRef, useState } from "react";
import ChildInfo from "../views/register/ChildInfo";
import GuardianInfo from "../views/register/GuardianInfo";
import Avatars from "../views/register/AvatarFiles";
import PreviewForm from "../views/register/PreviewForm";

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
    <ChildInfo
      saveStep={saveStep}
      savedStep={savedStep}
      setStep={setStep}
      step={step}
    />,
    <GuardianInfo
      saveStep={saveStep}
      savedStep={savedStep}
      setStep={setStep}
      step={step}
    />,
    <Avatars
      saveStep={saveStep}
      savedStep={savedStep}
      setStep={setStep}
      step={step}
    />,
    <PreviewForm savedStep={savedStep} />,
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
