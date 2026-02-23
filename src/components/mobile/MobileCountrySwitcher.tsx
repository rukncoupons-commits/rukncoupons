"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Country } from "@/lib/types";
import { Search, X, Check } from "lucide-react";

interface MobileCountrySwitcherProps {
    isOpen: boolean;
    onClose: () => void;
    countries: Country[];
    currentCountry?: Country;
    onDrawerClose?: () => void;
}

export default function MobileCountrySwitcher({
    isOpen,
    onClose,
    countries,
    currentCountry,
    onDrawerClose,
}: MobileCountrySwitcherProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Prevent body scroll a second time in case Drawer logic is overridden
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            // Let the MobileHeader manage its own body lock, we just clean up ours
            if (!document.querySelector('[aria-label="القائمة الجانبية"][aria-expanded="true"]')) {
                document.body.style.overflow = "";
            }
        };
    }, [isOpen]);

    const filteredCountries = countries.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const switchCountry = (code: string) => {
        // Save preference to disable auto-detect for 30 days
        document.cookie = `country_preference=${code}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

        const parts = pathname.split("/");
        if (parts.length >= 2) {
            parts[1] = code;
            const newPath = parts.join("/") || "/";
            router.push(`${newPath}${searchParams.toString() ? "?" + searchParams.toString() : ""}`);
        } else {
            router.push(`/${code}`);
        }

        onClose();
        if (onDrawerClose) onDrawerClose();
    };

    return (
        <>
            {/* Modal Backdrop */}
            <div
                className={`fixed inset-0 z-[60] bg-gray-900/40 backdrop-blur-sm transition-opacity duration-250 lg:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Bottom Sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-[2rem] shadow-[-10px_-10px_30px_rgba(0,0,0,0.08)] flex flex-col transition-transform duration-300 ease-out lg:hidden max-h-[85vh] ${isOpen ? "translate-y-0" : "translate-y-full"
                    }`}
                dir="rtl"
                role="dialog"
                aria-modal="true"
                aria-label="اختر الدولة"
            >
                {/* Drag Handle & Header */}
                <div className="flex flex-col shrink-0 pt-3 pb-4 border-b border-gray-100 relative bg-white rounded-t-[2rem]">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

                    <div className="px-6 flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900">اختر الدولة</h2>
                        <button
                            onClick={onClose}
                            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
                            aria-label="إغلاق التحديد"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="px-6 mt-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ابحث عن دولتك..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-12 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-bold text-gray-900 placeholder-gray-400 transition-all min-h-[48px]"
                            />
                            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>

                {/* Country Grid - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-6 pb-safe-offset-8">
                    {filteredCountries.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 pb-8">
                            {filteredCountries.map((country) => {
                                const isActive = currentCountry?.code === country.code;
                                return (
                                    <button
                                        key={country.code}
                                        onClick={() => switchCountry(country.code)}
                                        className={`flex flex-col items-center text-center p-4 rounded-3xl border-2 transition-all active:scale-[0.96] min-h-[100px] justify-center gap-3 ${isActive
                                                ? "border-blue-500 bg-blue-50/50 shadow-md shadow-blue-500/10"
                                                : "border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50"
                                            }`}
                                        aria-pressed={isActive}
                                    >
                                        <div className="relative">
                                            <img
                                                src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/1x1/${country.code}.svg`}
                                                className={`w-10 h-10 object-cover rounded-full shadow-sm ${isActive ? "border-2 border-blue-500" : "border border-gray-200"}`}
                                                alt={`علم ${country.name}`}
                                                loading="lazy"
                                            />
                                            {isActive && (
                                                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-sm font-bold ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                                            {country.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-gray-400">
                            لا توجد نتائج مطابقة لبحثك
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
