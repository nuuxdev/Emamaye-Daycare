import { TAvatarFiles, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { ServerAvatar } from "@/app/components/ServerAvatar";
import { CameraIcon, UploadIcon } from "@/components/Icons";

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
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, []);

  useEffect(() => {
    if (uploadComplete && storageId && localPreviewUrl) {
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

    const previewUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(previewUrl);
    setUploadComplete(false);

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90));
      }, 200);

      const newStorageId = await uploadOptimizedImage({ imageData: arrayBuffer });

      clearInterval(progressInterval);
      setUploadProgress(100);

      onUploadComplete(newStorageId as Id<"_storage">, file);
      setUploadComplete(true);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("ምስሉን መጫን አልተቻለም");
      setIsUploading(false);
      setUploadProgress(0);
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl(null);
      }
    }
  };

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

          {isUploading && (
            <div style={{ width: "100%", maxWidth: "120px" }}>
              <HorizontalProgress progress={uploadProgress} />
            </div>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          id={`file-${label}`}
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          id={`camera-${label}`}
          onChange={handleFileSelect}
          disabled={isUploading}
        />

        {/* Buttons container - width fits content */}
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            type="button"
            className="secondary"
            onClick={() => document.getElementById(`file-${label}`)?.click()}
            disabled={isUploading}
          >
            {isUploading ? "እየጫነ..." : <><UploadIcon />ፋይል</>}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => document.getElementById(`camera-${label}`)?.click()}
            disabled={isUploading}
            style={{
              position: "absolute",
              right: "-4.5rem",
              aspectRatio: "1/1",
              borderRadius: "50%",
              padding: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <CameraIcon />
          </button>
        </div>
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
      setStep((prev) => prev + 1);
    } else if (direction === "previous") {
      setStep((prev) => prev - 1);
    }

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
              label="የልጅ ፎቶ (አማራጭ)"
              storageId={field.value}
              uploadOptimizedImage={uploadOptimizedImage}
              onUploadComplete={(id, file) => {
                field.onChange(id);
                setValue("childAvatar", file);

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
