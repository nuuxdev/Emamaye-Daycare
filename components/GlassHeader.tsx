import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeft } from "./Icons";

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
                    <ArrowLeft />
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
