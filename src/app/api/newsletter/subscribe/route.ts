import { NextRequest, NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/newsletter-service";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (!email || !email.includes("@")) {
            return NextResponse.json({ success: false, message: "البريد الإلكتروني غير صالح." }, { status: 400 });
        }
        const result = await subscribeToNewsletter(email.toLowerCase().trim());
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ success: false, message: "حدث خطأ، يرجى المحاولة مجدداً." }, { status: 500 });
    }
}
