// Use next.js middleware without edge runtime
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Public paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/admin-login",
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

// Edge-compatible token verification
async function verifyToken(token: string) {
  try {
    // Secret key for JWT
    const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
    // Convert the secret to the format expected by jose
    const JWT_SECRET_BYTES = new TextEncoder().encode(JWT_SECRET);

    const { payload } = await jwtVerify(token, JWT_SECRET_BYTES);

    return {
      _id: (payload._id as string) || (payload.sub as string) || "unknown",
      name: (payload.name as string) || "Unknown",
      email: (payload.email as string) || "unknown@example.com",
      role: (payload.role as string) || "user",
      pgId: payload.pgId as string | undefined,
    };
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
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
  const debugCookie = request.cookies.get("debug_admin_login")?.value;

  console.log(
    "[Middleware] Cookies available:",
    Object.fromEntries(
      request.cookies
        .getAll()
        .map((c) => [c.name, c.value.substring(0, 10) + "..."])
    )
  );
  console.log("[Middleware] Debug cookie found:", debugCookie);

  // If no token found, redirect to login
  if (!token) {
    console.log("[Middleware] No token found, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify token and get user data
  const user = await verifyToken(token);
  console.log("[Middleware] User from token:", user);

  // If token is invalid, redirect to login
  if (!user) {
    console.log("[Middleware] Invalid token, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check for admin paths
  if (
    adminPaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    )
  ) {
    console.log(
      "[Middleware] Checking admin access:",
      pathname,
      "User role:",
      user.role
    );
    // Only allow admin users to access admin paths
    if (user.role !== "admin") {
      console.log("[Middleware] Not admin, redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    console.log(
      "[Middleware] Admin role verified, allowing access to",
      pathname
    );
  }

  // Allow authenticated users to proceed
  return NextResponse.next();
}

// Configure middleware to run on all routes except static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (static images)
     * - api/ (API routes)
     * - sw.js (service worker)
     * - pwa.js (PWA registration)
     * - sw-register.js (service worker registration)
     * - manifest.json (PWA manifest)
     * - workbox-*.js (Workbox library files)
     */
    "/((?!_next/static|_next/image|images/|favicon.ico|api/|sw.js|pwa.js|sw-register.js|manifest.json|workbox-).*)$",
  ],
};
