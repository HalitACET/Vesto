"use client";

import { useOutfit } from "@/hooks/useOutfit";
import { ItemThumb } from "./ItemThumb";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
    outfitId?: string | null;
}

export function OutfitMiniPreview({ outfitId }: Props) {
    if (!outfitId) return null;

    const { data: outfit, loading } = useOutfit(outfitId);

    if (loading) {
        return (
            <div className="aspect-square w-full max-w-[240px] mx-auto bg-muted/20 dark:bg-muted/10 rounded-lg p-2 border border-border grid grid-cols-2 gap-1 animate-pulse">
                <Skeleton className="aspect-square rounded-sm" />
                <Skeleton className="aspect-square rounded-sm" />
                <Skeleton className="aspect-square rounded-sm" />
                <Skeleton className="aspect-square rounded-sm" />
            </div>
        );
    }

    if (!outfit) {
        return (
            <div className="aspect-square w-full max-w-[240px] mx-auto bg-muted rounded-lg flex items-center justify-center border border-border">
                <span className="text-muted-foreground text-xs opacity-50">Kombin Bulunamadı</span>
            </div>
        );
    }

    const getSlotId = (slot: "top" | "bottom" | "shoes" | "accessory"): string | null => {
        if (!outfit.items) return null;
        if (Array.isArray(outfit.items)) {
            const snapshot = outfit.itemSnapshots?.find((s) => {
                if (slot === "top") return s.category === "tops" || s.category === "top";
                if (slot === "bottom") return s.category === "bottoms" || s.category === "bottom";
                if (slot === "shoes") return s.category === "shoes" || s.category === "footwear";
                if (slot === "accessory") return s.category === "accessories" || s.category === "accessory";
                return false;
            });
            return snapshot?.id || null;
        } else {
            const o = outfit.items as any;
            if (slot === "top") return o.topId || null;
            if (slot === "bottom") return o.bottomId || null;
            if (slot === "shoes") return o.shoesId || null;
            if (slot === "accessory") return o.accessoryId || null;
        }
        return null;
    };

    return (
        <div className="aspect-square w-full max-w-[240px] mx-auto grid grid-cols-2 gap-1 bg-muted/20 dark:bg-muted/10 rounded-lg p-2 border border-border">
            <ItemThumb itemId={getSlotId("top")} />
            <ItemThumb itemId={getSlotId("bottom")} />
            <ItemThumb itemId={getSlotId("shoes")} />
            <ItemThumb itemId={getSlotId("accessory")} />
        </div>
    );
}
