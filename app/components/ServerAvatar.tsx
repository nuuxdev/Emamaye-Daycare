import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export const ServerAvatar = ({
    storageId,
    className = "avatar-img",
    alt = "Avatar"
}: {
    storageId?: Id<"_storage">;
    className?: string;
    alt?: string;
}) => {
    const imageUrl = useQuery(api.images.getImageUrl, storageId ? { storageId } : "skip");

    if (!storageId) {
        return <img src="/profile.png" alt={alt} className={className} />;
    }

    if (imageUrl === undefined) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
                <div className="spinner" style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid #e0e0e0',
                    borderTop: '3px solid var(--primary-color)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return <img src={imageUrl || "/profile.png"} alt={alt} className={className} />;
};
