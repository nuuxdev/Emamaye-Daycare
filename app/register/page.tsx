"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useState } from "react";
import ChildInfo from "../views/register/ChildInfo";
import GuardianInfo from "../views/register/GuardianInfo";
import Avatars from "../views/register/AvatarFiles";
import PreviewForm from "../views/register/PreviewForm";
import useBetterMutation from "@/hooks/useBetterMutation";
import { toast } from "sonner";
import { TAgeGroup, TGender } from "@/convex/types/children";
import {
  CalendarDate,
  EthiopicCalendar,
  GregorianCalendar,
  toCalendar,
} from "@internationalized/date";
import { TRelationToChild } from "@/convex/types/guardians";

export type TChildInfo = {
  fullName: string;
  gender: TGender;
  dateOfBirth: string;
  ageGroup: TAgeGroup;
};

export type TGuardianInfo = {
  fullName: string;
  relationToChild: TRelationToChild;
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
      gender: "" as TGender,
      dateOfBirth: "",
      ageGroup: "" as TAgeGroup,
    },
    {
      fullName: "",
      relationToChild: "" as TRelationToChild,
      address: "",
      phoneNumber: "",
    },
    {
      childAvatar: null,
      guardianAvatar: null,
    },
  ]);
  const {
    mutate: addChild,
    isPending,
    setIsPending,
  } = useBetterMutation(api.children.addChild);
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);

  const submitHandler = async () => {
    setIsPending(true);
    if (step !== stepsData.length - 1) return;
    const childAvatar = savedSteps[2].childAvatar;
    const guardianAvatar = savedSteps[2].guardianAvatar;
    const postUrl = await generateUploadUrl();
    let childStorageId: Id<"_storage">;
    let guardianStorageId: Id<"_storage">;
    try {
      setIsPending("uploading child's avatar...");
      const childRes = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": childAvatar!.type },
        body: childAvatar,
      });
      childStorageId = (await childRes.json()).storageId;
      setIsPending("uploading guardian's avatar...");
      const guardianRes = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": guardianAvatar!.type },
        body: guardianAvatar,
      });
      guardianStorageId = (await guardianRes.json()).storageId;
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload avatars");
      return;
    }
    const dateOfBirth = savedSteps[0].dateOfBirth;
    const [month, date, year] = dateOfBirth.split("-");
    const dateInEt = new CalendarDate(
      new EthiopicCalendar(),
      parseInt(year),
      parseInt(month),
      parseInt(date),
    );
    const dateInGreg = toCalendar(dateInEt, new GregorianCalendar());
    const childData = {
      ...savedSteps[0],
      avatar: childStorageId as Id<"_storage">,
      dateOfBirth: dateInGreg.toString(),
    };
    const guardianData = {
      ...savedSteps[1],
      avatar: guardianStorageId as Id<"_storage">,
    };
    setIsPending(true);
    await addChild({
      childData,
      guardianData,
    });
    setIsPending(false);
  };

  const stepsData = [
    <ChildInfo
      key="child-info"
      saveSteps={saveSteps}
      savedSteps={savedSteps}
      setStep={setStep}
      step={step}
    />,
    <GuardianInfo
      key="guardian-info"
      saveSteps={saveSteps}
      savedSteps={savedSteps}
      setStep={setStep}
      step={step}
    />,
    <Avatars
      key="avatar-files"
      saveSteps={saveSteps}
      savedSteps={savedSteps}
      setStep={setStep}
      step={step}
    />,
    <PreviewForm
      key="preview-form"
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
