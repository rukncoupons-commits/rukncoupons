"use client";

import React, { useState, useTransition } from "react";
import { AdBanner, Country } from "@/lib/types";
import {
    Megaphone, Plus, Edit, Trash2, X, Check, Globe,
    Save, Loader2, Link as LinkIcon, Layers, FileCode
} from "lucide-react";
import { createBannerAction, updateBannerAction, deleteBannerAction } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

interface Props {
    initialBanners: AdBanner[];
    countries: Country[];
}

export default function AdminBannersClient({ initialBanners, countries }: Props) {
    const [banners, setBanners] = useState(initialBanners);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null);
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState<Partial<AdBanner>>({
        type: "image",
        imageUrl: "",
        imageUrlEn: "",
        htmlContent: "",
        htmlContentEn: "",
        linkUrl: "",
        linkUrlEn: "",
        altText: "",
        altTextEn: "",
        isActive: true,
        order: 0,
        countryCodes: [],
    });

    const resetForm = () => {
        setFormData({
            type: "image", imageUrl: "", imageUrlEn: "", htmlContent: "", htmlContentEn: "", linkUrl: "", linkUrlEn: "",
            altText: "", altTextEn: "", isActive: true, order: 0, countryCodes: []
        });
        setEditingBanner(null);
        setIsFormOpen(false);
    };

    const handleEdit = (banner: AdBanner) => {
        setEditingBanner(banner);
        setFormData({ ...banner });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            if (editingBanner) {
                await updateBannerAction(editingBanner.id, formData);
                setBanners(prev => prev.map(b => b.id === editingBanner.id ? { ...b, ...formData } as AdBanner : b));
            } else {
                await createBannerAction(formData);
                window.location.reload();
            }
            resetForm();
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
        startTransition(async () => {
            await deleteBannerAction(id);
            setBanners(prev => prev.filter(b => b.id !== id));
        });
    };

    const toggleCountry = (code: string) => {
        const codes = formData.countryCodes || [];
        setFormData({
            ...formData,
            countryCodes: codes.includes(code)
                ? codes.filter(c => c !== code)
                : [...codes, code]
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">الإعلانات الجانبية</h2>
                    <p className="text-slate-400 font-medium">إدارة البنرات الإعلانية في الشريط الجانبي.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 text-sm"
                >
                    <Plus size={20} />
                    <span>إضافة إعلان</span>
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {banners.sort((a, b) => (a.order || 0) - (b.order || 0)).map((banner) => (
                    <div key={banner.id} className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-6 space-y-6 group hover:shadow-2xl transition-all relative">
                        <div className="aspect-square w-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center relative">
                            {banner.type === "image" ? (
                                <img src={banner.imageUrl} alt={banner.altText} className="w-full h-full object-contain" />
                            ) : (
                                <div className="flex flex-col items-center gap-3 text-slate-300">
                                    <FileCode size={48} />
                                    <span className="text-[10px] font-black uppercase">HTML Content</span>
                                </div>
                            )}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-black shadow-sm border border-slate-100 uppercase">
                                {banner.type}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-slate-800 line-clamp-1">{banner.altText || "بدون اسم"}</h3>
                                <span className={cn(
                                    "px-2 py-1 rounded-lg text-[9px] font-black border",
                                    banner.isActive ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                                )}>
                                    {banner.isActive ? "نشط" : "معطل"}
                                </span>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {banner.countryCodes?.map(code => (
                                    <span key={code} className="text-[9px] font-black px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg uppercase">
                                        {code}
                                    </span>
                                )) || <span className="text-[9px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg">الكل</span>}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={() => handleEdit(banner)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-xs font-black"
                            >
                                <Edit size={14} /> تعديل
                            </button>
                            <button
                                onClick={() => handleDelete(banner.id)}
                                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form Dialog */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={resetForm}></div>
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Megaphone size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800">{editingBanner ? "تعديل الإعلان" : "إعلان جديد"}</h3>
                            </div>
                            <button onClick={resetForm} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-6">

                            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: "image" })}
                                    className={cn("flex-1 py-3 rounded-xl font-black text-xs transition-all", formData.type === "image" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}
                                >إعلان صوري</button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: "html" })}
                                    className={cn("flex-1 py-3 rounded-xl font-black text-xs transition-all", formData.type === "html" ? "bg-white text-purple-600 shadow-sm" : "text-slate-400")}
                                >إعلان HTML / كود</button>
                            </div>

                            {formData.type === "image" ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-700 pr-2">رابط الصورة (عربي)</label>
                                            <input
                                                type="text" required
                                                value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-700 pr-2">رابط الصورة (إنجليزي) - اختياري</label>
                                            <input
                                                type="text"
                                                value={formData.imageUrlEn || ""} onChange={e => setFormData({ ...formData, imageUrlEn: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-700 pr-2">رابط التوجه (عربي)</label>
                                            <input
                                                type="text"
                                                value={formData.linkUrl} onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-700 pr-2">رابط التوجه (إنجليزي)</label>
                                            <input
                                                type="text"
                                                value={formData.linkUrlEn || ""} onChange={e => setFormData({ ...formData, linkUrlEn: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700 pr-2">محتوى الكود (عربي)</label>
                                        <textarea
                                            rows={5} required
                                            value={formData.htmlContent} onChange={e => setFormData({ ...formData, htmlContent: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-mono text-xs leading-relaxed"
                                            placeholder="<div class='ad'>...</div>"
                                        ></textarea>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700 pr-2">محتوى الكود (إنجليزي)</label>
                                        <textarea
                                            rows={5} required
                                            value={formData.htmlContentEn || ""} onChange={e => setFormData({ ...formData, htmlContentEn: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-mono text-xs leading-relaxed"
                                            placeholder="<div class='ad'>...</div>"
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 pr-2">اسم توضيحي (عربي)</label>
                                    <input
                                        type="text" required
                                        value={formData.altText} onChange={e => setFormData({ ...formData, altText: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 pr-2">اسم توضيحي (إنجليزي)</label>
                                    <input
                                        type="text"
                                        value={formData.altTextEn || ""} onChange={e => setFormData({ ...formData, altTextEn: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700 pr-2">الترتيب</label>
                                <input
                                    type="number" required
                                    value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-black text-slate-700 pr-2">الدول (اتركه فارغاً للكل)</label>
                                <div className="flex gap-2 flex-wrap">
                                    {countries.map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => toggleCountry(c.code)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-[10px] font-black border transition-all flex items-center gap-2",
                                                formData.countryCodes?.includes(c.code) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                                            )}
                                        >
                                            <img src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/1x1/${c.code}.svg`} className="w-3 h-3 rounded-full" alt="" />
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button" onClick={resetForm}
                                    className="flex-1 py-4 rounded-2xl border-2 border-slate-100 font-black text-slate-400 hover:bg-slate-50 transition-all text-xs"
                                >إلغاء</button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 text-xs"
                                >
                                    {isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    <span>حفظ الإعلان</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
