import type { APIRoute } from "astro";
import { createSupabaseServer } from "../../../lib/supabaseServer";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
    const form = await request.formData();
    const email    = form.get("email")    as string;
    const password = form.get("password") as string;

    const supabase = createSupabaseServer(request, cookies);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
