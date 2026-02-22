"use client";

import React from "react";
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

interface TrendData {
    date: string;
    visitors: number;
    pageviews: number;
}

interface AnalyticsChartsProps {
    trendData: TrendData[];
    deviceSplit: { mobile: number; desktop: number };
    sourceSplit: { direct: number; organic: number; social: number; referral: number };
    clickPositions: { above_fold: number; mid: number; bottom: number };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
const DEVICE_COLORS = ['#3b82f6', '#94a3b8']; // Blue for mobile, Grey for Desktop

export default function AnalyticsChartsClient({ trendData, deviceSplit, sourceSplit, clickPositions }: AnalyticsChartsProps) {

    const deviceData = [
        { name: 'جوال', value: deviceSplit.mobile || 1 }, // default 1 to avoid empty chart in demo
        { name: 'ديسكتوب', value: deviceSplit.desktop || 0 }
    ];

    const sourceData = [
        { name: 'مباشر', value: sourceSplit.direct || 1 },
        { name: 'بحث (Organic)', value: sourceSplit.organic || 0 },
        { name: 'شبكات اجتماعية', value: sourceSplit.social || 0 },
        { name: 'إحالة', value: sourceSplit.referral || 0 },
    ];

    const positionData = [
        { name: 'أعلى الشاشة (Above Fold)', value: clickPositions.above_fold || 0 },
        { name: 'منتصف الشاشة', value: clickPositions.mid || 0 },
        { name: 'أسفل الصفحة', value: clickPositions.bottom || 0 }
    ];

    // Dummy data for empty states
    const mockTrend = trendData.length > 0 ? trendData : [
        { date: '2023-10-01', visitors: 120, pageviews: 250 },
        { date: '2023-10-02', visitors: 150, pageviews: 300 },
        { date: '2023-10-03', visitors: 180, pageviews: 400 },
    ];

    return (
        <div className="space-y-8">
            {/* Main Trend Chart */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 mb-6">نمو الزيارات والمشاهدات</h3>
                <div className="h-[350px] w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPage" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Legend />
                            <Area type="monotone" dataKey="pageviews" name="المشاهدات" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPage)" />
                            <Area type="monotone" dataKey="visitors" name="الزوار" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Device Split */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
                    <h3 className="text-lg font-black text-slate-800 w-full mb-4">الأجهزة المستخدمة</h3>
                    <div className="h-[250px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {deviceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Traffic Source */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
                    <h3 className="text-lg font-black text-slate-800 w-full mb-4">مصادر الزيارات</h3>
                    <div className="h-[250px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={sourceData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                                    {sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Click Positions */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
                    <h3 className="text-lg font-black text-slate-800 w-full mb-4">أماكن النقرات الفعالة</h3>
                    <div className="h-[250px] w-full" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={positionData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} fontSize={10} />
                                <Tooltip />
                                <Bar dataKey="value" name="عدد النقرات" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
