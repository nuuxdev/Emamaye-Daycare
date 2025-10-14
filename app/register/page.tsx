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

export type TChildInfo = {
  fullName: string;
  gender: "male" | "female";
  dateOfBirth: string;
  ageGroup: string;
};

export type TGuardianInfo = {
  fullName: string;
  relationToChild: string;
  address: string;
  phoneNumber: string;
};

export type TAvatarFiles = {
  childAvatar: File | null;
  guardianAvatar: File | null;
};

export type TSavedSteps = [TChildInfo, TGuardianInfo, TAvatarFiles];

export default function Register() {
  const [step, setStep] = useState(0);
  const [savedSteps, saveSteps] = useState<TSavedSteps>([
    {
      fullName: "",
      gender: "" as "male" | "female",
      dateOfBirth: "",
      ageGroup: "",
    },
    {
      fullName: "",
      relationToChild: "",
      address: "",
      phoneNumber: "",
    },
    {
      childAvatar: null,
      guardianAvatar: null,
    },
  ]);
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

  console.log(savedSteps, step);

  const submitHandler = async () => {
    if (step === stepsData.length - 1) {
      const childAvatar = savedSteps[2].childAvatar;
      const guardianAvatar = savedSteps[2].guardianAvatar;
      const childAvatarArrayBuffer = await childAvatar!.arrayBuffer();
      const guardianAvatarArrayBuffer = await guardianAvatar!.arrayBuffer();

      const childStorageId = await uploadImage({
        imageArrayBuffer: childAvatarArrayBuffer,
      });

      const guardianStorageId = await uploadImage({
        imageArrayBuffer: guardianAvatarArrayBuffer,
      });

      const childData = {
        ...savedSteps[0],
        avatar: childStorageId as Id<"_storage">,
      };
      const guardianData = {
        ...savedSteps[1],
        avatar: guardianStorageId as Id<"_storage">,
      };

      await addChild({
        childData,
        guardianData,
      });
    }
  };

  const stepsData = [
    <ChildInfo
      saveSteps={saveSteps}
      savedSteps={savedSteps}
      setStep={setStep}
      step={step}
    />,
    <GuardianInfo
      saveSteps={saveSteps}
      savedSteps={savedSteps}
      setStep={setStep}
      step={step}
    />,
    <Avatars
      saveSteps={saveSteps}
      savedSteps={savedSteps}
      setStep={setStep}
      step={step}
    />,
    <PreviewForm savedSteps={savedSteps} submitForm={submitHandler} />,
  ];

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
