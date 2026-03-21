import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";

const PUBLIC_ROUTES = [
    "/",
    "/login",
    "/register",
    "/pago",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",   // ← faltaba
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
    "/stock",           // ← la nueva página de movimientos
];

export const onRequest = defineMiddleware(async ({ url, cookies, redirect }, next) => {
    const pathname = url.pathname;

    if (PUBLIC_ROUTES.includes(pathname)) return next();
    if (pathname.startsWith("/api/")) return next();        // cubre /api/webhook y cualquier otra
    if (pathname.startsWith("/_")) return next();           // assets internos de Astro

    const accessToken = cookies.get("sb-access-token")?.value;
    const refreshToken = cookies.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) return redirect("/login");

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
        .select("role, activo, plan_expira_en")
        .eq("user_id", user.id)
        .single();

    const role           = roleData?.role           ?? "employee";
    const activo         = roleData?.activo         ?? false;
    const planExpiraEn   = roleData?.plan_expira_en ?? null;

    // Cuenta desactivada
    if (!activo) return redirect("/login");

    // Plan vencido → redirigir a la página de pago (solo si no está ya ahí)
    if (planExpiraEn && new Date(planExpiraEn) < new Date() && pathname !== "/pago") {
        return redirect("/pago");
    }

    // Empleado intentando entrar a rutas de owner
    if (role === "employee" && OWNER_ONLY_ROUTES.some(r => pathname.startsWith(r))) {
        return redirect("/empleado");
    }

    // Owner/admin intentando entrar al panel de empleado
    if ((role === "owner" || role === "admin") && EMPLOYEE_ONLY_ROUTES.some(r => pathname.startsWith(r))) {
        return redirect("/inicio");
    }

    return next();
});