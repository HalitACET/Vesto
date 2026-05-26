import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import type { UserRole } from "@/types";

// firebase-admin Node.js runtime gerektirir — Edge Runtime'da çalışmaz
export const runtime = "nodejs";

const SESSION_COOKIE = "vesto_session";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

// POST /api/auth/session
// Body: { idToken: string }
// Yanıt: HTTP-only session cookie set eder
export async function POST(request: NextRequest) {
    try {
        const { idToken } = (await request.json()) as { idToken: string };

        if (!idToken) {
            return NextResponse.json({ error: "idToken gerekli" }, { status: 400 });
        }

        // 1. ID token'ı Firebase Admin SDK ile doğrula
        const decoded = await adminAuth.verifyIdToken(idToken);

        // 2. Firestore'dan gerçek rolü çek — token'daki custom claim'e güvenme
        const userSnap = await adminDb.collection("users").doc(decoded.uid).get();
        if (!userSnap.exists) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        const role = (userSnap.data()?.role ?? "user") as UserRole;

        // 4. Session payload'ı oluştur ve base64'e encode et
        //    HTTP-only cookie olacağı için browser JS erişemez, sadece server set eder
        const payload = Buffer.from(JSON.stringify({ uid: decoded.uid, role })).toString("base64");

        const response = NextResponse.json({ ok: true, role });

        // HTTP-only: JS erişemez (XSS koruması)
        // sameSite strict: CSRF koruması
        // secure: sadece HTTPS'te gönderilir (production'da)
        response.cookies.set(SESSION_COOKIE, payload, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: ONE_WEEK_SECONDS,
            path: "/",
        });

        return response;
    } catch (err) {
        console.error("[session POST]", err);
        return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
    }
}

// DELETE /api/auth/session
// Session cookie'yi temizler
export async function DELETE() {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, "", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
        path: "/",
    });
    return response;
}
