const fs = require('fs');
const path = require('path');

const data = require('./extracted-data.json');

// Master dictionary of Arabic to English brand names from extracted data
const brandDictionary = {
    "علي إكسبرس": "AliExpress",
    "صيدلية وايتس": "Whites",
    "تويز آر أص": "Toys R Us",
    "إيس": "ACE Hardware",
    "ذا بودي شوب": "The Body Shop",
    "كارفور": "Carrefour",
    "ماج": "Maje",
    "فيسز (وجوه سابقاً)": "Faces",
    "كيابي": "Kiabi",
    "نكست": "Next",
    "أول بيردز": "Allbirds",
    "الميثالي": "Almaithaly",
    "أناس": "Ounass",
    "فيرجن ميجاستور": "Virgin Megastore",
    "وفرة": "Waffrah",
    "بي تك": "B.TECH",
    "باث & بودي وركس": "Bath & Body Works",
    "فيرست كراي": "Firstcry",
    "ThrowMeNot": "ThrowMeNot",
    "مترو برازيل": "Metro Brazil",
    "ToYou": "ToYou",
    "جرير": "Jarir Bookstore",
    "H&M": "H&M",
    "المسافر": "Almosafer",
    "يوباي": "Ubuy",
    "٦ ستريت": "6th Street",
    "تيمو": "Temu",
    "هوم سنتر": "Home Centre",
    "مذركير": "Mothercare",
    "فوغا كلوسيت": "VogaCloset",
    "جاب": "GAP",
    "ديفاكتو": "DeFacto",
    "بوتري بارن": "Pottery Barn",
    "إكسترا": "eXtra",
    "أمازون": "Amazon",
    "بوكينج": "Booking.com",
    "سامسونج": "Samsung",
    "جاهز": "Jahez",
    "صيدلية النهدي": "Nahdi Pharmacy",
    "فيكتوريا سيكريت": "Victoria's Secret",
    "نون": "Noon",
    "أمريكان إيجل": "American Eagle",
    "ايكيا": "IKEA",
    "شي إن": "SHEIN",
    "سيفي": "Sivvi",
    "ليڤيل شوز": "Level Shoes",
    "دكتور نيوترشن": "Dr Nutrition",
    "سنتربوينت": "Centrepoint",
    "نمشي": "Namshi",
    "مجوهرات داماس": "Damas Jewellery",
    "آي هيرب": "iHerb",
    "ماكس فاشون": "Max Fashion",
    "Glasseslit": "Glasseslit",
    "سيفورا": "Sephora",
    "سبلاش": "Splash",
    "المطار": "Almatar",
    "أجودا": "Agoda",
    "ماماز وباباز": "Mamas & Papas",
    "ناو ناو": "NowNow",
    "سبورتر": "Sporter",
    "800 فلاورز": "800 Flowers",
    "Bloomingdale's": "Bloomingdale's",
    "مرسول": "Mrsool",
    "جوميا": "Jumia",
    "طلبات": "Talabat",
    "ممزورلد": "Mumzworld",
    "هنقرستيشن": "Hungerstation",
    "عطور ريف (Reef Perfumes)": "Reef Perfumes",
    "وست إلم": "West Elm"
};

const processedStores = data.stores.map(store => {
    const enName = brandDictionary[store.name] || store.name;
    const year = new Date().getFullYear();

    const faqEn = [
        {
            question: `What is the latest ${enName} coupon code?`,
            answer: `The latest ${enName} coupon code gives you an instant discount on your purchase. Apply it at checkout to save on your entire order.`
        },
        {
            question: `How do I use a ${enName} promo code?`,
            answer: `To use a ${enName} promo code, simply copy the code from our site, paste it into the "Promo Code" or "Discount Code" box at checkout on the ${enName} website or app, and click apply.`
        },
        {
            question: `Does ${enName} offer free shipping?`,
            answer: `Free shipping policies at ${enName} vary depending on your location and order value. Often, using a specific ${enName} coupon can unlock free delivery.`
        },
        {
            question: `Are these ${enName} discount codes tested and working?`,
            answer: `Yes, all ${enName} discount codes and offers on our platform are regularly tested and verified by our team to assure they are working and valid.`
        }
    ];

    return {
        ...store,
        nameEn: enName,
        descriptionEn: `Find the latest ${enName} coupon codes, promo codes, and exclusive deals. Save on your favorite products with verified ${enName} discount codes today.`,
        seoTitleEn: `${enName} Coupon Code Saudi Arabia ${year} – Verified & Working`,
        metaDescriptionEn: `Get the latest ${enName} coupon codes for Saudi Arabia. Save big on your online shopping with our verified and working ${enName} promo codes and deals.`,
        faqEn
    };
});

const processedCoupons = data.coupons.map(coupon => {
    const storeObj = processedStores.find(s => s.id === coupon.storeId);
    const storeNameEn = storeObj ? storeObj.nameEn : "this store";

    // Auto-detect discount value if possible
    let discountStr = coupon.discountValue || "Discount";
    let englishDiscount = discountStr.replace('خصم', 'Off').replace('شحن مجاني', 'Free Shipping').replace('ريال', 'SAR').replace('درهم', 'AED').trim();

    return {
        ...coupon,
        titleEn: `${englishDiscount} With This ${storeNameEn} Coupon Code`,
        descriptionEn: `Use this verified ${storeNameEn} coupon code to get ${englishDiscount.toLowerCase()} on your purchase. Valid for selected items while the promotion lasts.`,
        discountValueEn: englishDiscount
    };
});

const output = { stores: processedStores, coupons: processedCoupons };
fs.writeFileSync(path.join(__dirname, 'translated-data.json'), JSON.stringify(output, null, 2));
console.log(`Generated SEO & Translations for ${processedStores.length} stores and ${processedCoupons.length} coupons.`);
