"use client";

interface LanguageSwitchProps {
    language: "en" | "am";
    onToggle: () => void;
    /** Compact mode renders a smaller toggle (default: false) */
    compact?: boolean;
    /** Hide the text labels on either side (default: false) */
    noLabels?: boolean;
}

export default function LanguageSwitch({ language, onToggle, compact = false, noLabels = false }: LanguageSwitchProps) {
    const isEnglish = language === "en";
    const trackCls = compact ? "lang-switch-track lang-switch-track--sm" : "lang-switch-track";
    const thumbCls = compact ? "lang-switch-thumb lang-switch-thumb--sm" : "lang-switch-thumb";
    const flagCls = compact ? "lang-switch-flag lang-switch-flag--sm" : "lang-switch-flag";

    return (
        <div className="lang-switch-wrapper" aria-label="Language selector">
            {/* Amharic label (left) */}
            {!noLabels && (
                <span className={`lang-switch-label ${!isEnglish ? "lang-switch-label--active" : ""}`}>
                    አማ
                </span>
            )}

            {/* The toggle track */}
            <button
                className={trackCls}
                onClick={onToggle}
                aria-pressed={isEnglish}
                aria-label={isEnglish ? "Switch to Amharic" : "Switch to English"}
            >
                {/* Ethiopian flag — blurred when English is active */}
                <span
                    className={`${flagCls} lang-switch-flag--left ${isEnglish ? "lang-switch-flag--inactive" : ""}`}
                    aria-hidden="true"
                >
                    🇪🇹
                </span>

                {/* Sliding thumb — shows the active flag */}
                <span className={`${thumbCls} ${isEnglish ? "lang-switch-thumb--right" : "lang-switch-thumb--left"}`}>
                    <span className="lang-switch-thumb-flag" aria-hidden="true">
                        {isEnglish ? "🇬🇧" : "🇪🇹"}
                    </span>
                </span>

                {/* British flag — blurred when Amharic is active */}
                <span
                    className={`${flagCls} lang-switch-flag--right ${!isEnglish ? "lang-switch-flag--inactive" : ""}`}
                    aria-hidden="true"
                >
                    🇬🇧
                </span>
            </button>

            {/* English label (right) */}
            {!noLabels && (
                <span className={`lang-switch-label ${isEnglish ? "lang-switch-label--active" : ""}`}>
                    ENG
                </span>
            )}
        </div>
    );
}
