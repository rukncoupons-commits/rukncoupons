import React from "react";
import { getRules, getCountries, getStores, getCategories } from "@/lib/data-service";
import AdminRulesClient from "@/components/admin/AdminRulesClient";

export const dynamic = "force-dynamic";

export default async function AdminRulesPage() {
    const rules = await getRules();
    const countries = await getCountries();
    const stores = await getStores();
    const categories = await getCategories();

    return (
        <AdminRulesClient
            initialRules={rules}
            countries={countries}
            stores={stores}
            categories={categories}
        />
    );
}
