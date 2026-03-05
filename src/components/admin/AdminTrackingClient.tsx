"use client";

import React, { useState, useTransition } from "react";
import { TrackingConfig } from "@/lib/types";
import {
    Activity, Save, Loader2, Check, BarChart3,
    Search, Shield, Zap, Globe, Database, RefreshCw, AlertTriangle
} from "lucide-react";
import { updateTrackingConfigAction } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

interface Props {
    initialConfig: TrackingConfig;
}

export default function AdminTrackingClient({ initialConfig }: Props) {
    const [formData, setFormData] = useState<TrackingConfig>(initialConfig);
    const [isPending, startTransition] = useTransition();
    const [isSuccess, setIsSuccess] = useState(false);

    // AI Engine controls
    const [migrateStatus, setMigrateStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [migrateResult, setMigrateResult] = useState<string>('');
    const [recalcStatus, setRecalcStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [recalcResult, setRecalcResult] = useState<string>('');

    const handleMigrate = async () => {
        setMigrateStatus('loading');
        try {
            const res = await fetch('/api/admin/migrate-behavioral-schema', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setMigrateStatus('done');
                setMigrateResult(`✅ تم: ${data.summary?.migrated ?? 0} مقال محدّث، ${data.summary?.skipped ?? 0} موجود مسبقاً`);
            } else {
                setMigrateStatus('error');
                setMigrateResult(`❌ خطأ: ${data.error || 'غير معروف'}`);
            }
        } catch (e) {
            setMigrateStatus('error');
            setMigrateResult('❌ فشل الاتصال بالخادم');
        }
    };

    const handleRecalculate = async () => {
        setRecalcStatus('loading');
        try {
            const res = await fetch('/api/heatmap/recalculate', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setRecalcStatus('done');
                setRecalcResult(`✅ ${data.message}`);
            } else {
                setRecalcStatus('error');
                setRecalcResult(`❌ خطأ: ${data.error || 'غير معروف'}`);
            }
        } catch (e) {
            setRecalcStatus('error');
            setRecalcResult('❌ فشل الاتصال بالخادم');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            await updateTrackingConfigAction(formData);
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        });
    };

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">

            {/* Header */}
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-blue-500/10">
                    <Activity size={40} />
                </div>
                <h2 className="text-4xl font-black text-slate-800">إعدادات التتبع والتحليل</h2>
                <p className="text-slate-400 font-medium max-w-lg mx-auto">إدارة أكواد التتبع لبكسل فيسبوك، جوجل أناليتكس، وتيك توك بسهولة.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* GA4 */}
                    <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                                    <BarChart3 size={24} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">Google Analytics 4</h3>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-12 h-6 rounded-full relative transition-all",
                                    formData.enableGA4 ? "bg-orange-500 shadow-lg shadow-orange-500/30" : "bg-slate-200"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                        formData.enableGA4 ? "right-7" : "right-1"
                                    )}></div>
                                </div>
                                <input
                                    type="checkbox" className="hidden"
                                    checked={formData.enableGA4}
                                    onChange={e => setFormData({ ...formData, enableGA4: e.target.checked })}
                                />
                            </label>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-500 pr-2">GA4 Measurement ID</label>
                            <input
                                type="text"
                                value={formData.ga4MeasurementId} onChange={e => setFormData({ ...formData, ga4MeasurementId: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-orange-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                                placeholder="G-XXXXXXXXXX"
                            />
                        </div>
                    </div>

                    {/* Meta Pixel */}
                    <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                    <Zap size={24} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">Meta Pixel</h3>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-12 h-6 rounded-full relative transition-all",
                                    formData.enableMeta ? "bg-blue-600 shadow-lg shadow-blue-600/30" : "bg-slate-200"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                        formData.enableMeta ? "right-7" : "right-1"
                                    )}></div>
                                </div>
                                <input
                                    type="checkbox" className="hidden"
                                    checked={formData.enableMeta}
                                    onChange={e => setFormData({ ...formData, enableMeta: e.target.checked })}
                                />
                            </label>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-500 pr-2">Meta Pixel ID</label>
                            <input
                                type="text"
                                value={formData.metaPixelId} onChange={e => setFormData({ ...formData, metaPixelId: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-600 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                            />
                        </div>
                    </div>

                    {/* Google Ads */}
                    <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center">
                                    <Search size={24} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">Google Ads</h3>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-12 h-6 rounded-full relative transition-all",
                                    formData.enableGoogleAds ? "bg-yellow-500 shadow-lg shadow-yellow-500/30" : "bg-slate-200"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                        formData.enableGoogleAds ? "right-7" : "right-1"
                                    )}></div>
                                </div>
                                <input
                                    type="checkbox" className="hidden"
                                    checked={formData.enableGoogleAds}
                                    onChange={e => setFormData({ ...formData, enableGoogleAds: e.target.checked })}
                                />
                            </label>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-500 pr-2">Conversion ID</label>
                            <input
                                type="text"
                                value={formData.googleAdsConversionId} onChange={e => setFormData({ ...formData, googleAdsConversionId: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-yellow-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                            />
                        </div>
                    </div>

                    {/* TikTok Pixel */}
                    <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                                    <Globe size={24} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800">TikTok Pixel</h3>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={cn(
                                    "w-12 h-6 rounded-full relative transition-all",
                                    formData.enableTikTok ? "bg-slate-900 shadow-lg shadow-slate-900/30" : "bg-slate-200"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                        formData.enableTikTok ? "right-7" : "right-1"
                                    )}></div>
                                </div>
                                <input
                                    type="checkbox" className="hidden"
                                    checked={formData.enableTikTok}
                                    onChange={e => setFormData({ ...formData, enableTikTok: e.target.checked })}
                                />
                            </label>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-500 pr-2">Tiktok Pixel ID</label>
                            <input
                                type="text"
                                value={formData.tiktokPixelId} onChange={e => setFormData({ ...formData, tiktokPixelId: e.target.value })}
                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-slate-900 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                            />
                        </div>
                    </div>
                </div>

                {/* Custom Head Code */}
                <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800">كود مخصص في الـ Head</h3>
                            <p className="text-sm text-slate-400">ضع هنا أي كود تتبع إضافي مثل Google Ads conversion snippet أو أي سكربت مخصص</p>
                        </div>
                    </div>
                    <textarea
                        value={formData.customHeadCode ?? ""}
                        onChange={e => setFormData({ ...formData, customHeadCode: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-purple-500 py-4 px-6 rounded-2xl outline-none transition-all font-mono text-sm dir-ltr min-h-[160px] resize-y"
                        placeholder={"<!-- مثال: Google Ads Conversion -->\ngtag('event', 'conversion', {\n  'send_to': 'AW-XXXXXXXXX/XXXX'\n});"}
                        dir="ltr"
                    />
                </div>

                <div className="flex justify-center pt-10">
                    <button
                        type="submit"
                        disabled={isPending}
                        className={cn(
                            "relative px-16 py-6 rounded-3xl font-black text-white transition-all transform active:scale-95 shadow-2xl flex items-center gap-4 overflow-hidden",
                            isSuccess ? "bg-green-600 shadow-green-500/20" : "bg-slate-900 shadow-slate-900/20 hover:bg-black"
                        )}
                    >
                        {isPending ? <Loader2 className="animate-spin" size={24} /> : (isSuccess ? <Check size={24} /> : <Save size={24} />)}
                        <span className="text-lg">{isSuccess ? "تم الحفظ بنجاح" : "حفظ التغييرات"}</span>
                    </button>
                </div>
            </form>

            {/* ─── AI Engine Control Panel ─────────────────────────────────── */}
            <div className="mt-16 space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-slate-800">🧠 لوحة تحكم محرك الـ AI</h2>
                    <p className="text-slate-400 text-sm">إدارة بيانات السلوك والتعلم الذاتي</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Migration Button */}
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-amber-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                <Database size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800">ترقية قاعدة البيانات</h3>
                                <p className="text-xs text-slate-400">شغّله مرة واحدة فقط بعد الـ deploy</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            يحوّل كل مقالات المدونة للـ Schema الجديد (Phase 8).
                            آمن للتكرار — يتجاهل ما هو محدّث بالفعل.
                        </p>
                        {migrateResult && (
                            <div className={cn("text-sm font-bold p-3 rounded-2xl", migrateStatus === 'done' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                                {migrateResult}
                            </div>
                        )}
                        <button
                            onClick={handleMigrate}
                            disabled={migrateStatus === 'loading' || migrateStatus === 'done'}
                            className={cn(
                                "w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all",
                                migrateStatus === 'done' ? 'bg-green-600' :
                                    migrateStatus === 'error' ? 'bg-red-600 hover:bg-red-700' :
                                        'bg-amber-500 hover:bg-amber-600'
                            )}
                        >
                            {migrateStatus === 'loading' ? <Loader2 className="animate-spin" size={20} /> :
                                migrateStatus === 'done' ? <Check size={20} /> :
                                    migrateStatus === 'error' ? <AlertTriangle size={20} /> :
                                        <Database size={20} />}
                            {migrateStatus === 'loading' ? 'جاري الترقية...' :
                                migrateStatus === 'done' ? 'تمت الترقية' :
                                    'ترقية Schema قاعدة البيانات'}
                        </button>
                    </div>

                    {/* Recalculate Button */}
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-blue-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                <RefreshCw size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800">إعادة حساب الـ AI</h3>
                                <p className="text-xs text-slate-400">تلقائي كل اثنين 3 صباحاً • أو شغّله يدوياً</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            يعيد تحسين موضع حقن الكوبونات لكل مقال بناءً على بيانات السلوك المتجمّعة.
                            يحتاج مقال ≥ 20 جلسة لإعادة الحساب.
                        </p>
                        {recalcResult && (
                            <div className={cn("text-sm font-bold p-3 rounded-2xl", recalcStatus === 'done' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                                {recalcResult}
                            </div>
                        )}
                        <button
                            onClick={handleRecalculate}
                            disabled={recalcStatus === 'loading'}
                            className={cn(
                                "w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all",
                                recalcStatus === 'done' ? 'bg-green-600 hover:bg-green-700' :
                                    recalcStatus === 'error' ? 'bg-red-600 hover:bg-red-700' :
                                        'bg-blue-600 hover:bg-blue-700'
                            )}
                        >
                            {recalcStatus === 'loading' ? <Loader2 className="animate-spin" size={20} /> :
                                recalcStatus === 'done' ? <Check size={20} /> :
                                    recalcStatus === 'error' ? <AlertTriangle size={20} /> :
                                        <RefreshCw size={20} />}
                            {recalcStatus === 'loading' ? 'جاري الحساب...' : 'إعادة حساب الـ AI الآن'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
