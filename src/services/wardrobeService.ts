import {
    getWardrobeItems,
    addWardrobeItem,
    updateWardrobeItem,
    deleteWardrobeItem,
} from "@/lib/firebase/firestore";
import { uploadWardrobeImage } from "@/lib/firebase/storage";
import type { WardrobeItem, ClothingCategory, Season, OccasionTag } from "@/types";

// ── Read ──────────────────────────────────────────────────────────────────────

export async function fetchUserWardrobe(userId: string): Promise<WardrobeItem[]> {
    return getWardrobeItems(userId);
}

// ── Create ────────────────────────────────────────────────────────────────────

export interface AddItemPayload {
    userId: string;
    name: string;
    category: ClothingCategory;
    color: string[];
    season: Season[];
    occasions: OccasionTag[];
    imageFile: File;
    brand?: string;
    price?: number;
    notes?: string;
}

export async function addItem(payload: AddItemPayload): Promise<string> {
    const imageUrl = await uploadWardrobeImage(payload.userId, payload.imageFile);

    const id = await addWardrobeItem({
        userId: payload.userId,
        name: payload.name,
        category: payload.category,
        imageUrl,
        color: payload.color,
        season: payload.season,
        occasions: payload.occasions,
        brand: payload.brand,
        price: payload.price,
        notes: payload.notes,
        isFavorite: false,
        wearCount: 0,
    });

    return id;
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function updateItem(
    id: string,
    data: Partial<Omit<WardrobeItem, "id" | "userId">>
): Promise<void> {
    return updateWardrobeItem(id, data);
}

export async function toggleFavorite(
    item: WardrobeItem
): Promise<void> {
    return updateWardrobeItem(item.id, { isFavorite: !item.isFavorite });
}

export async function incrementWearCount(item: WardrobeItem): Promise<void> {
    return updateWardrobeItem(item.id, {
        wearCount: item.wearCount + 1,
        lastWornAt: new Date().toISOString(),
    });
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function removeItem(id: string): Promise<void> {
    return deleteWardrobeItem(id);
}
