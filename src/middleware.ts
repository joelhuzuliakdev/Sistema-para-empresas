import { defineMiddleware } from "astro:middleware";
import { createSupabaseServer } from "../src/lib/supabaseServer";

const PUBLIC_ROUTES = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
];

const EMPLOYEE_ONLY_ROUTES = ["/empleado"];

const OWNER_ONLY_ROUTES = [
    "/inicio",
    "/productos",
    "/ventas",
    "/caja",
    "/clientes",
    "/reportes",
    "/equipo",
    "/facturas",
    "/proveedores",
    "/configuraciones",
    "/stock",
];

export const onRequest = defineMiddleware(async ({ url, request, cookies, redirect }, next) => {
    const pathname = url.pathname;

    if (PUBLIC_ROUTES.includes(pathname)) return next();
    if (pathname.startsWith("/api/")) return next();
    if (pathname.startsWith("/_")) return next();

    const supabase = createSupabaseServer(request, cookies);

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return redirect("/login");

    const { data: roleData } = await supabase
        .from("user_roles")
        .select("role, activo, plan_expira_en")
        .eq("user_id", user.id)
        .single();

    const role         = roleData?.role         ?? "employee";
    const activo       = roleData?.activo       ?? false;
    const planExpiraEn = roleData?.plan_expira_en ?? null;

    if (!activo) return redirect("/login");

    if (role === "employee" && OWNER_ONLY_ROUTES.some(r => pathname.startsWith(r))) {
        return redirect("/empleado");
    }

    if ((role === "owner" || role === "admin") && EMPLOYEE_ONLY_ROUTES.some(r => pathname.startsWith(r))) {
        return redirect("/inicio");
    }

    return next();
});