"use client";

import React, { useState, useEffect } from "react";
import { Slide } from "@/lib/types";

interface Props {
    slides: Slide[];
    isEn: boolean;
}

export default function HeroSliderClient({ slides, isEn }: Props) {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-slide effect
    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    if (!slides.length) return null;

    return (
        <section aria-label={isEn ? "Featured Deals" : "عروض مميزة"} className="w-full flex flex-col gap-4">
            <div className="w-full relative h-[200px] md:h-[320px] rounded-[2rem] overflow-hidden shadow-lg group bg-slate-100">
                {slides.map((slide, i) => (
                    <a
                        key={slide.id}
                        href={isEn && slide.linkUrlEn ? slide.linkUrlEn : slide.linkUrl || "#"}
                        aria-label={slide.title ? (isEn ? `Offer: ${slide.titleEn || slide.title}` : `عرض: ${slide.title}`) : (isEn ? "View offer" : "نظرة على العرض")}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out block ${currentSlide === i ? "opacity-100 z-10" : "opacity-0 z-0"
                            }`}
                    >
                        <img
                            src={isEn && slide.imageUrlEn ? slide.imageUrlEn : slide.image}
                            className="w-full h-full object-cover"
                            alt={isEn && slide.titleEn ? slide.titleEn : slide.title || (isEn ? "Featured offer" : "عرض مميز")}
                            loading={i === 0 ? "eager" : "lazy"}
                            fetchPriority={i === 0 ? "high" : "auto"}
                            decoding="async"
                            width={1200}
                            height={400}
                        />
                        {(slide.title || slide.titleEn) && (
                            <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/60 to-transparent text-white">
                                <h2 className="text-xl md:text-3xl font-black mb-2 leading-tight">
                                    {isEn ? slide.titleEn || slide.title : slide.title}
                                </h2>
                                {(slide.description || slide.descriptionEn) && (
                                    <p className="text-sm text-gray-200 line-clamp-1">
                                        {isEn ? slide.descriptionEn || slide.description : slide.description}
                                    </p>
                                )}
                            </div>
                        )}
                    </a>
                ))}
            </div>

            {/* Dots placed below the slider in a professional way (Lines) */}
            {slides.length > 1 && (
                <div className="flex justify-center items-center gap-2 mt-1 py-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ease-in-out border border-slate-300 shadow-sm ${currentSlide === i ? "bg-blue-600 w-8 border-blue-600" : "bg-slate-400 hover:bg-slate-500 w-4"
                                }`}
                            aria-label={isEn ? `Go to slide ${i + 1}` : `الذهاب إلى الشريحة ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
