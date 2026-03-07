"use client";

import React, { useState, useTransition } from "react";
import { Save, Loader2, Image as ImageIcon, ExternalLink } from "lucide-react";
import { updateFaviconAction } from "@/lib/admin-actions";

interface Props {
    initialFaviconUrl: string;
}

export default function AdminFaviconClient({ initialFaviconUrl }: Props) {
    const [faviconUrl, setFaviconUrl] = useState(initialFaviconUrl);
    const [isPending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            await updateFaviconAction(faviconUrl);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <ImageIcon size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">أيقونة الموقع (Favicon)</h3>
                        <p className="text-sm font-medium text-slate-500">تحكم بأيقونة الموقع التي تظهر في تبويب المتصفح.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Preview */}
                        <div className="shrink-0">
                            <p className="text-sm font-black text-slate-700 mb-3">معاينة</p>
                            <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-2">
                                {faviconUrl ? (
                                    <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                                ) : (
                                    <ImageIcon size={32} className="text-slate-300" />
                                )}
                            </div>
                        </div>

                        {/* URL Input */}
                        <div className="flex-1 space-y-2 w-full">
                            <label className="text-sm font-black text-slate-700 pr-2">رابط أيقونة الموقع (Favicon URL)</label>
                            <input
                                type="text"
                                value={faviconUrl}
                                onChange={e => setFaviconUrl(e.target.value)}
                                placeholder="https://example.com/favicon.ico"
                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-slate-900 dir-ltr"
                            />
                            <p className="text-xs text-slate-400 font-medium">
                                يفضل استخدام صيغة <span className="font-mono">.ico</span> أو <span className="font-mono">.png</span> بحجم 32×32 أو 64×64 بكسل.
                            </p>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            <span>حفظ التغييرات</span>
                        </button>
                        {saved && (
                            <span className="text-green-600 font-bold text-sm animate-in fade-in duration-300">
                                ✓ تم الحفظ بنجاح!
                            </span>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
