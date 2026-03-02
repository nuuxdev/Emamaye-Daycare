import { TSavedSteps } from "@/app/register/page";
import { ServerAvatar } from "@/app/components/ServerAvatar";
import { useLanguage } from "@/context/LanguageContext";

export default function PreviewForm({
  savedSteps,
  submitForm,
  isPending,
}: {
  savedSteps: TSavedSteps;
  submitForm: () => void;
  isPending: boolean | string;
}) {
  const { t, language } = useLanguage();
  return (
    <div className="grid-gap-1 w-full">

      {/* Child Info Card */}
      <div className="mb-1">
        <h3 className="card-title">{t("registration.steps.child")}</h3>
        <div className="neo-box preview-card">
          <div className="preview-header">
            <div className="avatar-preview-container small">
              <ServerAvatar storageId={savedSteps[2].childStorageId} />
            </div>
            <div>
              <div className="font-bold" style={{ fontSize: '1.125rem' }}>{savedSteps[0].fullNameAmh || savedSteps[0].fullName}</div>
              <div className="text-sm opacity-60">{savedSteps[0].fullName}</div>
              <div className="opacity-60">{savedSteps[0].gender === "male" ? t("common.male") : t("common.female")}</div>
            </div>
          </div>

          <div className="preview-info-row">
            <span className="preview-label">{t("children.sort.birthday")}</span>
            <span className="preview-value">{savedSteps[0].dateOfBirth}</span>
          </div>
          <hr />
          <div className="preview-info-row">
            <span className="preview-label">{t("children.sort.age")}</span>
            <span>{t(`ageGroups.${savedSteps[0].ageGroup}`)}</span>
          </div>
          <hr />
          <div className="preview-info-row">
            <span className="preview-label">{t("kpi.categoryPayments")}</span>
            <span className="preview-value">{savedSteps[0].paymentAmount} {language === "am" ? "ብር" : "ETB"}</span>
          </div>
        </div>
      </div>

      {/* Guardian Info Card */}
      <div className="mb-1">
        <h3 className="card-title">{t("registration.steps.guardian")}</h3>
        <div className="neo-box preview-card">
          <div className="preview-header">
            <div className="avatar-preview-container small">
              <ServerAvatar storageId={savedSteps[2].guardianStorageId} />
            </div>
            <div>
              <div className="font-bold" style={{ fontSize: '1.125rem' }}>{savedSteps[1].fullNameAmh || savedSteps[1].fullName}</div>
              <div className="text-sm opacity-60">{savedSteps[1].fullName}</div>
              <div className="opacity-60">{t(`relationToChild.${savedSteps[1].relationToChild}` as any) || savedSteps[1].relationToChild}</div>
            </div>
          </div>

          <div className="preview-info-row border-bottom">
            <span className="preview-label">{language === "am" ? "አድራሻ" : "Address"}</span>
            <span>{savedSteps[1].address}</span>
          </div>
          <div className="preview-info-row">
            <span className="preview-label">{language === "am" ? "ስልክ ቁጥር" : "Phone Number"}</span>
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
          ? (language === "am" ? "ይላኩ" : "Submit")
          : isPending === true
            ? (language === "am" ? "እየተላከ ነው..." : "Submitting...")
            : isPending}
      </button>
    </div>
  );
}
