"use client";

import React, { useState } from "react";
import { User, Mail, FileText, Send, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ContactClient() {
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
                <h3 className="font-black text-2xl mb-3">شكراً لك!</h3>
                <p className="text-lg opacity-90 leading-relaxed">تم استلام رسالتك بنجاح. سيقوم فريقنا بمراجعتها والرد عليك في أقرب وقت ممكن.</p>
                <button
                    onClick={() => { setFormStatus("idle"); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-8 text-green-700 font-bold hover:underline"
                >
                    إرسال رسالة أخرى
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 text-right" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="space-y-2">
                    <label className="block text-sm font-black text-gray-700 pr-2">الاسم الكامل</label>
                    <div className="relative group">
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl py-4 pr-12 pl-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-400 group-focus-within:border-blue-500"
                            placeholder="اكتب اسمك هنا"
                        />
                        <User className="absolute right-4 top-4.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="block text-sm font-black text-gray-700 pr-2">البريد الإلكتروني</label>
                    <div className="relative group">
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl py-4 pr-12 pl-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-400 group-focus-within:border-blue-500"
                            placeholder="name@example.com"
                        />
                        <Mail className="absolute right-4 top-4.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
                <label className="block text-sm font-black text-gray-700 pr-2">موضوع الرسالة</label>
                <div className="relative group">
                    <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-gray-50 border-2 border-transparent text-gray-900 rounded-2xl py-4 pr-12 pl-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-400 group-focus-within:border-blue-500"
                        placeholder="مثال: استفسار بخصوص كوبون"
                    />
                    <FileText className="absolute right-4 top-4.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
                <label className="block text-sm font-black text-gray-700 pr-2">نص الرسالة</label>
                <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-transparent text-gray-900 rounded-3xl py-4 px-6 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder-gray-400 focus:border-blue-500"
                    placeholder="اكتب تفاصيل رسالتك هنا..."
                />
            </div>

            <div className="text-center pt-6">
                <button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-black py-5 px-16 rounded-[2rem] shadow-xl shadow-blue-500/20 transition-all transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 mx-auto text-lg"
                >
                    {formStatus === "submitting" ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>جاري الإرسال...</span>
                        </>
                    ) : (
                        <>
                            <span>إرسال الرسالة</span>
                            <Send className="w-5 h-5 rotate-180" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
