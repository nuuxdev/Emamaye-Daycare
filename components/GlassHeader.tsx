import Link from "next/link";
import { ReactNode } from "react";
// @ts-ignore
import { ViewTransition } from "react";
import { ArrowLeft } from "./Icons";

type GlassHeaderProps = {
    title: string;
    backHref?: string;
    onBack?: () => void;
    leftAction?: ReactNode;
    action?: ReactNode;
    isCompact?: boolean;
    icon?: ReactNode;
    transitionName?: string;
};

export default function GlassHeader({ title, backHref, action, isCompact, onBack, leftAction, icon, transitionName }: GlassHeaderProps) {
    return (
        <header className="glass-header-wrapper">
            {leftAction ? (
                leftAction
            ) : onBack ? (
                <div onClick={onBack} className="glass-pill" style={{ cursor: "pointer" }}>
                    <ArrowLeft />
                </div>
            ) : backHref ? (
                <Link href={backHref} className="glass-pill">
                    <ArrowLeft />
                </Link>
            ) : (
                <div style={{ width: "48px" }}></div>
            )}

            {transitionName ? (
                <ViewTransition name={transitionName}>
                    <h4 className="glass-pill title" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {icon}
                        {isCompact ? title.charAt(0) : title}
                    </h4>
                </ViewTransition>
            ) : (
                <h4 className="glass-pill title" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {icon}
                    {isCompact ? title.charAt(0) : title}
                </h4>
            )}

            {action ? (
                action
            ) : (
                <div style={{ width: "48px" }}></div>
            )}
        </header>
    );
}
