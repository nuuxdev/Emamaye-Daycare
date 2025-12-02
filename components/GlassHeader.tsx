import Link from "next/link";
import { ReactNode } from "react";

type GlassHeaderProps = {
    title: string;
    backHref?: string;
    action?: ReactNode;
    isCompact?: boolean;
};

export default function GlassHeader({ title, backHref, action, isCompact }: GlassHeaderProps) {
    return (
        <header className="glass-header-wrapper">
            {backHref ? (
                <Link href={backHref} className="glass-pill">
                    <i className="hgi hgi-stroke hgi-arrow-left-01"></i>
                </Link>
            ) : (
                <div style={{ width: "48px" }}></div>
            )}

            <h4 className="glass-pill title">
                {isCompact ? title.charAt(0) : title}
            </h4>

            {action ? (
                action
            ) : (
                <div style={{ width: "48px" }}></div>
            )}
        </header>
    );
}
