"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { adminDb } from "./firebase-admin";
import { redirect } from "next/navigation";
import { getSession } from "./auth-actions";

// Helper to check auth
async function ensureAuth() {
    const isAuth = await getSession();
    if (!isAuth) throw new Error("Unauthorized");
}

/* --- STORES --- */

export async function createStoreAction(data: any) {
    await ensureAuth();
    const docRef = await adminDb.collection("stores").add({
        ...data,
        updatedAt: new Date().toISOString()
    });
    revalidateTag("stores", { expire: 0 });
    revalidatePath("/admin/stores");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true, id: docRef.id };
}

export async function updateStoreAction(id: string, data: any) {
    await ensureAuth();
    await adminDb.collection("stores").doc(id).update({
        ...data,
        updatedAt: new Date().toISOString()
    });
    revalidateTag("stores", { expire: 0 });
    revalidatePath("/admin/stores");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true };
}

export async function deleteStoreAction(id: string) {
    await ensureAuth();
    await adminDb.collection("stores").doc(id).delete();
    revalidateTag("stores", { expire: 0 });
    revalidatePath("/admin/stores");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true };
}

/* --- COUPONS --- */

export async function createCouponAction(data: any) {
    await ensureAuth();
    const docRef = await adminDb.collection("coupons").add({
        ...data,
        usedCount: 0,
        updatedAt: new Date().toISOString()
    });
    revalidateTag("coupons", { expire: 0 });
    revalidatePath("/admin/coupons");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true, id: docRef.id };
}

export async function updateCouponAction(id: string, data: any) {
    await ensureAuth();
    await adminDb.collection("coupons").doc(id).update({
        ...data,
        updatedAt: new Date().toISOString()
    });
    revalidateTag("coupons", { expire: 0 });
    revalidatePath("/admin/coupons");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true };
}

export async function deleteCouponAction(id: string) {
    await ensureAuth();
    await adminDb.collection("coupons").doc(id).delete();
    revalidateTag("coupons", { expire: 0 });
    revalidatePath("/admin/coupons");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true };
}

/* --- CATEGORIES --- */

export async function createCategoryAction(data: any) {
    await ensureAuth();
    await adminDb.collection("categories").add(data);
    revalidateTag("categories", { expire: 0 });
    revalidatePath("/admin/categories");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true };
}

export async function updateCategoryAction(id: string, data: any) {
    await ensureAuth();
    await adminDb.collection("categories").doc(id).update(data);
    revalidateTag("categories", { expire: 0 });
    revalidatePath("/admin/categories");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true };
}


export async function deleteCategoryAction(id: string) {
    await ensureAuth();
    await adminDb.collection("categories").doc(id).delete();
    revalidateTag("categories", { expire: 0 });
    revalidatePath("/admin/categories");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true };
}

/* --- BLOG --- */

export async function createBlogPostAction(data: any) {
    await ensureAuth();
    const docRef = await adminDb.collection("blogPosts").add({
        ...data,
        updatedAt: new Date().toISOString()
    });
    revalidateTag("blogPosts", { expire: 0 });
    revalidatePath("/admin/blog");
    revalidatePath("/(public)/[country]/blog", "layout");
    return { success: true, id: docRef.id };
}

export async function updateBlogPostAction(id: string, data: any) {
    await ensureAuth();
    await adminDb.collection("blogPosts").doc(id).update({
        ...data,
        updatedAt: new Date().toISOString()
    });
    revalidateTag("blogPosts", { expire: 0 });
    revalidatePath("/admin/blog");
    revalidatePath("/(public)/[country]/blog", "layout");
    return { success: true };
}


export async function deleteBlogPostAction(id: string) {
    await ensureAuth();
    await adminDb.collection("blogPosts").doc(id).delete();
    revalidateTag("blogPosts", { expire: 0 });
    revalidatePath("/admin/blog");
    revalidatePath("/(public)/[country]/blog", "layout");
    return { success: true };
}

/* --- SLIDERS --- */

export async function createSliderAction(data: any) {
    await ensureAuth();
    await adminDb.collection("slides").add(data);
    revalidateTag("slides", { expire: 0 });
    revalidatePath("/(public)/[country]", "layout");
    revalidatePath("/admin/sliders");
    return { success: true };
}

export async function updateSliderAction(id: string, data: any) {
    await ensureAuth();
    await adminDb.collection("slides").doc(id).update(data);
    revalidateTag("slides", { expire: 0 });
    revalidatePath("/(public)/[country]", "layout");
    revalidatePath("/admin/sliders");
    return { success: true };
}

export async function deleteSliderAction(id: string) {
    await ensureAuth();
    await adminDb.collection("slides").doc(id).delete();
    revalidateTag("slides", { expire: 0 });
    revalidatePath("/(public)/[country]", "layout");
    revalidatePath("/admin/sliders");
    return { success: true };
}

/* --- BANNERS --- */

export async function createBannerAction(data: any) {
    await ensureAuth();
    await adminDb.collection("adBanners").add(data);
    revalidateTag("adBanners", { expire: 0 });
    revalidatePath("/(public)/[country]", "layout");
    revalidatePath("/admin/banners");
    return { success: true };
}

export async function updateBannerAction(id: string, data: any) {
    await ensureAuth();
    await adminDb.collection("adBanners").doc(id).update(data);
    revalidateTag("adBanners", { expire: 0 });
    revalidatePath("/(public)/[country]", "layout");
    revalidatePath("/admin/banners");
    return { success: true };
}


export async function deleteBannerAction(id: string) {
    await ensureAuth();
    await adminDb.collection("adBanners").doc(id).delete();
    revalidateTag("adBanners", { expire: 0 });
    revalidatePath("/(public)/[country]", "layout");
    revalidatePath("/admin/banners");
    return { success: true };
}

/* --- RULES --- */

export async function createRuleAction(data: any) {
    await ensureAuth();
    await adminDb.collection("rules").add({
        ...data,
        updatedAt: new Date().toISOString()
    });
    revalidateTag("rules", { expire: 0 });
    revalidatePath("/admin/rules");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true };
}

export async function updateRuleAction(id: string, data: any) {
    await ensureAuth();
    await adminDb.collection("rules").doc(id).update({
        ...data,
        updatedAt: new Date().toISOString()
    });
    revalidateTag("rules", { expire: 0 });
    revalidatePath("/admin/rules");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true };
}


export async function deleteRuleAction(id: string) {
    await ensureAuth();
    await adminDb.collection("rules").doc(id).delete();
    revalidateTag("rules", { expire: 0 });
    revalidatePath("/admin/rules");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true };
}

/* --- CONFIGS --- */

export async function updateTrackingConfigAction(data: any) {
    await ensureAuth();
    await adminDb.collection("settings").doc("tracking").set(data, { merge: true });
    revalidateTag("tracking", { expire: 0 });
    revalidatePath("/admin/tracking");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true };
}

export async function updateSocialConfigAction(data: any) {
    await ensureAuth();
    await adminDb.collection("settings").doc("social").set(data, { merge: true });
    revalidateTag("social", { expire: 0 });
    revalidatePath("/admin/social");
    revalidatePath("/(public)/[country]", "layout");
    return { success: true };
}
