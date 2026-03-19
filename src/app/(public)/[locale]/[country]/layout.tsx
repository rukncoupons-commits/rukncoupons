import React, { Suspense } from "react";
import Header from "@/components/Header";
import MobileHeader from "@/components/mobile/MobileHeader";
import Footer from "@/components/Footer";
import { getCountries, getCountryData } from "@/lib/data-service";
import { redirect } from "next/navigation";
import { SUPPORTED_COUNTRIES } from "@/lib/seo-helpers";
import { isValidLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string; country: string }>;
}

export default async function PublicLayout({ children, params }: LayoutProps) {
    const { locale: rawLocale, country } = await params;
    const locale = isValidLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
    const data = await getCountryData(country);
    const { countries, currentCountry, stores, categories, coupons } = data;

    if (!currentCountry && country !== "temu") {
        if (countries.length > 0) {
            redirect(`/${locale}/sa`);
        }
    }

    return (
        <>
            <Suspense fallback={<div className="h-20 bg-white border-b border-gray-100"></div>}>
                <Header
                    countries={countries}
                    currentCountry={currentCountry}
                    stores={stores}
                    categories={categories}
                    coupons={coupons}
                    locale={locale}
                />
            </Suspense>
            <Suspense fallback={<div className="h-16 bg-white border-b border-gray-100"></div>}>
                <MobileHeader
                    countries={countries}
                    currentCountry={currentCountry}
                    stores={stores}
                    categories={categories}
                    coupons={coupons}
                    locale={locale}
                />
            </Suspense>
            {children}
            <Footer currentCountryCode={country} locale={locale} />
        </>
    );
}
