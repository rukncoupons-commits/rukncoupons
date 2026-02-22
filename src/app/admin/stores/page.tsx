import React from "react";
import { getStores, getCategories, getCountries } from "@/lib/data-service";
import AdminStoresClient from "@/components/admin/AdminStoresClient";

export const dynamic = "force-dynamic";

export default async function AdminStoresPage() {
    const stores = await getStores();
    const categories = await getCategories();
    const countries = await getCountries();

    return (
        <AdminStoresClient
            initialStores={stores}
            categories={categories}
            countries={countries}
        />
    );
}
