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

        // Convert class instances (like Timestamps) to plain objects so Next.js can serialize them
        const plainObjects = JSON.parse(JSON.stringify(filtered));
        return { ok: true, items: plainObjects };
    } catch (err) {
        console.error("[fetchAIQueue]", err);
        return { ok: false, error: "Firestore okuma hatası." };
    }
}
// ── Moderation ─────────────────────────────────────────────────────────────────

export async function approveReportAndPenalize(reportId: string): Promise<ActionResult> {
    const auth = await requireAdmin();
    if (isActionResult(auth)) return auth;

    try {
        const reportRef = adminDb.collection('reports').doc(reportId);
        const reportDoc = await reportRef.get();
        if (!reportDoc.exists) return { ok: false, error: 'Rapor bulunamadı.' };

        const report = reportDoc.data()!;
        const { targetType, targetId, reason } = report;
        let authorId: string | undefined;

        if (targetType === 'post') {
            const postRef = adminDb.collection('forumPosts').doc(targetId);
            const postDoc = await postRef.get();
            if (postDoc.exists) {
                authorId = postDoc.data()!.authorId;
                await postRef.update({
                    isArchived: true,
                    isModerated: true,
                    moderationReason: reason || 'Kural ihlali',
                    moderatedAt: new Date().toISOString(),
                    moderatedBy: auth.uid,
                });
            }
        } else if (targetType === 'comment') {
            const commentRef = adminDb.collection('forumComments').doc(targetId);
            const commentDoc = await commentRef.get();
            if (commentDoc.exists) {
                authorId = commentDoc.data()!.authorId;
                await commentRef.update({
                    isArchived: true,
                    isModerated: true,
                    moderatedAt: new Date().toISOString(),
                });
            }
        }

        if (authorId) {
            const userRef = adminDb.collection('users').doc(authorId);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                const strikes = (userDoc.data()?.strikes || 0) + 1;
                await userRef.update({
                    strikes,
                    isSuspended: strikes >= 3,
                    lastStrikeReason: reason || 'Kural ihlali',
                    lastStrikeAt: new Date().toISOString(),
                    lastStrikeBy: auth.uid,
                });
            }
        }

        await reportRef.update({
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
            resolvedBy: auth.uid,
        });

        return { ok: true, data: { strikes: authorId ? ((await adminDb.collection('users').doc(authorId).get()).data()?.strikes || 0) : 0 } };
    } catch (err) {
        console.error('[approveReportAndPenalize]', err);
        return { ok: false, error: 'Veritabanı hatası.' };
    }
}

export async function approveReportAdmin(reportId: string): Promise<ActionResult> {
    const auth = await requireAdmin();
    if (isActionResult(auth)) return auth;

    try {
        const reportRef = adminDb.collection('reports').doc(reportId);
        const reportDoc = await reportRef.get();
        if (!reportDoc.exists) return { ok: false, error: 'Rapor bulunamadı.' };

        const report = reportDoc.data()!;
        const { targetType, targetId, reason } = report;

        if (targetType === 'post') {
            await adminDb.collection('forumPosts').doc(targetId).update({
                isArchived: true,
                isModerated: true,
                moderationReason: reason || 'Şikayet üzerine kaldırıldı',
                moderatedAt: new Date().toISOString(),
                moderatedBy: auth.uid,
            });
        } else if (targetType === 'comment') {
            await adminDb.collection('forumComments').doc(targetId).update({
                isArchived: true,
                isModerated: true,
                moderatedAt: new Date().toISOString(),
            });
        }

        await reportRef.update({
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
            resolvedBy: auth.uid,
        });

        return { ok: true };
    } catch (err) {
        console.error('[approveReportAdmin]', err);
        return { ok: false, error: 'Veritabanı hatası.' };
    }
}

export async function dismissReportAdmin(reportId: string): Promise<ActionResult> {
    const auth = await requireAdmin();
    if (isActionResult(auth)) return auth;

    try {
        await adminDb.collection('reports').doc(reportId).update({
            status: 'dismissed',
            resolvedAt: new Date().toISOString(),
            resolvedBy: auth.uid,
        });

        return { ok: true };
    } catch (err) {
        console.error('[dismissReportAdmin]', err);
        return { ok: false, error: 'Veritabanı hatası.' };
    }
}

export async function removeCommentAdmin(commentId: string): Promise<ActionResult> {
    const auth = await requireAdmin();
    if (isActionResult(auth)) return auth;

    try {
        const commentRef = adminDb.collection('forumComments').doc(commentId);
        const commentDoc = await commentRef.get();
        if (!commentDoc.exists) return { ok: false, error: 'Yorum bulunamadı.' };

        await commentRef.update({
            isArchived: true,
            isModerated: true,
            moderatedAt: new Date().toISOString(),
            moderatedBy: auth.uid,
        });

        return { ok: true };
    } catch (err) {
        console.error('[removeCommentAdmin]', err);
        return { ok: false, error: 'Veritabanı hatası.' };
    }
}

export async function removePostAdmin(postId: string, reason: string): Promise<ActionResult> {
    const auth = await requireAdmin();
    if (isActionResult(auth)) return auth;

    try {
        const postRef = adminDb.collection('forumPosts').doc(postId);
        const postDoc = await postRef.get();
        if (!postDoc.exists) return { ok: false, error: 'Post bulunamadı.' };

        await postRef.update({
            isArchived: true,
            isModerated: true,
            moderationReason: reason,
            moderatedAt: new Date().toISOString(),
            moderatedBy: auth.uid,
        });

        return { ok: true };
    } catch (err) {
        console.error('[removePostAdmin]', err);
        return { ok: false, error: 'Veritabanı hatası.' };
    }
}

export async function restorePostAdmin(postId: string): Promise<ActionResult> {
    const auth = await requireAdmin();
    if (isActionResult(auth)) return auth;

    try {
        const postRef = adminDb.collection('forumPosts').doc(postId);
        const postDoc = await postRef.get();
        if (!postDoc.exists) return { ok: false, error: 'Post bulunamadı.' };

        await postRef.update({
            isArchived: false,
            isModerated: false,
            moderationReason: null,
            moderatedAt: null,
            moderatedBy: null,
        });

        return { ok: true };
    } catch (err) {
        console.error('[restorePostAdmin]', err);
        return { ok: false, error: 'Veritabanı hatası.' };
    }
}

