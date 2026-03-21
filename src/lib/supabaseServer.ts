import { createServerClient } from "@supabase/ssr";

export function createSupabaseServer(request: Request, cookies: any) {
    return createServerClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_KEY,
        {
            cookies: {
                getAll() {
                    // Verificación defensiva por si cookies no está listo
                    if (typeof cookies?.getAll !== "function") return [];
                    return cookies.getAll().map((c: any) => ({
                        name: c.name,
                        value: c.value,
                    }));
                },
                setAll(cookiesToSet: any[]) {
                    if (typeof cookies?.set !== "function") return;
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookies.set(name, value, options);
                    });
                },
            },
        }
    );
}