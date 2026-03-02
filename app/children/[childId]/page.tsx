"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import GlassHeader from "@/components/GlassHeader";
import { JSX, useEffect, useState, useRef } from "react";
import { ArrowRight, CallIcon, CameraIcon, CloseIcon, DeactivatedChildIcon, EditIcon, InfantIcon, MessageIcon, PlusIcon, PreschoolerIcon, RecycleIcon, ToddlerIcon, UploadIcon, SettingsIcon } from "@/components/Icons";
import { formatEthiopianDate, todayInEth } from "@/utils/calendar";
import { parseDate } from "@internationalized/date";
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
                backgroundColor: "var(--primary-color)",
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

type TTab = "details" | "guardian" | "attendance";

export default function ChildInfo() {
    const { childId } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialTab = (searchParams.get("tab") as TTab) || "details";
    const initialDate = searchParams.get("date") || todayInEth.toString();

    const [activeTab, setActiveTab] = useState<TTab>(initialTab);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

    const { t, language } = useLanguage();
    const { formatAge } = useAge();

    const child = useQuery(api.children.getChild, {
        id: childId as Id<"children">,
    });

    const updateChildAvatar = useMutation(api.children.updateChildAvatar);
    const updateGuardianAvatar = useMutation(api.guardians.updateGuardianAvatar);
    const reactivateChild = useMutation(api.children.reactivateChild);

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
    const ageFormatted = formatAge(ageResult);

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
            <main style={{ width: "100%", maxWidth: "600px", marginInline: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
                    {/* Tabs */}
                    <div style={{ display: "flex", width: "100%", gap: "0" }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                disabled={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="tabs secondary"
                                style={{ flex: 1 }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === "details" && (
                        <div className="neo-box animate-fade-in">
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
                                    <span style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--primary-color)" }}>
                                        🎉 {t("childInfo.labels.happyBirthday")} 🎉
                                    </span>
                                ) : (
                                    ageFormatted && <span style={{ fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: ageFormatted }} />
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
                                        color: "var(--success-color)",
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
                                        color: "var(--info-color)",
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

                    {/* Status Card - Always visible below the main info */}
                    <div className="neo-box" style={{ alignItems: "start", gap: "1.5rem" }}>
                        <h3 className="text-primary" style={{ margin: 0, fontSize: "1.1rem" }}>{t("childInfo.status")}</h3>
                        {child.isActive ? (
                            <button
                                onClick={() => setIsDeactivateModalOpen(true)}
                                className="secondary"
                                style={{
                                    width: "100%",
                                    borderColor: "var(--primary-color)",
                                    color: "var(--primary-color)",
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
                                    borderColor: "var(--success-color)",
                                    color: "var(--success-color)",
                                    opacity: 0.8
                                }}
                            >
                                {t("childInfo.reactivateChild")}
                            </button>
                        )}
                    </div>
                </div>
            </main >
        </>
    );
}
