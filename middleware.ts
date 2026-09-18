import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "fallback-lpgsafe-dev-secret-key-32chars" });
  const { pathname } = req.nextUrl;

  // Public paths always allowed
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/dealers") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/prices") ||
    pathname.startsWith("/safety") ||
    pathname.startsWith("/cylinders") ||
    pathname.startsWith("/complaints") ||
    pathname.startsWith("/notifications") ||
    pathname.startsWith("/iot") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/verify") ||
    pathname.startsWith("/api/cylinders") ||
    pathname.startsWith("/api/dealers") ||
    pathname.startsWith("/api/prices") ||
    pathname.startsWith("/api/complaints") ||
    pathname.startsWith("/api/inventory") ||
    pathname.startsWith("/api/notifications") ||
    pathname.startsWith("/api/iot") ||
    pathname.startsWith("/api/inspections") ||
    pathname.startsWith("/api/certifications") ||
    pathname.startsWith("/api/supply-chain") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/ai") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".");

  if (isPublic) {
    return NextResponse.next();
  }

  // If not logged in, redirect to login
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const role = token.role;

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
    }
    return NextResponse.next();
  }

  // Inspector routes
  if (pathname.startsWith("/inspector")) {
    if (role !== "INSPECTOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
    }
    return NextResponse.next();
  }

  // Dealer routes
  if (pathname.startsWith("/dealer")) {
    if (role !== "DEALER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?error=AccessDenied", req.url));
    }
    return NextResponse.next();
  }

  // Consumer dashboard
  if (pathname.startsWith("/dashboard")) {
    if (role !== "CONSUMER" && role !== "ADMIN") {
      // If dealer or inspector went to /dashboard, send them to their own dashboard
      if (role === "DEALER") return NextResponse.redirect(new URL("/dealer/dashboard", req.url));
      if (role === "INSPECTOR") return NextResponse.redirect(new URL("/inspector/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dealer/:path*",
    "/inspector/:path*",
    "/admin/:path*",
  ],
};
