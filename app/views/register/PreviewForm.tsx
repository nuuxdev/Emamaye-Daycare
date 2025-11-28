import { TSavedSteps } from "@/app/register/page";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

const ServerAvatar = ({ storageId }: { storageId?: Id<"_storage"> }) => {
  const imageUrl = useQuery(api.images.getImageUrl, storageId ? { storageId } : "skip");

  if (!storageId) {
    return <img src="/profile.png" alt="Avatar" className="avatar-img" />;
  }

  if (imageUrl === undefined) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <img src={imageUrl || "/profile.png"} alt="Avatar" className="avatar-img" />;
};

export default function PreviewForm({
  savedSteps,
  submitForm,
  isPending,
}: {
  savedSteps: TSavedSteps;
  submitForm: () => void;
  isPending: boolean | string;
}) {
  return (
    <div className="grid-gap-1 w-full">

      {/* Child Info Card */}
      <div className="mb-1">
        <h3 className="card-title">የልጅ መረጃዎች</h3>
        <div className="neo-box preview-card">
          <div className="preview-header">
            <div className="avatar-preview-container small">
              <ServerAvatar storageId={savedSteps[2].childStorageId} />
            </div>
            <div>
              <div className="font-bold" style={{ fontSize: '1.125rem' }}>{savedSteps[0].fullName}</div>
              <div className="opacity-60">{savedSteps[0].gender}</div>
            </div>
          </div>

          <div className="preview-info-row">
            <span className="preview-label">የልደት ቀን</span>
            <span className="preview-value">{savedSteps[0].dateOfBirth}</span>
          </div>
          <hr />
          <div className="preview-info-row">
            <span className="preview-label">የእድሜ መደብ</span>
            <span>{savedSteps[0].ageGroup}</span>
          </div>
          <hr />
          <div className="preview-info-row">
            <span className="preview-label">የክፍያ መጠን</span>
            <span className="preview-value">{savedSteps[0].paymentAmount} ብር</span>
          </div>
        </div>
      </div>

      {/* Guardian Info Card */}
      <div className="mb-1">
        <h3 className="card-title">የአሳዳጊ መረጃዎች</h3>
        <div className="neo-box preview-card">
          <div className="preview-header">
            <div className="avatar-preview-container small">
              <ServerAvatar storageId={savedSteps[2].guardianStorageId} />
            </div>
            <div>
              <div className="font-bold" style={{ fontSize: '1.125rem' }}>{savedSteps[1].fullName}</div>
              <div className="opacity-60">{savedSteps[1].relationToChild}</div>
            </div>
          </div>

          <div className="preview-info-row border-bottom">
            <span className="preview-label">አድራሻ</span>
            <span>{savedSteps[1].address}</span>
          </div>
          <div className="preview-info-row">
            <span className="preview-label">ስልክ ቁጥር</span>
            <span className="preview-value">{savedSteps[1].phoneNumber}</span>
          </div>
        </div>
      </div>

      <button
        className="neo-btn primary w-full submit-btn"
        onClick={submitForm}
        disabled={!!isPending}
      >
        {isPending === false
          ? "ይላኩ"
          : isPending === true
            ? "እየተላከ ነው..."
            : isPending}
      </button>
    </div>
  );
}
