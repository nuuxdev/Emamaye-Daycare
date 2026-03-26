"use client";
import { useState, useEffect, useRef } from "react";
import { CloseIcon, SearchIcon } from "./Icons";

type SearchPillProps = {
    onSearch: (query: string) => void;
    initialValue?: string;
    onExpandChange?: (isExpanded: boolean) => void;
    debounceMs?: number;
    placeholder?: string;
};

export default function SearchPill({ onSearch, initialValue = "", onExpandChange, debounceMs = 300, placeholder = "Search..." }: SearchPillProps) {
    const [isExpanded, setIsExpanded] = useState(!!initialValue);
    const [searchQuery, setSearchQuery] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);
    const isFirstRender = useRef(true);

    // Debounce logic
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            // Don't trigger search on mount if it matches initialValue
            return;
        }
        const timer = setTimeout(() => {
            onSearch(searchQuery);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchQuery, debounceMs, onSearch]);

    // Sync with initialValue for external changes (back/forward)
    useEffect(() => {
        setSearchQuery(initialValue);
        if (initialValue) setIsExpanded(true);
    }, [initialValue]);

    const toggleExpand = () => {
        const newExpandedState = !isExpanded;
        setIsExpanded(newExpandedState);
        onExpandChange?.(newExpandedState);
        inputRef.current?.focus();
        if (isExpanded) {
            // Clear search when collapsing
            setSearchQuery("");
            inputRef.current?.blur();
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
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
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
                        <CloseIcon />
                    ) : (
                        <SearchIcon />
                    )
                }
            </div>
        </div>
    );
}
