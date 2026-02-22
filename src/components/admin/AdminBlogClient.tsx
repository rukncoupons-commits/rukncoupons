"use client";

import React, { useState, useTransition } from "react";
import SmartEditor from "./SmartEditor";
import { BlogPost, Category, Country, Store } from "@/lib/types";
import {
    FileText, Plus, Edit, Trash2, X, Check, Globe,
    Search, Save, Loader2, Image as ImageIcon,
    Calendar, User, Tag, Layout
} from "lucide-react";
import { createBlogPostAction, updateBlogPostAction, deleteBlogPostAction } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

interface Props {
    initialPosts: BlogPost[];
    categories: Category[];
    countries: Country[];
    stores: Store[];
}

export default function AdminBlogClient({ initialPosts, categories, countries, stores }: Props) {
    const [posts, setPosts] = useState(initialPosts);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isPending, startTransition] = useTransition();
    const [currentSeoScore, setCurrentSeoScore] = useState(100);

    const [formData, setFormData] = useState<Partial<BlogPost>>({
        title: "",
        slug: "",
        content: "",
        image: "",
        category: "",
        author: "ركن الكوبونات",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        views: 0,
        countryCodes: [],
        status: "published",
    });

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const resetForm = () => {
        setFormData({
            title: "",
            slug: "",
            content: "",
            image: "",
            category: "",
            author: "ركن الكوبونات",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            views: 0,
            countryCodes: [],
            status: "published",
        });
        setEditingPost(null);
        setIsFormOpen(false);
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setFormData({ ...post });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Block publish if SEO is weak (Phase 5)
        if (currentSeoScore < 50) {
            alert("لا يمكن نشر المقال بنقاط SEO منخفضة جداً (أقل من 50). يرجى إضافة روابط للمتاجر وروابط داخلية لمعالجة المشكلة.");
            return;
        }

        startTransition(async () => {
            const dataToSave = { ...formData, seoLinkingScore: currentSeoScore };
            if (editingPost) {
                await updateBlogPostAction(editingPost.id, dataToSave);
                setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...dataToSave } as BlogPost : p));
            } else {
                const result = await createBlogPostAction(dataToSave);
                if (result.success && result.id) {
                    setPosts(prev => [{ id: result.id, ...dataToSave } as BlogPost, ...prev]);
                }
            }
            resetForm();
        });
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`هل أنت متأكد من حذف المقال "${title}"؟`)) return;
        startTransition(async () => {
            await deleteBlogPostAction(id);
            setPosts(prev => prev.filter(p => p.id !== id));
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">

            {/* Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="relative w-full md:w-96 group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="بحث في المقالات..."
                        className="w-full bg-white border-2 border-slate-100 pr-12 pl-4 py-4 rounded-3xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold placeholder:text-slate-300"
                    />
                    <Search className="absolute right-4 top-4.5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="w-full md:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4.5 rounded-[1.5rem] font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 text-sm"
                >
                    <Plus size={20} />
                    <span>كتابة مقال جديد</span>
                </button>
            </div>

            {/* Posts List */}
            <div className="grid grid-cols-1 gap-6">
                {filteredPosts.map((post) => (
                    <div
                        key={post.id}
                        className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-6 flex flex-col md:flex-row items-center gap-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
                    >
                        <div className="w-full md:w-48 h-32 rounded-3xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100 relative group-hover:scale-105 transition-transform duration-500">
                            {post.image ? (
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                    <ImageIcon size={48} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-4 py-2">
                            <div className="flex items-center gap-3">
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black border border-blue-100 flex items-center gap-1">
                                    <Tag size={10} />
                                    {categories.find(c => c.slug === post.category)?.name || "بدون تصنيف"}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                    <Calendar size={12} />
                                    {post.createdAt ? post.createdAt.split('T')[0] : ''}
                                </span>
                                {post.countryCodes && post.countryCodes.length > 0 && (
                                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase">
                                        <Globe size={12} />
                                        {post.countryCodes.join(", ")}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-black text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{post.title}</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-[10px] text-white font-black">R</div>
                                <span className="text-xs text-slate-500 font-black">{post.author}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button
                                onClick={() => handleEdit(post)}
                                className="p-4 bg-white border border-slate-100 text-blue-600 rounded-2xl shadow-sm hover:bg-blue-600 hover:text-white transition-all transform hover:rotate-6"
                            >
                                <Edit size={20} />
                            </button>
                            <button
                                onClick={() => handleDelete(post.id, post.title)}
                                className="p-4 bg-white border border-slate-100 text-red-600 rounded-2xl shadow-sm hover:bg-red-600 hover:text-white transition-all transform hover:-rotate-6"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor Panel */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={resetForm}></div>
                    <div className="absolute inset-y-0 left-0 max-w-4xl w-full bg-white shadow-2xl animate-in slide-in-from-left duration-500">
                        <div className="h-full flex flex-col">
                            {/* Header */}
                            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800">{editingPost ? "تعديل المقال" : "كتابة مقال جديد"}</h3>
                                        <p className="text-sm font-medium text-slate-400">شارك المعرفة والعروض مع الزوار.</p>
                                    </div>
                                </div>
                                <button onClick={resetForm} className="p-3 hover:bg-slate-50 text-slate-400 rounded-2xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-12 pb-32">
                                <form id="post-form" onSubmit={handleSubmit} className="space-y-12">

                                    {/* Meta */}
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">المعلومات المرجعية</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">عنوان المقال</label>
                                                <input
                                                    type="text" required
                                                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-lg"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">رابط المقال (Slug)</label>
                                                <input
                                                    type="text" required
                                                    value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">التصنيف</label>
                                                <select
                                                    required
                                                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold appearance-none"
                                                >
                                                    <option value="">اختر تصنيف...</option>
                                                    {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-sm font-black text-slate-700 pr-2 flex items-center gap-2">
                                                    <Globe size={14} /> الدول المستهدفة
                                                </label>
                                                <div className="flex gap-2 flex-wrap">
                                                    {countries.map(country => (
                                                        <label
                                                            key={country.id}
                                                            className={cn(
                                                                "cursor-pointer px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 font-bold text-[10px]",
                                                                formData.countryCodes?.includes(country.code)
                                                                    ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                                                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                                                            )}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={formData.countryCodes?.includes(country.code)}
                                                                onChange={() => {
                                                                    const codes = formData.countryCodes || [];
                                                                    setFormData({
                                                                        ...formData,
                                                                        countryCodes: codes.includes(country.code)
                                                                            ? codes.filter(c => c !== country.code)
                                                                            : [...codes, country.code]
                                                                    });
                                                                }}
                                                            />
                                                            <img src={`https://cdnjs.cloudflare.com/ajax/libs/flag-icons/7.2.3/flags/1x1/${country.code}.svg`} className="w-4 h-4 rounded-full object-cover" alt="" />
                                                            <span>{country.name}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cover & Author */}
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">الوسائط والمؤلف</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">رابط صورة الغلاف</label>
                                                <input
                                                    type="text" required
                                                    value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold dir-ltr text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">الكاتب</label>
                                                <input
                                                    type="text" required
                                                    value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content (Smart Editor & AI Engine) */}
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">محتوى المقال الذكي (Auto-linking & AI Engine)</h4>
                                        <div className="space-y-2">
                                            <SmartEditor
                                                value={formData.content || ""}
                                                onChange={(val) => setFormData({ ...formData, content: val })}
                                                stores={stores}
                                                selectedCountries={formData.countryCodes || []}
                                                onScoreChange={setCurrentSeoScore}
                                                onAiIntentChange={(intent) => {
                                                    if (intent) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            aiIntentType: intent.type,
                                                            aiIntentScore: intent.score,
                                                            aiCommercialWeight: intent.commercialWeight,
                                                            aiDetectedKeywords: intent.keywords,
                                                            aiOptimizationScore: currentSeoScore
                                                        }));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Advanced SEO Settings */}
                                    <div className="space-y-6 pb-20">
                                        <h4 className="text-xs font-black text-green-600 uppercase tracking-widest flex items-center gap-2">إعدادات الـ SEO المتقدمة (اختياري)</h4>
                                        <div className="grid grid-cols-1 gap-6 bg-green-50/30 p-8 rounded-[2rem] border border-green-100/50">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">عنوان الميتا (Meta Title)</label>
                                                <input
                                                    type="text"
                                                    placeholder="يُترك فارغاً لاعتماد عنوان المقال الأساسي..."
                                                    value={formData.seo?.metaTitle || ""}
                                                    onChange={e => setFormData({ ...formData, seo: { ...(formData.seo || {}), metaTitle: e.target.value } as any })}
                                                    className="w-full bg-white border-2 border-transparent focus:border-green-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">وصف الميتا (Meta Description)</label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="يُترك فارغاً لاعتماد مقتطف تلقائي من المحتوى..."
                                                    value={formData.seo?.metaDescription || ""}
                                                    onChange={e => setFormData({ ...formData, seo: { ...(formData.seo || {}), metaDescription: e.target.value } as any })}
                                                    className="w-full bg-white border-2 border-transparent focus:border-green-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-sm resize-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">الرابط المرجعي الأساسي (Canonical URL)</label>
                                                <input
                                                    type="text"
                                                    placeholder="URL لدعم أولوية الفهرسة..."
                                                    value={formData.seo?.canonicalUrl || ""}
                                                    onChange={e => setFormData({ ...formData, seo: { ...(formData.seo || {}), canonicalUrl: e.target.value } as any })}
                                                    className="w-full bg-white border-2 border-transparent focus:border-green-500 py-4 px-6 rounded-2xl outline-none transition-all font-bold text-sm dir-ltr"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-10 border-t border-slate-100 sticky bottom-0 bg-white/95 backdrop-blur z-10 flex gap-4">
                                <button
                                    type="button" onClick={resetForm}
                                    className="flex-1 py-5 rounded-3xl border-2 border-slate-100 font-black text-slate-400 hover:bg-slate-50 transition-all"
                                >إلغاء</button>
                                <button
                                    type="submit" form="post-form"
                                    disabled={isPending}
                                    className="flex-[2] py-5 rounded-3xl bg-blue-600 text-white font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {isPending ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                                    <span>نشر المقال</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
