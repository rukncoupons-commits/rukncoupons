import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import MobileHeader from "@/components/mobile/MobileHeader";
import Footer from "@/components/Footer";
import { getCountries, getCountryData } from "@/lib/data-service";
import { redirect } from "next/navigation";
import { buildHreflangAlternates, buildAbsoluteUrl, SUPPORTED_COUNTRIES } from "@/lib/seo-helpers";
import { isValidLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string; country: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; country: string }> }): Promise<Metadata> {
    const { locale, country } = await params;
    return {
        alternates: {
            languages: buildHreflangAlternates(""),
        },
    };
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
            <Header
                countries={countries}
                currentCountry={currentCountry}
                stores={stores}
                categories={categories}
                coupons={coupons}
                locale={locale}
            />
            <MobileHeader
                countries={countries}
                currentCountry={currentCountry}
                stores={stores}
                categories={categories}
                coupons={coupons}
                locale={locale}
            />
            {children}
            <Footer currentCountryCode={country} locale={locale} />
        </>
    );
}
