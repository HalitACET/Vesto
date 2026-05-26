"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { Outfit } from "@/types";
import { OutfitCard } from "./OutfitCard";

interface Props {
    outfits: Outfit[];
    onToggleFavorite: (id: string) => void;
}

export function OutfitGrid({ outfits, onToggleFavorite }: Props) {
    const t = useTranslations("outfits");
    const router = useRouter();

    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="font-playfair text-2xl text-foreground">{t("allOutfits")}</h2>
                <p className="text-sm text-muted-foreground">
                    {t("subtitle", { count: outfits.length })}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {outfits.map((outfit) => (
                    <OutfitCard
                        key={outfit.id}
                        outfit={outfit}
                        onToggleFavorite={onToggleFavorite}
                        onClick={() => router.push(`/dashboard/outfits/${outfit.id}`)}
                    />
                ))}
            </div>
        </div>
    );
}
