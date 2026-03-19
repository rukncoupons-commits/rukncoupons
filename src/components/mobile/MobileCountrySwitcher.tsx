"use client";

import React, { useState, useEffect, useRef } from "react";
import { Country } from "@/lib/types";
import { getCountryName, Locale } from "@/lib/i18n";

interface MobileCountrySwitcherProps {
    countries: Country[];
    currentCountry?: Country;
    isOpen: boolean;
    onClose: () => void;
    onSelect: (code: string) => void;
    locale?: string;
}

export default function MobileCountrySwitcher({
    countries,
    currentCountry,
    isOpen,
    onClose,
    onSelect,
    locale = "ar"
}: MobileCountrySwitcherProps) {
    const [search, setSearch] = useState("");
    const sheetRef = useRef<HTMLDivElement>(null);

    // Deduplicate countries
    const uniqueCountries = Array.from(
        new Map(countries.map((c) => [c.code, c])).values()
    );

    const priorityOrder = ["sa", "ae", "eg"];
    const sortedCountries = [...uniqueCountries].sort((a, b) => {
        const aIdx = priorityOrder.indexOf(a.code);
        const bIdx = priorityOrder.indexOf(b.code);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return 0;
    });

    const filtered = search.trim()
        ? sortedCountries.filter((c) =>
            getCountryName(locale as Locale, c.code).toLowerCase().includes(search.trim().toLowerCase())
        )
        : sortedCountries;

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    // Reset search when opening
    useEffect(() => {
        if (isOpen) setSearch("");
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="mobile-country-switcher-overlay" onClick={onClose}>
            <div
                ref={sheetRef}
                className="mobile-country-sheet"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="اختيار الدولة"
            >
                {/* Handle bar */}
                <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
                    <div style={{
                        width: 40,
                        height: 4,
                        borderRadius: 2,
                        background: "#d1d5db",
                    }} />
                </div>

                {/* Header */}
                <div style={{ padding: "8px 20px 12px", borderBottom: "1px solid #f3f4f6" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", marginBottom: 10, textAlign: "right" }}>
                        اختر الدولة
                    </h3>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ابحث عن دولة..."
                        dir="rtl"
                        autoFocus
                        style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "2px solid #e5e7eb",
                            fontSize: 14,
                            outline: "none",
                            textAlign: "right",
                            background: "#f9fafb",
                        }}
                    />
                </div>

                {/* Grid */}
                <div style={{
                    padding: "12px 16px 24px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    maxHeight: "50vh",
                    overflowY: "auto",
                }}>
                    {filtered.map((country) => {
                        const isActive = currentCountry?.code === country.code;
                        return (
                            <button
                                key={country.code}
                                onClick={() => {
                                    onSelect(country.code);
                                    onClose();
                                }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "12px",
                                    borderRadius: 12,
                                    border: isActive ? "2px solid #2563eb" : "2px solid #f3f4f6",
                                    background: isActive ? "#eff6ff" : "#fff",
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                    minHeight: 48,
                                    direction: "rtl",
                                }}
                                aria-label={`اختر ${country.name}`}
                                aria-current={isActive ? "true" : undefined}
                            >
                                <img
                                    src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/1x1/${country.code}.svg`}
                                    alt={locale === "en" ? `Flag of ${getCountryName(locale as Locale, country.code)}` : `علم ${getCountryName(locale as Locale, country.code)}`}
                                    width={28}
                                    height={28}
                                    style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid #e5e7eb" }}
                                />
                                <span style={{
                                    fontSize: 14,
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? "#2563eb" : "#374151",
                                }}>
                                    {country.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
