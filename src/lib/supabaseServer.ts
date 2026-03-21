import { createServerClient } from "@supabase/ssr";

export function createSupabaseServer(request: Request, cookies: any) {
    return createServerClient(
        import.meta.env.PUBLIC_SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_KEY,
        {
            cookies: {
                getAll() {
                    const cookieHeader = request.headers.get("Cookie") ?? "";
                    if (!cookieHeader) return [];
                    
                    return cookieHeader.split(";").map((cookie) => {
                        const [name, ...rest] = cookie.trim().split("=");
                        return {
                            name: name.trim(),
                            value: rest.join("=").trim(),
                        };
                    });
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookies.set(name, value, options)
                    );
                },
            },
        }
    );
}