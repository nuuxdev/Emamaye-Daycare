import Link from "next/link";
import { ReactNode } from "react";

type GlassHeaderProps = {
    title: string;
    backHref?: string;
    action?: ReactNode;
};

export default function GlassHeader({ title, backHref, action }: GlassHeaderProps) {
    return (
        <header className="glass-header-wrapper">
            {backHref ? (
                <Link href={backHref} className="glass-pill">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </Link>
            ) : (
                <div style={{ width: "48px" }}></div>
            )}

            <h4 className="glass-pill title">
                {title}
            </h4>

            {action ? (
                <div className="glass-pill">{action}</div>
            ) : (
                <div style={{ width: "48px" }}></div>
            )}
        </header>
    );
}
