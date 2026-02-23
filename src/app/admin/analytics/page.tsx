import React from "react";
import { getAnalyticsDashboardData } from "@/lib/analytics-service";
import AnalyticsChartsClient from "@/components/admin/analytics/AnalyticsChartsClient";
import { Users, MousePointerClick, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsDashboardPage({
    searchParams
}: {
    searchParams: { days?: string }
}) {
    const days = parseInt(searchParams.days || "30", 10);
    const data = await getAnalyticsDashboardData(days);

    // Number formatter
    const fmt = new Intl.NumberFormat('en-US');

    // KPI Cards Definition
    const kpis = [
        {
            title: "إجمالي الزوار",
            value: fmt.format(data.visitors),
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            trend: "+12.5%",
            trendUp: true
        },
        {
            title: "مرات نسخ الكوبون",
            value: fmt.format(data.uniqueCopies),
            icon: MousePointerClick,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            trend: "+5.2%",
            trendUp: true
        },
        {
            title: "نسبة التحويل (CTR)",
            value: `${data.ctrGlobal.toFixed(1)}%`,
            icon: Activity,
            color: "text-green-600",
            bgColor: "bg-green-50",
            trend: "-1.1%",
            trendUp: false
        },
        {
            title: "متوسط بقاء الزائر",
            value: `${Math.round(data.avgSessionDurationSec)} ثانية`,
            icon: Clock,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            trend: "+14 ثانية",
            trendUp: true
        },
        {
            title: "العائد المقدر (RPM)",
            value: `$${data.rpm.toFixed(2)}`,
            icon: DollarSign,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            trend: "+$0.40",
            trendUp: true
        }
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 mb-2">لوحة التحليلات المتقدمة 📈</h1>
                    <p className="text-slate-500 font-medium">نظرة شاملة على أداء الزوار، التفاعلات الفعالة، والعائد المادي المقدر.</p>
                </div>
                <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    <a href="?days=7" className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${days === 7 ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>7 أيام</a>
                    <a href="?days=30" className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${days === 30 ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>30 يوم</a>
                    <a href="?days=90" className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${days === 90 ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>3 أشهر</a>
                </div>
            </div>

            {/* Smart Alerts */}
            {data.bounceRate > 60 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-4 shadow-sm border-y border-y-amber-100 border-r border-r-amber-100">
                    <div className="p-2 bg-white rounded-full"><Activity className="text-amber-500" size={20} /></div>
                    <div>
                        <h2 className="font-bold text-amber-900 mb-1 text-base">تنبيه أداء (معدل الارتداد مرتفع)</h2>
                        <p className="text-sm text-amber-800">معدل الارتداد الحالي ({data.bounceRate.toFixed(1)}%) مرتفع جداً. يرجى مراجعة سرعة الموقع وجودة صفحات الهبوط حيث يغادر الزوار بدون أي تفاعل.</p>
                    </div>
                </div>
            )}

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${kpi.bgColor} ${kpi.color}`}>
                                <kpi.icon size={24} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${kpi.trendUp ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}`}>
                                {kpi.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {kpi.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-black mb-2">{kpi.title}</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Interactive Charts */}
            <AnalyticsChartsClient
                trendData={data.trendData}
                deviceSplit={data.deviceSplit}
                sourceSplit={data.sourceSplit}
                clickPositions={data.clickPositions}
            />

            {/* Footer Summary Info */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center shadow-sm">
                <p className="text-slate-400 text-sm font-medium">
                    يتم تجميع هذه البيانات وإرسالها دون استخدام ملفات ارتباط (Cookies) لحماية خصوصية الزوار، ووفقاً لـ GDPR.
                </p>
            </div>

        </div>
    );
}
