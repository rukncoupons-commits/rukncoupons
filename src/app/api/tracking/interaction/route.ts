import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * POST /api/tracking/interaction
 * 
 * Tracks individual coupon interactions (views and copies).
 * Body: { couponId: string, action: 'view' | 'copy' }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { couponId, action } = body;

        if (!couponId || (action !== 'view' && action !== 'copy')) {
            return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
        }

        const couponRef = adminDb.collection('coupons').doc(couponId);

        // Fast, atomic increment without fetching the document
        const updateData: any = {};
        if (action === 'view') {
            updateData.viewCount = FieldValue.increment(1);
        } else if (action === 'copy') {
            updateData.usedCount = FieldValue.increment(1);
        }

        await couponRef.update(updateData);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Interaction tracking error:', error);
        // Fail silently so we don't disrupt the user UI if tracking fails
        return NextResponse.json({ success: false, error: 'Failed to track interaction' }, { status: 500 });
    }
}
