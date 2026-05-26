"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
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
        const q = query(
            collection(db, "wardrobeItems"),
            where("userId", "==", firebaseUser.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const list = snapshot.docs
                    .map((d) => ({ id: d.id, ...d.data() } as WardrobeItem))
                    .filter((item) => !(item as any).isArchived);
                setItems(list);
                setLoading(false);
            },
            (err) => {
                console.error("Error subscribing to wardrobe:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [firebaseUser]);

    const filteredByCategory = (category: ClothingCategory) =>
        items.filter((item) => item.category === category);

    const favorites = items.filter((item) => item.isFavorite);

    return { items, loading, error, filteredByCategory, favorites };
}
