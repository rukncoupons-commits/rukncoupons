"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, Globe } from "lucide-react";

// Mapping of country codes to names and flags
const COUNTRY_MAP: Record<string, { label: string; flag: string }> = {
    sa: { label: "السعودية", flag: "🇸🇦" },
    ae: { label: "الإمارات", flag: "🇦🇪" },
    eg: { label: "مصر", flag: "🇪🇬" },
    kw: { label: "الكويت", flag: "🇰🇼" },
    qa: { label: "قطر", flag: "🇶🇦" },
    bh: { label: "البحرين", flag: "🇧🇭" },
    om: { label: "عُمان", flag: "🇴🇲" },
};

export default function GeoSuggestionPopup() {
    const router = useRouter();
    const pathname = usePathname();

    const [showPopup, setShowPopup] = useState(false);
    const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

    useEffect(() => {
        // Check if the user has already made a choice to ignore this prompt
        const hasIgnored = document.cookie.includes("geo_prompt_ignored=true");
        if (hasIgnored) return;

        // Check if there is an explicit country preference set
        const hasCountryCookie = document.cookie.includes("country_preference=");

        // Attempt to get the detected country injected by the server
        // Note: Since this is a client component, we rely on the server pushing the 
        // x-detected-country header into a cookie, or we can look at the HTML.
        // However, the cleanest way in Next.js App Router without passing props everywhere 
        // is to have the layout or middleware set a temporary cookie with the detected country.
        // Assuming middleware didn't set a cookie for bots/search engine users, 
        // let's fetch an API endpoint that reads the geo IP and returns it.

        // To keep it simple and edge-compatible, we can read a meta tag if it exists 
        // or just make a fast API call that reads request.geo.
        const fetchGeo = async () => {
            try {
                // 1. Try backend headers first (works if behind Cloudflare/Vercel)
                let detected = "";
                try {
                    const res = await fetch("/api/geo-detect");
                    if (res.ok) {
                        const data = await res.json();
                        if (data.country && data.country !== 'sa') {
                            detected = data.country.toLowerCase();
                        }
                    }
                } catch { }

                // 2. If backend failed (e.g. direct Cloud Run / bare metal without CDN), use client-side fallback API
                if (!detected) {
                    const fallbackRes = await fetch("https://get.geojs.io/v1/ip/country.json");
                    if (fallbackRes.ok) {
                        const fallbackData = await fallbackRes.json();
                        detected = fallbackData.country?.toLowerCase();
                    }
                }

                if (!detected) detected = 'sa';

                if (detected && COUNTRY_MAP[detected]) {
                    const isRoot = pathname === "/";
                    const isLocalePath = pathname.startsWith("/ar") || pathname.startsWith("/en");

                    if (!isRoot && !isLocalePath) return; // Exclude admin or other paths

                    const pathParts = pathname.split("/");
                    const currentUrlCountry = isLocalePath ? (pathParts[2] || "").toLowerCase() : "";

                    // If the URL country matches the detected country, no need to show
                    if (currentUrlCountry === detected) return;

                    setDetectedCountry(detected);
                    setShowPopup(true);
                }
            } catch (err) {
                console.error("Failed to detect geo", err);
            }
        };

        fetchGeo();
    }, [pathname]);

    if (!showPopup || !detectedCountry) return null;

    const countryData = COUNTRY_MAP[detectedCountry];

    const handleAccept = () => {
        // Save preference
        document.cookie = `country_preference=${detectedCountry}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        setShowPopup(false);

        // Replace the current country slug in the pathname
        const isLocalePath = pathname.startsWith("/ar") || pathname.startsWith("/en");

        if (isLocalePath) {
            const parts = pathname.split("/");
            if (parts.length >= 3) {
                parts[2] = detectedCountry;
                router.push(parts.join("/"));
            } else {
                router.push(`/${parts[1]}/${detectedCountry}`);
            }
        } else {
            router.push(`/ar/${detectedCountry}`);
        }
    };

    const handleDecline = () => {
        // Prevent showing this for the rest of the session / 1 day
        document.cookie = `geo_prompt_ignored=true; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
        setShowPopup(false);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in slide-in-from-bottom duration-500">
            <div className="relative max-w-4xl mx-auto m-4 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">

                <div className="flex items-center gap-4 text-slate-800 font-bold flex-1">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl shrink-0">
                        {countryData.flag}
                    </div>
                    <p className="text-sm md:text-base leading-relaxed">
                        يبدو أنك تتصفح من <span className="text-blue-600 font-black">{countryData.label}</span> — هل ترغب بالانتقال إلى النسخة المحلية للحصول على عروض أفضل؟
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 shrink-0">
                    <button
                        onClick={handleDecline}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 font-bold text-sm transition-all text-center border-2 border-transparent"
                    >
                        البقاء هنا
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-slate-900 text-white font-black text-sm shadow-lg hover:bg-black transition-all text-center border-2 border-slate-900 flex items-center justify-center gap-2"
                    >
                        نعم، الانتقال <Globe size={16} />
                    </button>
                    <button
                        onClick={handleDecline}
                        className="md:hidden absolute top-2 right-2 p-2 text-slate-400"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
