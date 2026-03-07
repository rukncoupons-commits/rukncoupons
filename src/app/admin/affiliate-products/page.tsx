import React from "react";
import { Metadata } from "next";
import { getAffiliateProducts, getStores } from "@/lib/data-service";
import AdminAffiliateProductsClient from "@/components/admin/AdminAffiliateProductsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "إدارة منتجات أمازون | لوحة التحكم",
};

export default async function AdminAffiliateProductsPage() {
    // Phase 2: Fetch Data
    const [products, stores] = await Promise.all([
        getAffiliateProducts(),
        getStores(),
    ]);

    // Only pass the Amazon store or relevant stores
    const mappedStores = stores.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug
    }));

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">
                    إدارة منتجات أمازون
                </h1>
                <p className="text-slate-500 font-medium max-w-2xl leading-relaxed">
                    هنا يمكنك إضافة المنتجات المخصصة للمقالات والصفحات عالية التحويل (High-Conversion Hubs).
                </p>
            </div>

            <AdminAffiliateProductsClient
                initialProducts={products}
                stores={mappedStores}
            />
        </div>
    );
}
