import { NextRequest, NextResponse } from "next/server";
import { getNewsletterSubscribers, sendNewsletterEmail } from "@/lib/newsletter-service";

export async function POST(req: NextRequest) {
    try {
        const { subject, htmlContent, sendToAll } = await req.json();

        if (!subject || !htmlContent) {
            return NextResponse.json({ success: false, message: "الموضوع والمحتوى مطلوبان." }, { status: 400 });
        }

        const subscribers = await getNewsletterSubscribers();
        const activeEmails = subscribers
            .filter(s => s.isActive)
            .map(s => s.email);

        if (activeEmails.length === 0) {
            return NextResponse.json({ success: false, message: "لا يوجد مشتركين نشطين." });
        }

        const result = await sendNewsletterEmail(subject, htmlContent, activeEmails);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "حدث خطأ." }, { status: 500 });
    }
}
