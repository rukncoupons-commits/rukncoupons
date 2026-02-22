/**
 * NewsletterForm — minimal client island for email subscription.
 * Total JS: ~800 bytes. Only interactive element in Sidebar.
 */
"use client";
import React, { useState } from "react";

export default function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes("@")) { setStatus("error"); setMsg("بريد إلكتروني غير صالح"); return; }
        setStatus("loading");
        try {
            const res = await fetch("/api/newsletter/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            setStatus(data.success ? "success" : "error");
            setMsg(data.message);
            if (data.success) setEmail("");
        } catch {
            setStatus("error");
            setMsg("حدث خطأ، يرجى المحاولة لاحقاً.");
        }
    };

    if (status === "success") {
        return (
            <div className="bg-green-500 text-white text-sm font-bold py-3 px-4 rounded-lg text-center">
                ✅ {msg}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2" noValidate>
            <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                className="w-full px-4 py-2.5 rounded-lg bg-white text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 text-right border-0"
                required
                aria-label="بريدك الإلكتروني"
            />
            {status === "error" && <p className="text-red-300 text-xs">{msg}</p>}
            <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-70 text-white font-bold py-2 rounded-lg text-sm transition-colors"
            >
                {status === "loading" ? "جاري الاشتراك..." : "اشترك الآن"}
            </button>
        </form>
    );
}
