"use client";

import React, { useState, useEffect } from "react";
import { NewsletterSubscriber } from "@/lib/newsletter-service";
import { Mail, Send, Settings, Trash2, Users, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

interface Props {
    initialSubscribers: NewsletterSubscriber[];
}

export default function AdminNewsletterClient({ initialSubscribers }: Props) {
    const [subscribers, setSubscribers] = useState(initialSubscribers);
    const [activeTab, setActiveTab] = useState<"subscribers" | "compose" | "settings">("subscribers");

    // Compose state
    const [subject, setSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

    // Settings state
    const [settings, setSettings] = useState({
        smtpHost: "", smtpPort: 587, smtpUser: "", smtpPass: "", senderName: "ركن الكوبونات", senderEmail: "",
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [settingsSaved, setSettingsSaved] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const activeCount = subscribers.filter(s => s.isActive).length;

    useEffect(() => {
        fetch("/api/newsletter/settings")
            .then(r => r.json())
            .then(data => { if (data.smtpHost) setSettings(data); });
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("هل تريد حذف هذا المشترك نهائياً؟")) return;
        await fetch(`/api/newsletter/subscribers/${id}`, { method: "DELETE" });
        setSubscribers(prev => prev.filter(s => s.id !== id));
    };

    const handleSend = async () => {
        setIsSending(true);
        setSendResult(null);
        const res = await fetch("/api/newsletter/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subject, htmlContent: emailBody }),
        });
        const data = await res.json();
        setSendResult({
            success: data.success,
            message: data.success
                ? `✅ تم إرسال الرسالة إلى ${data.sent} مشترك بنجاح!`
                : `❌ ${data.message || data.error}`,
        });
        setIsSending(false);
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        await fetch("/api/newsletter/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
        });
        setIsSavingSettings(false);
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
    };

    return (
        <div className="space-y-8" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 mb-1">إدارة النشرة البريدية</h2>
                    <p className="text-slate-500">
                        <span className="font-bold text-blue-600">{activeCount}</span> مشترك نشط من أصل{" "}
                        <span className="font-bold">{subscribers.length}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    {(["subscribers", "compose", "settings"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"}`}
                        >
                            {tab === "subscribers" ? <><Users className="inline w-4 h-4 ml-1" />المشتركون</> :
                                tab === "compose" ? <><Send className="inline w-4 h-4 ml-1" />إرسال رسالة</> :
                                    <><Settings className="inline w-4 h-4 ml-1" />إعدادات SMTP</>}
                        </button>
                    ))}
                </div>
            </div>

            {/* ==== SUBSCRIBERS TAB ==== */}
            {activeTab === "subscribers" && (
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {subscribers.length === 0 ? (
                        <div className="p-16 text-center">
                            <Mail className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold">لا يوجد مشتركون بعد.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="text-right px-6 py-4 text-sm font-black text-slate-600">البريد الإلكتروني</th>
                                    <th className="text-right px-6 py-4 text-sm font-black text-slate-600">تاريخ الاشتراك</th>
                                    <th className="text-right px-6 py-4 text-sm font-black text-slate-600">الحالة</th>
                                    <th className="text-right px-6 py-4 text-sm font-black text-slate-600">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.map((sub) => (
                                    <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-slate-700">{sub.email}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(sub.subscribedAt).toLocaleDateString("ar-SA")}
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.isActive ? (
                                                <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-3 py-1 rounded-full w-fit">
                                                    <CheckCircle className="w-3.5 h-3.5" /> نشط
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-red-500 font-bold text-xs bg-red-50 px-3 py-1 rounded-full w-fit">
                                                    <XCircle className="w-3.5 h-3.5" /> ملغى
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(sub.id!)}
                                                className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                title="حذف"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ==== COMPOSE TAB ==== */}
            {activeTab === "compose" && (
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700 font-medium">
                        <Mail className="inline w-4 h-4 ml-1" />
                        سيتم إرسال هذه الرسالة إلى <strong>{activeCount}</strong> مشترك نشط.
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-700 mb-2">موضوع الرسالة</label>
                        <input
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="مثال: 🔥 عروض رمضان الحصرية - خصم يصل إلى 70%"
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-black text-slate-700 mb-2">محتوى الرسالة (HTML أو نص عادي)</label>
                        <textarea
                            value={emailBody}
                            onChange={e => setEmailBody(e.target.value)}
                            placeholder={`<div dir="rtl">\n  <h2>عروض مميزة هذا الأسبوع</h2>\n  <p>أعزاءنا المشتركين، لدينا اليوم أقوى العروض...</p>\n</div>`}
                            rows={12}
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-mono focus:border-blue-500 outline-none transition resize-none"
                        />
                    </div>

                    {sendResult && (
                        <div className={`p-4 rounded-xl text-sm font-bold ${sendResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {sendResult.message}
                        </div>
                    )}

                    <button
                        onClick={handleSend}
                        disabled={isSending || !subject || !emailBody}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        {isSending ? "جاري الإرسال..." : <><Send className="w-4 h-4" /> إرسال للمشتركين</>}
                    </button>
                </div>
            )}

            {/* ==== SETTINGS TAB ==== */}
            {activeTab === "settings" && (
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 space-y-6">
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700 font-medium">
                        <Settings className="inline w-4 h-4 ml-1" />
                        لإرسال الرسائل، قم بإدخال بيانات SMTP. للـ Gmail: استخدم <code className="bg-white px-1 rounded font-mono">smtp.gmail.com</code> مع <a href="https://myaccount.google.com/apppasswords" target="_blank" className="underline">كلمة مرور التطبيق</a>.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: "SMTP Host", key: "smtpHost", placeholder: "smtp.gmail.com", type: "text" },
                            { label: "SMTP Port", key: "smtpPort", placeholder: "587", type: "number" },
                            { label: "SMTP User (البريد)", key: "smtpUser", placeholder: "your@gmail.com", type: "email" },
                            { label: "اسم المرسل", key: "senderName", placeholder: "ركن الكوبونات", type: "text" },
                            { label: "بريد المرسل", key: "senderEmail", placeholder: "no-reply@rukncoupons.com", type: "email" },
                        ].map(field => (
                            <div key={field.key}>
                                <label className="block text-sm font-black text-slate-700 mb-2">{field.label}</label>
                                <input
                                    type={field.type}
                                    value={(settings as any)[field.key]}
                                    onChange={e => setSettings(prev => ({ ...prev, [field.key]: field.type === "number" ? +e.target.value : e.target.value }))}
                                    placeholder={field.placeholder}
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition"
                                />
                            </div>
                        ))}

                        <div>
                            <label className="block text-sm font-black text-slate-700 mb-2">SMTP Password (كلمة المرور)</label>
                            <div className="relative">
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={settings.smtpPass}
                                    onChange={e => setSettings(prev => ({ ...prev, smtpPass: e.target.value }))}
                                    placeholder="كلمة مرور التطبيق"
                                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition pl-12"
                                />
                                <button onClick={() => setShowPass(!showPass)} className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600">
                                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSaveSettings}
                        disabled={isSavingSettings}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                        {isSavingSettings ? "جاري الحفظ..." : settingsSaved ? "✅ تم الحفظ!" : <><Settings className="w-4 h-4" /> حفظ الإعدادات</>}
                    </button>
                </div>
            )}
        </div>
    );
}
