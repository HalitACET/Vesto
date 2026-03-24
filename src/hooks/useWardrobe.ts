"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getWardrobeItems } from "@/lib/firebase/firestore";
import type { WardrobeItem, ClothingCategory } from "@/types";

export function useWardrobe() {
    const { firebaseUser } = useAuth();
    const [items, setItems] = useState<WardrobeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!firebaseUser) {
            setItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        getWardrobeItems(firebaseUser.uid)
            .then(setItems)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [firebaseUser]);

    const filteredByCategory = (category: ClothingCategory) =>
        items.filter((item) => item.category === category);

    const favorites = items.filter((item) => item.isFavorite);

    return { items, loading, error, filteredByCategory, favorites };
}
