"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useWardrobeItem } from "@/hooks/useWardrobeItem";

export function ItemThumb({ itemId }: { itemId: string | null }) {
    if (!itemId) {
        return (
            <div className="aspect-square bg-muted/40 rounded-sm flex items-center justify-center">
                <span className="text-muted-foreground text-xs opacity-50">—</span>
            </div>
        );
    }

    const { data: item, loading } = useWardrobeItem(itemId);

    if (loading) {
        return <Skeleton className="aspect-square rounded-sm" />;
    }

    if (!item) {
        return (
            <div className="aspect-square bg-muted/40 rounded-sm flex items-center justify-center">
                <span className="text-muted-foreground text-xs opacity-50">?</span>
            </div>
        );
    }

    return (
        <div className="aspect-square bg-muted/10 rounded-sm overflow-hidden relative">
            <Image
                src={item.bgRemovedUrl || item.imageUrl}
                alt={item.brand || "Kıyafet"}
                fill
                className="object-contain"
            />
        </div>
    );
}
