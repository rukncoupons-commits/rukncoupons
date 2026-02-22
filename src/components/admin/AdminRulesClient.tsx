"use client";

import React, { useState, useTransition } from "react";
import { Rule, RuleCondition, RuleAction, Country, Store, Category } from "@/lib/types";
import {
    ShieldCheck, Plus, Edit, Trash2, X, Check, Globe,
    Save, Loader2, Link as LinkIcon, Layers, Settings,
    Activity, Zap, Info, ArrowRight, BarChart3, Tag,
    Layout, Eye, Star, AlertTriangle, AlertCircle
} from "lucide-react";
import { createRuleAction, updateRuleAction, deleteRuleAction } from "@/lib/admin-actions";
import { cn } from "@/lib/utils";

interface Props {
    initialRules: Rule[];
    countries: Country[];
    stores: Store[];
    categories: Category[];
}

export default function AdminRulesClient({ initialRules, countries, stores, categories }: Props) {
    const [rules, setRules] = useState(initialRules);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | null>(null);
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState<Partial<Rule>>({
        name: "",
        scope: "global",
        priority: 1,
        isActive: true,
        conditions: [],
        actions: []
    });

    const resetForm = () => {
        setFormData({ name: "", scope: "global", priority: 1, isActive: true, conditions: [], actions: [] });
        setEditingRule(null);
        setIsFormOpen(false);
    };

    const handleEdit = (rule: Rule) => {
        setEditingRule(rule);
        setFormData({ ...rule });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || formData.conditions?.length === 0 || formData.actions?.length === 0) {
            alert("يرجى إكمال بيانات القاعدة وإضافة شرط واحد وعمل واحد على الأقل.");
            return;
        }

        startTransition(async () => {
            if (editingRule) {
                await updateRuleAction(editingRule.id, formData);
                setRules(prev => prev.map(r => r.id === editingRule.id ? { ...r, ...formData } as Rule : r));
            } else {
                await createRuleAction(formData);
                window.location.reload();
            }
            resetForm();
        });
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`هل أنت متأكد من حذف القاعدة "${name}"؟`)) return;
        startTransition(async () => {
            await deleteRuleAction(id);
            setRules(prev => prev.filter(r => r.id !== id));
        });
    };

    const addCondition = () => {
        setFormData(prev => ({
            ...prev,
            conditions: [...(prev.conditions || []), { field: "country", operator: "eq", value: "" }]
        }));
    };

    const removeCondition = (index: number) => {
        setFormData(prev => ({
            ...prev,
            conditions: prev.conditions?.filter((_, i) => i !== index)
        }));
    };

    const updateCondition = (index: number, field: keyof RuleCondition, value: any) => {
        setFormData(prev => {
            const newConditions = [...(prev.conditions || [])];
            newConditions[index] = { ...newConditions[index], [field]: value };
            return { ...prev, conditions: newConditions };
        });
    };

    const addAction = () => {
        setFormData(prev => ({
            ...prev,
            actions: [...(prev.actions || []), { type: "visible", value: true }]
        }));
    };

    const removeAction = (index: number) => {
        setFormData(prev => ({
            ...prev,
            actions: prev.actions?.filter((_, i) => i !== index)
        }));
    };

    const updateAction = (index: number, field: keyof RuleAction, value: any) => {
        setFormData(prev => {
            const newActions = [...(prev.actions || [])];
            newActions[index] = { ...newActions[index], [field]: value };
            return { ...prev, actions: newActions };
        });
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">محرك القواعد الذكي</h2>
                    <p className="text-slate-400 font-medium">تحكم في ظهور وسلوك المحتوى بناءً على شروط مخصصة.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-900/10 transition-all active:scale-95 text-sm"
                >
                    <Plus size={20} />
                    <span>إنشاء قاعدة جديدة</span>
                </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-6">
                {rules.sort((a, b) => (b.priority || 0) - (a.priority || 0)).map((rule) => (
                    <div key={rule.id} className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 flex flex-col lg:flex-row items-start lg:items-center gap-10 hover:shadow-2xl hover:shadow-slate-200/50 transition-all relative group overflow-hidden">

                        <div className="flex-1 space-y-4 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black border border-blue-100 uppercase tracking-wider">
                                    Priority: {rule.priority}
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider",
                                    rule.scope === "global" ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-orange-50 text-orange-600 border-orange-100"
                                )}>
                                    Scope: {rule.scope}
                                </div>
                                {!rule.isActive && (
                                    <div className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black border border-red-100 uppercase tracking-wider">
                                        Disabled
                                    </div>
                                )}
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 line-clamp-1">{rule.name}</h3>

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-black text-slate-400">تُطبق عندما:</span>
                                {rule.conditions.map((c, i) => (
                                    <div key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600">
                                        {c.field} {c.operator} <span className="text-blue-600">{c.value}</span>
                                    </div>
                                ))}
                                <ArrowRight size={14} className="text-slate-300 mx-1" />
                                <span className="text-xs font-black text-slate-400">النتيجة:</span>
                                {rule.actions.map((a, i) => (
                                    <div key={i} className="px-3 py-1.5 bg-green-50 border border-green-100 rounded-xl text-[10px] font-black text-green-700">
                                        {a.type}: {String(a.value)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={() => handleEdit(rule)}
                                className="p-5 bg-white border-2 border-slate-100 rounded-2xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 shadow-sm"
                            >
                                <Edit size={22} />
                            </button>
                            <button
                                onClick={() => handleDelete(rule.id, rule.name)}
                                className="p-5 bg-white border-2 border-slate-100 rounded-2xl text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-105 shadow-sm"
                            >
                                <Trash2 size={22} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editor Panel */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={resetForm}></div>
                    <div className="absolute inset-y-0 left-0 max-w-5xl w-full bg-slate-50 shadow-2xl animate-in slide-in-from-left duration-500">
                        <div className="h-full flex flex-col">
                            {/* Header */}
                            <div className="px-10 py-8 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.25rem] flex items-center justify-center shadow-2xl">
                                        <Zap size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800">{editingRule ? "تعديل القاعدة" : "إنشاء قاعدة محرك"}</h3>
                                        <p className="text-sm font-medium text-slate-400">حدد الشروط والنتائج بدقة عالية.</p>
                                    </div>
                                </div>
                                <button onClick={resetForm} className="p-3 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all">
                                    <X size={28} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-12 pb-32">
                                <form id="rule-form" onSubmit={handleSubmit} className="space-y-12">

                                    {/* Meta */}
                                    <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-200/60 shadow-sm space-y-8">
                                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">الإعدادات الأساسية</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">اسم القاعدة (للاستخدام الإداري)</label>
                                                <input
                                                    type="text" required
                                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4.5 px-6 rounded-2xl outline-none transition-all font-black text-lg"
                                                    placeholder="مثلاً: إخفاء العروض المعطلة في السعودية"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">الأولوية (الأعلى يُنفذ أولاً)</label>
                                                <input
                                                    type="number" required
                                                    value={formData.priority} onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 py-4.5 px-6 rounded-2xl outline-none transition-all font-black"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 pt-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">نطاق القاعدة</label>
                                                <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, scope: "global" })}
                                                        className={cn("flex-1 py-3 rounded-xl font-black text-xs transition-all", formData.scope === "global" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}
                                                    >عالمي (Global)</button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, scope: "country" })}
                                                        className={cn("flex-1 py-3 rounded-xl font-black text-xs transition-all", formData.scope === "country" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400")}
                                                    >دولي (Country)</button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-black text-slate-700 pr-2">الحالة</label>
                                                <div className="flex items-center gap-4 py-3">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div className={cn(
                                                            "w-12 h-6 rounded-full relative transition-all",
                                                            formData.isActive ? "bg-green-500" : "bg-slate-200"
                                                        )}>
                                                            <div className={cn(
                                                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                                formData.isActive ? "right-7" : "right-1"
                                                            )}></div>
                                                        </div>
                                                        <input
                                                            type="checkbox" className="hidden"
                                                            checked={formData.isActive}
                                                            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                                        />
                                                        <span className="text-sm font-black text-slate-800">{formData.isActive ? "نشط" : "معطل"}</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Conditions */}
                                    <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-200/60 shadow-sm space-y-8 relative overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">الشروط والقواعد (IF)</h4>
                                            <button
                                                type="button" onClick={addCondition}
                                                className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-orange-600 hover:text-white transition-all flex items-center gap-2"
                                            >
                                                <Plus size={14} /> إضافة شرط
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {formData.conditions?.map((c, i) => (
                                                <div key={i} className="flex flex-col md:flex-row items-center gap-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 group">
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                                        <select
                                                            value={c.field} onChange={e => updateCondition(i, "field", e.target.value)}
                                                            className="bg-white border-2 border-slate-100 py-3 px-4 rounded-xl outline-none font-bold text-xs"
                                                        >
                                                            <option value="country">الدولة (Country)</option>
                                                            <option value="storeId">المتجر (Store ID)</option>
                                                            <option value="status">الحالة (Status)</option>
                                                            <option value="type">نوع العرض (Type)</option>
                                                            <option value="category">التصنيف (Category)</option>
                                                            <option value="views">المشاهدات (Views)</option>
                                                            <option value="clicks">النقرات (Clicks)</option>
                                                        </select>
                                                        <select
                                                            value={c.operator} onChange={e => updateCondition(i, "operator", e.target.value)}
                                                            className="bg-white border-2 border-slate-100 py-3 px-4 rounded-xl outline-none font-bold text-xs"
                                                        >
                                                            <option value="eq">يساوي (=)</option>
                                                            <option value="neq">لا يساوي (!=)</option>
                                                            <option value="contains">يحتوي (Contains)</option>
                                                            <option value="gt">أكبر من (&gt;)</option>
                                                            <option value="lt">أصغر من (&lt;)</option>
                                                        </select>
                                                        <input
                                                            type="text" value={c.value} onChange={e => updateCondition(i, "value", e.target.value)}
                                                            className="bg-white border-2 border-slate-100 py-3 px-4 rounded-xl outline-none font-bold text-xs"
                                                            placeholder="القيمة..."
                                                        />
                                                    </div>
                                                    <button type="button" onClick={() => removeCondition(i)} className="p-3 text-red-300 hover:text-red-600 transition-colors">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            ))}
                                            {formData.conditions?.length === 0 && (
                                                <div className="py-12 text-center bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-200">
                                                    <p className="text-slate-400 font-bold text-sm">لا توجد شروط مضافة لهذه القاعدة.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-200/60 shadow-sm space-y-8">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-xs font-black text-green-600 uppercase tracking-widest flex items-center gap-2">الإجراءات والنتائج (THEN)</h4>
                                            <button
                                                type="button" onClick={addAction}
                                                className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-green-600 hover:text-white transition-all flex items-center gap-2"
                                            >
                                                <Plus size={14} /> إضافة إجراء
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {formData.actions?.map((a, i) => (
                                                <div key={i} className="flex flex-col md:flex-row items-center gap-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 group">
                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                                        <select
                                                            value={a.type} onChange={e => updateAction(i, "type", e.target.value)}
                                                            className="bg-white border-2 border-slate-100 py-3 px-4 rounded-xl outline-none font-bold text-xs"
                                                        >
                                                            <option value="visible">الظهور (Visible)</option>
                                                            <option value="featured">عروض مميزة (Featured)</option>
                                                            <option value="suppressSchema">تعطيل السكيما (No Schema)</option>
                                                            <option value="badge">إضافة شارة (Badge Text)</option>
                                                        </select>

                                                        {a.type === 'badge' ? (
                                                            <input
                                                                type="text" value={String(a.value)} onChange={e => updateAction(i, "value", e.target.value)}
                                                                className="bg-white border-2 border-slate-100 py-3 px-4 rounded-xl outline-none font-bold text-xs"
                                                                placeholder="نص الشارة..."
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-4 bg-white border-2 border-slate-100 rounded-xl px-4">
                                                                <label className="flex items-center gap-2 cursor-pointer py-3">
                                                                    <input
                                                                        type="radio" name={`action-val-${i}`} checked={a.value === true}
                                                                        onChange={() => updateAction(i, "value", true)}
                                                                    />
                                                                    <span className="text-[10px] font-black">TRUE</span>
                                                                </label>
                                                                <label className="flex items-center gap-2 cursor-pointer py-3">
                                                                    <input
                                                                        type="radio" name={`action-val-${i}`} checked={a.value === false}
                                                                        onChange={() => updateAction(i, "value", false)}
                                                                    />
                                                                    <span className="text-[10px] font-black">FALSE</span>
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button type="button" onClick={() => removeAction(i)} className="p-3 text-red-300 hover:text-red-600 transition-colors">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            ))}
                                            {formData.actions?.length === 0 && (
                                                <div className="py-12 text-center bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-200">
                                                    <p className="text-slate-400 font-bold text-sm">لا توجد إجراءات مضافة لهذه القاعدة.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-10 border-t border-slate-200 sticky bottom-0 bg-white/95 backdrop-blur z-10 flex gap-6">
                                <button
                                    type="button" onClick={resetForm}
                                    className="flex-1 py-5 rounded-[1.5rem] border-2 border-slate-200 font-black text-slate-400 hover:bg-slate-50 transition-all text-sm"
                                >إلغاء الأمر</button>
                                <button
                                    type="submit" form="rule-form"
                                    disabled={isPending}
                                    className="flex-[2] py-5 rounded-[1.5rem] bg-slate-900 text-white font-black shadow-2xl shadow-slate-900/20 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 text-sm"
                                >
                                    {isPending ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
                                    <span>حفظ ونشر القاعدة</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
