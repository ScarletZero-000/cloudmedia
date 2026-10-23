import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Strict route protection:
 * - /admin/**  → ADMIN only; anyone else (signed-in non-admins and anonymous
 *   visitors alike) is REDIRECTED to "/".
 * - /upload    → any signed-in user; anonymous visitors go to /login.
 * - everything else → public.
 *
 * The role travels inside the signed JWT (set in lib/auth.ts callbacks),
 * so verification happens at the edge without a database round-trip.
 */
export default withAuth(
  function middleware(req) {
    // Defense in depth: `authorized` below already gates /admin, but this
    // explicit check guarantees the redirect-to-home behaviour.
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (req.nextauth.token?.role !== "ADMIN") {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;

        if (path.startsWith("/admin")) {
          return token?.role === "ADMIN";
        }
        if (path.startsWith("/upload")) {
          return Boolean(token);
        }
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/upload", "/upload/:path*"],
};
