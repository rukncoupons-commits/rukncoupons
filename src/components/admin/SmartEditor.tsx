"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Store } from "@/lib/types";
import { type IntentResult } from "@/lib/ai-engine";
import {
    Search, Link as LinkIcon, Tag, AlertCircle, CheckCircle,
    Bold, Italic, Strikethrough, Underline as UnderlineIcon,
    List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
    Link2, ImageIcon, Heading2, Heading3, Quote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

interface SmartEditorProps {
    value: string;
    onChange: (val: string) => void;
    stores: Store[];
    selectedCountries: string[];
    onScoreChange?: (score: number) => void;
    onAiIntentChange?: (intent: IntentResult | null) => void;
}

interface StoreMatch {
    store: Store;
    index: number;
    word: string;
}

// --- Toolbar Component ---
const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL:', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        const url = window.prompt('URL Image:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    return (
        <div className="flex flex-wrap items-center gap-1 p-3 bg-white border-b border-slate-100 rounded-t-[2rem]">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={cn("p-2 rounded-xl transition-colors", editor.isActive('bold') ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-800")} type="button"><Bold size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={cn("p-2 rounded-xl transition-colors", editor.isActive('italic') ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-800")} type="button"><Italic size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={cn("p-2 rounded-xl transition-colors", editor.isActive('underline') ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-800")} type="button"><UnderlineIcon size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={cn("p-2 rounded-xl transition-colors", editor.isActive('strike') ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-800")} type="button"><Strikethrough size={16} /></button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={cn("p-2 rounded-xl transition-colors", editor.isActive('heading', { level: 2 }) ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-800")} type="button"><Heading2 size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={cn("p-2 rounded-xl transition-colors", editor.isActive('heading', { level: 3 }) ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-800")} type="button"><Heading3 size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={cn("p-2 rounded-xl transition-colors", editor.isActive('blockquote') ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-800")} type="button"><Quote size={16} /></button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={cn("p-2 rounded-xl transition-colors", editor.isActive('bulletList') ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-800")} type="button"><List size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={cn("p-2 rounded-xl transition-colors", editor.isActive('orderedList') ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-800")} type="button"><ListOrdered size={16} /></button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={cn("p-2 rounded-xl transition-colors", editor.isActive({ textAlign: 'right' }) ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-800")} type="button"><AlignRight size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={cn("p-2 rounded-xl transition-colors", editor.isActive({ textAlign: 'center' }) ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-800")} type="button"><AlignCenter size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={cn("p-2 rounded-xl transition-colors", editor.isActive({ textAlign: 'left' }) ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-800")} type="button"><AlignLeft size={16} /></button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={setLink} className={cn("p-2 rounded-xl transition-colors", editor.isActive('link') ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-800")} type="button"><Link2 size={16} /></button>
            <button onClick={addImage} className="p-2 rounded-xl hover:bg-slate-100 text-slate-800 transition-colors" type="button"><ImageIcon size={16} /></button>
        </div>
    );
};

export default function SmartEditor({ value, onChange, stores, selectedCountries, onScoreChange, onAiIntentChange }: SmartEditorProps) {
    const [suggestions, setSuggestions] = useState<StoreMatch[]>([]);
    const [seoScore, setSeoScore] = useState(100);
    const [seoErrors, setSeoErrors] = useState<string[]>([]);

    // Setup TipTap Editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            ImageExtension.configure({ HTMLAttributes: { class: 'rounded-xl max-w-full h-auto my-4' } }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline font-bold',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                defaultAlignment: 'right'
            }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[400px] w-full max-w-none p-8 text-slate-900',
                dir: 'rtl'
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    const [aiIntent, setAiIntent] = useState<IntentResult | null>(null);

    // Debounce processing
    useEffect(() => {
        if (!editor) return;
        const html = editor.getHTML();
        const text = editor.getText();
        // Since we don't have direct access to 'title' here easily without props, 
        // we'll pass an empty string or basic fallback for now to the intent detector.
        // In a real app we'd pass the actual article title down.
        const fallbackTitle = "المقال";

        const timer = setTimeout(() => {
            analyzeContent(html, text, fallbackTitle);
        }, 800);
        return () => clearTimeout(timer);
    }, [value, selectedCountries, stores, editor]);

    // Handle initial value sync if async data loads
    useEffect(() => {
        if (editor && value && editor.getHTML() !== value && editor.isEmpty) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const analyzeContent = (htmlText: string, plainText: string, title?: string) => {
        if (!htmlText || htmlText === '<p></p>') {
            setSuggestions([]);
            setSeoScore(100);
            setSeoErrors([]);
            setAiIntent(null);
            if (onScoreChange) onScoreChange(100);
            if (onAiIntentChange) onAiIntentChange(null);
            return;
        }

        // 1. Store Detection (Phase 1)
        const availableStores = selectedCountries.length > 0
            ? stores.filter(s => s.countryCodes?.some(c => selectedCountries.includes(c)))
            : stores;

        const found: StoreMatch[] = [];
        const linkedStoreIds = new Set<string>();

        // Find already linked stores in HTML
        const linkedMatches = htmlText.matchAll(/data-store-id="([^"]+)"/g);
        for (const match of linkedMatches) {
            linkedStoreIds.add(match[1]);
        }
        const embedMatches = htmlText.matchAll(/\[COUPON_BLOCK:\s*([^\]]+)\]/gi);
        for (const match of embedMatches) {
            const s = stores.find(s => s.slug === match[1]);
            if (s) linkedStoreIds.add(s.id);
        }

        // Search for store names in plain text to suggest
        for (const store of availableStores) {
            if (linkedStoreIds.has(store.id)) continue;

            const storeNameEn = (store as any).nameEn || "";
            const namesToMatch = [store.name, storeNameEn].filter(Boolean) as string[];
            for (const name of namesToMatch) {
                if (name.length < 3) continue;
                const regex = new RegExp(`(?:^|[\\s>])(${escapeRegex(name)})(?=[\\s<.,!؟] |$)`, 'gi');
                const match = regex.exec(plainText);
                if (match && match.index !== undefined) {
                    found.push({ store, index: match.index, word: match[1] });
                    break;
                }
            }
        }
        setSuggestions(found.slice(0, 3));

        // 2. AI Intent Detection (Phase 8)
        import('@/lib/ai-engine').then(({ detectSearchIntent }) => {
            const intentRes = detectSearchIntent(plainText, title || "");
            setAiIntent(intentRes);
            if (onAiIntentChange) onAiIntentChange(intentRes);

            // 3. SEO Scoring (Phase 4, 5)
            let score = 100;
            const errors: string[] = [];

            const linkMatches = Array.from(htmlText.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi));
            const internalLinks = linkMatches.filter(m => m[1].startsWith('/'));

            if (internalLinks.length < 3) {
                score -= 20;
                errors.push(`المقال يحتوي على ${internalLinks.length} روابط داخلية. يُفضل إضافة 3 على الأقل.`);
            }

            if (linkedStoreIds.size === 0) {
                score -= 30;
                errors.push("يجب ربط المقال بمتجر واحد على الأقل (نصياً أو كود خصم).");
            }

            const anchorCounts = new Map<string, number>();
            internalLinks.forEach(m => {
                const anchor = m[2].trim().toLowerCase();
                anchorCounts.set(anchor, (anchorCounts.get(anchor) || 0) + 1);
            });

            for (const [anchor, count] of anchorCounts.entries()) {
                if (count > 2) {
                    score -= 10;
                    errors.push(`تكرار نص الرابط "${anchor}" ${count} مرات (Over-optimization).`);
                }
            }

            // Adjust score based on Intent Mismatch (e.g., Transactional intent without a coupon embed)
            if (intentRes.type === 'transactional' && embedMatches.next().done) {
                score -= 15;
                errors.push("نية البحث 'شرائية' (Transactional) لكن لم يتم تضمين أي كود خصم (Coupon Block).");
            }

            setSeoScore(Math.max(0, score));
            setSeoErrors(errors);
            if (onScoreChange) onScoreChange(Math.max(0, score));
        });
    };

    const escapeRegex = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const handleEmbedCoupon = (store: Store, word: string) => {
        if (!editor) return;
        const primaryCountry = selectedCountries.length > 0 ? selectedCountries[0] : 'sa';

        // Find the word in text and replace it with a Node.
        // TipTap doesn't have an easy "replace string" command natively without ranges, 
        // so we just inject the macro at the current cursor or end.

        const linkHtml = `<a href="/${primaryCountry}/${store.slug}" data-store-id="${store.id}" title="كود خصم ${store.name}">${word}</a>`;
        const embedHtml = `<p>[COUPON_BLOCK:${store.slug}]</p>`;

        editor.chain().focus().insertContent(`${linkHtml}${embedHtml}`).run();

        // Remove the suggestion immediately
        setSuggestions(prev => prev.filter(s => s.store.id !== store.id));
    };

    const handleLinkStore = (store: Store, word: string) => {
        if (!editor) return;
        const primaryCountry = selectedCountries.length > 0 ? selectedCountries[0] : 'sa';
        const linkHtml = `<a href="/${primaryCountry}/${store.slug}" data-store-id="${store.id}" title="كوبونات خصم ${store.name}">${word}</a>`;

        editor.chain().focus().insertContent(linkHtml).run();
        setSuggestions(prev => prev.filter(s => s.store.id !== store.id));
    };

    return (
        <div className="space-y-4">
            {/* Rich Editor Area */}
            <div className="relative border-2 border-slate-100 rounded-[2rem] bg-slate-50 overflow-hidden focus-within:bg-white focus-within:border-blue-500 transition-all flex flex-col">
                <MenuBar editor={editor} />
                <div className="bg-transparent overflow-y-auto" style={{ maxHeight: '700px' }}>
                    <EditorContent editor={editor} />
                </div>

                {/* Auto Suggestions Bar */}
                {suggestions.length > 0 && (
                    <div className="bg-blue-50 border-t border-blue-100 p-4 shrink-0 shadow-inner">
                        <div className="flex items-center gap-2 mb-3 max-w-full overflow-hidden">
                            <Search size={14} className="text-blue-600 shrink-0" />
                            <span className="text-xs font-bold text-blue-900 border-b border-blue-200 pb-1 w-full truncate">محرك الربط الذكي متاح:</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {suggestions.map(s => (
                                <div key={s.store.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl shadow-sm border border-blue-100/50">
                                    <div className="flex items-center gap-3">
                                        <img src={s.store.logoUrl} className="w-8 h-8 rounded-full border border-gray-100 bg-white" alt="" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">اكتشفنا كلمة &quot;{s.word}&quot;</p>
                                            <p className="text-[10px] text-gray-500">هل تقصد متجر {s.store.name}؟</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                        <button
                                            type="button" onClick={() => handleLinkStore(s.store, s.word)}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                                        >
                                            <LinkIcon size={12} /> ربط نصي
                                        </button>
                                        <button
                                            type="button" onClick={() => handleEmbedCoupon(s.store, s.word)}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors shadow-sm"
                                        >
                                            <Tag size={12} /> تضمين أقوى الكوبونات
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* SEO Intelligence Panel */}
            <div className={cn("rounded-2xl border-2 p-5 transition-colors", seoScore === 100 ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100")}>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-black flex items-center gap-2 text-gray-800">
                        التحليل الذكي (SEO Intelligence)
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-bold">نقاط الجودة</span>
                        <div className={cn("px-3 py-1 rounded-lg text-sm font-black text-white shadow-sm", seoScore >= 80 ? "bg-green-500" : "bg-orange-500")}>
                            {seoScore} / 100
                        </div>
                    </div>
                </div>

                {aiIntent && (
                    <div className="mb-4 bg-white/60 p-4 rounded-xl border border-gray-100/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">AI Intent Detection</p>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-2 py-1 rounded-lg text-xs font-black text-white",
                                    aiIntent.type === 'transactional' ? "bg-purple-500"
                                        : aiIntent.type === 'commercial' ? "bg-blue-500"
                                            : "bg-teal-500"
                                )}>
                                    {aiIntent.type === 'transactional' ? 'شراء (Transactional)'
                                        : aiIntent.type === 'commercial' ? 'مقارنة (Commercial)'
                                            : aiIntent.type === 'informational' ? 'معلوماتي (Informational)'
                                                : 'مباشر (Navigational)'}
                                </span>
                                <span className="text-xs font-bold text-gray-500">ثقة: {aiIntent.score}%</span>
                            </div>
                        </div>
                        {aiIntent.keywords.length > 0 && (
                            <div className="flex-1 max-w-sm">
                                <p className="text-[10px] text-gray-400 font-bold mb-1">الكلمات المفتاحية المكتشفة:</p>
                                <div className="flex flex-wrap gap-1">
                                    {aiIntent.keywords.map(kw => (
                                        <span key={kw} className="bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">{kw}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {seoErrors.length > 0 ? (
                    <ul className="space-y-2 mt-4">
                        {seoErrors.map((err, i) => (
                            <li key={i} className="text-xs text-orange-800 flex flex-wrap items-center gap-2 bg-orange-100/50 p-2 rounded-lg">
                                <AlertCircle size={14} className="text-orange-600 shrink-0" /> <span className="flex-1">{err}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center gap-2 text-green-700 text-xs font-bold bg-green-100/50 p-3 rounded-lg mt-4">
                        <CheckCircle size={16} /> مميز! المحتوى جاهز لتصدر نتائج البحث ومُحسّن تماماً.
                    </div>
                )}
            </div>

            <input type="hidden" name="seoLinkingScore" value={seoScore} />
        </div >
    );
}
