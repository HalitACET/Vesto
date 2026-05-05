import { saveOutfit, getOutfits } from "@/lib/firebase/firestore";
import type { Outfit, OccasionTag, OutfitSeason, OutfitItem } from "@/types";

// ── Read ──────────────────────────────────────────────────────────────────────

export async function fetchUserOutfits(userId: string): Promise<Outfit[]> {
    return getOutfits(userId);
}

// ── Create (legacy — canvas için outfitActions.ts kullan) ─────────────────────

export interface CreateOutfitPayload {
    userId: string;
    name: string;
    items: OutfitItem[];
    occasion: OccasionTag;
    season: OutfitSeason[];
    isPublic?: boolean;
}

export async function createOutfit(payload: CreateOutfitPayload): Promise<string> {
    return saveOutfit({
        userId: payload.userId,
        name: payload.name,
        description: null,
        items: payload.items,
        itemIds: [],
        itemSnapshots: [],
        canvasLayout: [],
        occasion: payload.occasion,
        season: payload.season,
        visibility: payload.isPublic ? "public" : "private",
        source: "manual",
        recommendedBy: null,
        status: "draft",
        acceptedAt: null,
        likeCount: 0,
        commentCount: 0,
        likes: 0,
        isPublic: payload.isPublic ?? false,
        aiGenerated: false,
    });
}

// ── AI Suggestion ─────────────────────────────────────────────────────────────

/**
 * TODO (Hafta 6): Google Vision + Gemini entegrasyonu ile
 * kullanıcının gardırobuna ve hava durumuna göre outfit önerileri üretir.
 */
export async function generateAISuggestions(
    _userId: string,
    _weather: string
): Promise<Outfit[]> {
    // Stub — gerçek AI entegrasyonu Hafta 6'da gelecek
    return [];
}
