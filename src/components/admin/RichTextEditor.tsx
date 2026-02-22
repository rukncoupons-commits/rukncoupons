"use client";

import React, { useCallback } from "react";
import {
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

interface RichTextEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
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

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
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
                class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[250px] w-full max-w-none p-6 text-slate-900',
                dir: 'rtl'
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Handle initial value sync if async data loads
    React.useEffect(() => {
        if (editor && value && editor.getHTML() !== value && editor.isEmpty) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    return (
        <div className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] transition-all focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5 shadow-sm overflow-hidden">
            <MenuBar editor={editor} />
            <div className="relative">
                {editor?.isEmpty && placeholder && (
                    <div className="absolute top-6 right-6 text-slate-500 pointer-events-none select-none">
                        {placeholder}
                    </div>
                )}
                <EditorContent editor={editor} className="cursor-text" />
            </div>
        </div>
    );
}
