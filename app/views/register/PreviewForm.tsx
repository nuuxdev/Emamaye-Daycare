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
    <div className="neo-box grid-gap-1" style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2>የመጨረሻ ማረጋገጫ</h2>

      <div style={{
        background: "var(--background)",
        boxShadow: "var(--shadow-inset-dark), var(--shadow-inset-light)",
        borderRadius: "20px",
        padding: "1.5rem"
      }}>
        <h3 style={{ marginBottom: "0.5rem", fontSize: "1.1rem", color: "var(--primary-color)" }}>የልጅ መረጃ</h3>
        <div style={{ display: "grid", gap: "0.5rem", opacity: 0.8 }}>
          <p><strong>ስም:</strong> {savedSteps[0].fullName}</p>
          <p><strong>የልደት ቀን:</strong> {savedSteps[0].dateOfBirth}</p>
          <p><strong>የእድሜ መደብ:</strong> {savedSteps[0].ageGroup}</p>
          <p><strong>የክፍያ መጠን:</strong> {savedSteps[0].paymentAmount} ብር</p>
        </div>
      </div>

      <div style={{
        background: "var(--background)",
        boxShadow: "var(--shadow-inset-dark), var(--shadow-inset-light)",
        borderRadius: "20px",
        padding: "1.5rem"
      }}>
        <h3 style={{ marginBottom: "0.5rem", fontSize: "1.1rem", color: "var(--primary-color)" }}>የወላጅ መረጃ</h3>
        <div style={{ display: "grid", gap: "0.5rem", opacity: 0.8 }}>
          <p><strong>ስም:</strong> {savedSteps[1].fullName}</p>
          <p><strong>ዝምድና:</strong> {savedSteps[1].relationToChild}</p>
          <p><strong>ስልክ:</strong> {savedSteps[1].phoneNumber}</p>
          <p><strong>አድራሻ:</strong> {savedSteps[1].address}</p>
        </div>
      </div>

      <button
        className="neo-btn primary w-full"
        style={{ marginTop: "1rem", padding: "1.25rem 2rem", fontSize: "1.1rem" }}
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
