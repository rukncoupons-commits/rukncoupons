import React from "react";
import { getCountries } from "@/lib/data-service";
import LandingClient from "@/components/LandingClient";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const countries = await getCountries();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4 font-cairo" dir="rtl">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-10">
          <div className="inline-block bg-blue-50 p-5 rounded-[2rem] mb-6 shadow-inner rotate-3">
            <span className="text-5xl">🌍</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-4 leading-tight">
            مرحباً بك في <span className="text-blue-600">ركن الكوبونات</span>
          </h1>
          <LandingClient countries={countries} />
        </div>
      </div>
    </div>
  );
}
