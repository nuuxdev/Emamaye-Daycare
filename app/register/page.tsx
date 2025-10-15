"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAction } from "convex/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ChildInfo from "../views/register/ChildInfo";
import GuardianInfo from "../views/register/GuardianInfo";
import Avatars from "../views/register/AvatarFiles";
import PreviewForm from "../views/register/PreviewForm";
import useBetterMutation from "@/hooks/useBetterMutation";
import useTelegram from "@/hooks/useTelegram";
import { toast } from "sonner";
import fileToArrayBuffer from "@/utils/fileToArrayBuffer";

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
  const {
    mutate: addChildBetter,
    isPending,
    setIsPending,
  } = useBetterMutation(api.children.addChild);
  const uploadImage = useAction(api.images.uploadImage);

  const { isTelegram } = useTelegram();

  useEffect(() => {
    if (isTelegram) {
      toast.info("i am telegram");
    } else {
      toast.info("i am not telegram");
    }
  }, [isTelegram]);

  const submitHandler = async () => {
    setIsPending(true);
    if (step !== stepsData.length - 1) return;
    const childAvatar = savedSteps[2].childAvatar;
    const guardianAvatar = savedSteps[2].guardianAvatar;
    setIsPending("buffering first image...");
    if (childAvatar) {
      toast.info(childAvatar?.size.toString());
    } else {
      toast.info("no child avatar");
    }
    const childAvatarArrayBuffer = await fileToArrayBuffer(childAvatar!);
    setIsPending("buffering second image...");
    const guardianAvatarArrayBuffer = await fileToArrayBuffer(guardianAvatar!);
    setIsPending("Uploading first image...");
    const childStorageId = await uploadImage({
      imageArrayBuffer: childAvatarArrayBuffer,
    });
    setIsPending("Uploading second image...");
    const guardianStorageId = await uploadImage({
      imageArrayBuffer: guardianAvatarArrayBuffer,
    });
    setIsPending(true);
    const childData = {
      ...savedSteps[0],
      avatar: childStorageId as Id<"_storage">,
    };
    const guardianData = {
      ...savedSteps[1],
      avatar: guardianStorageId as Id<"_storage">,
    };

    await addChildBetter({
      childData,
      guardianData,
    });
    setIsPending(false);
  };

  const stepsData = [
    <ChildInfo
      key={"child-info"}
      saveSteps={saveSteps}
      savedSteps={savedSteps}
      setStep={setStep}
      step={step}
    />,
    <GuardianInfo
      key={"guardian-info"}
      saveSteps={saveSteps}
      savedSteps={savedSteps}
      setStep={setStep}
      step={step}
    />,
    <Avatars
      key={"avatar-files"}
      saveSteps={saveSteps}
      savedSteps={savedSteps}
      setStep={setStep}
      step={step}
    />,
    <PreviewForm
      key={"preview-form"}
      savedSteps={savedSteps}
      submitForm={submitHandler}
      isPending={isPending}
    />,
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
