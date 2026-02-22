import React from "react";
import { getCategories, getCountries } from "@/lib/data-service";
import AdminCategoriesClient from "@/components/admin/AdminCategoriesClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
    const categories = await getCategories();
    const countries = await getCountries();

    return (
        <AdminCategoriesClient
            initialCategories={categories}
            countries={countries}
        />
    );
}
