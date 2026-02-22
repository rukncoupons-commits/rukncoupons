import { adminDb } from "./firebase-admin";

export interface AnalyticsSummary {
    visitors: number;
    sessions: number;
    pageviews: number;
    bounceRate: number;
    avgSessionDurationSec: number;
    uniqueCopies: number;
    dealClicks: number;
    totalRevenueEstimated: number; // Placeholder for RPM calculation
    rpm: number;
    epc: number;
    ctrGlobal: number;
    deviceSplit: { mobile: number; desktop: number };
    sourceSplit: { direct: number; organic: number; social: number; referral: number };
    clickPositions: { above_fold: number; mid: number; bottom: number };
    trendData: { date: string; visitors: number; pageviews: number }[];
}

export async function getAnalyticsDashboardData(daysOptions = 30): Promise<AnalyticsSummary> {
    const now = new Date();
    const startDate = new Date(now.getTime() - daysOptions * 24 * 60 * 60 * 1000);

    const snapshot = await adminDb.collection("analytics_events")
        .where("timestamp", ">=", startDate)
        .get();

    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    // Aggregators
    const sessionsMap = new Map<string, { events: any[], startTime: number, endTime: number, pages: Set<string> }>();
    let totalPageviews = 0;
    let totalCopies = 0;
    let totalDeals = 0;

    let mobile = 0; let desktop = 0;
    let direct = 0; let organic = 0; let social = 0; let referral = 0;
    let above_fold = 0; let mid = 0; let bottom = 0;

    // Trend grouping (YYYY-MM-DD)
    const trendMap = new Map<string, { visitors: Set<string>, pageviews: number }>();

    events.forEach(ev => {
        // Group by Session
        const sid = ev.session_id;
        const evTime = ev.timestamp?.toDate ? ev.timestamp.toDate().getTime() : new Date(ev.timestamp).getTime();

        if (!sessionsMap.has(sid)) {
            sessionsMap.set(sid, { events: [], startTime: evTime, endTime: evTime, pages: new Set() });
        }
        const s = sessionsMap.get(sid)!;
        s.events.push(ev);
        if (evTime < s.startTime) s.startTime = evTime;
        if (evTime > s.endTime) s.endTime = evTime;

        // Daily Trend grouping
        const dateKey = new Date(evTime).toISOString().split('T')[0];
        if (!trendMap.has(dateKey)) trendMap.set(dateKey, { visitors: new Set(), pageviews: 0 });
        trendMap.get(dateKey)!.visitors.add(sid);

        // Event specific processing
        if (ev.event_type === 'pageview') {
            totalPageviews++;
            s.pages.add(ev.url);
            trendMap.get(dateKey)!.pageviews++;

            // Device & Source (take from first pageview of session ideally, but this is simple aggregation)
            if (ev.device === 'mobile') mobile++; else desktop++;
            if (ev.source === 'organic') organic++;
            else if (ev.source === 'social') social++;
            else if (ev.source === 'referral') referral++;
            else direct++;
        }
        else if (ev.event_type === 'coupon_copy') {
            totalCopies++;
            const pos = ev.metadata?.position;
            if (pos === 'above_fold') above_fold++;
            else if (pos === 'bottom') bottom++;
            else mid++;
        }
        else if (ev.event_type === 'deal_click') {
            totalDeals++;
        }
    });

    // Calculate complex metrics from sessions
    const totalSessions = sessionsMap.size;
    let singlePageSessions = 0;
    let totalSessionDurationMs = 0;

    sessionsMap.forEach(session => {
        if (session.pages.size <= 1 && session.events.filter(e => e.event_type === 'coupon_copy' || e.event_type === 'deal_click').length === 0) {
            singlePageSessions++;
        }
        totalSessionDurationMs += (session.endTime - session.startTime);
    });

    const bounceRate = totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0;
    const avgSessionDurationSec = totalSessions > 0 ? (totalSessionDurationMs / totalSessions) / 1000 : 0;

    // Build trend array sorted by date
    const trendData = Array.from(trendMap.entries())
        .map(([date, data]) => ({ date, visitors: data.visitors.size, pageviews: data.pageviews }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Revenue/Monetization formulas (mocking revenue as an example of EPS/RPM, usually pulled from affiliate API)
    // Assume average EPC is $0.15 for this demonstration
    const totalClicks = totalCopies + totalDeals;
    const estimatedRevenue = totalClicks * 0.15;

    const rpm = totalSessions > 0 ? (estimatedRevenue / totalSessions) * 1000 : 0;
    const epc = totalClicks > 0 ? (estimatedRevenue / totalClicks) : 0;
    const ctrGlobal = totalPageviews > 0 ? (totalClicks / totalPageviews) * 100 : 0;

    return {
        visitors: totalSessions, // Treating unique session as visitor for this un-cookied tracking
        sessions: totalSessions,
        pageviews: totalPageviews,
        bounceRate,
        avgSessionDurationSec,
        uniqueCopies: totalCopies,
        dealClicks: totalDeals,
        totalRevenueEstimated: estimatedRevenue,
        rpm,
        epc,
        ctrGlobal,
        deviceSplit: { mobile, desktop },
        sourceSplit: { direct, organic, social, referral },
        clickPositions: { above_fold, mid, bottom },
        trendData
    };
}
