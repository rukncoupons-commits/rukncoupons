import { NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function GET() {
    try {
        revalidateTag('stores');
        revalidateTag('coupons');
        revalidatePath('/', 'layout');
        return NextResponse.json({ success: true, message: "Cache cleared" });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
