import React from "react";
import { getAdBanners, getCountries } from "@/lib/data-service";
import AdminBannersClient from "@/components/admin/AdminBannersClient";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
    const banners = await getAdBanners();
    const countries = await getCountries();

    return (
        <AdminBannersClient
            initialBanners={banners}
            countries={countries}
        />
    );
}
