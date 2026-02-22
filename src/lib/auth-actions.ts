"use server";

import { cookies } from "next/headers";
import { verifyCredentials } from "./data-service";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const isValid = await verifyCredentials(username, password);

    if (isValid) {
        const cookieStore = await cookies();
        cookieStore.set("admin_token", "valid_session", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });
        return { success: true };
    }

    return { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_token");
    redirect("/login");
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");
    return token?.value === "valid_session";
}
