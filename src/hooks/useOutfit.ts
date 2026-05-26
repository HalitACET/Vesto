"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Outfit } from "@/types";

export function useOutfit(outfitId: string | null) {
    const [outfit, setOutfit] = useState<Outfit | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!outfitId) {
            setOutfit(null);
            setLoading(false);
            return;
        }

        let isMounted = true;
        setLoading(true);

        getDoc(doc(db, "outfits", outfitId))
            .then((snap) => {
                if (isMounted) {
                    if (snap.exists()) {
                        setOutfit({ id: snap.id, ...snap.data() } as Outfit);
                    } else {
                        setOutfit(null);
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
    }, [outfitId]);

    return { data: outfit, loading, error };
}
