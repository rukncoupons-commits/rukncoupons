import { getNewsletterSubscribers } from "@/lib/newsletter-service";
import AdminNewsletterClient from "@/components/admin/AdminNewsletterClient";

export const dynamic = "force-dynamic";

export default async function NewsletterAdminPage() {
    const subscribers = await getNewsletterSubscribers();
    return <AdminNewsletterClient initialSubscribers={subscribers} />;
}
