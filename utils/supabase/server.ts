import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

let cookiesModule: any = null;

// Try to import cookies from next/headers, but handle cases where it's not available
try {
  cookiesModule = require("next/headers");
} catch (error) {
  // next/headers is not available in this context
  cookiesModule = null;
}

export const createClient = (
  request?: NextRequest,
  response?: NextResponse
) => {
  // If request and response are provided, use middleware-style cookie handling
  if (request && response) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: "", ...options });
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );
  }

  // If cookies module is available (App Router Server Components), use it
  if (cookiesModule?.cookies) {
    const cookieStore = cookiesModule.cookies();

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
  }

  // Fallback: create a basic server client without cookie management
  // This is useful in contexts where cookies are not available
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() {
          return undefined;
        },
        set() {
          /* no-op */
        },
        remove() {
          /* no-op */
        },
      },
    }
  );
};
