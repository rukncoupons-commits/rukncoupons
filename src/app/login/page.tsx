"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/lib/auth-actions";
import { Lock, User, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) return;

        setIsLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        const result = await loginAction(formData);

        if (result.success) {
            router.push("/admin");
        } else {
            setError(result.error || "Login failed");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-right" dir="rtl">
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-5 duration-500">

                {/* Header */}
                <div className="bg-blue-600 p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner rotate-3">
                        <Lock className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">تسجيل الدخول</h2>
                    <p className="text-blue-100 text-sm font-medium">لوحة تحكم ركن الكوبونات</p>
                </div>

                {/* Form */}
                <div className="p-10">
                    <form onSubmit={handleLogin} className="space-y-8">

                        <div className="space-y-6">
                            {/* Username Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-black text-slate-700 pr-2">اسم المستخدم</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="أدخل اسم المستخدم..."
                                        className="w-full bg-slate-50 text-slate-900 pr-12 pl-4 py-4 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-left dir-ltr font-medium group-focus-within:border-blue-500"
                                    />
                                    <div className="absolute right-4 top-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <User size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="block text-sm font-black text-slate-700 pr-2">كلمة المرور</label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="أدخل كلمة المرور..."
                                        className="w-full bg-slate-50 text-slate-900 pr-12 pl-12 py-4 rounded-2xl border-2 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-left dir-ltr font-medium group-focus-within:border-blue-500"
                                    />
                                    <div className="absolute right-4 top-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-4 top-4.5 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 text-red-600 text-sm font-bold bg-red-50 p-4 rounded-2xl border border-red-100 animate-in slide-in-from-right-2">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !username || !password}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>جاري التحقق...</span>
                                </>
                            ) : (
                                <>
                                    <span>دخول</span>
                                </>
                            )}
                        </button>

                    </form>

                    <div className="mt-8 text-center">
                        <Link href="/" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                            <ArrowLeft size={16} />
                            <span>العودة للصفحة الرئيسية</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
