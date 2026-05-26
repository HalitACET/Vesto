"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { WardrobeItem } from "@/types";

export interface GroupedWardrobe {
    tops: WardrobeItem[];
    bottoms: WardrobeItem[];
    shoes: WardrobeItem[];
    accessories: WardrobeItem[];
}

/**
 * Subscribes to the PUBLIC wardrobe items of another user.
 * Only returns items where isPublic === true.
 * Used for the "Kombin Öner" (outfit suggestion) sheet.
 */
export function useUserWardrobe(userId: string | null | undefined) {
    const [items, setItems] = useState<WardrobeItem[]>([]);
    const [grouped, setGrouped] = useState<GroupedWardrobe>({
        tops: [],
        bottoms: [],
        shoes: [],
        accessories: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const q = query(
            collection(db, "wardrobeItems"),
            where("userId", "==", userId),
            where("isPublic", "==", true)
        );

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as WardrobeItem[];

            setItems(data);

            setGrouped({
                tops: data.filter((i) =>
                    ["tops", "top", "dresses", "outerwear"].includes(i.category)
                ),
                bottoms: data.filter((i) =>
                    ["bottoms", "bottom"].includes(i.category)
                ),
                shoes: data.filter((i) =>
                    ["shoes", "footwear"].includes(i.category)
                ),
                accessories: data.filter((i) =>
                    ["accessories", "accessory", "bags", "jewelry"].includes(i.category)
                ),
            });

            setLoading(false);
        });

        return unsub;
    }, [userId]);

    return { items, grouped, loading };
}
