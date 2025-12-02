"use client";
import { useState, useEffect } from "react";

type SearchPillProps = {
    onSearch: (query: string) => void;
    onExpandChange?: (isExpanded: boolean) => void;
    debounceMs?: number;
};

export default function SearchPill({ onSearch, onExpandChange, debounceMs = 300 }: SearchPillProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Debounce logic
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchQuery);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchQuery, debounceMs, onSearch]);

    const toggleExpand = () => {
        const newExpandedState = !isExpanded;
        setIsExpanded(newExpandedState);
        onExpandChange?.(newExpandedState);
        if (isExpanded) {
            // Clear search when collapsing
            setSearchQuery("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleExpand();
        }
    };

    return (
        <div className={`glass-pill search ${isExpanded ? "grow" : ""}`}>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search children..."
                style={{
                    cursor: isExpanded ? "text" : "pointer",
                    pointerEvents: isExpanded ? "auto" : "none"
                }}
            />
            <div
                role="button"
                tabIndex={0}
                onClick={toggleExpand}
                onKeyDown={handleKeyDown}
                style={{ cursor: "pointer" }}
                aria-label={isExpanded ? "Close search" : "Open search"}
            >
                {
                    isExpanded ? (
                        <i className="hgi hgi-stroke hgi-multiplication-sign"></i>
                    ) : (
                        <i className="hgi hgi-stroke hgi-search-02"></i>
                    )
                }
            </div>
        </div>
    );
}
