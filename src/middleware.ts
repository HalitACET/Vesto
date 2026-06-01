import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const SESSION_COOKIE = "vesto_session";

interface SessionPayload {
    uid: string;
    role: "user" | "stylist" | "admin";
}

function parseSession(raw: string): SessionPayload | null {
    try {
        return JSON.parse(Buffer.from(raw, "base64").toString()) as SessionPayload;
    } catch {
        return null;
    }
}

const intlMiddleware = createIntlMiddleware(routing);

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Strip locale prefix to get the "real" path for auth checks
    // e.g. /tr/dashboard → /dashboard, /en/login → /login
    const localePattern = new RegExp(`^/(${routing.locales.join("|")})`);
    const strippedPath = pathname.replace(localePattern, "") || "/";

    const isAuthPage = strippedPath.startsWith("/login") || strippedPath.startsWith("/register");
    const isDashboardPage = strippedPath.startsWith("/dashboard");
    const isCommunityPage = strippedPath === "/dashboard/community";
    const isProtectedDashboardPage = isDashboardPage && !isCommunityPage;
    const isStylistFeaturePage = strippedPath.startsWith("/stylists") || strippedPath.startsWith("/recommendations") || strippedPath.startsWith("/stylist") || strippedPath.startsWith("/notifications");
    const isAdminPage = strippedPath.startsWith("/admin");

    const raw = request.cookies.get(SESSION_COOKIE)?.value;
    const session = raw ? parseSession(raw) : null;

    // Extract current locale from URL for redirect construction
    const localeMatch = pathname.match(localePattern);
    const currentLocale = localeMatch ? localeMatch[1] : routing.defaultLocale;

    function redirectTo(path: string) {
        return NextResponse.redirect(new URL(`/${currentLocale}${path}`, request.url));
    }

    // Unauthenticated user trying to access protected pages
    if (!session && (isProtectedDashboardPage || isAdminPage || isStylistFeaturePage)) {
        return redirectTo("/login");
    }

    // /admin requires admin role
    if (session && isAdminPage && session.role !== "admin") {
        return redirectTo("/dashboard");
    }

    // /dashboard/clients requires stylist or admin
    if (
        session &&
        strippedPath.startsWith("/dashboard/clients") &&
        session.role !== "stylist" &&
        session.role !== "admin"
    ) {
        return redirectTo("/dashboard");
    }

    // Authenticated user visiting auth pages → redirect to dashboard
    if (session && isAuthPage) {
        return redirectTo("/dashboard");
    }

    // Let next-intl handle locale routing (prefix, detection, cookie)
    return intlMiddleware(request);
}

export const config = {
    matcher: [
        // Match locale-prefixed routes and root
        "/(tr|en)/:path*",
        // Also match non-prefixed routes so next-intl can redirect to locale prefix
        "/((?!api|_next|_vercel|.*\\..*).*)",
    ],
};
