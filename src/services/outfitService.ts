import { saveOutfit, getOutfits } from "@/lib/firebase/firestore";
import type { Outfit, OccasionTag, Season, OutfitItem } from "@/types";

// ── Read ──────────────────────────────────────────────────────────────────────

export async function fetchUserOutfits(userId: string): Promise<Outfit[]> {
    return getOutfits(userId);
}

// ── Create ────────────────────────────────────────────────────────────────────

export interface CreateOutfitPayload {
    userId: string;
    name: string;
    items: OutfitItem[];
    occasion: OccasionTag;
    season: Season[];
    isPublic?: boolean;
}

export async function createOutfit(payload: CreateOutfitPayload): Promise<string> {
    return saveOutfit({
        userId: payload.userId,
        name: payload.name,
        items: payload.items,
        occasion: payload.occasion,
        season: payload.season,
        isPublic: payload.isPublic ?? false,
        likes: 0,
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
