import Script from "next/script";
import { getTrackingConfig } from "@/lib/data-service";

/**
 * TrackingScripts — Server Component
 *
 * Reads tracking configuration from Firestore and injects the appropriate
 * third-party tracking scripts into <head>.
 *
 * Supported platforms:
 *   - Google Analytics 4 (GA4)
 *   - Google Ads (shares gtag.js with GA4)
 *   - Meta (Facebook) Pixel
 *   - TikTok Pixel
 *   - Custom head code (raw HTML/JS)
 */
export default async function TrackingScripts() {
    const config = await getTrackingConfig();

    // Determine if gtag.js is needed (shared by GA4 and Google Ads)
    const needsGtag =
        (config.enableGA4 && config.ga4MeasurementId) ||
        (config.enableGoogleAds && config.googleAdsConversionId);

    // Pick the primary gtag ID for the loader script
    const gtagLoaderId = config.enableGA4 && config.ga4MeasurementId
        ? config.ga4MeasurementId
        : config.googleAdsConversionId;

    // Build gtag('config', ...) calls
    const gtagConfigs: string[] = [];
    if (config.enableGA4 && config.ga4MeasurementId) {
        gtagConfigs.push(`gtag('config', '${config.ga4MeasurementId}');`);
    }
    if (config.enableGoogleAds && config.googleAdsConversionId) {
        gtagConfigs.push(`gtag('config', '${config.googleAdsConversionId}');`);
    }

    return (
        <>
            {/* ─── Google gtag.js (GA4 + Google Ads) ───────────────────────── */}
            {needsGtag && (
                <>
                    <Script
                        id="gtag-loader"
                        src={`https://www.googletagmanager.com/gtag/js?id=${gtagLoaderId}`}
                        strategy="afterInteractive"
                    />
                    <Script
                        id="gtag-init"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                                window.dataLayer = window.dataLayer || [];
                                function gtag(){dataLayer.push(arguments);}
                                gtag('js', new Date());
                                ${gtagConfigs.join('\n')}
                            `,
                        }}
                    />
                </>
            )}

            {/* ─── Meta (Facebook) Pixel ───────────────────────────────────── */}
            {config.enableMeta && config.metaPixelId && (
                <Script
                    id="meta-pixel"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window, document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '${config.metaPixelId}');
                            fbq('track', 'PageView');
                        `,
                    }}
                />
            )}

            {/* ─── TikTok Pixel ────────────────────────────────────────────── */}
            {config.enableTikTok && config.tiktokPixelId && (
                <Script
                    id="tiktok-pixel"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            !function (w, d, t) {
                                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                                ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
                                ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                                for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                                ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                                ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
                                ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e+\"_\"+o]=1;
                                var i=d.createElement("script");i.type="text/javascript";i.async=!0;i.src=r+"?sdkid="+e+"&lib="+t;
                                var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(i,a)};
                                ttq.load('${config.tiktokPixelId}');
                                ttq.page();
                            }(window, document, 'ttq');
                        `,
                    }}
                />
            )}

            {/* ─── Custom Head Code ────────────────────────────────────────── */}
            {config.customHeadCode && (
                <Script
                    id="custom-head-code"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{ __html: config.customHeadCode }}
                />
            )}
        </>
    );
}
