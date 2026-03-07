/**
 * CopyButton — Client island for coupon copy interaction.
 * Shows the coupon code directly in a dashed box.
 * Click to copy. No auto store redirect.
 */
"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

interface CopyButtonProps {
    couponId: string;
    code: string;
    storeName: string;
}

export default function CopyButton({ couponId, code, storeName }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);
    const pathname = usePathname();
    const isEn = pathname.startsWith("/en");

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

            setTimeout(() => setCopied(false), 3000);
        } catch {
            // Fallback: select input
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`w-full group cursor-pointer border-2 border-dashed rounded-xl py-3 px-4 flex items-center justify-center gap-3 transition-all active:scale-95 ${copied
                ? "border-green-400 bg-green-50"
                : "border-blue-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                }`}
            aria-label={isEn ? `Copy ${storeName} discount code: ${code}` : `نسخ كود خصم ${storeName}: ${code}`}
        >
            <span className={`font-mono font-black text-base tracking-widest ${copied ? "text-green-600" : "text-blue-700"}`} dir="ltr">
                {code}
            </span>
            {copied ? (
                <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {isEn ? "Copied!" : "تم النسخ!"}
                </span>
            ) : (
                <span className="flex items-center gap-1 text-blue-400 group-hover:text-blue-600 text-xs font-bold transition-colors">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    {isEn ? "Copy" : "نسخ"}
                </span>
            )}
        </button>
    );
}
