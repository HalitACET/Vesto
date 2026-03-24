import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get("vesto_auth")?.value;
    const roleCookie = request.cookies.get("vesto_role")?.value;

    const isAuthPage = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register");
    const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin");

    // Eğer giriş yapmamışsa ve dashboard/admin rotalarına girmeye çalışıyorsa login sayfasına at
    if (!authCookie && isDashboardPage) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Eğer giriş yapmış bir stylist/admin ise ve tekrar login/register sayfasına girmeye çalışıyorsa dashboard'a gönder
    if (authCookie && (roleCookie === "stylist" || roleCookie === "admin") && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

// Sadece bu rotalarda tetiklensin
export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
