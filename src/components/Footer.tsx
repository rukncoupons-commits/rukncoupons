"use client";

import React, { useState } from "react";
import Link from "next/link";

interface FooterProps {
    currentCountryCode?: string;
    locale?: string;
}

export default function Footer({ currentCountryCode = "sa", locale = "ar" }: FooterProps) {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");
    const isEn = locale === "en";
    const dir = isEn ? "ltr" : "rtl";
    const textAlign = isEn ? "text-left" : "text-right";

    const handleSubscribe = async () => {
        if (!email || !email.includes("@")) {
            setStatus("error");
            setMessage(isEn ? "Please enter a valid email address." : "يرجى إدخال بريد إلكتروني صحيح.");
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
                setMessage(isEn ? "Subscribed successfully! 🎉" : (data.message || "تم الاشتراك بنجاح! 🎉"));
                setEmail("");
            } else {
                setStatus("error");
                setMessage(isEn ? "An error occurred, please try again." : (data.message || "حدث خطأ، يرجى المحاولة مجدداً."));
            }
        } catch {
            setStatus("error");
            setMessage(isEn ? "Connection error, please try again." : "حدث خطأ في الاتصال، يرجى المحاولة مجدداً.");
        }
    };

    const prefix = `/${locale}/${currentCountryCode}`;

    return (
        <footer className="bg-gray-800 text-gray-300 pt-10 mt-12 pb-8">
            <div className={`container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 ${textAlign}`} dir={dir}>
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-600 text-white p-1 rounded font-bold">
                            {isEn ? "Rukn" : "ركن"}
                        </div>
                        <span className="text-xl font-bold text-white">
                            {isEn ? "Coupons" : "الكوبونات"}
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed">
                        {isEn
                            ? "Your go-to platform for the latest discount codes and deals from the best online stores across the Middle East."
                            : "منصتك الأولى للحصول على أحدث كوبونات الخصم والعروض لأفضل المتاجر الإلكترونية في العالم العربي."}
                    </p>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4">
                        {isEn ? "Quick Links" : "روابط سريعة"}
                    </h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link href={`${prefix}/about`} className="hover:text-white transition">
                                {isEn ? "About Us" : "عن الموقع"}
                            </Link>
                        </li>
                        <li>
                            <Link href={`${prefix}/contact`} className="hover:text-white transition">
                                {isEn ? "Contact Us" : "اتصل بنا"}
                            </Link>
                        </li>
                        <li>
                            <Link href={`${prefix}/privacy`} className="hover:text-white transition">
                                {isEn ? "Privacy Policy" : "سياسة الخصوصية"}
                            </Link>
                        </li>
                        <li>
                            <Link href={`${prefix}/how-we-verify-coupons`} className="hover:text-white transition text-green-400 font-medium flex items-center gap-2 mt-2">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                {isEn ? "How We Verify Coupons" : "كيف نتحقق من الكوبونات"}
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4">
                        {isEn ? "Popular Categories" : "أقسام مشهورة"}
                    </h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link href={`${prefix}/coupons?cat=fashion`} className="hover:text-white transition">
                                {isEn ? "Fashion & Apparel" : "أزياء وموضة"}
                            </Link>
                        </li>
                        <li>
                            <Link href={`${prefix}/coupons?cat=electronics`} className="hover:text-white transition">
                                {isEn ? "Electronics" : "إلكترونيات"}
                            </Link>
                        </li>
                        <li>
                            <Link href={`${prefix}/coupons?cat=grocery`} className="hover:text-white transition">
                                {isEn ? "Grocery" : "بقالة"}
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4">
                        {isEn ? "Newsletter" : "اشترك في النشرة"}
                    </h3>
                    <p className="text-xs mb-3">
                        {isEn ? "Get the latest coupons in your inbox." : "احصل على أحدث الكوبونات في بريدك."}
                    </p>
                    {status === "success" ? (
                        <p className="text-green-400 text-sm font-bold">{message}</p>
                    ) : (
                        <>
                            <div className={`flex ${isEn ? "" : "flex-row-reverse"} overflow-hidden rounded`}>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
                                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                                    placeholder={isEn ? "Your email address" : "بريدك الإلكتروني"}
                                    className={`w-full px-3 text-sm border-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${textAlign} min-h-[48px]`}
                                    dir={dir}
                                    disabled={status === "loading"}
                                />
                                <button
                                    onClick={handleSubscribe}
                                    disabled={status === "loading"}
                                    className="bg-blue-600 text-white px-6 text-sm font-bold hover:bg-blue-700 shrink-0 disabled:opacity-60 min-h-[48px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    {status === "loading" ? "..." : (isEn ? "Subscribe" : "اشتراك")}
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
                        <div className="flex flex-wrap items-center gap-6 py-2">
                            <Link href={`${prefix}/blog`} className="hover:text-white transition-colors py-2 focus-visible:outline-white">
                                {isEn ? "Blog" : "المدونة"}
                            </Link>
                            <Link href={`${prefix}/privacy`} className="hover:text-white transition-colors py-2 focus-visible:outline-white">
                                {isEn ? "Privacy Policy" : "سياسة الخصوصية"}
                            </Link>
                            <Link href="/admin" className="hover:text-white transition-colors py-2 focus-visible:outline-white">
                                {isEn ? "Admin Panel" : "لوحة التحكم"}
                            </Link>
                        </div>
                        <div>
                            &copy; {currentYear} {isEn ? "Rukn Coupons. All rights reserved." : "موقع ركن الكوبونات. جميع الحقوق محفوظة."}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
