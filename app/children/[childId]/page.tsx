"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAction, useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import GlassHeader from "@/components/GlassHeader";
import { JSX, useEffect, useState, useRef } from "react";
import { ArrowRight, CallIcon, CameraIcon, CloseIcon, DeactivatedChildIcon, EditIcon, InfantIcon, MessageIcon, PlusIcon, PreschoolerIcon, RecycleIcon, ToddlerIcon, UploadIcon, SettingsIcon } from "@/components/Icons";
import { formatEthiopianDate, todayInEth, todayInGreg, ethMonthNames, EthiopianCalendar, gregorianToEthDateString } from "@/utils/calendar";
import { parseDate, toCalendar } from "@internationalized/date";
import { toast } from "sonner";
import ChildAttendanceGrid from "@/app/views/attendance/ChildAttendanceGrid";
import DeactivateChildModal from "@/app/components/DeactivateChildModal";
import { useLanguage } from "@/context/LanguageContext";
import { useAge, calculateAge } from "@/utils/calculateAge";

import { ServerAvatar } from "@/app/components/ServerAvatar";

// Reusable HorizontalProgress component
const HorizontalProgress = ({ progress }: { progress: number }) => {
    return (
        <div style={{
            width: "100%",
            height: "4px",
            backgroundColor: "#e0e0e0",
            borderRadius: "2px",
            overflow: "hidden",
            marginTop: "0.5rem"
        }}>
            <div style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "var(--color-primary)",
                borderRadius: "2px",
                transition: "width 0.1s linear"
            }} />
        </div>
    );
};

