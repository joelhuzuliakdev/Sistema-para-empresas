import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const ADMIN_ROUTES = ["/dashboard", "/products", "/clients", "/cash", "/reports", "/sales", "/team"];

export const onRequest = defineMiddleware(async ({ url, request, cookies, redirect }, next) => {
    const pathname = url.pathname;

    if (PUBLIC_ROUTES.includes(pathname)) return next();

    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
        return redirect("/login");
    }

    const supabase = createClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    if (error || !user) return redirect("/login");

    const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

    const role = roleData?.role ?? "employee";

    if (role === "employee" && ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
        return redirect("/employee");
    }

    if (role === "admin" && pathname.startsWith("/employee")) {
        return redirect("/dashboard");
    }

    return next();
});