import React from "react";
import Link from "next/link";

export default function NotFound() {
    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center text-right" dir="rtl">
            <div className="text-center max-w-lg mx-auto px-6">
                <div className="text-8xl font-black text-blue-600 mb-4">404</div>
                <h1 className="text-3xl font-black text-gray-800 mb-4">الصفحة غير موجودة</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يمكنك العودة للصفحة الرئيسية أو تصفح المتاجر.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/sa"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg"
                    >
                        الصفحة الرئيسية
                    </Link>
                    <Link
                        href="/sa/stores"
                        className="bg-white border-2 border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-600 font-bold py-3 px-8 rounded-xl transition-all"
                    >
                        تصفح المتاجر
                    </Link>
                </div>
            </div>
        </main>
    );
}
