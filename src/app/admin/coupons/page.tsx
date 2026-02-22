import React from "react";
import { getCoupons, getStores, getCategories, getCountries } from "@/lib/data-service";
import AdminCouponsClient from "@/components/admin/AdminCouponsClient";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
    const coupons = await getCoupons();
    const stores = await getStores();
    const categories = await getCategories();
    const countries = await getCountries();

    return (
        <AdminCouponsClient
            initialCoupons={coupons}
            initialStores={stores}
            categories={categories}
            countries={countries}
        />
    );
}
