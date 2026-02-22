import { NextRequest, NextResponse } from "next/server";
import { saveEmailSettings, getEmailSettings } from "@/lib/newsletter-service";

export async function GET() {
    try {
        const settings = await getEmailSettings();
        return NextResponse.json(settings || {});
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const settings = await req.json();
        await saveEmailSettings(settings);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
