"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search, Edit2, Trash2, X, Star, Link as LinkIcon, Image as ImageIcon, Save, Tag } from "lucide-react";
import { AffiliateProduct } from "@/lib/types";
import { createAffiliateProductAction, updateAffiliateProductAction, deleteAffiliateProductAction } from "@/lib/admin-actions";

interface AdminAffiliateProductsClientProps {
    initialProducts: AffiliateProduct[];
    stores: { id: string; name: string; slug: string }[];
}

const emptyProduct: Partial<AffiliateProduct> = {
    title: "",
    description: "",
    imageUrl: "",
    price: "",
    oldPrice: "",
    discountPercent: 0,
    rating: 4.5,
    reviewsCount: 1000,
    affiliateUrl: "",
    badge: "",
    section: "none",
    order: 0,
    isActive: true,
    countryCodes: ["sa", "ae", "eg", "kw", "bh", "om", "qa"], // Default to all
    storeId: "",
};

export default function AdminAffiliateProductsClient({ initialProducts, stores }: AdminAffiliateProductsClientProps) {
    const [products, setProducts] = useState<AffiliateProduct[]>(initialProducts);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<AffiliateProduct>>(emptyProduct);
    const [searchQuery, setSearchQuery] = useState("");

    // Setup an initial default store if available
    const defaultStoreId = stores.find(s => s.slug.toLowerCase().includes('amazon'))?.id || stores[0]?.id || "";

    const openDrawer = (product?: AffiliateProduct) => {
        if (product) {
            setEditingProduct(product);
        } else {
            setEditingProduct({ ...emptyProduct, storeId: defaultStoreId });
        }
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setEditingProduct(emptyProduct);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingProduct.id) {
                await updateAffiliateProductAction(editingProduct.id, editingProduct);
                setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...editingProduct } as AffiliateProduct : p));
            } else {
                const res = await createAffiliateProductAction(editingProduct);
                if (res.success && res.id) {
                    const newProd = { ...editingProduct, id: res.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as AffiliateProduct;
                    setProducts([...products, newProd]);
                }
            }
            closeDrawer();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟")) return;
        setIsSubmitting(true);
        try {
            await deleteAffiliateProductAction(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCountryToggle = (code: string) => {
        const currentCodes = editingProduct.countryCodes || [];
        if (currentCodes.includes(code)) {
            setEditingProduct({ ...editingProduct, countryCodes: currentCodes.filter(c => c !== code) });
        } else {
            setEditingProduct({ ...editingProduct, countryCodes: [...currentCodes, code] });
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase().trim()));
    }, [products, searchQuery]);

    // Available country list
    const COUNTRIES = [
        { code: 'sa', name: 'السعودية', flag: '🇸🇦' },
        { code: 'ae', name: 'الإمارات', flag: '🇦🇪' },
        { code: 'eg', name: 'مصر', flag: '🇪🇬' },
        { code: 'kw', name: 'الكويت', flag: '🇰🇼' },
        { code: 'bh', name: 'البحرين', flag: '🇧🇭' },
        { code: 'qa', name: 'قطر', flag: '🇶🇦' },
        { code: 'om', name: 'عمان', flag: '🇴🇲' },
    ];

    return (
        <div className="w-full" dir="rtl">
            {/* Header / Actions */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full md:w-96">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ابحث عن منتج..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pr-12 pl-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                </div>
                <button
                    onClick={() => openDrawer()}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    إضافة منتج جديد
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="text-slate-400 text-xs font-black uppercase tracking-wider border-b border-slate-100">
                                <th className="p-4 rounded-tr-2xl">صورة</th>
                                <th className="p-4">البيانات</th>
                                <th className="p-4">القسم</th>
                                <th className="p-4">إحصائيات</th>
                                <th className="p-4 rounded-tl-2xl w-32">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="w-16 h-16 rounded-xl border border-slate-100 bg-white overflow-hidden p-1 flex items-center justify-center relative">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.title} className="max-w-full max-h-full object-contain" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-slate-300" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-sm line-clamp-1">{product.title}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{product.price || '-'}</span>
                                                {product.badge && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{product.badge}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                                            {product.section === 'top_deals' ? '🔥 صفقات' :
                                                product.section === 'trending' ? '⭐ مقترحة' :
                                                    product.section === 'comparison' ? '📊 مقارنة' : 'غير محدد'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 text-xs font-medium text-slate-500">
                                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {product.rating} ({product.reviewsCount})</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openDrawer(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(product.id!)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-400">
                                        لا توجد منتجات مسجلة حتى الآن.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal / Drawer */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={closeDrawer} />
                    <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-left-8">

                        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800">
                                {editingProduct.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                            </h2>
                            <button onClick={closeDrawer} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-8">
                            {/* Visual & Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2"><Tag className="w-4 h-4" /> البيانات الأساسية</h3>

                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">اسم المنتج الكامل</label>
                                        <input required type="text" value={editingProduct.title} onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثال: أيفون 15 برو ماكس (256 جيجابايت)" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">رابط الصورة (URL)</label>
                                        <div className="flex items-center gap-3">
                                            {editingProduct.imageUrl ? (
                                                <div className="w-12 h-12 shrink-0 rounded-lg border border-slate-200 p-1 bg-white">
                                                    <img src={editingProduct.imageUrl.trim()} className="w-full h-full object-contain" alt="Preview" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 shrink-0 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
                                                    <ImageIcon className="w-5 h-5 text-slate-300" />
                                                </div>
                                            )}
                                            <input required type="url" value={editingProduct.imageUrl} onChange={e => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })} className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://m.media-amazon.com/images/..." />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">رابط الأفلييت المباشر</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute right-4 top-3.5 w-4 h-4 text-slate-400" />
                                            <input required type="url" value={editingProduct.affiliateUrl} onChange={e => setEditingProduct({ ...editingProduct, affiliateUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://amzn.to/..." text-left dir="ltr" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Descriptions & Marketing */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">وصف مختصر (3-4 سطور)</label>
                                        <textarea required rows={3} value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed" placeholder="أقوى هاتف ذكي بتصميم التيتانيوم الجديد وكاميرا احترافية من أبل..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">السعر الحالي</label>
                                        <input type="text" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="4,899 ريال" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">السعر القديم (للمقارنة)</label>
                                        <input type="text" value={editingProduct.oldPrice} onChange={e => setEditingProduct({ ...editingProduct, oldPrice: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="5,699 ريال" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">نسبة الخصم (%)</label>
                                        <input type="number" min={0} max={100} value={editingProduct.discountPercent} onChange={e => setEditingProduct({ ...editingProduct, discountPercent: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="14" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">شارة مميزة (Badge)</label>
                                        <input type="text" value={editingProduct.badge} onChange={e => setEditingProduct({ ...editingProduct, badge: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="أفضل مبيعاً, خصم حصري..." />
                                    </div>
                                </div>
                            </div>

                            {/* Trust Signals */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">مؤشرات الثقة (SEO/CTR)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">التقييم (من 5)</label>
                                        <input type="number" step="0.1" min={1} max={5} required value={editingProduct.rating} onChange={e => setEditingProduct({ ...editingProduct, rating: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">عدد المراجعات السابقة</label>
                                        <input type="number" required value={editingProduct.reviewsCount} onChange={e => setEditingProduct({ ...editingProduct, reviewsCount: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Targeting & Placement */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider">الاستهداف والمكان</h3>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">المتجر المربوط</label>
                                    <select required value={editingProduct.storeId} onChange={e => setEditingProduct({ ...editingProduct, storeId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="">اختر المتجر...</option>
                                        {stores.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">القسم للعرض</label>
                                    <select required value={editingProduct.section} onChange={e => setEditingProduct({ ...editingProduct, section: e.target.value as any })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="none">محتوى مخصص في مقال</option>
                                        <option value="top_deals">عروض اليوم (الصفحة الرئيسية للمتجر)</option>
                                        <option value="trending">مقترحات شائعة (الشريط السفلي)</option>
                                        <option value="comparison">جدول المقارنات المباشر</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">الدول المستهدفة</label>
                                    <div className="flex flex-wrap gap-2">
                                        {COUNTRIES.map(country => {
                                            const isSelected = editingProduct.countryCodes?.includes(country.code);
                                            return (
                                                <button
                                                    key={country.code}
                                                    type="button"
                                                    onClick={() => handleCountryToggle(country.code)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border flex items-center gap-1.5
                                                        ${isSelected ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}
                                                    `}
                                                >
                                                    <span>{country.flag}</span>
                                                    <span>{country.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 font-medium">عدم اختيار أي دولة يعني أن المنتج لن يظهر. افتراضياً يظهر في جميع الدول المحددة.</p>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? "جاري الحفظ..." : "حفظ المنتج للنشـر"}
                                    {!isSubmitting && <Save className="w-5 h-5" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeDrawer}
                                    className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
