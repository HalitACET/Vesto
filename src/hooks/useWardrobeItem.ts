"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { WardrobeItem } from "@/types";

export function useWardrobeItem(itemId: string | null) {
    const [item, setItem] = useState<WardrobeItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!itemId) {
            setItem(null);
            setLoading(false);
            return;
        }

        let isMounted = true;
        setLoading(true);

        getDoc(doc(db, "wardrobeItems", itemId))
            .then((snap) => {
                if (isMounted) {
                    if (snap.exists()) {
                        setItem({ id: snap.id, ...snap.data() } as WardrobeItem);
                    } else {
                        setItem(null);
                    }
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [itemId]);

    return { data: item, loading, error };
}
