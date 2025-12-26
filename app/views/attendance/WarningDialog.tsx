import { RefObject } from "react";

export default function WarningDialog({
    dialogRef,
    confirmDateChange,
    cancelDateChange,
}: {
    dialogRef: RefObject<HTMLDialogElement | null>;
    confirmDateChange: () => void;
    cancelDateChange: () => void;
}) {
    return (
        <dialog ref={dialogRef} style={{ borderRadius: "16px", padding: "1.5rem", maxWidth: "90%", width: "320px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "center" }}>
                <h3 style={{ margin: 0 }}>⚠️ ማስጠንቀቂያ</h3>
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                    የተገቢው የተማሪዎች ቅፅ ያልተጠናቀቀ ነው። ቀኑን ከቀየሩ የተቀዳው መረጃ ይሰረዛል።
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        onClick={cancelDateChange}
                        className="secondary"
                        style={{ flex: 1 }}
                    >
                        ተመለስ
                    </button>
                    <button
                        onClick={confirmDateChange}
                        className="secondary"
                        style={{ flex: 1, color: "var(--error-color)" }}
                    >
                        ቀይር
                    </button>
                </div>
            </div>
        </dialog>
    );
}
