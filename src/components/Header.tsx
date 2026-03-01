"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Country } from "@/lib/types";
import { Search, ChevronDown } from "lucide-react";

interface HeaderProps {
    countries: Country[];
    currentCountry?: Country;
}

export default function Header({ countries, currentCountry }: HeaderProps) {
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
            // Simplified search logic for now, similar to Angular
            // We don't have all stores here easily without passing them, 
            // but we can just redirect to the search page.
            router.push(`/${countryCode}/coupons?q=${encodeURIComponent(query)}`);
            setSearchQuery("");
        }
    };

    return (
        <header className="hidden lg:block bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-24 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href={`/${currentCountry?.code || ""}`} className="flex items-center gap-2 shrink-0" aria-label="الرئيسية">
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-xl">ركن</div>
                    <span className="text-lg md:text-xl font-bold text-gray-800">الكوبونات</span>
                </Link>

                {/* Search */}
                <div className="hidden md:flex flex-1 mx-8 max-w-xl">
                    <form onSubmit={onSearch} className="relative w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
