import { Locale } from "./i18n";

export type CityKey = "dubai" | "abu-dhabi" | "riyadh" | "cairo";

export interface CityData {
    id: CityKey;
    slug: string;
    validCountryCode: string; // The country this city belongs to
    names: {
        ar: string;
        en: string;
    };
    titles: {
        ar: string;
        en: string;
    };
    descriptions: {
        ar: string;
        en: string;
    };
    h1: {
        ar: string;
        en: string;
    };
    intros: {
        ar: string;
        en: string;
    };
}

export const CITIES: Record<CityKey, CityData> = {
    dubai: {
        id: "dubai",
        slug: "dubai-coupons",
        validCountryCode: "ae",
        names: {
            ar: "دبي",
            en: "Dubai"
        },
        titles: {
            ar: "أفضل كود خصم في دبي 2026 | عروض دبي الحصرية – ركن الكوبونات",
            en: "Best Coupon Codes in Dubai 2026 | Exclusive Deals – Rukn Coupons"
        },
        descriptions: {
            ar: "اكتشف أفضل كود خصم في دبي وأقوى عروض دبي للمتسوقين عبر الإنترنت. وفر أموالك مع كوبونات مجربة وحصرية صالحة لجميع المتاجر المتوفرة في الإمارات.",
            en: "Discover the best Dubai coupon codes and exclusive deals. Save money with verified discount codes tailored for shoppers across the UAE. Updated daily for 2026."
        },
        h1: {
            ar: "أفضل كود خصم وعروض دبي",
            en: "Best Coupon Codes & Deals in Dubai"
        },
        intros: {
            ar: "التسوق في دبي أصبح أسهل وأكثر توفيراً مع هذه الكوبونات الحصرية. إذا كنت تبحث عن أقوى **كود خصم دبي** لعام 2026، فأنت في المكان الصحيح. نجمع لك هنا أحدث التطفيضات والخصومات الفعالة التي تلبي كافة احتياجاتك اليومية. من الإلكترونيات والأزياء إلى البقالة، نوفر لك **عروض دبي** التي تجعل تجربة الشراء أذكى وأقل تكلفة. فريقنا يقوم بفحص هذه الكوبونات يومياً لضمان فعاليتها التامة عند الوصول لصفحة الدفع. لا تفوت فرصة الاستفادة من هذه التخفيضات الكبرى، ابدأ بتصفح القائمة أدناه وانسخ الرمز الترويجي المناسب لمشترياتك واستمتع بالتوفير فوراً.",
            en: "Shopping in the UAE has never been easier or more affordable. If you are looking for the most reliable **Dubai coupon code** for 2026, you have found the ultimate source. We curate the absolute **best deals in Dubai**, bringing you massive savings across top electronics, fashion, and grocery retailers. Our editorial team manually verifies every single promotional code daily to ensure you never face an invalid discount at checkout. Why pay full price when you can instantly unlock exclusive vendor discounts tailored for UAE residents? Browse our top recommended stores below, copy your favorite code, and start maximizing your savings on your next order."
        }
    },
    "abu-dhabi": {
        id: "abu-dhabi",
        slug: "abu-dhabi-coupons",
        validCountryCode: "ae",
        names: {
            ar: "أبوظبي",
            en: "Abu Dhabi"
        },
        titles: {
            ar: "كوبونات وأكواد خصم أبوظبي 2026 | أقوى العروض – ركن الكوبونات",
            en: "Best Coupon Codes in Abu Dhabi 2026 | Top Deals – Rukn Coupons"
        },
        descriptions: {
            ar: "تسوق بذكاء مع أحدث أكواد خصم أبوظبي لعام 2026. وفر أموالك عبر أقوى التخفيضات اليومية المحدثة باستمرار والمناسبة للمتسوقين في الإمارات.",
            en: "Shop smarter with the latest Abu Dhabi coupon codes for 2026. Maximize your savings across top UAE stores with verified, daily updated discount codes."
        },
        h1: {
            ar: "أكواد خصم وتخفيضات أبوظبي",
            en: "Best Coupon Codes & Deals in Abu Dhabi"
        },
        intros: {
            ar: "للباحثين عن التميز والتوفير، نقدم لكم أقوى **كود خصم أبوظبي** لعام 2026. نوفر لكم تشكيلة واسعة من التخفيضات لأكبر المتاجر التي توصل خدماتها ومنتجاتها عبر الإنترنت داخل العاصمة وفي جميع أنحاء الإمارات. سواء كنت تخطط لشراء أجهزة حديثة أو ملابس راقية، فإن **عروض أبوظبي** المتوفرة في هذه الصفحة صُممت خصيصاً لخفض تكلفة مشترياتك وتوفير ميزانيتك. جميع الكامونات مجربة ومضمونة بنسبة 100%. تصفح الخيارات المتاحة أدناه واستمتع بأفضل الأسعار الممكنة على الإطلاق عند التسوق الإلكتروني.",
            en: "If you prioritize premium savings, you need the most reliable **Abu Dhabi coupon code** for 2026. We curate an extensive selection of price drops and promotional offers for leading online stores servicing the capital and the wider UAE. Whether you're hunting for the latest gadgets or fashion upgrades, our verified **Abu Dhabi deals** are specifically gathered to lower your checkout total and stretch your budget further. Every code on this page is tested and guaranteed to work. Explore the curated list below and secure the best possible online prices today."
        }
    },
    riyadh: {
        id: "riyadh",
        slug: "riyadh-coupons",
        validCountryCode: "sa",
        names: {
            ar: "الرياض",
            en: "Riyadh"
        },
        titles: {
            ar: "أفضل كود خصم في الرياض 2026 | عروض الرياض الحصرية – ركن الكوبونات",
            en: "Best Coupon Codes in Riyadh 2026 | Exclusive Saudi Deals – Rukn Coupons"
        },
        descriptions: {
            ar: "وفّر مع أفضل كود خصم في الرياض وعروض حصرية تشمل أبرز المتاجر الإلكترونية في السعودية لعام 2026. كوبونات فعالة ومجربة يومياً.",
            en: "Save big with the best Riyadh coupon codes and exclusive offers covering top online stores in Saudi Arabia for 2026. Verified daily."
        },
        h1: {
            ar: "أفضل كود خصم وعروض الرياض",
            en: "Best Coupon Codes & Deals in Riyadh"
        },
        intros: {
            ar: "هل تبحث عن أعلى درجات التوفير في المملكة؟ نقدم لك أقوى **كود خصم الرياض** لعام 2026. يقدم لك هذا الدليل مجموعة متكاملة من التخفيضات المخصصة للمتسوقين داخل العاصمة ومختلف مناطق السعودية. من الأزياء والعطور إلى مستلزمات المنزل، قمنا بتجميع أحدث **عروض الرياض** الفعالة والمحدثة على مدار الساعة عبر فريقنا المختص. لا داعي لدفع السعر الأصلي بعد اليوم! ما عليك سوى نسخ الرمز الترويجي الذي يناسبك من القائمة أدناه ولصقه في صفحة الدفع لتحصل على تخفيضات هائلة وشحن مجاني لطلبياتك.",
            en: "Searching for maximum savings in the Kingdom? We bring you the most powerful **Riyadh coupon code** directory for 2026. This dedicated page offers a comprehensive list of discounts specifically targeted for shoppers in the capital and across Saudi Arabia. From luxury fashion and fragrances to home essentials, we compile the latest working **Riyadh deals** updated around the clock by our dedicated editors. Never pay full retail price again! Simply pick a promotional code from the active list below, apply it at checkout, and unlock massive tiered discounts and free delivery."
        }
    },
    cairo: {
        id: "cairo",
        slug: "cairo-coupons",
        validCountryCode: "eg",
        names: {
            ar: "القاهرة",
            en: "Cairo"
        },
        titles: {
            ar: "أفضل كود خصم في القاهرة 2026 | أقوى عروض مصر – ركن الكوبونات",
            en: "Best Coupon Codes in Cairo 2026 | Top Egypt Deals – Rukn Coupons"
        },
        descriptions: {
            ar: "احصل على أقوى كود خصم في القاهرة لعام 2026 وتمتع بأكبر عروض وتخفيضات مصر الحصرية عبر الإنترنت. كوبونات مصرية مضمونة ومحدثة.",
            en: "Get the most powerful Cairo coupon codes for 2026 and enjoy the biggest online discounts in Egypt. Guaranteed and verified promo codes."
        },
        h1: {
            ar: "أقوى كود خصم وعروض القاهرة",
            en: "Best Coupon Codes & Deals in Cairo"
        },
        intros: {
            ar: "اجعل تجربة التسوق في مصر أكثر متعة وتوفيراً مع أقوى **كود خصم القاهرة** لعام 2026. نظراً لارتفاع تكاليف التسوق مؤخراً، جمعنا لك هنا أحدث الكوبونات المختبرة والموثوقة التي تشمل متاجر الملابس، والإلكترونيات، وتطبيقات طلب الطعام وغيرها داخل الجمهورية. استغل **عروض القاهرة** المذهلة لاقتناء كل ما تحتاجه بأسعار محطمة. الكوبونات التي نقدمها تمنحك خصومات مباشرة عند تفعيلها عبر صفحة الدفع. اختر متجرك المفضل الآن وابدأ بتوفير المال بضغطة زر واحدة.",
            en: "Make online shopping in Egypt an incredibly rewarding experience with the strongest **Cairo coupon code** available in 2026. As retail costs rise, we have aggregated the most reliable, tested promo codes covering local apparel, major electronics, and top food delivery applications across the republic. Take full advantage of these phenomenal **Cairo deals** to acquire everything you need at unbeatable prices. Applying our curated discount codes grants you immediate cash-saving reductions during checkout. Select your preferred retailer below and start keeping more money in your wallet with single a click."
        }
    }
};

export function getCityContent(cityKey: CityKey, locale: string) {
    const data = CITIES[cityKey];
    if (!data) return null;
    const isEn = locale === 'en';
    return {
        ...data,
        name: isEn ? data.names.en : data.names.ar,
        title: isEn ? data.titles.en : data.titles.ar,
        description: isEn ? data.descriptions.en : data.descriptions.ar,
        h1: isEn ? data.h1.en : data.h1.ar,
        intro: isEn ? data.intros.en : data.intros.ar
    };
}
