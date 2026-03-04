"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Country, Store, Category, Coupon } from "@/lib/types";
import { Search, ChevronDown, Store as StoreIconLucide, Folder, TicketPercent } from "lucide-react";

interface HeaderProps {
    countries: Country[];
    currentCountry?: Country;
    stores?: Store[];
    categories?: Category[];
    coupons?: Coupon[];
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

export default function Header({ countries, currentCountry, stores = [], categories = [], coupons = [] }: HeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const switchCountry = (code: string) => {
        // Save preference to disable auto-detect for 30 days
        document.cookie = `country_preference=${code}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

        const parts = pathname.split("/");
        // pathname usually /sa/something... parts=["", "sa", "something"]
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
            const countryCode = currentCountry?.code || "sa";
            router.push(`/${countryCode}/coupons?q=${encodeURIComponent(query)}`);
            setSearchQuery("");
            setShowSuggestions(false);
        }
    };

    const [showSuggestions, setShowSuggestions] = useState(false);

    // Smart Multi-Entity Fuzzy Search
    const suggestedItems = React.useMemo(() => {
        if (!searchQuery.trim()) return [];

        // Split query into individual words (e.g. "كود خصم نون" -> ["كود", "خصم", "نون"])
        const queryWords = searchQuery.trim().toLowerCase().split(/\s+/);
        const countryCode = currentCountry?.code || "sa";

        const results: SearchResultItem[] = [];

        // 1. Search Stores
        stores.forEach(store => {
            // Create a rich searchable string map for the store (safely accessing nameEn if it exists)
            const searchIndex = `متجر موقع كود خصم كوبون ${store.name} ${(store as any).nameEn || ''} ${store.slug}`.toLowerCase();

            // fuzzy match: ALL query words must exist SOMEWHERE in the searchIndex
            const isMatch = queryWords.every(word => searchIndex.includes(word));
            if (isMatch) {
                results.push({
                    id: `store-${store.id}`,
                    type: 'store',
                    title: store.name,
                    url: `/${countryCode}/${store.slug}`,
                    imageUrl: store.logoUrl,
                    score: 3 // highest priority
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
                    title: category.name,
                    url: `/${countryCode}/categories/${category.slug}`,
                    score: 2
                });
            }
        });

        // 3. Search Coupons
        coupons.forEach(coupon => {
            const storeName = stores.find(s => s.id === coupon.storeId)?.name || '';
            const searchIndex = `كوبون كود عرض خصم ${coupon.title} ${storeName} ${coupon.code}`.toLowerCase();
            const isMatch = queryWords.every(word => searchIndex.includes(word));
            if (isMatch) {
                results.push({
                    id: `coup-${coupon.id}`,
                    type: 'coupon',
                    title: coupon.title,
                    subtitle: storeName ? `كوبون يعرّض في ${storeName}` : undefined,
                    url: `/${countryCode}/coupons?q=${encodeURIComponent(coupon.title)}`,
                    score: 1
                });
            }
        });

        // Sort by priority (Stores first, then categories, then coupons) and take top 10
        return results.sort((a, b) => b.score - a.score).slice(0, 10);
    }, [searchQuery, stores, categories, coupons, currentCountry]);

    // Handle outside clicks
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(".search-container")) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="hidden lg:block bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-24 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href={`/${currentCountry?.code || ""}`} className="flex items-center gap-2 shrink-0" aria-label="الرئيسية">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-xl">ركن</div>
                    <span className="text-lg md:text-xl font-bold text-gray-800">الكوبونات</span>
                </Link>

                {/* Search */}
                <div className="hidden md:flex flex-1 mx-8 max-w-xl search-container relative z-50">
                    <form onSubmit={onSearch} className="relative w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="ابحث عن متجر أو ماركة... (مثل نون، أمازون)"
                            className="w-full bg-white border-2 border-gray-200 rounded-full py-3 px-5 pr-14 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all text-right text-gray-800 placeholder-gray-400 min-h-[48px]"
                            dir="rtl"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1 bottom-1 w-11 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded-full"
                            aria-label="بحث"
                        >
                            <Search className="w-5 h-5" aria-hidden="true" />
                        </button>
                    </form>

                    {/* Auto-Suggestions Dropdown */}
                    {showSuggestions && searchQuery.trim().length > 0 && (
                        <div className="absolute top-[56px] left-0 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-right animate-in fade-in slide-in-from-top-2 duration-200">
                            {suggestedItems.length > 0 ? (
                                <div className="max-h-80 overflow-y-auto">
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                                        <StoreIconLucide className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs font-bold text-gray-500">نتائج بحث ذكية</span>
                                    </div>
                                    {suggestedItems.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setShowSuggestions(false);
                                                setSearchQuery("");
                                                router.push(item.url);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 text-right"
                                        >
                                            {/* Icon / Image based on type */}
                                            {item.type === 'store' && item.imageUrl ? (
                                                <div className="w-10 h-10 rounded-full border border-gray-100 bg-white p-1 shrink-0 flex items-center justify-center shadow-sm">
                                                    <img
                                                        src={item.imageUrl.trim()}
                                                        alt={item.title}
                                                        className="w-full h-full object-contain rounded-full"
                                                    />
                                                </div>
                                            ) : item.type === 'category' ? (
                                                <div className="w-10 h-10 rounded-full border border-gray-100 bg-blue-50 text-blue-500 shrink-0 flex items-center justify-center shadow-sm">
                                                    <Folder className="w-5 h-5" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full border border-gray-100 bg-orange-50 text-orange-500 shrink-0 flex items-center justify-center shadow-sm">
                                                    <TicketPercent className="w-5 h-5" />
                                                </div>
                                            )}

                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 line-clamp-1">{item.title}</span>
                                                {item.subtitle && (
                                                    <span className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.subtitle}</span>
                                                )}
                                                <span className="text-[10px] text-gray-400 mt-1 px-1.5 py-0.5 bg-gray-100 rounded-md w-fit">
                                                    {item.type === 'store' ? 'متجر' : item.type === 'category' ? 'قسم' : 'عرض / كوبون'}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    لم نجد نتائج تطابق بحثك بدقة... اضغط "بحث" لرؤية جميع النتائج.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {/* Country Switcher */}
                    <div className="relative group" onMouseLeave={() => setIsCountryOpen(false)}>
                        <button
                            onClick={() => setIsCountryOpen(!isCountryOpen)}
                            className="flex items-center justify-between gap-2 bg-white hover:bg-gray-100 px-4 rounded-full border-2 border-gray-200 transition-colors min-h-[48px] min-w-[120px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            aria-expanded={isCountryOpen}
                            aria-label="اختر الدولة"
                        >
                            {currentCountry ? (
                                <>
                                    <img
                                        src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/1x1/${currentCountry.code}.svg`}
                                        className="w-6 h-6 object-cover rounded-full shadow-sm border border-gray-100"
                                        alt={`علم ${currentCountry.name}`}
                                    />
                                    <span className="text-sm font-bold text-gray-800">{currentCountry.name}</span>
                                </>
                            ) : (
                                <span className="font-bold text-sm">اختر الدولة</span>
                            )}
                            <ChevronDown className="w-4 h-4 text-gray-500 transition-transform group-hover:rotate-180" />
                        </button>

                        {/* Mobile Backdrop for closing */}
                        {isCountryOpen && (
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsCountryOpen(false)}
                            />
                        )}

                        {/* Dropdown */}
                        <div className={`absolute top-full right-0 w-48 pt-2 ${isCountryOpen ? 'block' : 'hidden md:group-hover:block'} animate-in fade-in slide-in-from-top-1 duration-200 z-50`}>
                            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                                {Array.from(new Map(countries.map(c => [c.code, c])).values()).map((country, idx) => (
                                    <button
                                        key={`${country.code}-${idx}`}
                                        onClick={() => {
                                            setIsCountryOpen(false);
                                            switchCountry(country.code);
                                        }}
                                        className="w-full text-right px-4 hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0 min-h-[48px] focus-visible:outline-inset focus-visible:bg-blue-50"
                                        aria-label={`تغيير الدولة إلى ${country.name}`}
                                    >
                                        <img
                                            src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/1x1/${country.code}.svg`}
                                            className="w-5 h-5 object-cover rounded-full shadow-sm border border-gray-100"
                                            alt={`علم ${country.name}`}
                                        />
                                        <span className="text-gray-700 font-medium">{country.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
