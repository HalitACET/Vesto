"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import type { Outfit } from "@/types";
import { ItemThumb } from "./ItemThumb";
import { Badge } from "@/components/ui/badge";

export function OutfitHero({
    outfit,
    onToggleFavorite,
}: {
    outfit: Outfit;
    onToggleFavorite: (id: string) => void;
}) {
    const t = useTranslations("outfits");
    const router = useRouter();
    const locale = useLocale();
    const dateLocale = locale === "tr" ? tr : enUS;

    let createdAtDate = new Date();
    if (outfit.createdAt) {
        if (typeof outfit.createdAt === "object" && "toDate" in outfit.createdAt) {
            createdAtDate = (outfit.createdAt as any).toDate();
        } else if (typeof outfit.createdAt === "string") {
            createdAtDate = new Date(outfit.createdAt);
        }
    }

    const formattedDate = format(createdAtDate, "d MMMM yyyy", { locale: dateLocale });

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
        <div className="bg-card rounded-2xl p-8 mb-16 shadow-sm border border-border overflow-hidden">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10">
                {/* Left: 2x2 mini grid */}
                <div className="grid grid-cols-2 gap-3 aspect-square max-w-lg mx-auto w-full">
                    <ItemThumb itemId={getSlotId("top")} />
                    <ItemThumb itemId={getSlotId("bottom")} />
                    <ItemThumb itemId={getSlotId("shoes")} />
                    <ItemThumb itemId={getSlotId("accessory")} />
                </div>

                {/* Right: Info */}
                <div className="flex flex-col justify-center py-6">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-4 font-sans font-medium">
                            {t("latestLabel")}
                        </p>
                        <h2 className="font-playfair text-4xl lg:text-5xl text-foreground mb-5 leading-tight">
                            {outfit.name || "İsimsiz Kombin"}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-8 flex items-center gap-2">
                            {formattedDate}
                            <span className="text-border">•</span>
                            {t("wearCountLabel", { count: outfit.wearCount || 0 })}
                        </p>

                        {(outfit as any).tags && (outfit as any).tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-10">
                                {(outfit as any).tags.map((tag: string) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="text-xs bg-muted/40 dark:bg-muted/10 text-muted-foreground border-border"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 mt-auto">
                        <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 duration-200 h-12 px-8 rounded-md"
                            onClick={() => router.push(`/dashboard/outfits/${outfit.id}`)}
                        >
                            {t("viewDetails")}
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 px-8 rounded-md border-border text-foreground hover:bg-muted active:scale-95 transition-all duration-200"
                            onClick={() => router.push(`/dashboard/canvas?edit=${outfit.id}`)}
                        >
                            {t("edit")}
                        </Button>
                        <Button
                            variant="outline"
                            className={`h-12 w-12 p-0 rounded-md transition-all active:scale-95 duration-200 ${
                                outfit.isFavorite
                                    ? "bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200 dark:border-red-800"
                                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                            onClick={() => onToggleFavorite(outfit.id)}
                        >
                            <Heart size={18} className={outfit.isFavorite ? "fill-current" : ""} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
