import { TAvatarFiles, TSavedSteps } from "@/app/register/page";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { ServerAvatar } from "@/app/components/ServerAvatar";

const CircularProgress = ({ progress }: { progress: number }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-full">
      <svg className="transform -rotate-90 w-24 h-24">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="#e0e0e0"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="var(--primary-color)"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-primary">{Math.round(progress)}%</span>
    </div>
  );
};

const ImageUploader = ({
  label,
  storageId,
  onUploadComplete,
  generateUploadUrl
}: {
  label: string;
  storageId?: Id<"_storage">;
  onUploadComplete: (storageId: Id<"_storage">, file: File) => void;
  generateUploadUrl: () => Promise<string>;
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const postUrl = await generateUploadUrl();

      const xhr = new XMLHttpRequest();
      xhr.open("POST", postUrl);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          onUploadComplete(response.storageId, file);
          setIsUploading(false);
        } else {
          console.error("Upload failed");
          toast.error("Upload failed");
          setIsUploading(false);
        }
      };

      xhr.onerror = () => {
        console.error("Upload error");
        toast.error("Upload error");
        setIsUploading(false);
      };

      xhr.send(file);
    } catch (error) {
      console.error("Error starting upload", error);
      toast.error("Error starting upload");
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-1">
      <label className="input-label">{label}</label>
      <div className="neo-box avatar-card relative">
        <div className="avatar-preview-container relative">
          <ServerAvatar storageId={storageId} />
          {isUploading && <CircularProgress progress={uploadProgress} />}
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

  // We need to keep track of storageIds in the form state or just use savedSteps directly?
  // Using react-hook-form is good for validation if we needed it, but here we are managing storageIds.
  // Let's sync with react-hook-form for consistency with other steps, but we primarily care about storageIds.

  const { control, setValue, getValues } = useForm<TAvatarFiles>({
    defaultValues,
  });

  const generateUploadUrl = useMutation(api.images.generateUploadUrl);

  const submitHandler = async (direction: "next" | "previous") => {
    const data = getValues();

    if (direction === "next") {
      // Validate that we have storageIds if required
      // For now, let's assume child avatar is required? 
      // The previous logic checked for childAvatar file.

      if (!data.childStorageId) {
        toast.error("Please upload a child photo");
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
              generateUploadUrl={generateUploadUrl}
              onUploadComplete={(id, file) => {
                field.onChange(id);
                setValue("childAvatar", file); // Keep file for consistency if needed, though we rely on ID

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
              generateUploadUrl={generateUploadUrl}
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
