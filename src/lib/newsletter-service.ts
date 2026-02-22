import { adminDb } from "./firebase-admin";
import nodemailer from "nodemailer";

export interface NewsletterSubscriber {
    id?: string;
    email: string;
    subscribedAt: string;
    isActive: boolean;
}

export interface EmailSettings {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    senderName: string;
    senderEmail: string;
}

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    // Check if already subscribed
    const existing = await adminDb.collection("newsletterSubscribers")
        .where("email", "==", email)
        .get();

    if (!existing.empty) {
        const doc = existing.docs[0];
        if (doc.data().isActive) {
            return { success: false, message: "البريد الإلكتروني مشترك بالفعل." };
        }
        // Re-activate
        await doc.ref.update({ isActive: true, subscribedAt: new Date().toISOString() });
        return { success: true, message: "تم تفعيل اشتراكك مجدداً!" };
    }

    await adminDb.collection("newsletterSubscribers").add({
        email,
        subscribedAt: new Date().toISOString(),
        isActive: true,
    });

    return { success: true, message: "تم الاشتراك بنجاح!" };
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    const snapshot = await adminDb.collection("newsletterSubscribers")
        .orderBy("subscribedAt", "desc")
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsletterSubscriber));
}

export async function unsubscribeEmail(id: string): Promise<void> {
    await adminDb.collection("newsletterSubscribers").doc(id).update({ isActive: false });
}

export async function deleteSubscriber(id: string): Promise<void> {
    await adminDb.collection("newsletterSubscribers").doc(id).delete();
}

export async function getEmailSettings(): Promise<EmailSettings | null> {
    const doc = await adminDb.collection("config").doc("emailSettings").get();
    if (!doc.exists) return null;
    return doc.data() as EmailSettings;
}

export async function saveEmailSettings(settings: EmailSettings): Promise<void> {
    await adminDb.collection("config").doc("emailSettings").set(settings);
}

export async function sendNewsletterEmail(
    subject: string,
    htmlContent: string,
    recipients: string[]
): Promise<{ success: boolean; sent: number; error?: string }> {
    const settings = await getEmailSettings();
    if (!settings || !settings.smtpHost) {
        return { success: false, sent: 0, error: "لم يتم إعداد إعدادات البريد الإلكتروني بعد." };
    }

    const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: settings.smtpPort || 587,
        secure: settings.smtpPort === 465,
        auth: {
            user: settings.smtpUser,
            pass: settings.smtpPass,
        },
    });

    let sent = 0;
    const errors: string[] = [];

    for (const email of recipients) {
        try {
            await transporter.sendMail({
                from: `"${settings.senderName}" <${settings.senderEmail}>`,
                to: email,
                subject,
                html: htmlContent,
            });
            sent++;
        } catch (err: any) {
            errors.push(`${email}: ${err.message}`);
        }
    }

    return {
        success: sent > 0,
        sent,
        error: errors.length > 0 ? errors.join(", ") : undefined,
    };
}
