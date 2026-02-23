import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import MobileHeader from "@/components/mobile/MobileHeader";
import Footer from "@/components/Footer";
import { getCountries } from "@/lib/data-service";
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
    const countries = await getCountries();
    const currentCountry = countries.find((c) => c.code === country);

    if (!currentCountry && country !== "temu") {
        if (countries.length > 0) {
            redirect("/sa");
        }
    }

    return (
        <>
            <main className="flex-1 flex flex-col min-h-screen relative w-full overflow-x-hidden md:bg-gray-50/50">
                {/* Desktop Header: Hidden on mobile (<1024px) */}
                <div className="hidden lg:block">
                    <Header countries={countries} currentCountry={currentCountry} />
                </div>

                {/* Mobile Header: Hidden on desktop (>=1024px) */}
                <div className="lg:hidden">
                    <MobileHeader countries={countries} currentCountry={currentCountry} />
                </div>

                <div className="container mx-auto px-4 py-8 max-w-7xl flex gap-8">
                    {children}
                </div>
            </main>
            <Footer currentCountryCode={country} />
        </>
    );
}
