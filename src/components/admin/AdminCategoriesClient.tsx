"use client";

import React, { useState, useTransition } from "react";
import { Category, Country } from "@/lib/types";
import { FolderTree, Plus, Edit, Trash2, Globe, Save, Loader2, X, Check, Search } from "lucide-react";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

interface Props {
    initialCategories: Category[];
    countries: Country[];
}

export default function AdminCategoriesClient({ initialCategories, countries }: Props) {
    const [categories, setCategories] = useState(initialCategories);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState<Partial<Category>>({
        name: "",
        nameEn: "",
        slug: "",
        icon: "🏷️",
        type: "store",
        countryCode: "",
    });

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setFormData({ name: "", nameEn: "", slug: "", icon: "🏷️", type: "store", countryCode: "" });
        setEditingCategory(null);
        setIsFormOpen(false);
    };

    const handleEdit = (cat: Category) => {
        setEditingCategory(cat);
        setFormData({ ...cat });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            if (editingCategory) {
                await updateCategoryAction(editingCategory.id, formData);
                setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...formData } as Category : c));
            } else {
                const result = await createCategoryAction(formData);
                if (result.success) {
                    // Re-fetch or update locally (if server action returns ID, better)
                    // For now, let's assume success and UI will refresh on next visit or we can re-fetch
                    window.location.reload(); // Simple way to sync for now since ID isn't returned for categories yet
                }
            }
            resetForm();
        });
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`حذف التصنيف "${name}" قد يؤثر على المتاجر/المقالات المرتبطة به. هل أنت متأكد؟`)) return;
        startTransition(async () => {
            await deleteCategoryAction(id);
            setCategories(prev => prev.filter(c => c.id !== id));
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">

            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث في التصنيفات..."
                        className="w-full bg-white border-2 border-slate-100 pr-12 pl-4 py-4 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold placeholder:text-slate-500 text-slate-900 shadow-sm"
                    />
                    <Search className="absolute right-4 top-4.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="w-full md:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4.5 rounded-[1.5rem] font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 text-sm"
                >
                    <Plus size={20} />
                    <span>إضافة تصنيف</span>
                </button>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCategories.map((cat) => (
                    <div
                        key={cat.id}
                        className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 flex items-center justify-between group hover:shadow-2xl hover:shadow-slate-200/50 hover:border-blue-50 transition-all relative overflow-hidden"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-50 text-3xl flex items-center justify-center rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                                {cat.icon}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-black text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-mono">{cat.slug}</p>
                                <div className="flex gap-2">
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                                        {cat.type === "store" ? "متاجر" : "مقالات"}
                                    </span>
                                    {cat.countryCode && (
                                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                                            {cat.countryCode}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button
                                onClick={() => handleEdit(cat)}
                                className="p-3 bg-white border border-slate-100 text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all transform hover:rotate-12"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(cat.id, cat.name)}
                                className="p-3 bg-white border border-slate-100 text-red-600 rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all transform hover:-rotate-12"
                            >
                                <Trash2 size={16} />
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
                        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur z-10 sticky top-0">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <FolderTree size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800">{editingCategory ? "تعديل التصنيف" : "تصنيف جديد"}</h3>
                                    <p className="text-sm font-medium text-slate-500">نظّم محتواك باحترافية.</p>
                                </div>
                            </div>
                            <button onClick={resetForm} className="p-3 hover:bg-slate-50 text-slate-500 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
                                <div className="sm:col-span-1 space-y-2">
                                    <label className="text-sm font-black text-slate-700 pr-2">أيقونة</label>
                                    <input
                                        type="text" required
                                        value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-2 rounded-2xl outline-none transition-all font-bold text-slate-900 text-center text-2xl"
                                        placeholder="🏷️"
                                    />
                                </div>
                                <div className="sm:col-span-3 space-y-2">
                                    <label className="text-sm font-black text-slate-700 pr-2">اسم التصنيف</label>
                                    <input
                                        type="text" required
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-slate-900 text-lg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-black text-slate-700 pr-2">الاسم اللطيف (Slug)</label>
                                <input
                                    type="text" required
                                    value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-slate-900 dir-ltr"
                                />
                            </div>

                            {/* English Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-black text-indigo-600 pr-2 flex items-center gap-2">
                                    <Globe size={14} /> Category Name (English)
                                </label>
                                <input
                                    type="text"
                                    value={formData.nameEn || ""} onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                                    className="w-full bg-indigo-50/50 border-2 border-transparent focus:bg-white focus:border-indigo-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-slate-900 text-lg" dir="ltr"
                                    placeholder="e.g. Electronics"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 pr-2">النوع</label>
                                    <div className="flex bg-slate-50 p-1.5 rounded-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: "store" })}
                                            className={cn("flex-1 py-3 rounded-[0.8rem] font-black text-xs transition-all", formData.type === "store" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}
                                        >متاجر</button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: "blog" })}
                                            className={cn("flex-1 py-3 rounded-[0.8rem] font-black text-xs transition-all", formData.type === "blog" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500")}
                                        >مقالات</button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-700 pr-2 flex items-center gap-2">
                                        <Globe size={14} /> الدولة (اختياري)
                                    </label>
                                    <select
                                        value={formData.countryCode} onChange={e => setFormData({ ...formData, countryCode: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-slate-900 appearance-none text-slate-900 text-sm"
                                    >
                                        <option value="">جميع الدول</option>
                                        {countries.map(c => <option key={c.id} value={c.code}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button" onClick={resetForm}
                                    className="flex-1 py-5 rounded-[1.5rem] border-2 border-slate-100 font-black text-slate-500 hover:bg-slate-50 hover:text-slate-600 transition-all text-sm"
                                >إلغاء</button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="flex-[2] py-5 rounded-[1.5rem] bg-blue-600 text-white font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 text-sm"
                                >
                                    {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    <span>حفظ التصنيف</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
