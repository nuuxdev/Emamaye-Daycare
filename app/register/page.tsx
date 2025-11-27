"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState, useEffect } from "react";
import useTelegram from "@/hooks/useTelegram";
import ChildInfo from "../views/register/ChildInfo";
import GuardianInfo from "../views/register/GuardianInfo";
import Avatars from "../views/register/AvatarFiles";
import PreviewForm from "../views/register/PreviewForm";
import useBetterMutation from "@/hooks/useBetterMutation";
import { toast } from "sonner";
import GlassHeader from "@/components/GlassHeader";
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
  paymentAmount: number | null;
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
  const { isTelegram, setPageTitle, showBackButton, hideBackButton } = useTelegram();
  const [step, setStep] = useState(0);
  const [savedSteps, saveSteps] = useState<TSavedSteps>([
    {
      fullName: "",
      gender: "" as TGender,
      dateOfBirth: "",
      ageGroup: "" as TAgeGroup,
      paymentAmount: null,
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

  // Manage Telegram back button
  useEffect(() => {
    setPageTitle("Registration");

    if (isTelegram) {
      if (step > 0) {
        showBackButton(() => {
          setStep((prev) => prev - 1);
        });
      } else {
        hideBackButton();
      }
    }

    // Cleanup on unmount
    return () => {
      if (isTelegram) {
        hideBackButton();
      }
    };
  }, [step, isTelegram, setPageTitle, showBackButton, hideBackButton]);

  const submitHandler = async () => {
    setIsPending(true);
    if (step !== stepsData.length - 1) return;
    const childAvatar = savedSteps[2].childAvatar;
    const guardianAvatar = savedSteps[2].guardianAvatar;
    try {
      const uploadImage = async (imageFile: File | null) => {
        if (imageFile) {
          const postUrl = await generateUploadUrl();
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": imageFile.type },
            body: imageFile,
          });
          const { storageId } = await result.json();
          return storageId as Id<"_storage">
        }
        return
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

      setIsPending('Uploading Child Avatar');
      const childStorageId = await uploadImage(childAvatar);
      setIsPending('Uploading Guardian Avatar');
      const guardianStorageId = await uploadImage(guardianAvatar);
      const childData = {
        ...savedSteps[0],
        paymentAmount: savedSteps[0].paymentAmount!,
        avatar: childStorageId,
        dateOfBirth: dateInGreg.toString(),
      };
      const guardianData = {
        ...savedSteps[1],
        avatar: guardianStorageId,
      };
      setIsPending(true);
      await addChild({
        childData,
        guardianData,
      });
      setIsPending(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to Register Child");
      return;
    }

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
      <GlassHeader title="Registration" backHref="/" />
      <main className="animate-fade-in">
        <div className="neo-box" style={{ width: '100%', maxWidth: '600px', padding: '0' }}>

          {/* Stepper */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.25rem 1rem', position: 'relative', width: '100%' }}>
            {/* Progress Line */}
            <div style={{ position: 'absolute', top: '50%', left: '1rem', right: '1rem', height: '2px', background: 'rgba(0,0,0,0.05)', transform: 'translateY(-50%)', zIndex: 0, borderRadius: '2px' }}>
              <div style={{
                height: '100%',
                width: `${(step / (stepsData.length - 1)) * 100}%`,
                background: 'var(--primary-color)',
                borderRadius: '2px',
                transition: 'width 0.4s ease'
              }} />
            </div>

            {stepsData.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: index <= step ? 'var(--primary-color)' : 'var(--background)',
                  color: index <= step ? 'white' : 'var(--foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  zIndex: 1,
                  boxShadow: index <= step ? '0 4px 10px rgba(255, 51, 102, 0.4)' : 'var(--shadow-dark)',
                  transition: 'all 0.4s ease',
                  border: index <= step ? 'none' : '2px solid rgba(255,255,255,0.5)'
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* Content Area */}
          <div style={{ padding: '0 1rem 1.5rem' }}>
            {stepsData[step]}
          </div>
        </div>
      </main>
    </>
  );
}
