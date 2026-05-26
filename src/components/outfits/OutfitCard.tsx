"use client";

import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { Heart } from "lucide-react";
import type { Outfit } from "@/types";
import { ItemThumb } from "./ItemThumb";

interface Props {
    outfit: Outfit;
    onToggleFavorite: (id: string) => void;
    onClick: () => void;
}

export function OutfitCard({ outfit, onToggleFavorite, onClick }: Props) {
    const t = useTranslations("outfits");
    const locale = useLocale();
    const dateLocale = locale === "tr" ? tr : enUS;

    let createdAtDate = new Date();
    if (outfit.createdAt) {
        // Handle Firestore Timestamp or string
        if (typeof outfit.createdAt === "object" && "toDate" in outfit.createdAt) {
            createdAtDate = (outfit.createdAt as any).toDate();
        } else if (typeof outfit.createdAt === "string") {
            createdAtDate = new Date(outfit.createdAt);
        }
    }

    const timeAgo = formatDistanceToNow(createdAtDate, {
        addSuffix: true,
        locale: dateLocale,
    });

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
        <div 
            className="group cursor-pointer relative block p-4 -m-4 rounded-xl transition-all duration-200 hover:bg-muted/40 active:scale-[0.98]"
            onClick={onClick}
        >
            {/* 2x2 mini grid */}
            <div className="aspect-square mb-4 grid grid-cols-2 gap-1 bg-muted/20 dark:bg-muted/10 rounded p-2 border border-transparent group-hover:border-border transition-colors">
                <ItemThumb itemId={getSlotId("top")} />
                <ItemThumb itemId={getSlotId("bottom")} />
                <ItemThumb itemId={getSlotId("shoes")} />
                <ItemThumb itemId={getSlotId("accessory")} />
            </div>

            <h3 className="font-playfair text-lg text-foreground mb-1 truncate">
                {outfit.name || "İsimsiz Kombin"}
            </h3>
            <p className="text-xs text-muted-foreground">
                {t("wearCountLabel", { count: outfit.wearCount || 0 })} · {timeAgo}
            </p>

            <button
                className={`absolute top-7 right-7 p-2 rounded-full backdrop-blur-sm bg-background/80 dark:bg-card/85 border border-border shadow-sm transition-all duration-200 active:scale-90 hover:scale-105 ${
                    outfit.isFavorite
                        ? "opacity-100 text-red-500"
                        : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                }`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleFavorite(outfit.id);
                }}
            >
                <Heart size={16} className={outfit.isFavorite ? "fill-current" : ""} />
            </button>
        </div>
    );
}
