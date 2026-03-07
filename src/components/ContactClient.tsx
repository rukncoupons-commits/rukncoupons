"use client";

import React, { useState } from "react";
import { User, Mail, FileText, Send, CheckCircle2, Loader2 } from "lucide-react";

export default function ContactClient({ locale }: { locale: string }) {
    const isEn = locale === "en";
    const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("submitting");
        // Simulate API call
        setTimeout(() => {
            setFormStatus("success");
        }, 1500);
    };

    if (formStatus === "success") {
        return (
            <div className="bg-green-50 border border-green-200 text-green-800 p-10 rounded-[2.5rem] text-center shadow-sm animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
                    <CheckCircle2 size={48} />
                </div>
                <h3 className="font-black text-2xl mb-3">{isEn ? "Thank You!" : "شكراً لك!"}</h3>
                <p className="text-lg opacity-90 leading-relaxed">
                    {isEn ? "Your message has been successfully received. Our team will review it and reply as soon as possible." : "تم استلام رسالتك بنجاح. سيقوم فريقنا بمراجعتها والرد عليك في أقرب وقت ممكن."}
                </p>
                <button
                    onClick={() => { setFormStatus("idle"); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-8 text-green-700 font-bold hover:underline"
                >
                    {isEn ? "Send another message" : "إرسال رسالة أخرى"}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-8 ${isEn ? 'text-left' : 'text-right'}`} dir={isEn ? "ltr" : "rtl"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="space-y-2">
                    <label className={`block text-sm font-black text-gray-700 ${isEn ? 'pl-2' : 'pr-2'}`}>
                        {isEn ? "Full Name" : "الاسم الكامل"}
                    </label>
                    <div className="relative group">
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl py-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-400 group-focus-within:border-blue-500 ${isEn ? 'pl-12 pr-4' : 'pr-12 pl-4'}`}
                            placeholder={isEn ? "Enter your name here" : "اكتب اسمك هنا"}
                        />
                        <User className={`absolute top-4.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors ${isEn ? 'left-4' : 'right-4'}`} />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className={`block text-sm font-black text-gray-700 ${isEn ? 'pl-2' : 'pr-2'}`}>
                        {isEn ? "Email Address" : "البريد الإلكتروني"}
                    </label>
                    <div className="relative group">
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl py-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-400 group-focus-within:border-blue-500 ${isEn ? 'pl-12 pr-4' : 'pr-12 pl-4'}`}
                            placeholder="name@example.com"
                        />
                        <Mail className={`absolute top-4.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors ${isEn ? 'left-4' : 'right-4'}`} />
                    </div>
                </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
                <label className={`block text-sm font-black text-gray-700 ${isEn ? 'pl-2' : 'pr-2'}`}>
                    {isEn ? "Subject" : "موضوع الرسالة"}
                </label>
                <div className="relative group">
                    <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className={`w-full bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl py-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-400 group-focus-within:border-blue-500 ${isEn ? 'pl-12 pr-4' : 'pr-12 pl-4'}`}
                        placeholder={isEn ? "Example: Inquiry about a coupon" : "مثال: استفسار بخصوص كوبون"}
                    />
                    <FileText className={`absolute top-4.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors ${isEn ? 'left-4' : 'right-4'}`} />
                </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
                <label className={`block text-sm font-black text-gray-700 ${isEn ? 'pl-2' : 'pr-2'}`}>
                    {isEn ? "Message" : "نص الرسالة"}
                </label>
                <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-transparent text-gray-900 rounded-3xl py-4 px-6 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-400 focus:border-blue-500"
                    placeholder={isEn ? "Write your message details here..." : "اكتب تفاصيل رسالتك هنا..."}
                />
            </div>

            <div className="text-center pt-6">
                <button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    className={`w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black py-5 px-16 rounded-[2rem] shadow-xl shadow-blue-500/20 transition-all transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mx-auto text-lg ${isEn ? 'flex-row' : 'flex-row'}`}
                >
                    {formStatus === "submitting" ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>{isEn ? "Sending..." : "جاري الإرسال..."}</span>
                        </>
                    ) : (
                        <>
                            <span>{isEn ? "Send Message" : "إرسال الرسالة"}</span>
                            <Send className={`w-5 h-5 ${isEn ? '' : 'rotate-180'}`} />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
