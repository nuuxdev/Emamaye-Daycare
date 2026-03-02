"use client";

import GlassHeader from "@/components/GlassHeader";
import { useLanguage } from "@/context/LanguageContext";
import { CheckIcon } from "@/components/Icons";

export default function SettingsPage() {
    const { language, setLanguage, t } = useLanguage();

    const handleLanguageChange = (lang: "en" | "am") => {
        setLanguage(lang);
    };

    return (
        <>
            <GlassHeader title={t("settings.title")} backHref="/" />
            <main className="p-1">
                <div className="neo-box p-1">
                    <h3 className="mb-1 flex items-center gap-1">
                        <span>{t("settings.language")}</span>
                    </h3>

                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => handleLanguageChange("en")}
                            className={`neo-btn w-full flex justify-between items-center ${language === "en" ? "active" : ""}`}
                            style={{ padding: "1rem" }}
                        >
                            <span>{t("settings.english")}</span>
                            {language === "en" && <CheckIcon />}
                        </button>

                        <button
                            onClick={() => handleLanguageChange("am")}
                            className={`neo-btn w-full flex justify-between items-center ${language === "am" ? "active" : ""}`}
                            style={{ padding: "1rem" }}
                        >
                            <span>{t("settings.amharic")}</span>
                            {language === "am" && <CheckIcon />}
                        </button>
                    </div>
                </div>
            </main>
        </>
    );
}
