import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth?.token;

    // 1. Redirect already authenticated users away from auth pages to dashboard
    if (
      token &&
      (pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/forgot-password")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 2. CSRF Origin Verification for state-changing API routes
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

    // 3. Attach defense-in-depth security headers at edge runtime
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

    return response;
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes or auth routes do not require session token
        if (
          pathname.startsWith("/api/auth/") ||
          pathname === "/login" ||
          pathname === "/register" ||
          pathname === "/forgot-password" ||
          pathname === "/privacy" ||
          pathname === "/terms" ||
          pathname === "/"
        ) {
          return true;
        }

        // Unauthenticated or deactivated users are denied
        if (!token || token.status === "DEACTIVATED") {
          return false;
        }

        // Admin-only protection
        if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
          return token.role === "ADMIN";
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/goals/:path*",
    "/expenses/:path*",
    "/categories/:path*",
    "/activity/:path*",
    "/health/:path*",
    "/settings/:path*",
    "/rooms/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/api/expenses/:path*",
    "/api/rooms/:path*",
    "/api/goals/:path*",
    "/api/budgets/:path*",
    "/api/categories/:path*",
    "/api/user/:path*",
    "/api/admin/:path*",
    "/api/insights/:path*",
  ],
};
