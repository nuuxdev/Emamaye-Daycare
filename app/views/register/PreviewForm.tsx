import { TSavedSteps } from "@/app/register/page";

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
        <div className="neo-box">
          <div className="preview-header">
            <div className="avatar-preview-container small">
              <img
                src={savedSteps[2].childAvatar ? URL.createObjectURL(savedSteps[2].childAvatar) : "/profile.png"}
                alt="Child"
                className="avatar-img"
              />
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
              <img
                src={savedSteps[2].guardianAvatar ? URL.createObjectURL(savedSteps[2].guardianAvatar) : "/profile.png"}
                alt="Guardian"
                className="avatar-img"
              />
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
