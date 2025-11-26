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
    <div className="neo-box grid-gap-1 max-w-500">
      <h2>የመጨረሻ ማረጋገጫ</h2>

      <div className="review-box">
        <h3 className="review-title">የልጅ መረጃ</h3>
        <div className="review-grid">
          <p><strong>ስም:</strong> {savedSteps[0].fullName}</p>
          <p><strong>የልደት ቀን:</strong> {savedSteps[0].dateOfBirth}</p>
          <p><strong>የእድሜ መደብ:</strong> {savedSteps[0].ageGroup}</p>
          <p><strong>የክፍያ መጠን:</strong> {savedSteps[0].paymentAmount} ብር</p>
        </div>
      </div>

      <div className="review-box">
        <h3 className="review-title">የወላጅ መረጃ</h3>
        <div className="review-grid">
          <p><strong>ስም:</strong> {savedSteps[1].fullName}</p>
          <p><strong>ዝምድና:</strong> {savedSteps[1].relationToChild}</p>
          <p><strong>ስልክ:</strong> {savedSteps[1].phoneNumber}</p>
          <p><strong>አድራሻ:</strong> {savedSteps[1].address}</p>
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
