import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";

const SESSION_COOKIE = "vesto_session";

interface SessionPayload {
    uid: string;
    role: UserRole;
}

function parseSession(raw: string): SessionPayload | null {
    try {
        return JSON.parse(Buffer.from(raw, "base64").toString()) as SessionPayload;
    } catch {
        return null;
    }
}

// Session cookie'yi okur, geçerliyse payload döner, yoksa null döner
export async function getServerSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE)?.value;
    if (!raw) return null;
    return parseSession(raw);
}

// Authenticated olmasını zorunlu kılar; değilse /login'e redirect atar
export async function requireAuth(): Promise<SessionPayload> {
    const session = await getServerSession();
    if (!session) redirect("/login");
    return session;
}

// Belirli bir rol gerektiren sayfalarda kullan
// Yetersiz yetkide /dashboard'a redirect atar (403 yerine sessiz redirect — UX tercihi)
export async function requireRole(role: UserRole): Promise<SessionPayload> {
    const session = await requireAuth();
    const allowed =
        session.role === role ||
        // Admin her role'ü geçer
        session.role === "admin";
    if (!allowed) redirect("/dashboard");
    return session;
}
