import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import MobileHeader from "@/components/mobile/MobileHeader";
import Footer from "@/components/Footer";
import { getCountries, getCountryData } from "@/lib/data-service";
import { redirect } from "next/navigation";
import { buildHreflangAlternates, buildAbsoluteUrl, SUPPORTED_COUNTRIES } from "@/lib/seo-helpers";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
    const { country } = await params;
    return {
        alternates: {
            canonical: buildAbsoluteUrl(`/${country}`),
            languages: buildHreflangAlternates(),
        },
    };
}

export default async function PublicLayout({ children, params }: LayoutProps) {
    const { country } = await params;
    const data = await getCountryData(country);
    const { countries, currentCountry, stores } = data;

    if (!currentCountry && country !== "temu") {
        if (countries.length > 0) {
            redirect("/sa");
        }
    }

    return (
        <>
            <Header countries={countries} currentCountry={currentCountry} />
            <MobileHeader countries={countries} currentCountry={currentCountry} stores={stores} />
            {children}
            <Footer currentCountryCode={country} />
        </>
    );
}

