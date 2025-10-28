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
    <div>
      <h2>Preview</h2>
      <div>
        <h4>{savedSteps[0].fullName}</h4>
        <p>{savedSteps[0].dateOfBirth}</p>
        <p>{new Date().toISOString().slice(0, 10)}</p>
        <p>{savedSteps[0].ageGroup}</p>
      </div>
      <div>
        <h4>{savedSteps[1].fullName}</h4>
        <p>{savedSteps[1].relationToChild}</p>
        <p>{savedSteps[1].phoneNumber}</p>
        <p>{savedSteps[1].address}</p>
      </div>
      <button
        className="primary-button"
        onClick={submitForm}
        disabled={!!isPending}
      >
        {isPending === false
          ? "submit"
          : isPending === true
            ? "submitting..."
            : isPending}
      </button>
    </div>
  );
}
