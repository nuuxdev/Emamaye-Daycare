import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useState, useEffect, CSSProperties } from "react";

export const ServerAvatar = ({
    storageId,
    src,
    className = "avatar-img",
    alt = "Avatar",
    style
}: {
    storageId?: Id<"_storage">;
    src?: string;
    className?: string;
    alt?: string;
    style?: CSSProperties;
}) => {
    const [error, setError] = useState(false);
    const imageUrl = useQuery(api.images.getImageUrl, storageId ? { storageId } : "skip");

    // Reset error if src or storageId changes
    useEffect(() => {
        setError(false);
    }, [src, storageId]);

    if (storageId && imageUrl === undefined && !error) {
        return (
            <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
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

    const finalSrc = error ? "/profile.png" : (src || imageUrl || "/profile.png");

    return (
        <img
            src={finalSrc}
            alt={alt}
            className={className}
            style={style}
            onError={() => setError(true)}
        />
    );
};
