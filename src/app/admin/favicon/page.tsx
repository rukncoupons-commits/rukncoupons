import { adminDb } from "@/lib/firebase-admin";
import AdminFaviconClient from "@/components/admin/AdminFaviconClient";

export const dynamic = "force-dynamic";

export default async function AdminFaviconPage() {
    const doc = await adminDb.collection("settings").doc("general").get();
    const data = doc.data();
    const faviconUrl = data?.faviconUrl || "";

    return <AdminFaviconClient initialFaviconUrl={faviconUrl} />;
}
