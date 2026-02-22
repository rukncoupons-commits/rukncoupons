"use client";

import React, { useState, useTransition } from "react";
import { SocialConfig } from "@/lib/types";
import {
    Facebook, Twitter, Instagram, Youtube,
    MessageCircle, Share2, Save, Loader2, Check,
    Link as LinkIcon, Smartphone
} from "lucide-react";
import { updateSocialConfigAction } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

interface Props {
    initialConfig: SocialConfig;
}

export default function AdminSocialClient({ initialConfig }: Props) {
    const [formData, setFormData] = useState<SocialConfig>(initialConfig);
    const [isPending, startTransition] = useTransition();
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            await updateSocialConfigAction(formData);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        });
    };

    const socialPlatforms = [
        { key: "facebook", label: "فيسبوك", icon: Facebook, color: "text-blue-600", bg: "bg-blue-50" },
        { key: "twitter", label: "تويتر / X", icon: Twitter, color: "text-slate-900", bg: "bg-slate-50" },
        { key: "instagram", label: "إنستقرام", icon: Instagram, color: "text-pink-600", bg: "bg-pink-50" },
        { key: "youtube", label: "يوتيوب", icon: Youtube, color: "text-red-600", bg: "bg-red-50" },
        { key: "tiktok", label: "تيك توك", icon: Share2, color: "text-slate-900", bg: "bg-slate-50" },
        { key: "snapchat", label: "سناب شات", icon: Smartphone, color: "text-yellow-600", bg: "bg-yellow-50" },
        { key: "upscrolled", label: "آب سكرولد (إضافي)", icon: LinkIcon, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">

            {/* Header */}
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-pink-50 text-pink-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-pink-500/10">
                    <Share2 size={40} />
                </div>
                <h2 className="text-4xl font-black text-slate-800">التواصل الاجتماعي</h2>
                <p className="text-slate-400 font-medium max-w-lg mx-auto">إدارة روابط منصات التواصل الاجتماعي الخاصة بك والتي تظهر في الموقع.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-12 rounded-[3.5rem] border-2 border-slate-100 shadow-sm space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {socialPlatforms.map((platform) => {
                        const Icon = platform.icon;
                        return (
                            <div key={platform.key} className="space-y-3 group">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-focus-within:scale-110", platform.bg, platform.color)}>
                                        <Icon size={20} />
                                    </div>
                                    <label className="text-sm font-black text-slate-700">{platform.label}</label>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={(formData as any)[platform.key] || ""}
                                        onChange={e => setFormData({ ...formData, [platform.key]: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-slate-900 py-4.5 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr text-sm"
                                        placeholder="https://..."
                                    />
                                    <LinkIcon className="absolute right-5 top-5 text-slate-200 group-focus-within:text-slate-900 transition-colors" size={16} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center pt-10">
                    <button
                        type="submit"
                        disabled={isPending}
                        className={cn(
                            "px-20 py-6 rounded-3xl font-black text-white transition-all transform active:scale-95 shadow-2xl flex items-center gap-4",
                            isSuccess ? "bg-green-600 shadow-green-500/20" : "bg-slate-900 shadow-slate-900/20 hover:bg-black"
                        )}
                    >
                        {isPending ? <Loader2 className="animate-spin" size={24} /> : (isSuccess ? <Check size={24} /> : <Save size={24} />)}
                        <span className="text-lg">{isSuccess ? "تم حفظ الروابط" : "حفظ الكل"}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
