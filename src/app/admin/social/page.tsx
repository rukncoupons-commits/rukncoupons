import React from "react";
import { getSocialConfig } from "@/lib/data-service";
import AdminSocialClient from "@/components/admin/AdminSocialClient";

export const dynamic = "force-dynamic";

export default async function AdminSocialPage() {
    const config = await getSocialConfig();

    return (
        <AdminSocialClient
            initialConfig={config}
        />
    );
}
