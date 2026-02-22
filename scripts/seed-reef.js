const admin = require("firebase-admin");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

async function addReefPerfumes() {
    try {
        console.log("Adding Reef Perfumes...");

        const storeRef = await db.collection("stores").add({
            name: "عطور ريف (Reef Perfumes)",
            nameEn: "Reef Perfumes",
            slug: "reef-perfumes",
            logoUrl: "https://reefperfumes.com/wp-content/uploads/2021/08/logo.png",
            description: "تسوق أرقى العطور الشرقية والفرنسية من عطور ريف.",
            longDescription: "عطور ريف هي علامة تجارية رائدة في مجال العطور تقدم تشكيلة واسعة من العطور الفاخرة التي تناسب جميع الأذواق.",
            category: "perfumes-and-makeup",
            storeUrl: "https://reefperfumes.com",
            countryCodes: ["sa", "ae", "kw"],
            isActive: true,
            isFeatured: true,
            seo: {
                metaTitle: "كود خصم عطور ريف 2026 | كوبون فعال على جميع العطور",
                metaDescription: "استخدم كود خصم عطور ريف وتسوق أفضل العطور الشرقية والفرنسية بأقل الأسعار.",
                ogTitle: "عطور ريف | خصومات حصرية",
                ogDescription: "وفر أكثر مع أحدث كوبونات عطور ريف.",
                ogImage: "https://reefperfumes.com/wp-content/uploads/2021/08/logo.png"
            },
            shippingInfo: "شحن مجاني للطلبات فوق 200 ريال",
            returnPolicy: "استرجاع خلال 7 أيام",
            updatedAt: new Date().toISOString()
        });

        console.log("Store added with ID:", storeRef.id);

        await db.collection("coupons").add({
            storeId: storeRef.id,
            title: "كود خصم 15% على جميع العطور",
            description: "استخدم الكود عند الدفع للحصول على خصم 15% إضافي على جميع مشترياتك من عطور ريف.",
            code: "REEF15",
            discountValue: "15%",
            type: "code",
            category: "perfumes",
            countryCodes: ["sa", "ae", "kw"],
            isActive: true,
            isFeatured: true,
            isVerified: true,
            isExclusive: true,
            usedCount: 0,
            linkUrl: "https://reefperfumes.com",
            updatedAt: new Date().toISOString()
        });

        console.log("Coupon added successfully.");
        process.exit(0);
    } catch (e) {
        console.error("Error adding data:", e);
        process.exit(1);
    }
}

addReefPerfumes();
