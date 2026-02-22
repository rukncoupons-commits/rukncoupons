import React from "react";
import { getSlides, getCountries, getStores } from "@/lib/data-service";
import AdminSlidersClient from "@/components/admin/AdminSlidersClient";

export const dynamic = "force-dynamic";

export default async function AdminSlidersPage() {
    const slides = await getSlides();
    const countries = await getCountries();
    const stores = await getStores();

    return (
        <AdminSlidersClient
            initialSlides={slides}
            countries={countries}
            stores={stores}
        />
    );
}
