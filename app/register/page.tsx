"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import useTelegram from "@/hooks/useTelegram";
import ChildInfo from "../views/register/ChildInfo";
import GuardianInfo from "../views/register/GuardianInfo";
import Avatars from "../views/register/AvatarFiles";
import PreviewForm from "../views/register/PreviewForm";
import useBetterMutation from "@/hooks/useBetterMutation";
import { toast } from "sonner";
import GlassHeader from "@/components/GlassHeader";
import { TAgeGroup, TGender } from "@/convex/types/children";
import { TRelationToChild } from "@/convex/types/guardians";
import { fromEthDateString } from "@/utils/calendar";

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
  childStorageId?: Id<"_storage">;
  guardianStorageId?: Id<"_storage">;
};

export type TSavedSteps = [TChildInfo, TGuardianInfo, TAvatarFiles];

export default function Register() {
  const { isTelegram, setPageTitle, showBackButton, hideBackButton } = useTelegram();
  const [step, setStep] = useState(0);
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
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

  const handleReset = () => {
    saveSteps([
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
    setStep(0);
    dialogRef.current?.close();
    setIsPending(false);
  };

  const handleHome = () => {
    router.push("/");
  };

  const submitHandler = async () => {
    setIsPending(true);
    if (step !== stepsData.length - 1) return;

    // Images should already be uploaded by the AvatarFiles step (both are now optional)
    const childStorageId = savedSteps[2].childStorageId;
    const guardianStorageId = savedSteps[2].guardianStorageId;

    try {
      const dateOfBirth = savedSteps[0].dateOfBirth;
      const dateOfBirthString = fromEthDateString(dateOfBirth);
      const childData = {
        ...savedSteps[0],
        paymentAmount: savedSteps[0].paymentAmount!,
        avatar: childStorageId,
        dateOfBirth: dateOfBirthString,
      };
      const guardianData = {
        ...savedSteps[1],
        avatar: guardianStorageId,
      };

      await addChild({
        childData,
        guardianData,
      });
      // Show success dialog instead of just stopping pending state
      dialogRef.current?.showModal();
    } catch (error) {
      console.error(error);
      toast.error("Failed to Register Child");
      setIsPending(false); // Only stop pending on error
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
        <div className="neo-box centered-container" style={{ maxWidth: '600px' }}>

          {/* Stepper */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', width: '100%' }}>
            {/* Progress Line */}
            <div style={{ position: 'absolute', top: '50%', left: '1rem', right: '1rem', height: '2px', background: 'rgba(0,0,0,0.05)', transform: 'translateY(-50%)', zIndex: 0, borderRadius: '2px' }}>
              <div style={{
                height: '100%',
                width: `${(step / (stepsData.length - 1)) * 100}% `,
                background: 'var(--primary-color)',
                borderRadius: '2px',
                transition: 'width 0.4s ease'
              }} />
            </div>

            {stepsData.map((_, index) => {
              const isCompleted = (index: number) => {
                if (index === 0) return !!savedSteps[0].fullName && !!savedSteps[0].dateOfBirth;
                if (index === 1) return !!savedSteps[1].fullName && !!savedSteps[1].phoneNumber;
                if (index === 2) return !!savedSteps[2].childAvatar; // Optional: require avatar?
                return false;
              };

              // Allow navigation if the step is the current one, 
              // OR if it's a previous step (always allowed to go back),
              // OR if it's a future step BUT all previous steps are completed.
              // Simpler rule based on user request "Only make the filled ones to be navigatable":
              // We can interpret "filled" as "completed".
              // But usually you can always go back. 
              // And you can go to a future step only if all intermediate steps are done.
              // Let's allow clicking if:
              // 1. It's less than or equal to current step (history)
              // 2. It's a future step and the immediate previous step is complete (next available) - actually user said "filled ones".
              // If I jump from 0 to 2, 1 must be filled.

              const canNavigate = index <= step || (index > step && Array.from({ length: index }, (_, i) => i).every(i => isCompleted(i)));

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (canNavigate) setStep(index);
                  }}
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
                    border: index <= step ? 'none' : '2px solid rgba(255,255,255,0.5)',
                    cursor: canNavigate ? 'pointer' : 'not-allowed',
                    opacity: canNavigate ? 1 : 0.6
                  }}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>

          {/* Content Area */}
          {stepsData[step]}
        </div>
      </main>

      <dialog ref={dialogRef}>
        <div className="dialog-title">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>ምዝገባው ተሳክቷል!</h2>
          <p style={{ opacity: 0.8 }}>የልጁ መረጃ በተሳካ ሁኔታ ተመዝግቧል።</p>
        </div>
        <div className="dialog-actions" style={{ flexDirection: 'column', gap: '0.75rem' }}>
          <button className="neo-btn primary w-full" onClick={handleHome}>
            ወደ ዋናው ገጽ ይመለሱ
          </button>
          <button className="secondary w-full" onClick={handleReset}>
            ሌላ ልጅ ያስመዝግቡ
          </button>
        </div>
      </dialog>
    </>
  );
}
