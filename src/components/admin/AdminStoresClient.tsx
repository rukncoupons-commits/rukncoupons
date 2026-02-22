"use client";

import React, { useState, useTransition } from "react";
import { Store, Category, Country } from "@/lib/types";
import { Search, Plus, Edit, Trash2, X, Check, Globe, Layout, Info, Link as LinkIcon, Save, Loader2, FileText, Store as StoreIcon } from "lucide-react";
import { createStoreAction, updateStoreAction, deleteStoreAction } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";
import RichTextEditor from "./RichTextEditor";

interface Props {
    initialStores: Store[];
    categories: Category[];
    countries: Country[];
}

export default function AdminStoresClient({ initialStores, categories, countries }: Props) {
    const [stores, setStores] = useState(initialStores);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [isPending, startTransition] = useTransition();

    // Form State
    const [formData, setFormData] = useState<Partial<Store>>({
        name: "",
        slug: "",
        logoUrl: "",
        storeUrl: "",
        category: "",
        description: "",
        longDescription: "",
        shippingInfo: "",
        returnPolicy: "",
        countryCodes: [],
        isActive: true,
    });

    const filteredStores = stores.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            name: "",
            slug: "",
            logoUrl: "",
            storeUrl: "",
            category: "",
            description: "",
            longDescription: "",
            shippingInfo: "",
            returnPolicy: "",
            countryCodes: [],
            isActive: true,
        });
        setEditingStore(null);
        setIsFormOpen(false);
    };

    const handleEdit = (store: Store) => {
        setEditingStore(store);
        setFormData({ ...store });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            if (editingStore) {
                await updateStoreAction(editingStore.id, formData);
                setStores(prev => prev.map(s => s.id === editingStore.id ? { ...s, ...formData } as Store : s));
            } else {
                const result = await createStoreAction(formData);
                if (result.success && result.id) {
                    setStores(prev => [...prev, { id: result.id, ...formData } as Store]);
                }
            }
            resetForm();
        });
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`هل أنت متأكد من حذف المتجر "${name}"؟`)) return;

        startTransition(async () => {
            await deleteStoreAction(id);
            setStores(prev => prev.filter(s => s.id !== id));
        });
    };

    const toggleCountry = (code: string) => {
        setFormData(prev => ({
            ...prev,
            countryCodes: prev.countryCodes?.includes(code)
                ? prev.countryCodes.filter(c => c !== code)
                : [...(prev.countryCodes || []), code]
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Search & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث عن متجر بالاسم أو الرابط..."
                        className="w-full bg-white border-2 border-slate-100 pr-12 pl-4 py-4 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold placeholder:text-slate-300"
                    />
                    <Search className="absolute right-4 top-4.5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4.5 rounded-[1.5rem] font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 text-sm"
                >
                    <Plus size={20} />
                    <span>إضافة متجر جديد</span>
                </button>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredStores.map((store) => (
                    <div
                        key={store.id}
                        className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 flex items-center gap-6 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-blue-50 transition-all group relative overflow-hidden"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-white border border-slate-100 flex items-center justify-center p-3 shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                            <img src={store.logoUrl} alt={store.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-black text-slate-800 truncate text-lg">{store.name}</h3>
                            </div>
                            <p className="text-xs text-slate-400 font-bold mb-3 truncate font-mono">{store.slug}</p>
                            <div className="flex items-center gap-3">
                                <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black border border-slate-100 flex items-center gap-1">
                                    <Layout size={10} />
                                    {categories.find(c => c.slug === store.category)?.name || "بدون تصنيف"}
                                </span>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black border",
                                    store.isActive !== false ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                                )}>
                                    {store.isActive !== false ? "نشط" : "معطل"}
                                </span>
                            </div>
                        </div>

                        {/* Actions Panel */}
                        <div className="absolute left-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                            <button
                                onClick={() => handleEdit(store)}
                                className="p-3 bg-white border border-slate-100 text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all transform hover:rotate-12"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(store.id, store.name)}
                                className="p-3 bg-white border border-slate-100 text-red-600 rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all transform hover:-rotate-12"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modern Sidebar Form Panel */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={resetForm}></div>
                    <div className="absolute inset-y-0 left-0 max-w-2xl w-full bg-white shadow-2xl animate-in slide-in-from-left duration-500">
                        <div className="h-full flex flex-col">

                            {/* Header */}
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                        <StoreIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800">{editingStore ? "تعديل المتجر" : "إضافة متجر جديد"}</h3>
                                        <p className="text-sm font-medium text-slate-400">تحكم في تفاصيل المتجر وظهوره.</p>
                                    </div>
                                </div>
                                <button onClick={resetForm} className="p-3 hover:bg-slate-50 text-slate-400 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar pb-32">
                                <form id="store-form" onSubmit={handleSubmit} className="space-y-10">

                                    {/* Basic Info */}
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                            <Info size={16} />
                                            المعلومات الأساسية
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pr-2">اسم المتجر</label>
                                                <input
                                                    type="text" required
                                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pr-2">الاسم اللطيف (Slug)</label>
                                                <input
                                                    type="text" required
                                                    value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pr-2">التصنيف</label>
                                                <select
                                                    required
                                                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold appearance-none"
                                                >
                                                    <option value="">اختر تصنيف...</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pr-2">الحالة</label>
                                                <div className="flex bg-slate-50 p-1.5 rounded-2xl">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, isActive: true })}
                                                        className={cn("flex-1 py-3 rounded-[0.8rem] font-black text-sm transition-all", formData.isActive ? "bg-white text-green-600 shadow-sm" : "text-slate-400")}
                                                    >نشط</button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, isActive: false })}
                                                        className={cn("flex-1 py-3 rounded-[0.8rem] font-black text-sm transition-all", !formData.isActive ? "bg-white text-red-600 shadow-sm" : "text-slate-400")}
                                                    >معطل</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visuals & Links */}
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
                                            <LinkIcon size={16} />
                                            الروابط والمرئيات
                                        </h4>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pr-2">رابط الشعار (Logo URL)</label>
                                                <input
                                                    type="text" required
                                                    value={formData.logoUrl} onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pr-2">رابط الأفلييت (Affiliate URL)</label>
                                                <input
                                                    type="text"
                                                    value={formData.storeUrl} onChange={e => setFormData({ ...formData, storeUrl: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Support Countries */}
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                                            <Globe size={16} />
                                            الدول المدعومة
                                        </h4>
                                        <div className="flex gap-3 flex-wrap">
                                            {countries.map(country => (
                                                <label
                                                    key={country.id}
                                                    className={cn(
                                                        "cursor-pointer px-6 py-3 rounded-2xl border-2 transition-all flex items-center gap-3 font-bold",
                                                        formData.countryCodes?.includes(country.code)
                                                            ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={formData.countryCodes?.includes(country.code)}
                                                        onChange={() => toggleCountry(country.code)}
                                                    />
                                                    <img src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/1x1/${country.code}.svg`} className="w-5 h-5 rounded-full object-cover" alt="" />
                                                    <span>{country.name}</span>
                                                    {formData.countryCodes?.includes(country.code) && <Check size={14} className="text-green-400" />}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Content & SEO */}
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                                            <FileText size={16} />
                                            المحتوى والوصف
                                        </h4>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pr-2">وصف مختصر</label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold"
                                                ></textarea>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-900 pr-2">وصف تفصيلي (HTML)</label>
                                                <div className="block mt-2">
                                                    <RichTextEditor
                                                        value={formData.longDescription || ""}
                                                        onChange={(val) => setFormData({ ...formData, longDescription: val })}
                                                        placeholder="اكتب وصفاً مفصلاً للمتجر، أضف ترويسات وروابط وصور..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-10 border-t border-slate-100 sticky bottom-0 bg-white/95 backdrop-blur z-10 flex gap-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-5 rounded-2xl border-2 border-slate-100 font-black text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                                >إلغاء</button>
                                <button
                                    type="submit"
                                    form="store-form"
                                    disabled={isPending}
                                    className="flex-[2] py-5 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {isPending ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                                    <span>حفظ التعديلات</span>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
