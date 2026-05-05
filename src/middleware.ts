import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "vesto_session";

interface SessionPayload {
    uid: string;
    role: "user" | "stylist" | "admin";
}

// HTTP-only cookie'yi parse eder.
// Bu cookie sadece server (API route) tarafından set edildiği için
// browser JS ile manipüle edilemez — içeriğine güvenilebilir.
function parseSession(raw: string): SessionPayload | null {
    try {
        return JSON.parse(Buffer.from(raw, "base64").toString()) as SessionPayload;
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isDashboardPage = pathname.startsWith("/dashboard");
    const isAdminPage = pathname.startsWith("/admin");

    const raw = request.cookies.get(SESSION_COOKIE)?.value;
    const session = raw ? parseSession(raw) : null;

    // Giriş yapmamış kullanıcı korumalı sayfaya erişmeye çalışıyor
    if (!session && (isDashboardPage || isAdminPage)) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // /admin sadece admin rolüne açık
    if (session && isAdminPage && session.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // /dashboard/clients sadece stylist ve admin'e açık
    if (
        session &&
        pathname.startsWith("/dashboard/clients") &&
        session.role !== "stylist" &&
        session.role !== "admin"
    ) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Giriş yapmış kullanıcı auth sayfasına gitmeye çalışıyor
    if (session && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