// Simple confetti component
const Confetti = () => {
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#1dd1a1'];
    const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360
    }));

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 9999
        }}>
            {confettiPieces.map((piece) => (
                <div
                    key={piece.id}
                    style={{
                        position: 'absolute',
                        left: `${piece.left}%`,
                        top: '-20px',
                        width: `${piece.size}px`,
                        height: `${piece.size}px`,
                        backgroundColor: piece.color,
                        borderRadius: piece.id % 3 === 0 ? '50%' : '2px',
                        transform: `rotate(${piece.rotation}deg)`,
                        animation: `confetti-fall ${piece.duration}s ease-in forwards`,
                        animationDelay: `${piece.delay}s`,
                        opacity: 0
                    }}
                />
            ))}
            <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            top: -20px;
            transform: translateX(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            top: 100vh;
            transform: translateX(${Math.random() > 0.5 ? '' : '-'}100px) rotate(720deg);
          }
        }
      `}</style>
        </div>
    );
};

// Avatar uploader
// Avatar uploader
const AvatarUploader = ({
    currentAvatarUrl,
    onUploadComplete,
    size = "10rem",
    ageGroup,
}: {
    currentAvatarUrl?: string;
    onUploadComplete: (storageId: Id<"_storage">) => void;
    size?: string;
    ageGroup?: string;
}) => {
    const { t } = useLanguage();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
    const uploadOptimizedImage = useAction(api.imageOptimizer.uploadOptimizedImage);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        dialogRef.current?.close();

        const previewUrl = URL.createObjectURL(file);
        setLocalPreviewUrl(previewUrl);
        setIsUploading(true);
        setUploadProgress(10);

        const uploadInBackground = async () => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const progressInterval = setInterval(() => {
                    setUploadProgress(prev => Math.min(prev + 5, 90));
                }, 200);

                const newStorageId = await uploadOptimizedImage({ imageData: arrayBuffer });

                clearInterval(progressInterval);
                setUploadProgress(100);

                onUploadComplete(newStorageId as Id<"_storage">);
                toast.success(t("childInfo.messages.photoUploadSuccess"));

                setTimeout(() => {
                    setIsUploading(false);
                    setUploadProgress(0);
                }, 500);
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error(t("childInfo.messages.photoUploadError"));
                URL.revokeObjectURL(previewUrl);
                setLocalPreviewUrl(null);
                setIsUploading(false);
                setUploadProgress(0);
            }
        };

        uploadInBackground();
    };

    const displayUrl = localPreviewUrl || currentAvatarUrl;
    const hasRealImage = !!currentAvatarUrl && currentAvatarUrl !== "/profile.png";

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
                <ServerAvatar
                    src={displayUrl}
                    alt="Avatar"
                    style={{
                        width: size,
                        height: size,
                        borderRadius: "50%",
                        opacity: isUploading ? 0.7 : 1,
                        transition: "opacity 0.2s"
                    }}
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                    disabled={isUploading}
                />
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                    disabled={isUploading}
                />

                {!isUploading && (
                    <button
                        type="button"
                        onClick={() => dialogRef.current?.showModal()}
                        className={ageGroup || ""}
                        style={{
                            position: "absolute",
                            bottom: "0",
                            right: "-0.5rem",
                            width: "2.5rem",
                            height: "2.5rem",
                            borderRadius: "100vw",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            padding: 0,
                            border: "none",
                            backgroundColor: "var(--white, white)",
                            color: "var(--foreground)"
                        }}
                    >
                        {hasRealImage ? <RecycleIcon /> : <PlusIcon />}
                    </button>
                )}
            </div>

            {isUploading && (
                <div style={{ width: "100%", maxWidth: size }}>
                    <HorizontalProgress progress={uploadProgress} />
                </div>
            )}

            <dialog ref={dialogRef} style={{ borderRadius: "1rem", padding: "1.5rem" }}>
                <h3 style={{ margin: "0 0 1rem 0", textAlign: "center" }}>{t("childInfo.choosePhoto")}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", justifyContent: "center" }}>
                    <button
                        type="button"
                        className="secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadIcon />
                        <span>{t("childInfo.file")}</span>
                    </button>
                    <button
                        type="button"
                        className="secondary"
                        onClick={() => cameraInputRef.current?.click()}
                    >
                        <CameraIcon />
                        <span>{t("childInfo.camera")}</span>
                    </button>
                </div>
                <button
                    type="button"
                    onClick={() => dialogRef.current?.close()}
                    className="secondary"
                    style={{
                        position: "absolute",
                        top: "0.5rem",
                        right: "0.5rem",
                        cursor: "pointer",
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "50%",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        border: "none",
                        boxShadow: "none"
                    }}
                >
                    <CloseIcon />
                </button>
            </dialog>
        </div >
    );
};

type TTab = "details" | "guardian" | "attendance" | "payments";

export default function ChildInfo() {
    const { childId } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialTab = (searchParams.get("tab") as TTab) || "details";
    const initialDate = searchParams.get("date") || todayInEth.toString();

    const [activeTab, setActiveTab] = useState<TTab>(initialTab);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const payCreditDialogRef = useRef<HTMLDialogElement>(null);
    const [creditPayAmount, setCreditPayAmount] = useState<number>(0);

    const { t, language } = useLanguage();
    const { formatAge } = useAge();

    const child = useQuery(api.children.getChild, {
        id: childId as Id<"children">,
    });

    const updateChildAvatar = useMutation(api.children.updateChildAvatar);
    const updateGuardianAvatar = useMutation(api.guardians.updateGuardianAvatar);
    const reactivateChild = useMutation(api.children.reactivateChild);
    const payCreditBalance = useMutation(api.payments.payCreditBalance);
    const childPayments = useQuery(api.payments.getPayments, {
        childId: childId as Id<"children">,
    });

    const isBirthday = child ? calculateAge(parseDate(child.dateOfBirth))?.isBirthday : false;

    useEffect(() => {
        if (isBirthday) {
            setShowConfetti(true);
            const timeout = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timeout);
        }
    }, [isBirthday]);

    if (!child) return null;

    const birthDate = parseDate(child.dateOfBirth);
    const ageResult = calculateAge(birthDate);
    const ageFormatted = formatAge(ageResult, true);

    const ageGroupIcons: Record<string, JSX.Element> = {
        infant: <InfantIcon />,
        toddler: <ToddlerIcon />,
        preschooler: <PreschoolerIcon />,
        deactivated: <DeactivatedChildIcon />,
    };

    const handleChildAvatarUpload = async (storageId: Id<"_storage">) => {
        await updateChildAvatar({ childId: child._id, avatarStorageId: storageId });
    };

    const handleGuardianAvatarUpload = async (storageId: Id<"_storage">) => {
        if (child.primaryGuardian) {
            await updateGuardianAvatar({ guardianId: child.primaryGuardian._id, avatarStorageId: storageId });
        }
    };

    const tabs: { id: TTab; label: string }[] = [
        { id: "details", label: t("childInfo.tabs.details") },
        { id: "guardian", label: t("childInfo.tabs.guardian") },
        { id: "attendance", label: t("childInfo.tabs.attendance") },
        { id: "payments", label: language === "am" ? "ክፍያ" : "Payments" },
    ];

    const displayName = (language === "am" && child.fullNameAmh) ? child.fullNameAmh : child.fullName;
    const guardianDisplayName = (language === "am" && child.primaryGuardian?.fullNameAmh) ? child.primaryGuardian.fullNameAmh : child.primaryGuardian?.fullName;

    return (
        <>
            {showConfetti && <Confetti />}
            <GlassHeader
                title={t("childInfo.title")}
                backHref="/children"
                action={
                    <Link href={`/children/${child._id}/edit`} className="glass-pill">
                        <EditIcon />
                    </Link>
                }
            />

            <DeactivateChildModal
                childId={child._id}
                childName={displayName}
                isOpen={isDeactivateModalOpen}
                onClose={() => setIsDeactivateModalOpen(false)}
                onDeactivated={() => router.push("/children")}
            />

            {/* Pay Credit Dialog */}
            <dialog ref={payCreditDialogRef} style={{ borderRadius: "1rem", padding: "1.5rem", maxWidth: "400px", width: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <h3 style={{ margin: 0 }}>{language === "am" ? "ክሬዲት ይክፈሉ" : "Pay Credit"}</h3>
                        <button
                            type="button"
                            onClick={() => payCreditDialogRef.current?.close()}
                            className="secondary"
                            style={{
                                cursor: "pointer",
                                width: "2rem",
                                height: "2rem",
                                borderRadius: "50%",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "transparent",
                                border: "none",
                                boxShadow: "none"
                            }}
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.8 }}>
                        {language === "am" ? `ጠቅላላ ክሬዲት: ${child.creditBalance?.toLocaleString()} ETB` : `Total Credit: ${child.creditBalance?.toLocaleString()} ETB`}
                    </p>

                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            if (creditPayAmount <= 0 || creditPayAmount > (child.creditBalance || 0)) {
                                toast.error(language === "am" ? "ትክክለኛ ያልሆነ መጠን" : "Invalid amount");
                                return;
                            }

                            payCreditDialogRef.current?.close();
                            const promise = payCreditBalance({ childId: child._id, amount: creditPayAmount });
                            toast.promise(promise, {
                                loading: language === "am" ? "እየከፈለ..." : "Processing...",
                                success: language === "am" ? "ክሬዲት ተከፍሏል!" : "Credit paid!",
                                error: language === "am" ? "ስህተት ተፈጥሯል" : "Failed to pay credit",
                            });
                        }}
                        style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label className="label-text">{language === "am" ? "የሚከፈለው መጠን (ETB)" : "Amount to Pay (ETB)"}</label>
                            <input
                                type="number"
                                required
                                min="1"
                                max={child.creditBalance || 0}
                                value={creditPayAmount || ""}
                                onChange={(e) => setCreditPayAmount(Number(e.target.value))}
                                className="input-field"
                            />
                        </div>
                        <button type="submit" className="primary" style={{ width: "100%" }}>
                            {language === "am" ? "ይክፈሉ" : "Pay"}
                        </button>
                    </form>
                </div>
            </dialog>

            <main style={{ width: "100%", maxWidth: "600px", marginInline: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
                    {/* Tabs */}
                    <div style={{ display: "flex", width: "100%", overflowX: "auto" }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                disabled={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="tabs secondary"
                                style={{ flex: 1, whiteSpace: "nowrap" }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === "details" && (
                        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {/* Profile Card */}
                            <div className="neo-box">
                                <div style={{ position: "relative", display: "inline-block" }}>
                                    <AvatarUploader
                                        currentAvatarUrl={child.avatar}
                                        onUploadComplete={handleChildAvatarUpload}
                                        size="10rem"
                                        ageGroup={child.isActive ? child.ageGroup : "deactivated"}
                                    />
                                    {isBirthday && (
                                        <span style={{
                                            position: "absolute",
                                            top: "-10px",
                                            left: "-5px",
                                            fontSize: "2.5rem",
                                            transform: "rotate(-20deg)",
                                            filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.3))"
                                        }}>
                                            🥳
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                                    <h3 style={{ margin: 0 }}>{displayName}</h3>
                                    <div
                                        className={`tabs secondary ${child.isActive ? child.ageGroup : "deactivated"}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            borderRadius: "16px",
                                            padding: "0.5rem 1rem",
                                            width: "fit-content"
                                        }}
                                    >
                                        {child.isActive ? ageGroupIcons[child.ageGroup] : <DeactivatedChildIcon />}
                                        <span style={{ textTransform: "capitalize" }}>
                                            {child.isActive ? child.ageGroup : t("childInfo.labels.inactive")}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", opacity: 0.7 }}>
                                    {isBirthday ? (
                                        <span style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--color-primary)" }}>
                                            🎉 {t("childInfo.labels.happyBirthday")} 🎉
                                        </span>
                                    ) : (
                                        ageFormatted && <span style={{ fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: ageFormatted }} />
                                    )}
                                </div>
                            </div>

                            {/* Info Card */}
                            <div className="neo-box" style={{ alignItems: "start", gap: "0.75rem" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", width: "100%" }}>
                                    <div>
                                        <span className="label-text" style={{ fontSize: "0.80rem" }}>{language === "am" ? "የተመዘገበበት ቀን" : "Registration Date"}</span>
                                        <p style={{ margin: "0.25rem 0 0", fontWeight: 500 }}>
                                            {child.startDate || gregorianToEthDateString(new Date(child._creationTime).toISOString().split("T")[0])}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="label-text" style={{ fontSize: "0.80rem" }}>{language === "am" ? "የልደት ቀን" : "Birthdate"}</span>
                                        <p style={{ margin: "0.25rem 0 0", fontWeight: 500 }}>{gregorianToEthDateString(child.dateOfBirth)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className="neo-box" style={{ alignItems: "start", gap: "1rem" }}>
                                <h3 className="text-primary" style={{ margin: 0, fontSize: "1.1rem" }}>{t("childInfo.status")}</h3>
                                {child.isActive ? (
                                    <button
                                        onClick={() => setIsDeactivateModalOpen(true)}
                                        className="secondary"
                                        style={{
                                            width: "100%",
                                            borderColor: "var(--color-primary)",
                                            color: "var(--color-primary)",
                                            opacity: 0.8
                                        }}
                                    >
                                        {t("childInfo.deactivateChild")}
                                    </button>
                                ) : (
                                    <button
                                        onClick={async () => {
                                            const promise = reactivateChild({ childId: child._id });
                                            toast.promise(promise, {
                                                loading: t("childInfo.messages.reactivating"),
                                                success: t("childInfo.messages.reactivateSuccess"),
                                                error: t("childInfo.messages.reactivateError"),
                                            });
                                            await promise;
                                        }}
                                        className="secondary"
                                        style={{
                                            width: "100%",
                                            borderColor: "var(--color-success)",
                                            color: "var(--color-success)",
                                            opacity: 0.8
                                        }}
                                    >
                                        {t("childInfo.reactivateChild")}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "guardian" && child.primaryGuardian && (
                        <div className="neo-box animate-fade-in">
                            <h4 style={{ textAlign: "center", margin: 0 }}>{t("childInfo.primaryGuardian")}</h4>
                            <AvatarUploader
                                currentAvatarUrl={child.primaryGuardian.avatar}
                                onUploadComplete={handleGuardianAvatarUpload}
                                size="6rem"
                            />
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                                <h4 style={{ margin: 0, fontSize: "1.1rem" }}>{guardianDisplayName}</h4>
                                <span style={{ opacity: 0.7, textTransform: "capitalize" }}>
                                    {child.primaryGuardian.relationToChild}
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.7 }}>
                                <span>📍</span>
                                <span>{child.primaryGuardian.address}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "center", gap: "3rem" }}>
                                <a
                                    href={`tel:${child.primaryGuardian.phoneNumber}`}
                                    className="glass-pill"
                                    style={{
                                        color: "var(--color-success)",
                                        aspectRatio: "1/1",
                                        padding: 0,
                                        width: "3rem",
                                        height: "3rem"
                                    }}
                                >
                                    <CallIcon />
                                </a>
                                <a
                                    href={`sms:${child.primaryGuardian.phoneNumber}`}
                                    className="glass-pill"
                                    style={{
                                        color: "var(--color-accent)",
                                        aspectRatio: "1/1",
                                        padding: 0,
                                        width: "3rem",
                                        height: "3rem"
                                    }}
                                >
                                    <MessageIcon />
                                </a>
                            </div>
                        </div>
                    )}

                    {activeTab === "attendance" && (
                        <div className="animate-fade-in">
                            <ChildAttendanceGrid
                                childId={child._id}
                                initialDate={initialDate}
                            />
                        </div>
                    )}

                    {activeTab === "payments" && (
                        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {/* Credit Balance Card */}
                            <div className="neo-box" style={{ alignItems: "center", gap: "0.5rem" }}>
                                <span className="label-text" style={{ fontSize: "0.85rem" }}>
                                    {language === "am" ? "ክሬዲት" : "Credit"}
                                </span>
                                <h2 style={{ margin: 0, color: (child.creditBalance ?? 0) > 0 ? "var(--color-error)" : "var(--color-success)" }}>
                                    {(child.creditBalance ?? 0).toLocaleString()} <span style={{ fontSize: "0.9rem", fontWeight: "normal" }}>ETB</span>
                                </h2>
                                {(child.creditBalance ?? 0) > 0 && (
                                    <>
                                        <p style={{ margin: 0, opacity: 0.7, fontSize: "0.8rem", textAlign: "center" }}>
                                            {language === "am" ? "ይህ ክሬዲት በቀጣይ ክፍያ ላይ ይጨመራል" : "This credit will be added to the next payment"}
                                        </p>
                                        <button
                                            className="primary"
                                            style={{ marginTop: "0.5rem", width: "100%" }}
                                            onClick={() => {
                                                setCreditPayAmount(child.creditBalance || 0);
                                                payCreditDialogRef.current?.showModal();
                                            }}
                                        >
                                            {language === "am" ? "ክሬዲት ይክፈሉ" : "Pay Credit"}
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Payment Info */}
                            <div className="neo-box" style={{ alignItems: "start", gap: "0.75rem" }}>
                                <h4 style={{ margin: 0 }}>{language === "am" ? "የክፍያ መረጃ" : "Payment Info"}</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", width: "100%" }}>
                                    <div>
                                        <span className="label-text" style={{ fontSize: "0.8rem" }}>{language === "am" ? "ወርሃዊ ክፍያ" : "Monthly Fee"}</span>
                                        <p style={{ margin: "0.25rem 0 0", fontWeight: 600 }}>
                                            {child.paymentAmount?.toLocaleString()} ETB
                                            {child.discount ? <small style={{ color: "var(--color-danger)", marginLeft: "4px" }}>-{child.discount.toLocaleString()}</small> : null}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="label-text" style={{ fontSize: "0.8rem" }}>{language === "am" ? "የክፍያ ቀን" : "Payment Day"}</span>
                                        <p style={{ margin: "0.25rem 0 0", fontWeight: 600 }}>{child.paymentDate ?? "--"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment History */}
                            <h4 style={{ margin: "0.5rem 0 0" }}>{language === "am" ? "የክፍያ ታሪክ" : "Payment History"}</h4>
                            {childPayments === undefined ? (
                                <p style={{ textAlign: "center", opacity: 0.6 }}>{t("common.loading")}</p>
                            ) : childPayments.length === 0 ? (
                                <div className="neo-box" style={{ textAlign: "center", padding: "2rem 1rem", opacity: 0.6 }}>
                                    <p>{language === "am" ? "ምንም ክፍያ የለም" : "No payments found"}</p>
                                </div>
                            ) : (
                                childPayments.map((payment) => {
                                    const jsDue = new Date(payment.dueDate);
                                    const jsToday = new Date(todayInGreg.toString());
                                    const diffDays = Math.ceil((jsDue.getTime() - jsToday.getTime()) / (1000 * 60 * 60 * 24));

                                    let statusLabel: string;
                                    let statusColor: string;
                                    if (payment.status === "paid") {
                                        statusLabel = language === "am" ? "የተከፈለ" : "Paid";
                                        statusColor = "var(--color-success)";
                                    } else if (diffDays < 0) {
                                        statusLabel = language === "am" ? "ያልተከፈለ" : "Unpaid";
                                        statusColor = "var(--color-error)";
                                    } else if (diffDays <= 5) {
                                        statusLabel = language === "am" ? "ወርሃዊ" : "Due";
                                        statusColor = "var(--color-accent)";
                                    } else {
                                        statusLabel = language === "am" ? "በቅርቡ" : "Upcoming";
                                        statusColor = "var(--color-primary)";
                                    }

                                    const pEthDate = toCalendar(parseDate(payment.dueDate), EthiopianCalendar);
                                    const ethDateStr = `${ethMonthNames[pEthDate.month - 1]} ${pEthDate.day}, ${pEthDate.year}`;

                                    return (
                                        <div key={payment._id} className="neo-box" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "1rem" }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: "1rem" }}>
                                                    {(payment.amount + (payment.childDiscount || 0)).toLocaleString()} ETB
                                                    {payment.childDiscount ? <small style={{ color: "var(--color-danger)", marginLeft: "4px", fontSize: "0.8rem" }}>-{payment.childDiscount.toLocaleString()}</small> : null}
                                                </p>
                                                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", opacity: 0.7 }}>{ethDateStr}</p>
                                            </div>
                                            <span style={{
                                                padding: "0.25rem 0.75rem",
                                                borderRadius: "100vw",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                background: statusColor,
                                                color: "white",
                                            }}>
                                                {statusLabel}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}


                </div>
            </main >
        </>
    );
}
