import { TAvatarFiles, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

const AvatarPreview = ({ file }: { file: File | null }) => {
  const [preview, setPreview] = useState<string>("/profile.png");

  useEffect(() => {
    if (!file) {
      setPreview("/profile.png");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Cleanup function to revoke the URL when component unmounts or file changes
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return <img src={preview} alt="Avatar" className="avatar-img" />;
};

export default function AvatarFiles({
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
  const defaultValues: TAvatarFiles = savedSteps[step] as TAvatarFiles;
  const [isUploading, setIsUploading] = useState(false);

  const { control, trigger, getValues } = useForm<TAvatarFiles>({
    defaultValues,
  });

  const generateUploadUrl = useMutation(api.images.generateUploadUrl);

  const uploadImage = async (imageFile: File) => {
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": imageFile.type },
      body: imageFile,
    });
    const { storageId } = await result.json();
    return storageId as Id<"_storage">;
  };

  const submitHandler = async (direction: "next" | "previous") => {
    const data = getValues();

    if (direction === "next") {
      const valid = await trigger();
      if (!valid) return;

      // Upload images if they exist and haven't been uploaded yet (or if they changed - for simplicity we re-upload if file object is present)
      // Actually, we should check if we already have a storageId for this file? 
      // But the file object doesn't carry the storageId. 
      // Let's just upload if there is a file.

      setIsUploading(true);
      try {
        let childStorageId = data.childStorageId;
        let guardianStorageId = data.guardianStorageId;

        if (data.childAvatar) {
          // Only upload if it's a new file or we don't have an ID. 
          // Since we can't easily track "new file" vs "old file" without more state, 
          // and the user might have re-selected, let's upload.
          // Optimization: If we wanted to avoid re-uploading the same file on back/next navigation, 
          // we would need to check if data.childAvatar is the same reference as savedSteps[step].childAvatar 
          // AND we have a savedSteps[step].childStorageId.

          const isSameChildFile = data.childAvatar === (savedSteps[step] as TAvatarFiles).childAvatar;
          const hasChildId = !!(savedSteps[step] as TAvatarFiles).childStorageId;

          if (!isSameChildFile || !hasChildId) {
            childStorageId = await uploadImage(data.childAvatar);
          } else {
            childStorageId = (savedSteps[step] as TAvatarFiles).childStorageId;
          }
        }

        if (data.guardianAvatar) {
          const isSameGuardianFile = data.guardianAvatar === (savedSteps[step] as TAvatarFiles).guardianAvatar;
          const hasGuardianId = !!(savedSteps[step] as TAvatarFiles).guardianStorageId;

          if (!isSameGuardianFile || !hasGuardianId) {
            guardianStorageId = await uploadImage(data.guardianAvatar);
          } else {
            guardianStorageId = (savedSteps[step] as TAvatarFiles).guardianStorageId;
          }
        }

        const savedStateCopy = [...savedSteps] as TSavedSteps;
        savedStateCopy[step] = {
          ...data,
          childStorageId,
          guardianStorageId
        };
        saveSteps(savedStateCopy);
        setStep((prev) => prev + 1);
      } catch (error) {
        console.error("Upload failed", error);
        toast.error("Failed to upload images. Please try again.");
      } finally {
        setIsUploading(false);
      }

    } else if (direction === "previous") {
      // Just save current state (files) without uploading
      const savedStateCopy = [...savedSteps] as TSavedSteps;
      savedStateCopy[step] = data;
      saveSteps(savedStateCopy);
      setStep((prev) => prev - 1);
    }
  };

  return (
    <form className="grid-gap-1 form-container">
      <h2 className="text-center mb-1">ፎቶ ይጫኑ</h2>

      <div className="avatar-files-container">
        {/* Child Avatar */}
        <Controller
          name="childAvatar"
          control={control}
          render={({ field }) => (
            <div className="mb-1">
              <label htmlFor="childAvatar" className="input-label">የልጅ ፎቶ</label>
              <div className="neo-box">
                <div className="avatar-preview-container">
                  <AvatarPreview file={field.value} />
                </div>

                <input
                  id="childAvatarInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    field.onChange(file);
                  }}
                />

                <button
                  type="button"
                  className="secondary"
                  onClick={() => document.getElementById('childAvatarInput')?.click()}
                  disabled={isUploading}
                >
                  ያስገቡ
                  <span style={{ fontSize: '1.1rem' }}>↑</span>
                </button>
              </div>
            </div>
          )}
        />

        {/* Guardian Avatar */}
        <Controller
          name="guardianAvatar"
          control={control}
          render={({ field }) => (
            <div className="mb-1">
              <label htmlFor="guardianAvatar" className="input-label">የወላጅ ፎቶ (አማራጭ)</label>
              <div className="neo-box">
                <div className="avatar-preview-container">
                  <AvatarPreview file={field.value} />
                </div>

                <input
                  id="guardianAvatarInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    field.onChange(file);
                  }}
                />

                <button
                  type="button"
                  className="secondary"
                  onClick={() => document.getElementById('guardianAvatarInput')?.click()}
                  disabled={isUploading}
                >
                  ያስገቡ
                  <span style={{ fontSize: '1.1rem' }}>↑</span>
                </button>
              </div>
            </div>
          )}
        />
      </div>

      <div className="flex-gap-1 mt-2">
        <button
          type="button"
          className="secondary w-full"
          onClick={() => {
            submitHandler("previous");
          }}
          disabled={isUploading}
        >
          ወደኋላ
        </button>

        <button
          type="button"
          className="neo-btn primary w-full"
          onClick={() => submitHandler("next")}
          disabled={isUploading}
        >
          {isUploading ? "ፎቶዎች በመጫን ላይ..." : "ቀጣይ"}
        </button>
      </div>
    </form>
  );
}
