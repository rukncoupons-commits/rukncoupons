import React from "react";
import { getBlogPosts, getCategories, getCountries, getStores } from "@/lib/data-service";
import AdminBlogClient from "@/components/admin/AdminBlogClient";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
    const posts = await getBlogPosts();
    const categories = await getCategories();
    const countries = await getCountries();
    const stores = await getStores();

    // Filter blog categories
    const blogCategories = categories.filter(c => c.type === "blog");

    return (
        <AdminBlogClient
            initialPosts={posts}
            categories={blogCategories}
            countries={countries}
            stores={stores}
        />
    );
}
