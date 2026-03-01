"use client";

import React, { useState, useTransition } from "react";
import { Slide, Country, Store } from "@/lib/types";
import {
    ImageIcon, Plus, Edit, Trash2, X, Check, Globe,
    Search, Save, Loader2, Link as LinkIcon,
    ArrowRight, Layers, Eye
} from "lucide-react";
import { createSliderAction, updateSliderAction, deleteSliderAction } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

interface Props {
    initialSlides: Slide[];
    countries: Country[];
    stores: Store[];
}

export default function AdminSlidersClient({ initialSlides, countries, stores }: Props) {
    const [slides, setSlides] = useState(initialSlides);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState<Partial<Slide>>({
        image: "",
        title: "",
        description: "",
        linkUrl: "",
        countryCodes: [],
    });

    const resetForm = () => {
        setFormData({ image: "", title: "", description: "", linkUrl: "", countryCodes: [] });
        setEditingSlide(null);
        setIsFormOpen(false);
    };

    const handleEdit = (slide: Slide) => {
        setEditingSlide(slide);
        setFormData({ ...slide });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            if (editingSlide) {
                await updateSliderAction(editingSlide.id, formData);
                setSlides(prev => prev.map(s => s.id === editingSlide.id ? { ...s, ...formData } as Slide : s));
            } else {
                await createSliderAction(formData);
                // Reload to get IDs and sync
                window.location.reload();
            }
            resetForm();
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا السلايد؟")) return;
        startTransition(async () => {
            await deleteSliderAction(id);
            setSlides(prev => prev.filter(s => s.id !== id));
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
                    <h2 className="text-2xl font-black text-slate-800">سلايدر الصفحة الرئيسية</h2>
                    <p className="text-slate-400 font-medium">إدارة العروض المرئية في أعلى الصفحات.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 text-sm"
                >
                    <Plus size={20} />
                    <span>إضافة سلايد</span>
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {slides.map((slide) => (
                    <div key={slide.id} className="bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden group hover:shadow-2xl transition-all relative">
                        <div className="aspect-[21/9] w-full bg-slate-100 relative overflow-hidden">
                            <img src={slide.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={slide.title || "صورة متحركة للعرض"} />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-8">
                                <div className="text-white space-y-1">
                                    <h3 className="text-lg font-black">{slide.title || "بدون عنوان"}</h3>
                                    <p className="text-xs font-medium text-slate-300 line-clamp-1">{slide.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex items-center justify-between bg-white">
                            <div className="flex gap-2 flex-wrap">
                                {slide.countryCodes?.map(code => (
                                    <span key={code} className="text-[9px] font-black px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg uppercase">
                                        {code}
                                    </span>
                                )) || <span className="text-[9px] font-black px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg">جميع الدول</span>}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(slide)}
                                    className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(slide.id)}
                                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form Dialog */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={resetForm}></div>
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <ImageIcon size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800">{editingSlide ? "تعديل السلايد" : "سلايد جديد"}</h3>
                            </div>
                            <button onClick={resetForm} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 pr-2">رابط الصورة (Image URL)</label>
                                    <input
                                        type="text" required
                                        value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700 pr-2">العنوان</label>
                                        <input
                                            type="text"
                                            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700 pr-2">رابط التوجيه (Link)</label>
                                        <input
                                            type="text"
                                            value={formData.linkUrl} onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 pr-2">وصف قصير</label>
                                    <textarea
                                        rows={2}
                                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold"
                                    ></textarea>
                                </div>

                                <div className="space-y-4">
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
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button" onClick={resetForm}
                                    className="flex-1 py-4.5 rounded-2xl border-2 border-slate-100 font-black text-slate-400 hover:bg-slate-50 transition-all text-sm"
                                >إلغاء</button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-[2] py-4.5 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 text-sm"
                                >
                                    {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    <span>حفظ البيانات</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
