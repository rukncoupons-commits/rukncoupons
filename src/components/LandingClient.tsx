"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Country } from "@/lib/types";

interface Props {
    countries: Country[];
}

export default function LandingClient({ countries }: Props) {
    const router = useRouter();
    const [isDetecting, setIsDetecting] = useState(true);

    useEffect(() => {
        // 1. Check localStorage first (user previously chose a country)
        const saved = localStorage.getItem("user_country");
        if (saved) {
            router.push(`/${saved}`);
            return;
        }

        // 2. Auto-detect country via geo API
        const detectCountry = async () => {
            try {
                const res = await fetch("/api/geo-detect");
                if (res.ok) {
                    const data = await res.json();
                    const code = data.country?.toLowerCase();
                    if (code && countries.some(c => c.code === code)) {
                        localStorage.setItem("user_country", code);
                        document.cookie = `country_preference=${code}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
                        router.push(`/${code}`);
                        return;
                    }
                }
            } catch {
                // API failed, show manual picker
            }
            setIsDetecting(false);
        };

        detectCountry();
    }, [router, countries]);

    const selectCountry = (code: string) => {
        localStorage.setItem("user_country", code);
        document.cookie = `country_preference=${code}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
        router.push(`/${code}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="mb-10">
                    <div className="inline-block bg-blue-50 p-5 rounded-[2rem] mb-6 shadow-inner rotate-3">
                        <span className="text-5xl">🌍</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-4 leading-tight">
                        مرحباً بك في <span className="text-blue-600">ركن الكوبونات</span>
                    </h1>
                    {isDetecting ? (
                        <div className="flex flex-col items-center gap-4 mt-8">
                            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-gray-500 text-lg font-medium">
                                جارٍ تحديد موقعك تلقائياً...
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-lg font-medium">
                            اختر دولتك للبدء في توفير المال اليوم
                        </p>
                    )}
                </div>

                {!isDetecting && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-5 duration-700">
                            {countries.map((country) => (
                                <button
                                    key={country.code}
                                    onClick={() => selectCountry(country.code)}
                                    className="group relative overflow-hidden bg-white border-2 border-gray-100 hover:border-blue-500 hover:shadow-2xl rounded-3xl p-8 transition-all duration-300 transform hover:-translate-y-2"
                                >
                                    <div className="w-24 h-24 mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300 rounded-full shadow-lg overflow-hidden bg-gray-50 border-2 border-white">
                                        <img
                                            src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/1x1/${country.code}.svg`}
                                            alt={`علم ${country.name}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <h2 className="text-xl font-black text-gray-800 group-hover:text-blue-600 transition-colors">
                                        {country.name}
                                    </h2>
                                    <span className="text-xs font-bold text-gray-400 mt-3 block opacity-0 group-hover:opacity-100 transition-opacity">
                                        دخول الموقع ←
                                    </span>
                                    <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                </button>
                            ))}
                        </div>

                        <p className="mt-12 text-gray-400 text-sm font-medium">
                            يمكنك تغيير الدولة لاحقاً من القائمة العلوية
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

