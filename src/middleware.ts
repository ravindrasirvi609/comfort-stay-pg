import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./app/lib/auth";

// Public paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/about",
  "/contact",
  "/faqs",
  "/gallery",
  "/testimonials",
  "/facilities",
  "/favicon.ico",
];

// Admin only paths
const adminPaths = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public paths
  if (
    publicPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
  ) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get("token")?.value;

  // If no token found, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify token and get user data
  const user = verifyToken(token);

  // If token is invalid, redirect to login
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check for admin paths
  if (
    adminPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
  ) {
    // Only allow admin users to access admin paths
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Allow authenticated users to proceed
  return NextResponse.next();
}

// Configure middleware to run on all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|images/|favicon.ico).*)",
  ],
};
