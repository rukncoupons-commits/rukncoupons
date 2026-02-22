/**
 * CopyButton — ONLY client island for coupon copy interaction.
 * This is the ONLY "use client" component needed for coupons.
 * Everything else is server-rendered HTML.
 */
"use client";
import React, { useState } from "react";

interface CopyButtonProps {
    couponId: string;
    code: string;
    storeUrl?: string;
    storeName: string;
}

export default function CopyButton({ couponId, code, storeUrl, storeName }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);

            // Track copy interaction in background
            fetch('/api/tracking/interaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ couponId, action: 'copy' })
            }).catch(() => { });

            // Open store after copy
            if (storeUrl) {
                setTimeout(() => window.open(storeUrl, "_blank", "noopener,noreferrer"), 400);
            }
            setTimeout(() => setCopied(false), 3000);
        } catch {
            // Fallback: select input
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-white text-sm ${copied
                ? "bg-green-600 shadow-green-200"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                }`}
            aria-label={`نسخ كود خصم ${storeName}: ${code}`}
        >
            {copied ? (
                <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>تم النسخ!</span>
                </>
            ) : (
                <>
                    <span>نسخ الكود</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                </>
            )}
        </button>
    );
}
