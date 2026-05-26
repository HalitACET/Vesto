"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getOutfits } from "@/lib/firebase/firestore";
import type { Outfit } from "@/types";

export function useOutfits() {
    const { firebaseUser } = useAuth();
    const [outfits, setOutfits] = useState<Outfit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!firebaseUser) {
            setOutfits([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        getOutfits(firebaseUser.uid)
            .then(setOutfits)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [firebaseUser]);

    return { outfits, loading, error, setOutfits };
}
