import React from "react";
import { getTrackingConfig } from "@/lib/data-service";
import AdminTrackingClient from "@/components/admin/AdminTrackingClient";

export const dynamic = "force-dynamic";

export default async function AdminTrackingPage() {
    const config = await getTrackingConfig();

    return (
        <AdminTrackingClient
            initialConfig={config}
        />
    );
}
