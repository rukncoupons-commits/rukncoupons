import React from "react";
import { getCountries } from "@/lib/data-service";
import LandingClient from "@/components/LandingClient";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const countries = await getCountries();

  return <LandingClient countries={countries} />;
}
