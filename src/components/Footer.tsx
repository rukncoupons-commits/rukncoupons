"use client";

import React, { useState } from "react";
import Link from "next/link";

interface FooterProps {
    currentCountryCode?: string;
}

export default function Footer({ currentCountryCode = "sa" }: FooterProps) {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubscribe = async () => {
        if (!email || !email.includes("@")) {
            setStatus("error");
            setMessage("يرجى إدخال بريد إلكتروني صحيح.");
            return;
        }
        setStatus("loading");
        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setStatus("success");
                setMessage(data.message || "تم الاشتراك بنجاح! 🎉");
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.message || "حدث خطأ، يرجى المحاولة مجدداً.");
            }
        } catch {
            setStatus("error");
            setMessage("حدث خطأ في الاتصال، يرجى المحاولة مجدداً.");
        }
    };

    return (
        <footer className="bg-gray-800 text-gray-300 pt-10 mt-12 pb-8">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-right" dir="rtl">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-600 text-white p-1 rounded font-bold">ركن</div>
                        <span className="text-xl font-bold text-white">الكوبونات</span>
                    </div>
                    <p className="text-sm leading-relaxed">منصتك الأولى للحصول على أحدث كوبونات الخصم والعروض في السعودية، مصر، والإمارات.</p>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4">روابط سريعة</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link href={`/${currentCountryCode}/about`} className="hover:text-white transition">
                                عن الموقع
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${currentCountryCode}/contact`} className="hover:text-white transition">
                                اتصل بنا
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${currentCountryCode}/privacy`} className="hover:text-white transition">
                                سياسة الخصوصية
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4">أقسام مشهورة</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link href={`/${currentCountryCode}/stores`} className="hover:text-white transition">
                                أزياء وموضة
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${currentCountryCode}/stores`} className="hover:text-white transition">
                                إلكترونيات
                            </Link>
                        </li>
                        <li>
                            <Link href={`/${currentCountryCode}/stores`} className="hover:text-white transition">
                                بقالة
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4">اشترك في النشرة</h3>
                    <p className="text-xs mb-3">احصل على أحدث الكوبونات في بريدك.</p>
                    {status === "success" ? (
                        <p className="text-green-400 text-sm font-bold">{message}</p>
                    ) : (
                        <>
                            <div className="flex flex-row-reverse overflow-hidden rounded">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                                    placeholder="بريدك الإلكتروني"
                                    className="w-full px-3 text-sm border-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-right min-h-[48px]"
                                    dir="rtl"
                                    disabled={status === "loading"}
                                />
                                <button
                                    onClick={handleSubscribe}
                                    disabled={status === "loading"}
                                    className="bg-blue-600 text-white px-6 text-sm font-bold hover:bg-blue-700 shrink-0 disabled:opacity-60 min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    {status === "loading" ? "..." : "اشتراك"}
                                </button>
                            </div>
                            {status === "error" && (
                                <p className="text-red-400 text-xs mt-2">{message}</p>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* BOTTOM SECTION */}
            <div className="mt-8 pt-8 border-t border-gray-700">
                <div className="container mx-auto px-4 text-gray-300 text-xs">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-y-4">
                        {/* Links Only (Right on desktop) */}
                        <div className="flex flex-wrap items-center gap-6 py-2">
                            <Link href={`/${currentCountryCode}/blog`} className="hover:text-white transition-colors py-2 focus-visible:outline-white">
                                المدونة
                            </Link>
                            <Link href={`/${currentCountryCode}/privacy`} className="hover:text-white transition-colors py-2 focus-visible:outline-white">
                                سياسة الخصوصية
                            </Link>
                            <Link href="/admin" className="hover:text-white transition-colors py-2 focus-visible:outline-white">
                                لوحة التحكم
                            </Link>
                        </div>

                        {/* Copyright (Left on desktop) */}
                        <div>&copy; {currentYear} موقع ركن الكوبونات. جميع الحقوق محفوظة.</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
