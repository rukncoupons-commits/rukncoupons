"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Country, Store } from "@/lib/types";
import MobileDrawer from "./MobileDrawer";

interface MobileHeaderProps {
    countries: Country[];
    currentCountry?: Country;
    stores?: Store[];
}

export default function MobileHeader({ countries, currentCountry, stores = [] }: MobileHeaderProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const countryCode = currentCountry?.code || "sa";

    // Auto-focus search when opened
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    const switchCountry = (code: string) => {
        document.cookie = `country_preference=${code}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        const parts = pathname.split("/");
        if (parts.length >= 2) {
            parts[1] = code;
            const newPath = parts.join("/") || "/";
            router.push(`${newPath}${searchParams.toString() ? "?" + searchParams.toString() : ""}`);
        } else {
            router.push(`/${code}`);
        }
    };

    const onSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        const query = searchQuery.trim().toLowerCase();
        if (query) {
            router.push(`/${countryCode}/coupons?q=${encodeURIComponent(query)}`);
            setSearchQuery("");
            setSearchOpen(false);
        }
    };

    return (
        <>
            <header className="mobile-header" role="banner">
                {/* Top bar */}
                <div className="mobile-header__bar">
                    {/* Hamburger */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="mobile-header__icon-btn"
                        aria-label="فتح القائمة"
                        aria-expanded={drawerOpen}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    {/* Centered Logo */}
                    <Link
                        href={`/${countryCode}`}
                        className="mobile-header__logo"
                        aria-label="الرئيسية"
                    >
                        <div style={{
                            background: "#2563eb",
                            color: "#fff",
                            padding: "3px 7px",
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 15,
                        }}>ركن</div>
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#1f2937" }}>الكوبونات</span>
                    </Link>

                    {/* Search toggle */}
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="mobile-header__icon-btn"
                        aria-label={searchOpen ? "إغلاق البحث" : "فتح البحث"}
                    >
                        {searchOpen ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Slide-down search bar */}
                <div className={`mobile-header__search ${searchOpen ? "mobile-header__search--open" : ""}`}>
                    <form onSubmit={onSearch} style={{ display: "flex", gap: 8, padding: "0 16px 12px" }}>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث عن متجر أو كوبون..."
                            dir="rtl"
                            style={{
                                flex: 1,
                                padding: "10px 14px",
                                borderRadius: 10,
                                border: "2px solid #e5e7eb",
                                fontSize: 14,
                                outline: "none",
                                textAlign: "right",
                                background: "#f9fafb",
                                minHeight: 44,
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                background: "#2563eb",
                                color: "#fff",
                                border: "none",
                                borderRadius: 10,
                                padding: "0 16px",
                                fontWeight: 600,
                                fontSize: 14,
                                cursor: "pointer",
                                minHeight: 44,
                                minWidth: 44,
                            }}
                            aria-label="بحث"
                        >
                            بحث
                        </button>
                    </form>
                </div>
            </header>

            {/* Drawer */}
            <MobileDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                countries={countries}
                currentCountry={currentCountry}
                stores={stores}
                onSwitchCountry={switchCountry}
            />
        </>
    );
}
