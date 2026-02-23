import React from "react";
import {
    getStores,
    getCoupons,
    getRules,
    getBlogPosts,
    getCountries,
    getCategories
} from "@/lib/data-service";
import {
    Store,
    Ticket,
    Zap,
    FileText,
    TrendingUp,
    AlertTriangle,
    ArrowRight,
    Plus
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const stores = await getStores();
    const coupons = await getCoupons();
    const rules = await getRules();
    const posts = await getBlogPosts();

    // Calculate stats
    const activeStores = stores.filter(s => s.isActive !== false).length;
    const activeCoupons = coupons.filter(c => c.isActive !== false).length;
    const totalUsage = coupons.reduce((acc, c) => acc + (c.usedCount || 0) + (c.viewCount || 0), 0);

    // Check for expired but active coupons
    const now = new Date();
    const expiredActiveCoupons = coupons.filter(c => {
        if (!c.isActive || !c.expiryDate) return false;
        const exp = new Date(c.expiryDate);
        return exp < now;
    });

    const stats = [
        { label: "المتاجر النشطة", value: activeStores, total: stores.length, icon: Store, color: "bg-purple-50 text-purple-600", detail: "متجر مسجل في النظام" },
        { label: "كوبونات نشطة", value: activeCoupons, total: coupons.length, icon: Ticket, color: "bg-green-50 text-green-600", detail: "كوبون وعرض فعال حالياً" },
        { label: "إجمالي التفاعل", value: totalUsage.toLocaleString(), icon: TrendingUp, color: "bg-blue-50 text-blue-600", detail: "عمليات نسخ ومشاهدة" },
        { label: "القواعد النشطة", value: rules.length, icon: Zap, color: "bg-yellow-50 text-yellow-600", detail: "قاعدة تحكم تلقائية نشطة" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-500">

            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2">أهلاً بك مرة أخرى 👋</h1>
                    <p className="text-slate-500 font-medium">إليك نظرة سريعة على أداء موقع ركن الكوبونات اليوم.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/coupons" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-black shadow-xl shadow-blue-500/20 transition-all active:scale-95 text-sm" aria-label="إضافة كوبون جديد">
                        <Plus size={18} />
                        <span>إضافة كوبون جديد</span>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col group hover:scale-[1.02] transition-transform duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("p-4 rounded-2xl shadow-inner", stat.color)}>
                                <stat.icon size={28} />
                            </div>
                            {stat.total !== undefined && (
                                <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">PRO</div>
                            )}
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-black mb-1">{stat.label}</p>
                            <p className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                        </div>
                        <div className="mt-auto pt-6 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-bold">{stat.detail}</span>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight size={14} className="text-slate-400" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Alerts */}
            {expiredActiveCoupons.length > 0 && (
                <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-red-500/5">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h2 className="font-black text-xl text-red-900 mb-1">تنبيه كوبونات منتهية</h2>
                            <p className="text-sm text-red-700 font-medium">يوجد {expiredActiveCoupons.length} كوبون منتهي الصلاحية وما زال نشطاً في الموقع. يرجى مراجعتها فوراً.</p>
                        </div>
                    </div>
                    <Link href="/admin/coupons?filter=expired" className="bg-white border-2 border-red-200 text-red-600 px-8 py-3.5 rounded-2xl text-sm font-black hover:bg-red-50 transition-all active:scale-95 shadow-md">
                        مراجعة الآن
                    </Link>
                </div>
            )}

            {/* Recent Activity / Quick Links (Placeholder for now) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <Ticket className="text-blue-600" size={24} />
                        <span>آخر الكوبونات المضافة</span>
                    </h2>
                    <div className="space-y-4">
                        {coupons.slice(0, 5).map((coupon, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold shrink-0">
                                        {stores.find(s => s.id === coupon.storeId)?.name.charAt(0) || "C"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-800 truncate">{coupon.title}</p>
                                        <p className="text-xs text-slate-400 font-bold">{stores.find(s => s.id === coupon.storeId)?.name}</p>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-300 uppercase">{coupon.type}</p>
                                    <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors ml-auto mt-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link href="/admin/coupons" className="mt-8 flex items-center justify-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700 py-4 rounded-2xl border-2 border-dashed border-slate-100 hover:border-blue-100 transition-all" aria-label="عرض كافة الكوبونات">
                        عرض كل الكوبونات
                    </Link>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <Store className="text-purple-600" size={24} />
                        <span>أبرز المتاجر</span>
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {stores.slice(0, 6).map((store, i) => (
                            <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-xl transition-all duration-300">
                                <img src={store.logoUrl} alt={store.name} className="w-16 h-16 rounded-2xl object-contain bg-white p-2 border border-slate-100 mb-4 group-hover:scale-110 transition-transform" />
                                <p className="text-sm font-black text-slate-800 mb-1">{store.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{coupons.filter(c => c.storeId === store.id).length} كوبون</p>
                            </div>
                        ))}
                    </div>
                    <Link href="/admin/stores" className="mt-8 flex items-center justify-center gap-2 text-sm font-black text-purple-600 hover:text-purple-700 py-4 rounded-2xl border-2 border-dashed border-slate-100 hover:border-purple-100 transition-all" aria-label="إدارة كافة المتاجر">
                        إدارة المتاجر
                    </Link>
                </div>
            </div>

        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
