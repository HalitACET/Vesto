"use server";

import { adminDb } from "@/lib/firebase/admin";
import { getServerSession } from "@/lib/firebase/serverAuth";
import type { AdminReviewStatus, ClothingCategory } from "@/types";

// ── Input types ───────────────────────────────────────────────────────────────

export interface ApproveItemInput {
    itemId: string;
}

export interface RejectItemInput {
    itemId: string;
    notes: string;
}

export interface CorrectItemInput {
    itemId: string;
    corrections: {
        color?: string;
        material?: string;
        pattern?: string;
        category?: ClothingCategory;
    };
    notes?: string;
}

// ── Result type ───────────────────────────────────────────────────────────────

export interface ActionResult {
    ok: boolean;
    error?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<{ uid: string } | ActionResult> {
    const session = await getServerSession();
    if (!session || session.role !== "admin") {
        return { ok: false, error: "Yetkisiz işlem: admin rolü gerekli." };
    }
    return { uid: session.uid };
}

function isActionResult(v: unknown): v is ActionResult {
    return typeof v === "object" && v !== null && "ok" in v && (v as ActionResult).ok === false;
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function approveWardrobeItem(input: ApproveItemInput): Promise<ActionResult> {
    const auth = await requireAdmin();
    if (isActionResult(auth)) return auth;

    try {
        await adminDb.collection("wardrobeItems").doc(input.itemId).update({
            adminReview: {
                status: "approved" satisfies AdminReviewStatus,
                reviewedBy: auth.uid,
                reviewedAt: new Date().toISOString(),
                corrections: null,
                notes: null,
            },
        });
        return { ok: true };
    } catch (err) {
        console.error("[approveWardrobeItem]", err);
        return { ok: false, error: "Firestore yazma hatası." };
    }
}

export async function rejectWardrobeItem(input: RejectItemInput): Promise<ActionResult> {
    const auth = await requireAdmin();
    if (isActionResult(auth)) return auth;

    try {
        await adminDb.collection("wardrobeItems").doc(input.itemId).update({
            adminReview: {
                status: "rejected" satisfies AdminReviewStatus,
                reviewedBy: auth.uid,
                reviewedAt: new Date().toISOString(),
                corrections: null,
                notes: input.notes,
            },
        });
        return { ok: true };
    } catch (err) {
        console.error("[rejectWardrobeItem]", err);
        return { ok: false, error: "Firestore yazma hatası." };
    }
}

export async function correctWardrobeItem(input: CorrectItemInput): Promise<ActionResult> {
    const auth = await requireAdmin();
    if (isActionResult(auth)) return auth;

    try {
        await adminDb.collection("wardrobeItems").doc(input.itemId).update({
            adminReview: {
                status: "corrected" satisfies AdminReviewStatus,
                reviewedBy: auth.uid,
                reviewedAt: new Date().toISOString(),
                corrections: input.corrections,
                notes: input.notes ?? null,
            },
        });
        return { ok: true };
    } catch (err) {
        console.error("[correctWardrobeItem]", err);
        return { ok: false, error: "Firestore yazma hatası." };
    }
}

// Adminın kuyruktaki AI bekleyen öğeleri çekmesi için
// (aiAnalysis olan, adminReview'ı olmayan veya seçili statustaki öğeler)
export async function fetchAIQueue(
    statusFilter: AdminReviewStatus | "pending" | "all" = "all"
): Promise<ActionResult & { items?: unknown[] }> {
    const auth = await requireAdmin();
    if (isActionResult(auth)) return auth;

    try {
        // aiAnalysis null olmayan item'ları getir
        // Firestore'da field existence için != null sorgusu kullanılır
        const snapshot = await adminDb
            .collection("wardrobeItems")
            .where("aiAnalysis", "!=", null)
            .get();
        const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        const filtered =
            statusFilter === "all"
                ? all
                : statusFilter === "pending"
                ? all.filter((item) => {
                      const i = item as { adminReview?: { status: string } | null };
                      return !i.adminReview;
                  })
                : all.filter((item) => {
                      const i = item as { adminReview?: { status: string } | null };
                      return i.adminReview?.status === statusFilter;
                  });

        return { ok: true, items: filtered };
    } catch (err) {
        console.error("[fetchAIQueue]", err);
        return { ok: false, error: "Firestore okuma hatası." };
    }
}
