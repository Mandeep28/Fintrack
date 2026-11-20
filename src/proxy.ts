import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl;

    // 1. CSRF Origin Verification for state-changing API routes
    if (
      pathname.startsWith("/api/") &&
      !pathname.startsWith("/api/auth/") &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(request.method)
    ) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host") || request.headers.get("x-forwarded-host");

      if (origin && host) {
        try {
          const originUrl = new URL(origin);
          if (originUrl.host !== host) {
            return NextResponse.json(
              { message: "Cross-site request blocked: Origin mismatch" },
              { status: 403 }
            );
          }
        } catch (_e) {
          return NextResponse.json(
            { message: "Invalid Origin header" },
            { status: 403 }
          );
        }
      }
    }

    const response = NextResponse.next();

    // 2. Attach defense-in-depth security headers at edge runtime
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Public routes or auth routes do not require session token
        if (
          pathname.startsWith("/api/auth/") ||
          pathname === "/login" ||
          pathname === "/register" ||
          pathname === "/forgot-password" ||
          pathname === "/"
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/rooms/:path*",
    "/api/expenses/:path*",
    "/api/rooms/:path*",
    "/api/goals/:path*",
    "/api/budgets/:path*",
    "/api/categories/:path*",
    "/api/user/:path*",
    "/api/admin/:path*",
  ],
};
