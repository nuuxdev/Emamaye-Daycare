import { TAvatarFiles, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { ServerAvatar } from "@/app/components/ServerAvatar";

const HorizontalProgress = ({ progress }: { progress: number }) => {
  return (
    <div style={{
      width: "100%",
      height: "4px",
      backgroundColor: "#e0e0e0",
      borderRadius: "2px",
      overflow: "hidden",
      marginTop: "0.5rem"
    }}>
      <div style={{
        width: `${progress}%`,
        height: "100%",
        backgroundColor: "var(--primary-color)",
        borderRadius: "2px",
        transition: "width 0.1s linear"
      }} />
    </div>
  );
};

const ImageUploader = ({
  label,
  storageId,
  onUploadComplete,
  uploadOptimizedImage
}: {
  label: string;
  storageId?: Id<"_storage">;
  onUploadComplete: (storageId: Id<"_storage">, file: File) => void;
  uploadOptimizedImage: (args: { imageData: ArrayBuffer }) => Promise<string>;
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  // Local preview URL for instant display
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  // Track if upload is complete to swap images
  const [uploadComplete, setUploadComplete] = useState(false);

  // Cleanup object URL when component unmounts
  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, []);

  // Clear local preview when upload is complete and we have a storage ID
  useEffect(() => {
    if (uploadComplete && storageId && localPreviewUrl) {
      // Small delay to ensure server image is ready
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
        setUploadComplete(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [uploadComplete, storageId, localPreviewUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show instant preview
    const previewUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(previewUrl);
    setUploadComplete(false);

    setIsUploading(true);
    setUploadProgress(10); // Start at 10% to show something is happening

    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // Simulate progress while uploading (since action doesn't support progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      // Upload and optimize on backend
      const newStorageId = await uploadOptimizedImage({ imageData: arrayBuffer });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Notify parent of successful upload
      onUploadComplete(newStorageId as Id<"_storage">, file);

      // Mark upload as complete to trigger image swap
      setUploadComplete(true);

      // Hide progress bar after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("ምስሉን መጫን አልተቻለም");
      setIsUploading(false);
      setUploadProgress(0);
      // Clear the preview on error
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }
    }
  };

  // Show local preview while uploading, server image after complete
  const showLocalPreview = localPreviewUrl && !uploadComplete;

  return (
    <div className="mb-1">
      <label className="input-label">{label}</label>
      <div className="neo-box avatar-card relative">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <div className="avatar-preview-container">
            {showLocalPreview ? (
              <img
                src={localPreviewUrl}
                alt="Preview"
                className="avatar-img"
              />
            ) : (
              <ServerAvatar storageId={storageId} />
            )}
          </div>

          {/* Horizontal progress bar below the image */}
          {isUploading && (
            <div style={{ width: "100%", maxWidth: "120px" }}>
              <HorizontalProgress progress={uploadProgress} />
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          id={`file-${label}`}
          onChange={handleFileSelect}
          disabled={isUploading}
        />

        <button
          type="button"
          className="secondary"
          onClick={() => document.getElementById(`file-${label}`)?.click()}
          disabled={isUploading}
        >
          {isUploading ? "እየጫነ ነው..." : "ያስገቡ"}
          {!isUploading && <span style={{ fontSize: '1.1rem' }}>↑</span>}
        </button>
      </div>
    </div>
  );
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

  const { control, setValue, getValues } = useForm<TAvatarFiles>({
    defaultValues,
  });

  const uploadOptimizedImage = useAction(api.imageOptimizer.uploadOptimizedImage);

  const submitHandler = async (direction: "next" | "previous") => {
    const data = getValues();

    if (direction === "next") {
      if (!data.childStorageId) {
        toast.error("እባክዎ የልጁን ፎቶ ያስገቡ");
        return;
      }

      setStep((prev) => prev + 1);
    } else if (direction === "previous") {
      setStep((prev) => prev - 1);
    }

    // Save state
    const savedStateCopy = [...savedSteps] as TSavedSteps;
    savedStateCopy[step] = data;
    saveSteps(savedStateCopy);
  };

  return (
    <form className="grid-gap-1 form-container">
      <h2 className="text-center mb-1">ፎቶ ይጫኑ</h2>

      <div className="avatar-files-container">
        {/* Child Avatar */}
        <Controller
          name="childStorageId"
          control={control}
          render={({ field }) => (
            <ImageUploader
              label="የልጅ ፎቶ"
              storageId={field.value}
              uploadOptimizedImage={uploadOptimizedImage}
              onUploadComplete={(id, file) => {
                field.onChange(id);
                setValue("childAvatar", file);

                // Update savedSteps immediately to persist the ID
                const savedStateCopy = [...savedSteps] as TSavedSteps;
                savedStateCopy[step] = {
                  ...getValues(),
                  childStorageId: id,
                  childAvatar: file
                };
                saveSteps(savedStateCopy);
              }}
            />
          )}
        />

        {/* Guardian Avatar */}
        <Controller
          name="guardianStorageId"
          control={control}
          render={({ field }) => (
            <ImageUploader
              label="የወላጅ ፎቶ (አማራጭ)"
              storageId={field.value}
              uploadOptimizedImage={uploadOptimizedImage}
              onUploadComplete={(id, file) => {
                field.onChange(id);
                setValue("guardianAvatar", file);

                const savedStateCopy = [...savedSteps] as TSavedSteps;
                savedStateCopy[step] = {
                  ...getValues(),
                  guardianStorageId: id,
                  guardianAvatar: file
                };
                saveSteps(savedStateCopy);
              }}
            />
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
        >
          ወደኋላ
        </button>

        <button
          type="button"
          className="neo-btn primary w-full"
          onClick={() => submitHandler("next")}
        >
          ቀጣይ
        </button>
      </div>
    </form>
  );
}
