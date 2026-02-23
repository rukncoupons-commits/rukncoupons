"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Country } from "@/lib/types";
import { X, ChevronLeft, Home, Store, Grid, Tag, FileText, ChevronDown } from "lucide-react";
import MobileCountrySwitcher from "./MobileCountrySwitcher";

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    countries: Country[];
    currentCountry?: Country;
}

export default function MobileDrawer({ isOpen, onClose, countries, currentCountry }: MobileDrawerProps) {
    const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
    const router = useRouter();

    const countryCode = currentCountry?.code || "sa";

    const mainLinks = [
        { label: "الرئيسية", href: `/${countryCode}`, icon: Home },
        { label: "المتاجر", href: `/${countryCode}/stores`, icon: Store },
        { label: "أقسام", href: `/${countryCode}#categories`, icon: Grid },
        { label: "العروض", href: `/${countryCode}/coupons`, icon: Tag },
        { label: "المدونة", href: `/${countryCode}/blog`, icon: FileText },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-gray-900/60 transition-opacity duration-200 lg:hidden ${isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <aside
                className={`fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white z-50 flex flex-col transition-transform duration-250 ease-out lg:hidden shadow-2xl overflow-hidden ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                dir="rtl"
                aria-hidden={!isOpen}
                role="dialog"
                aria-modal="true"
                aria-label="القائمة الجانبية"
            >
                {/* Header SafeArea padding is usually handled by keeping content away from absolute top if PWA, but standard padding works */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 min-h-[64px]">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1 rounded-md font-bold text-lg leading-none">
                            ركن
                        </div>
                        <span className="text-base font-bold text-gray-800 tracking-tight">
                            الكوبونات
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
                        aria-label="أغلق القائمة"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain pb-safe">
                    {/* Country Selector Trigger */}
                    <div className="p-4 border-b border-gray-100">
                        <button
                            onClick={() => setIsCountryModalOpen(true)}
                            className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-all min-h-[48px]"
                            aria-label="تغيير الدولة"
                        >
                            <div className="flex items-center gap-3">
                                {currentCountry && (
                                    <img
                                        src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/1x1/${currentCountry.code}.svg`}
                                        className="w-6 h-6 object-cover rounded-full border border-gray-100 shadow-sm"
                                        alt={`علم ${currentCountry.name}`}
                                        loading="lazy"
                                    />
                                )}
                                <span className="font-bold text-gray-800 text-sm">
                                    {currentCountry?.name || "اختر الدولة"}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="p-4 space-y-1">
                        {mainLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={onClose}
                                className="flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-blue-50 active:bg-blue-100 text-gray-700 hover:text-blue-700 transition-colors group min-h-[48px]"
                            >
                                <div className="flex items-center gap-3">
                                    <link.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    <span className="font-bold text-sm">{link.label}</span>
                                </div>
                                <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-blue-400 group-hover:-translate-x-1 transition-transform" />
                            </Link>
                        ))}
                    </nav>

                    {/* Top Stores Quick Links (Static placeholders to align with prompt logic, actual stores would be fetched) */}
                    <div className="px-4 py-4 bg-gray-50 border-y border-gray-100 mt-2">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-4 px-2">
                            أبرز المتاجر
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {["noon", "amazon", "namshi"].map((store) => (
                                <Link
                                    key={store}
                                    href={`/${countryCode}/${store}`}
                                    onClick={onClose}
                                    className="aspect-square bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center p-2 active:scale-95 transition-transform min-h-[80px]"
                                >
                                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-1 overflow-hidden">
                                        <span className="text-xs font-bold text-gray-400">
                                            {store.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-600 truncate w-full text-center">
                                        {store}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Fixed Actions */}
                <div className="p-4 border-t border-gray-100 bg-white shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] pb-safe-offset-4">
                    <button
                        onClick={() => {
                            onClose();
                            router.push(`/${countryCode}/coupons`);
                        }}
                        className="w-full bg-blue-600 active:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[56px]"
                    >
                        <Tag className="w-5 h-5" />
                        <span>تصفح أحدث الكوبونات</span>
                    </button>
                </div>
            </aside>

            {/* Modals - Lazy load the country switcher logic if possible, or render conditionally to keep initial DOM light */}
            {isCountryModalOpen && (
                <MobileCountrySwitcher
                    isOpen={isCountryModalOpen}
                    onClose={() => setIsCountryModalOpen(false)}
                    countries={countries}
                    currentCountry={currentCountry}
                    onDrawerClose={onClose}
                />
            )}
        </>
    );
}
