"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { Country } from "@/lib/types";
import MobileDrawer from "./MobileDrawer";

interface MobileHeaderProps {
    countries: Country[];
    currentCountry?: Country;
}

export default function MobileHeader({ countries, currentCountry }: MobileHeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Subtle shadow on scroll
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Body scroll lock
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
        } else {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        };
    }, [isDrawerOpen]);

    return (
        <>
            <header
                className={`lg:hidden sticky top-0 z-40 bg-white transition-shadow duration-200 h-14 md:h-16 flex items-center justify-between px-4 ${isScrolled ? "shadow-sm border-b border-gray-100" : ""
                    }`}
                dir="rtl"
            >
                {/* 1. Burger Menu */}
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-2 -mr-2 text-gray-700 hover:text-blue-600 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 rounded-lg shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px]"
                    aria-label="افتح القائمة"
                    aria-expanded={isDrawerOpen}
                >
                    <Menu className="w-6 h-6" aria-hidden="true" />
                </button>

                {/* 2. Logo Centered */}
                <Link
                    href={`/${currentCountry?.code || ""}`}
                    className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2"
                    aria-label="ركن الكوبونات - الرئيسية"
                >
                    <div className="bg-blue-600 text-white p-1 rounded-md font-bold text-lg md:text-xl leading-none">
                        ركن
                    </div>
                    <span className="text-base md:text-lg font-bold text-gray-800 tracking-tight">
                        الكوبونات
                    </span>
                </Link>

                {/* 3. Search Icon */}
                <Link
                    href={`/${currentCountry?.code || "sa"}/coupons`}
                    className="p-2 -ml-2 text-gray-700 hover:text-blue-600 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 rounded-lg shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px]"
                    aria-label="البحث عن الكوبونات"
                >
                    <Search className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
                </Link>
            </header>

            {/* Mobile Drawer */}
            <MobileDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                countries={countries}
                currentCountry={currentCountry}
            />
        </>
    );
}
