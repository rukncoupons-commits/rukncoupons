"use client";

import React, { useState, useTransition, useMemo } from "react";
import { Coupon, Store, Category, Country } from "@/lib/types";
import {
    Search, Plus, Edit, Trash2, X, Check, Globe, Ticket as TicketIcon,
    Info, Link as LinkIcon, Save, Loader2, Calendar,
    Filter, AlertCircle, Hash, Tag, Zap, Layout
} from "lucide-react";
import { createCouponAction, updateCouponAction, deleteCouponAction, toggleCouponActiveAction, resetCouponStatsAction } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

interface Props {
    initialCoupons: Coupon[];
    initialStores: Store[];
    categories: Category[];
    countries: Country[];
}

export default function AdminCouponsClient({ initialCoupons, initialStores, categories, countries }: Props) {
    const [coupons, setCoupons] = useState(initialCoupons);
    const [stores] = useState(initialStores);
    const [searchQuery, setSearchQuery] = useState("");
    const [storeFilter, setStoreFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled" | "expired">("all");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [isPending, startTransition] = useTransition();

    // Form State
    const [formData, setFormData] = useState<Partial<Coupon>>({
        title: "",
        titleEn: "",
        code: "",
        description: "",
        descriptionEn: "",
        discountValue: "",
        discountValueEn: "",
        storeId: "",
        type: "coupon",
        expiryDate: "",
        isActive: true,
        isExclusive: false,
        isVerified: true,
        countryCodes: [],
        categories: [],
        affiliateLink: "",
    });

    const filteredCoupons = useMemo(() => {
        return coupons.filter(c => {
            const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.code || "").toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStore = storeFilter ? c.storeId === storeFilter : true;

            let matchesStatus = true;
            if (statusFilter === "active") matchesStatus = c.isActive !== false;
            if (statusFilter === "disabled") matchesStatus = c.isActive === false;
            if (statusFilter === "expired") {
                if (!c.expiryDate) matchesStatus = false;
                else {
                    const exp = new Date(c.expiryDate);
                    matchesStatus = exp < new Date();
                }
            }

            return matchesSearch && matchesStore && matchesStatus;
        });
    }, [coupons, searchQuery, storeFilter, statusFilter]);

    const resetForm = () => {
        setFormData({
            title: "",
            titleEn: "",
            code: "",
            description: "",
            descriptionEn: "",
            discountValue: "",
            discountValueEn: "",
            storeId: "",
            type: "coupon",
            expiryDate: "",
            isActive: true,
            isExclusive: false,
            isVerified: true,
            countryCodes: [],
            categories: [],
            affiliateLink: "",
        });
        setEditingCoupon(null);
        setIsFormOpen(false);
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({ ...coupon });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            if (editingCoupon) {
                await updateCouponAction(editingCoupon.id, formData);
                setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? { ...c, ...formData } as Coupon : c));
            } else {
                const result = await createCouponAction(formData);
                if (result.success && result.id) {
                    setCoupons(prev => [{ id: result.id, ...formData } as Coupon, ...prev]);
                }
            }
            resetForm();
        });
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`هل أنت متأكد من حذف الكوبون "${title}"؟`)) return;

        startTransition(async () => {
            await deleteCouponAction(id);
            setCoupons(prev => prev.filter(c => c.id !== id));
        });
    };

    const toggleArrayItem = (field: "countryCodes" | "categories", value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field]?.includes(value)
                ? prev[field]?.filter(item => item !== value)
                : [...(prev[field] || []), value]
        }));
    };

    const getStoreName = (id: string) => stores.find(s => s.id === id)?.name || "متجر محذوف";

    const handleToggleActive = async (coupon: Coupon) => {
        const newIsActive = coupon.isActive === false ? true : false;
        startTransition(async () => {
            await toggleCouponActiveAction(coupon.id, newIsActive);
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, isActive: newIsActive } : c));
        });
    };

    const handleResetStats = async (coupon: Coupon) => {
        if (!confirm(`هل تريد تصفير إحصائيات الكوبون "${coupon.title}"؟`)) return;
        startTransition(async () => {
            await resetCouponStatsAction(coupon.id);
            setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, usedCount: 0, viewCount: 0 } : c));
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Filters & Search */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
                    <div className="relative w-full xl:w-1/3 group">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="بحث في الكوبونات..."
                            className="w-full bg-slate-50 border-2 border-transparent pr-12 pl-4 py-4 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold placeholder:text-slate-500 text-slate-900"
                        />
                        <Search className="absolute right-4 top-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 w-full xl:w-2/3 justify-start xl:justify-end">
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            <Filter size={16} className="text-slate-500 mr-2" />
                            <select
                                value={storeFilter}
                                onChange={e => setStoreFilter(e.target.value)}
                                className="bg-transparent text-sm font-bold text-slate-900 outline-none pr-2"
                            >
                                <option value="">كل المتاجر</option>
                                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                            {(["all", "active", "disabled", "expired"] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-black transition-all",
                                        statusFilter === status ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-600"
                                    )}
                                >
                                    {status === "all" ? "الكل" : status === "active" ? "نشط" : status === "disabled" ? "معطل" : "منتهي"}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => { resetForm(); setIsFormOpen(true); }}
                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-sm"
                        >
                            <Plus size={18} />
                            <span>إضافة عرض</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table View */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <table className="w-full text-right border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-8 py-6 text-right">العرض / الكود</th>
                            <th className="px-8 py-6 text-right">المتجر</th>
                            <th className="px-8 py-6 text-right">الحالة</th>
                            <th className="px-8 py-6 text-right">الاستخدام</th>
                            <th className="px-8 py-6 text-center">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredCoupons.map((coupon) => {
                            const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
                            return (
                                <tr key={coupon.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1.5 min-w-[250px]">
                                            <span className="font-black text-slate-800 line-clamp-1">{coupon.title}</span>
                                            <div className="flex items-center gap-2">
                                                {coupon.code ? (
                                                    <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-lg border border-blue-100 uppercase tracking-wider font-mono">
                                                        <Hash size={10} />
                                                        {coupon.code}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-lg border border-amber-100">
                                                        <Zap size={10} />
                                                        عرض تلقائي
                                                    </span>
                                                )}
                                                {isExpired && (
                                                    <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 border border-red-100">
                                                        <AlertCircle size={10} />
                                                        منتهي
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                            {getStoreName(coupon.storeId)}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button
                                            onClick={() => handleToggleActive(coupon)}
                                            className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black border cursor-pointer transition-all hover:shadow-md",
                                                coupon.isActive !== false ? "bg-green-50 text-green-700 border-green-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200" : "bg-red-50 text-red-600 border-red-100 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                                            )}
                                            title={coupon.isActive !== false ? "انقر للتعطيل" : "انقر للتفعيل"}
                                        >
                                            <div className={cn("w-1.5 h-1.5 rounded-full", coupon.isActive !== false ? "bg-green-500" : "bg-red-500")}></div>
                                            {coupon.isActive !== false ? "نشط" : "معطل"}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-700">{coupon.usedCount || 0}</span>
                                                <span className="text-[10px] text-slate-500 font-bold">عملية استخدام</span>
                                            </div>
                                            <button
                                                onClick={() => handleResetStats(coupon)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                title="تصفير الإحصائيات"
                                            >
                                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleEdit(coupon)}
                                                className="p-3 bg-white border border-slate-100 text-blue-600 rounded-xl shadow-sm hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id, coupon.title)}
                                                className="p-3 bg-white border border-slate-100 text-red-600 rounded-xl shadow-sm hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredCoupons.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                            <TicketIcon size={32} className="text-slate-500" />
                        </div>
                        <p className="text-slate-500 font-black">لا توجد نتائج تطابق بحثك</p>
                    </div>
                )}
            </div>

            {/* Side Slide Panel Form */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={resetForm}></div>
                    <div className="absolute inset-y-0 left-0 max-w-2xl w-full bg-white shadow-2xl animate-in slide-in-from-left duration-500">
                        <div className="h-full flex flex-col">

                            {/* Header */}
                            <div className="px-10 py-8 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                        <TicketIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800">{editingCoupon ? "تعديل العرض" : "إضافة عرض جديد"}</h3>
                                        <p className="text-sm font-medium text-slate-500">تحكم بمحتوى العرض وظهوره للزوار.</p>
                                    </div>
                                </div>
                                <button onClick={resetForm} className="p-3 hover:bg-slate-50 text-slate-500 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar pb-32">
                                <form id="coupon-form" onSubmit={handleSubmit} className="space-y-12">

                                    {/* Store Select & Code */}
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Tag size={16} /> الماركة والكود
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">المتجر</label>
                                                <select
                                                    required
                                                    value={formData.storeId} onChange={e => setFormData({ ...formData, storeId: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-slate-900 appearance-none text-slate-900"
                                                >
                                                    <option value="">-- اختر المتجر --</option>
                                                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">كود الخصم (اختياري)</label>
                                                <input
                                                    type="text"
                                                    value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })}
                                                    placeholder="اتركه فارغاً للعروض"
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-black text-center dir-ltr uppercase tracking-widest placeholder:text-slate-500 text-slate-900"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-orange-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Info size={16} /> تفاصيل العرض
                                        </h4>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">عنوان العرض الرئيسي</label>
                                                <input
                                                    type="text" required
                                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-slate-900"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-black text-slate-700 pr-2">قيمة الخصم (لليوز بالبطاقة)</label>
                                                    <input
                                                        type="text" required
                                                        value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                                                        placeholder="e.g. 20% OFF"
                                                        className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-black text-center dir-ltr text-green-600"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-black text-slate-700 pr-2">تاريخ الانتهاء</label>
                                                    <div className="relative">
                                                        <input
                                                            type="date"
                                                            value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                                            className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-slate-900 text-center"
                                                        />
                                                        <Calendar size={18} className="absolute left-6 top-4.5 text-slate-500 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">وصف إضافي</label>
                                                <textarea
                                                    rows={3}
                                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-slate-900"
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    {/* English Content */}
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Globe size={16} /> English Content (المحتوى الإنجليزي)
                                        </h4>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">Coupon Title (English)</label>
                                                <input
                                                    type="text"
                                                    value={formData.titleEn || ""} onChange={e => setFormData({ ...formData, titleEn: e.target.value })}
                                                    className="w-full bg-indigo-50/50 border-2 border-transparent focus:bg-white focus:border-indigo-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-slate-900" dir="ltr"
                                                    placeholder="e.g. 20% off on all products"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-black text-slate-700 pr-2">Discount Value (English)</label>
                                                    <input
                                                        type="text"
                                                        value={formData.discountValueEn || ""} onChange={e => setFormData({ ...formData, discountValueEn: e.target.value })}
                                                        className="w-full bg-indigo-50/50 border-2 border-transparent focus:bg-white focus:border-indigo-500 py-4 px-6 rounded-2xl outline-none transition-all font-black text-center dir-ltr text-green-600"
                                                        placeholder="e.g. 20% OFF"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-black text-slate-700 pr-2">Description (English)</label>
                                                    <textarea
                                                        rows={2}
                                                        value={formData.descriptionEn || ""} onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })}
                                                        className="w-full bg-indigo-50/50 border-2 border-transparent focus:bg-white focus:border-indigo-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-slate-900" dir="ltr"
                                                        placeholder="e.g. Use this coupon code to get the discount"
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Settings & Toggles */}
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Zap size={16} /> الإعدادات المتقدمة
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { field: "isActive", label: "نشط حالياً", icon: Check },
                                                { field: "isExclusive", label: "عرض حصري", icon: Zap },
                                                { field: "isVerified", label: "تم التحقق", icon: Check },
                                            ].map((toggle) => (
                                                <button
                                                    key={toggle.field}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, [toggle.field]: !formData[toggle.field as keyof Coupon] })}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3",
                                                        formData[toggle.field as keyof Coupon]
                                                            ? "bg-slate-900 border-slate-900 text-white shadow-xl"
                                                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                                                    )}
                                                >
                                                    <toggle.icon size={24} />
                                                    <span className="text-xs font-black">{toggle.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Links */}
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <LinkIcon size={16} /> روابط التتبع
                                        </h4>
                                        <div className="space-y-2">
                                            <label className="text-sm font-black text-slate-700 pr-2">رابط الأفلييت المخصص (Affiliate Link)</label>
                                            <input
                                                type="text"
                                                value={formData.affiliateLink} onChange={e => setFormData({ ...formData, affiliateLink: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-slate-900 dir-ltr text-blue-600"
                                            />
                                        </div>
                                    </div>

                                    {/* Targeted Countries */}
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-green-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Globe size={16} /> الدول المستهدفة
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
                                                        onChange={() => toggleArrayItem("countryCodes", country.code)}
                                                    />
                                                    <img src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/1x1/${country.code}.svg`} className="w-5 h-5 rounded-full object-cover" alt="" />
                                                    <span>{country.name}</span>
                                                    {formData.countryCodes?.includes(country.code) && <Check size={14} className="text-green-400" />}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Categories */}
                                    <div className="space-y-6 pb-20">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Layout size={16} /> التصنيفات
                                        </h4>
                                        <div className="flex gap-2 flex-wrap">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => toggleArrayItem("categories", cat.id)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                                                        formData.categories?.includes(cat.id)
                                                            ? "bg-slate-900 text-white border-slate-900"
                                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                                                    )}
                                                >
                                                    {cat.icon} {cat.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-10 border-t border-slate-200 sticky bottom-0 bg-white/95 backdrop-blur z-10 flex gap-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-5 rounded-3xl border-2 border-slate-100 font-black text-slate-500 hover:bg-slate-50 hover:text-slate-600 transition-all"
                                >إلغاء</button>
                                <button
                                    type="submit"
                                    form="coupon-form"
                                    disabled={isPending}
                                    className="flex-[2] py-5 rounded-3xl bg-blue-600 text-white font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {isPending ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                                    <span>حفظ العرض</span>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
