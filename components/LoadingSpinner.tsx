import { SpinnerIcon } from "./Icons";

export default function LoadingSpinner({ size = "1.5rem", className = "" }: { size?: string, className?: string }) {
    return (
        <div className={`animate-spin text-primary ${className}`} style={{ height: size, width: size }}>
            <SpinnerIcon />
        </div>
    );
}
