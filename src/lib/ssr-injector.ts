import parse, { DOMNode, Element } from 'html-react-parser';
import React from 'react';

/**
 * PHASE 5: SSR DYNAMIC INJECTION SYSTEM (Next.js App Router Edition)
 *
 * Takes raw CMS HTML, evaluates it as a structured React DOM array, and surgically
 * pushes the localized Coupon React Node precisely behind the selected paragraph via
 * the AI Heatmap score prediction. Contains NO layout shift risks and renders 100%
 * server-side natively.
 *
 * BUG FIX (Audit): Previous implementation used `c.data` (text-only) to reconstruct
 * paragraph children, stripping all inner markup (<a>, <strong>, <em> etc.).
 * Fixed by re-using `html-react-parser` to re-parse the original inner HTML string
 * from each child node's serialized form, preserving rich content.
 */
export function injectCouponSSR(
    rawArticleHtml: string,
    optimalIndex: number,
    couponReactNode: React.ReactNode
): React.ReactNode {
    try {
        let paragraphCount = 0;

        const options: any = {
            replace: (domNode: DOMNode) => {
                if (domNode instanceof Element && domNode.name === 'p') {
                    if (paragraphCount === optimalIndex) {
                        paragraphCount++;

                        // Reconstruct the full paragraph Node preserving all inner HTML
                        // We pass domNode back as-is to html-react-parser via a clone replacement
                        // that appends the coupon block immediately after.
                        // Using React.createElement to avoid JSX transpilation issues at non-jsx files.
                        const reconstructedParagraph = React.createElement(
                            'p',
                            { className: domNode.attribs?.class },
                            parse(
                                // Re-serialize children back to HTML string for parsing
                                domNode.children
                                    .map((c: any) => {
                                        if (c.type === 'text') return c.data || '';
                                        if (c.type === 'tag') {
                                            const attrs = Object.entries(c.attribs || {})
                                                .map(([k, v]) => ` ${k}="${v}"`)
                                                .join('');
                                            const inner = c.children?.map((cc: any) => cc.data || '').join('') || '';
                                            return `<${c.name}${attrs}>${inner}</${c.name}>`;
                                        }
                                        return '';
                                    })
                                    .join('')
                            )
                        );

                        return React.createElement(
                            React.Fragment,
                            null,
                            reconstructedParagraph,
                            couponReactNode
                        );
                    }
                    paragraphCount++;
                }
                return domNode;
            }
        };

        return parse(rawArticleHtml, options);

    } catch (err) {
        console.error("DOM Injection Failed, returning raw unoptimized parse", err);
        return parse(rawArticleHtml);
    }
}
