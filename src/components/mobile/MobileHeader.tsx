"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Country, Store, Category, Coupon } from "@/lib/types";
import MobileDrawer from "./MobileDrawer";
import { Search, ChevronDown, Store as StoreIconLucide, Folder, TicketPercent } from "lucide-react";

interface MobileHeaderProps {
    countries: Country[];
    currentCountry?: Country;
    stores?: Store[];
    categories?: Category[];
    coupons?: Coupon[];
    locale?: string;
}

// Unified Search Result Type
type SearchResultItem = {
    id: string;
    type: 'store' | 'category' | 'coupon';
    title: string;
    url: string;
    imageUrl?: string;
    subtitle?: string;
    score: number;
};

export default function MobileHeader({ countries, currentCountry, stores = [], categories = [], coupons = [], locale = "ar" }: MobileHeaderProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const countryCode = currentCountry?.code || "sa";
    const isEn = locale === "en";

    const switchLocale = () => {
        const newLocale = isEn ? "ar" : "en";
        const parts = pathname.split("/");
        if (parts.length >= 2) {
            parts[1] = newLocale;
            window.location.href = parts.join("/");
        }
    };

    // Auto-focus search when opened
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    const switchCountry = (code: string) => {
        document.cookie = `country_preference=${code}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        const parts = pathname.split("/");
        if (parts.length >= 3) {
            parts[2] = code;
            const newPath = parts.join("/") || "/";
            router.push(`${newPath}${searchParams.toString() ? "?" + searchParams.toString() : ""}`);
        } else {
            router.push(`/${locale}/${code}`);
        }
    };

    const onSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        const query = searchQuery.trim().toLowerCase();
        if (query) {
            router.push(`/${locale}/${countryCode}/coupons?q=${encodeURIComponent(query)}`);
            setSearchQuery("");
            setSearchOpen(false);
        }
    };

    // Smart Multi-Entity Fuzzy Search
    const suggestedItems = React.useMemo(() => {
        if (!searchQuery.trim()) return [];

        const queryWords = searchQuery.trim().toLowerCase().split(/\s+/);
        const results: SearchResultItem[] = [];

        // 1. Search Stores
        stores.forEach(store => {
            const searchIndex = `متجر موقع كود خصم كوبون ${store.name} ${(store as any).nameEn || ''} ${store.slug}`.toLowerCase();
            const isMatch = queryWords.every(word => searchIndex.includes(word));
            if (isMatch) {
                results.push({
                    id: `store-${store.id}`,
                    type: 'store',
                    title: isEn && (store as any).nameEn ? (store as any).nameEn : store.name,
                    url: `/${locale}/${countryCode}/${store.slug}`,
                    imageUrl: store.logoUrl,
                    score: 3
                });
            }
        });

        // 2. Search Categories
        categories.forEach(category => {
            const searchIndex = `قسم تصنيف ${category.name} ${category.slug}`.toLowerCase();
            const isMatch = queryWords.every(word => searchIndex.includes(word));
            if (isMatch) {
                results.push({
                    id: `cat-${category.id}`,
                    type: 'category',
                    title: isEn && (category as any).nameEn ? (category as any).nameEn : category.name,
                    url: `/${locale}/${countryCode}/categories/${category.slug}`,
                    score: 2
                });
            }
        });

        // 3. Search Coupons
        coupons.forEach(coupon => {
            const storeNameRaw = stores.find(s => s.id === coupon.storeId);
            const storeNameBase = storeNameRaw?.name || '';
            const storeName = isEn && (storeNameRaw as any)?.nameEn ? (storeNameRaw as any).nameEn : storeNameBase;
            const searchIndex = `كوبون كود عرض خصم ${coupon.title} ${storeNameBase} ${coupon.code}`.toLowerCase();
            const isMatch = queryWords.every(word => searchIndex.includes(word));
            if (isMatch) {
                results.push({
                    id: `coup-${coupon.id}`,
                    type: 'coupon',
                    title: coupon.title,
                    subtitle: storeName ? (isEn ? `Valid at ${storeName}` : `كوبون يعرّض في ${storeName}`) : undefined,
                    url: `/${locale}/${countryCode}/coupons?q=${encodeURIComponent(coupon.title)}`,
                    score: 1
                });
            }
        });

        return results.sort((a, b) => b.score - a.score).slice(0, 10);
    }, [searchQuery, stores, categories, coupons, countryCode]);

    return (
        <>
            <header className="mobile-header" role="banner">
                {/* Top bar */}
                <div className="mobile-header__bar">
                    {/* Hamburger */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="mobile-header__icon-btn"
                        aria-label={isEn ? "Open Menu" : "فتح القائمة"}
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
                        href={`/${locale}/${countryCode}`}
                        className="mobile-header__logo"
                        aria-label={isEn ? "Home" : "الرئيسية"}
                    >
                        <div style={{
                            background: "#2563eb",
                            color: "#fff",
                            padding: "3px 7px",
                            borderRadius: 6,
                            fontWeight: 700,
                            fontSize: 15,
                        }}>{isEn ? "Rukn" : "ركن"}</div>
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#1f2937" }}>{isEn ? "Coupons" : "الكوبونات"}</span>
                    </Link>

                    {/* Search toggle */}
                    <button
                        onClick={() => setSearchOpen(!searchOpen)}
                        className="mobile-header__icon-btn"
                        aria-label={isEn ? (searchOpen ? "Close Search" : "Open Search") : (searchOpen ? "إغلاق البحث" : "فتح البحث")}
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
                            placeholder={isEn ? "Search for a store or coupon..." : "ابحث عن متجر أو كوبون..."}
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
                            aria-label={isEn ? "Search" : "بحث"}
                        >
                            {isEn ? "Search" : "بحث"}
                        </button>
                    </form>

                    {/* Auto-Suggestions Dropdown for Mobile */}
                    {searchOpen && searchQuery.trim().length > 0 && (
                        <div style={{ backgroundColor: '#fff', borderTop: '1px solid #e5e7eb', maxHeight: '60vh', overflowY: 'auto' }}>
                            {suggestedItems.length > 0 ? (
                                <div>
                                    <div style={{ padding: '8px 16px', background: '#f9fafb', fontSize: '12px', fontWeight: 'bold', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6' }} dir={isEn ? "ltr" : "rtl"}>
                                        <StoreIconLucide size={14} />
                                        <span>{isEn ? "Smart Search Results" : "نتائج بحث ذكية"}</span>
                                    </div>
                                    {suggestedItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setSearchOpen(false);
                                                setSearchQuery("");
                                                router.push(item.url);
                                            }}
                                            style={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px 16px',
                                                borderBottom: '1px solid #f9fafb',
                                                background: 'none',
                                                borderLeft: 'none',
                                                borderRight: 'none',
                                                borderTop: 'none',
                                                cursor: 'pointer',
                                                textAlign: 'right'
                                            }}
                                        >
                                            {/* Icon / Image based on type */}
                                            {item.type === 'store' && item.imageUrl ? (
                                                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #f3f4f6', backgroundColor: '#fff', padding: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                    <img
                                                        src={item.imageUrl.trim()}
                                                        alt={item.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }}
                                                    />
                                                </div>
                                            ) : item.type === 'category' ? (
                                                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #eff6ff', backgroundColor: '#eff6ff', color: '#3b82f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                    <Folder size={20} />
                                                </div>
                                            ) : (
                                                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #fff7ed', backgroundColor: '#fff7ed', color: '#f97316', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                                    <TicketPercent size={20} />
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                                                <span style={{ fontWeight: 700, color: '#1f2937', fontSize: '14px', textAlign: 'right', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</span>
                                                {item.subtitle && (
                                                    <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', textAlign: 'right', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.subtitle}</span>
                                                )}
                                                <span style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', padding: '2px 6px', backgroundColor: '#f3f4f6', borderRadius: '4px', display: 'inline-block' }}>
                                                    {item.type === 'store' ? (isEn ? 'Store' : 'متجر') : item.type === 'category' ? (isEn ? 'Category' : 'قسم') : (isEn ? 'Deal / Coupon' : 'عرض / كوبون')}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                                    لم نجد نتائج تطابق بحثك بدقة... اضغط "بحث" لرؤية جميع النتائج.
                                </div>
                            )}
                        </div>
                    )}
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
                locale={locale}
            />
        </>
    );
}
