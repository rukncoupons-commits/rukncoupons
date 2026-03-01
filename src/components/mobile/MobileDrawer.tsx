"use client";

import React, { useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { Country, Store } from "@/lib/types";
import MobileCountrySwitcher from "./MobileCountrySwitcher";

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    countries: Country[];
    currentCountry?: Country;
    stores?: Store[];
    onSwitchCountry: (code: string) => void;
}

export default function MobileDrawer({
    isOpen,
    onClose,
    countries,
    currentCountry,
    stores = [],
    onSwitchCountry,
}: MobileDrawerProps) {
    const [countrySheetOpen, setCountrySheetOpen] = useState(false);
    const countryCode = currentCountry?.code || "sa";

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("body-scroll-lock");
        } else {
            document.body.classList.remove("body-scroll-lock");
        }
        return () => document.body.classList.remove("body-scroll-lock");
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    const handleLinkClick = useCallback(() => {
        onClose();
    }, [onClose]);

    const topStores = stores.filter((s) => s.isActive !== false).slice(0, 6);

    const navLinks = [
        { label: "الرئيسية", href: `/${countryCode}` },
        { label: "المتاجر", href: `/${countryCode}/stores` },
        { label: "الكوبونات", href: `/${countryCode}/coupons` },
        { label: "المدونة", href: `/${countryCode}/blog` },
        { label: "عن الموقع", href: `/${countryCode}/about` },
        { label: "اتصل بنا", href: `/${countryCode}/contact` },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={`mobile-drawer-backdrop ${isOpen ? "mobile-drawer-backdrop--visible" : ""}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer panel */}
            <nav
                className={`mobile-drawer ${isOpen ? "mobile-drawer--open" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-label="القائمة الرئيسية"
            >
                {/* Drawer Header */}
                <div className="mobile-drawer__header">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                            background: "#2563eb",
                            color: "#fff",
                            padding: "4px 8px",
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 16,
                        }}>ركن</div>
                        <span style={{ fontWeight: 700, fontSize: 16, color: "#1f2937" }}>الكوبونات</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="mobile-drawer__close"
                        aria-label="إغلاق القائمة"
                    >
                        {/* X icon */}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Country Selector */}
                <div className="mobile-drawer__section">
                    <button
                        onClick={() => setCountrySheetOpen(true)}
                        className="mobile-drawer__country-btn"
                        aria-label="تغيير الدولة"
                    >
                        {currentCountry ? (
                            <>
                                <img
                                    src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/1x1/${currentCountry.code}.svg`}
                                    alt={`علم ${currentCountry.name}`}
                                    width={24}
                                    height={24}
                                    style={{ borderRadius: "50%", objectFit: "cover", border: "1px solid #e5e7eb" }}
                                />
                                <span style={{ fontWeight: 600, color: "#1f2937", fontSize: 14 }}>{currentCountry.name}</span>
                            </>
                        ) : (
                            <span style={{ fontWeight: 600, fontSize: 14 }}>اختر الدولة</span>
                        )}
                        {/* Chevron */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" style={{ marginRight: "auto" }}>
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

                {/* Nav Links */}
                <div className="mobile-drawer__section">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={handleLinkClick}
                            className="mobile-drawer__link"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Top Stores */}
                {topStores.length > 0 && (
                    <div className="mobile-drawer__section">
                        <h4 className="mobile-drawer__section-title">المتاجر الشائعة</h4>
                        <div className="mobile-drawer__stores-grid">
                            {topStores.map((store) => (
                                <Link
                                    key={store.id}
                                    href={`/${countryCode}/${store.slug}`}
                                    onClick={handleLinkClick}
                                    className="mobile-drawer__store-item"
                                >
                                    <img
                                        src={store.logoUrl}
                                        alt={store.name}
                                        width={36}
                                        height={36}
                                        style={{ borderRadius: 8, objectFit: "contain", background: "#f9fafb" }}
                                        loading="lazy"
                                    />
                                    <span style={{ fontSize: 12, fontWeight: 500, color: "#4b5563", textAlign: "center" }}>
                                        {store.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* CTA */}
                <div className="mobile-drawer__section" style={{ marginTop: "auto", paddingBottom: 24 }}>
                    <Link
                        href={`/${countryCode}/coupons`}
                        onClick={handleLinkClick}
                        className="mobile-drawer__cta"
                    >
                        🎁 تصفح أحدث الكوبونات
                    </Link>
                </div>
            </nav>

            {/* Country Bottom Sheet */}
            <MobileCountrySwitcher
                countries={countries}
                currentCountry={currentCountry}
                isOpen={countrySheetOpen}
                onClose={() => setCountrySheetOpen(false)}
                onSelect={(code) => {
                    onSwitchCountry(code);
                    setCountrySheetOpen(false);
                    onClose();
                }}
            />
        </>
    );
}
