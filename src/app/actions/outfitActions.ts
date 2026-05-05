"use server";

import { adminDb } from "@/lib/firebase/admin";
import { getServerSession } from "@/lib/firebase/serverAuth";
import type {
    CanvasLayoutItem,
    ClothingCategory,
    OccasionTag,
    OutfitItemSnapshot,
    OutfitSeason,
    OutfitSource,
    OutfitStatus,
    OutfitVisibility,
} from "@/types";

// ── Input type ────────────────────────────────────────────────────────────────

export interface CreateOutfitInput {
    name: string;
    description?: string;
    // canvasItems zaten snapshot içeriyor — ayrıca ID listesi çıkarılır
    canvasLayout: CanvasLayoutItem[];
    itemSnapshots: OutfitItemSnapshot[];
    occasion: OccasionTag | null;
    season: OutfitSeason[];
    visibility: OutfitVisibility;
    // Müşteri için yapılıyorsa doldurulur; yoksa stilistin kendisi sahip olur
    targetUserId?: string;
}

export interface ActionResult {
    ok: boolean;
    outfitId?: string;
    error?: string;
}

// ── Action ────────────────────────────────────────────────────────────────────

export async function createOutfitAction(input: CreateOutfitInput): Promise<ActionResult> {
    const session = await getServerSession();
    if (!session) return { ok: false, error: "Oturum bulunamadı." };

    // Sadece stilist ve admin outfit oluşturabilir
    if (session.role !== "stylist" && session.role !== "admin") {
        return { ok: false, error: "Yetkisiz işlem: stilist veya admin rolü gerekli." };
    }

    // Validasyon
    if (!input.name.trim()) return { ok: false, error: "Kombin adı zorunludur." };
    if (input.canvasLayout.length === 0) return { ok: false, error: "En az bir parça eklemelisiniz." };

    const now = new Date().toISOString();
    const itemIds = input.canvasLayout.map((c) => c.itemId);

    // Müşteri için mi yapılıyor yoksa stilistin kendi kombinimi?
    const isRecommendation = !!input.targetUserId && input.targetUserId !== session.uid;
    const ownerId = isRecommendation ? input.targetUserId! : session.uid;
    const source: OutfitSource = isRecommendation ? "stylist_recommendation" : "manual";
    const status: OutfitStatus = isRecommendation ? "pending_acceptance" : "draft";

    const docData = {
        userId: ownerId,
        name: input.name.trim(),
        description: input.description?.trim() ?? null,
        // Legacy field — boş bırakılır, yeni outfitler canvasLayout kullanır
        items: [],
        itemIds,
        itemSnapshots: input.itemSnapshots,
        canvasLayout: input.canvasLayout,
        occasion: input.occasion,
        season: input.season,
        visibility: input.visibility,
        source,
        recommendedBy: isRecommendation ? session.uid : null,
        status,
        acceptedAt: null,
        likeCount: 0,
        commentCount: 0,
        // Legacy compat fields
        likes: 0,
        isPublic: input.visibility === "public",
        aiGenerated: false,
        createdAt: now,
        updatedAt: now,
    };

    try {
        const ref = await adminDb.collection("outfits").add(docData);
        return { ok: true, outfitId: ref.id };
    } catch (err) {
        console.error("[createOutfitAction]", err);
        return { ok: false, error: "Firestore yazma hatası." };
    }
}

export async function updateOutfitAction(
    outfitId: string,
    input: Partial<CreateOutfitInput>
): Promise<ActionResult> {
    const session = await getServerSession();
    if (!session) return { ok: false, error: "Oturum bulunamadı." };
    if (session.role !== "stylist" && session.role !== "admin") {
        return { ok: false, error: "Yetkisiz işlem." };
    }

    const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (input.name) updates.name = input.name.trim();
    if (input.description !== undefined) updates.description = input.description?.trim() ?? null;
    if (input.canvasLayout) {
        updates.canvasLayout = input.canvasLayout;
        updates.itemIds = input.canvasLayout.map((c) => c.itemId);
    }
    if (input.itemSnapshots) updates.itemSnapshots = input.itemSnapshots;
    if (input.occasion !== undefined) updates.occasion = input.occasion;
    if (input.season) updates.season = input.season;
    if (input.visibility) {
        updates.visibility = input.visibility;
        updates.isPublic = input.visibility === "public";
    }

    try {
        await adminDb.collection("outfits").doc(outfitId).update(updates);
        return { ok: true, outfitId };
    } catch (err) {
        console.error("[updateOutfitAction]", err);
        return { ok: false, error: "Firestore yazma hatası." };
    }
}
