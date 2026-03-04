"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Store,
    Ticket,
    FolderTree,
    FileText,
    Image as ImageIcon,
    Megaphone,
    Zap,
    Target,
    Share2,
    Home,
    LogOut,
    ChevronLeft,
    Calendar,
    User as UserIcon,
    Mail
} from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

const menuItems = [
    { label: "لوحة القيادة", icon: LayoutDashboard, href: "/admin", section: "القائمة الرئيسية" },
    { label: "المتاجر", icon: Store, href: "/admin/stores", section: "إدارة المحتوى" },
    { label: "الكوبونات", icon: Ticket, href: "/admin/coupons", section: "إدارة المحتوى" },
    { label: "التصنيفات", icon: FolderTree, href: "/admin/categories", section: "إدارة المحتوى" },
    { label: "المدونة", icon: FileText, href: "/admin/blog", section: "إدارة المحتوى" },
    { label: "سلايدر الرئيسية", icon: ImageIcon, href: "/admin/sliders", section: "الإعلانات والمظهر" },
    { label: "منتجات أمازون", icon: Zap, href: "/admin/affiliate-products", section: "الإعلانات والمظهر" },
    { label: "الإعلانات الجانبية", icon: Megaphone, href: "/admin/banners", section: "الإعلانات والمظهر" },
    { label: "محرك القواعد", icon: Zap, href: "/admin/rules", section: "النظام" },
    { label: "أكواد التتبع", icon: Target, href: "/admin/tracking", section: "النظام" },
    { label: "تواصل اجتماعي", icon: Share2, href: "/admin/social", section: "النظام" },
    { label: "النشرة البريدية", icon: Mail, href: "/admin/newsletter", section: "النظام" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const today = new Date().toLocaleDateString("ar-SA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-right leading-relaxed" dir="rtl">

            {/* Sidebar */}
            <aside className={cn(
                "bg-white border-l border-slate-200 flex flex-col shrink-0 z-30 transition-all duration-300",
                isSidebarOpen ? "w-72" : "w-20"
            )}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
                    <Link href="/admin" className={cn("flex items-center gap-3 text-blue-700 transition-opacity", !isSidebarOpen && "opacity-0 invisible")} aria-label="الرئيسية للوحة التحكم">
                        <div className="w-10 h-10 bg-blue-600 rounded-[1rem] flex items-center justify-center text-xl font-black text-white shadow-lg shadow-blue-500/20 rotate-3">R</div>
                        <h1 className="text-xl font-black tracking-tight">ركن الكوبونات</h1>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
                    >
                        <ChevronLeft className={cn("transition-transform duration-300", !isSidebarOpen && "rotate-180")} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-6 overflow-y-auto scrollbar-hide">
                    {["القائمة الرئيسية", "إدارة المحتوى", "الإعلانات والمظهر", "النظام"].map((section) => {
                        const sectionItems = menuItems.filter(item => item.section === section);
                        return (
                            <div key={section} className="space-y-4">
                                {isSidebarOpen && (
                                    <p className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{section}</p>
                                )}
                                <div className="space-y-1">
                                    {sectionItems.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group relative",
                                                    isActive
                                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                )}
                                                aria-label={item.label}
                                            >
                                                <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                                                {isSidebarOpen && <span className="flex-1 truncate">{item.label}</span>}
                                                {isActive && isSidebarOpen && (
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full absolute left-4"></div>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-slate-100 space-y-3">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors group" aria-label="زيارة الموقع كزائر">
                        <Home className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                        {isSidebarOpen && <span>زيارة الموقع</span>}
                    </Link>
                    <button
                        onClick={() => logoutAction()}
                        className="flex items-center gap-3 px-4 py-3 w-full text-right rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors group"
                    >
                        <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-700" />
                        {isSidebarOpen && <span>تسجيل الخروج</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 relative">

                {/* Top Bar */}
                <header className="bg-white border-b border-slate-200 h-20 flex items-center justify-between px-10 shrink-0 z-20">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                        <h2 className="text-xl font-black text-slate-800">
                            {menuItems.find(item => item.href === pathname)?.label || "لوحة التحكم"}
                        </h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-3 text-sm font-bold text-slate-500 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>{today}</span>
                        </div>
                        <div className="flex items-center gap-3 border-r border-slate-200 pr-6">
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-black text-slate-800">المدير العام</p>
                                <p className="text-[10px] text-slate-400 font-bold">متصل الآن</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg rotate-3">A</div>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-10 scroll-smooth scrollbar-hide">
                    <div className="max-w-7xl mx-auto pb-20">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
