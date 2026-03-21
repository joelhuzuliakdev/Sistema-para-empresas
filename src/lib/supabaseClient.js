import { createBrowserClient, createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY

// Para usar en el cliente (browser) - en <script> tags
export const supabase = createBrowserClient(supabaseUrl, supabaseKey)

// Para usar en el servidor - en el frontmatter de .astro
export function createServerSupabase(context) {
    return createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return parseCookieHeader(context.request.headers.get('Cookie') ?? '')
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    context.cookies.set(name, value, options)
                })
            },
        },
    })
}