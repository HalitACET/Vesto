"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useOutfits } from "@/hooks/useOutfits";
import { OutfitHero } from "@/components/outfits/OutfitHero";
import { OutfitGrid } from "@/components/outfits/OutfitGrid";
import { OutfitEmptyState } from "@/components/outfits/OutfitEmptyState";
import { OutfitFilterBar, FilterType } from "@/components/outfits/OutfitFilterBar";
import { Skeleton } from "@/components/ui/skeleton";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function OutfitsPage() {
    const t = useTranslations("outfits");
    const router = useRouter();

    const { outfits, loading, setOutfits } = useOutfits();
    const [filter, setFilter] = useState<FilterType>("all");

    const handleToggleFavorite = async (id: string) => {
        const outfit = outfits.find((o) => o.id === id);
        if (!outfit) return;

        const newFavoriteStatus = !outfit.isFavorite;

        setOutfits((prev) =>
            prev.map((o) => (o.id === id ? { ...o, isFavorite: newFavoriteStatus } : o))
        );

        try {
            await updateDoc(doc(db, "outfits", id), {
                isFavorite: newFavoriteStatus,
            });
        } catch (err) {
            console.error("Failed to toggle favorite", err);
            // Revert
            setOutfits((prev) =>
                prev.map((o) => (o.id === id ? { ...o, isFavorite: !newFavoriteStatus } : o))
            );
        }
    };

    const filteredOutfits = useMemo(() => {
        if (!outfits) return [];
        switch (filter) {
            case "favorites":
                return outfits.filter((o) => o.isFavorite);
            case "recent":
                return [...outfits].sort((a, b) => {
                    const dateA = new Date(a.lastWornAt || a.createdAt).getTime();
                    const dateB = new Date(b.lastWornAt || b.createdAt).getTime();
                    return dateB - dateA;
                });
            default:
                return outfits;
        }
    }, [outfits, filter]);

    const heroOutfit = filteredOutfits?.[0];
    const otherOutfits = filteredOutfits?.slice(1) ?? [];

    if (loading) {
        return (
            <DashboardLayout>
                <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl">
                    <Skeleton className="h-12 w-48 mb-4" />
                    <Skeleton className="h-6 w-32 mb-8" />
                    <Skeleton className="h-96 w-full rounded-2xl mb-12" />
                </div>
            </DashboardLayout>
        );
    }

    if (!outfits || outfits.length === 0) {
        return (
            <DashboardLayout>
                <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="font-playfair text-4xl text-foreground mb-1">{t("title")}</h1>
                            <p className="text-muted-foreground">{t("subtitle", { count: 0 })}</p>
                        </div>
                    </div>
                    <OutfitEmptyState />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl">
                {/* PAGE HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-playfair text-4xl text-foreground mb-2">{t("title")}</h1>
                    </div>
                    <Button
                        onClick={() => router.push("/dashboard/canvas")}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 duration-200 rounded-md h-10 px-5"
                    >
                        <Plus className="mr-2" size={16} />
                        {t("newOutfit")}
                    </Button>
                </div>

                <OutfitFilterBar value={filter} onChange={setFilter} />

                {filteredOutfits.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground mb-4">{t("filterEmpty")}</p>
                        <Button
                            variant="outline"
                            onClick={() => setFilter("all")}
                            className="rounded-md border-border text-foreground hover:bg-muted active:scale-95 transition-all duration-200"
                        >
                            {t("clearFilter")}
                        </Button>
                    </div>
                ) : (
                    <>
                        {heroOutfit && (
                            <OutfitHero
                                outfit={heroOutfit}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        )}
                        {otherOutfits.length > 0 && (
                            <OutfitGrid
                                outfits={otherOutfits}
                                onToggleFavorite={handleToggleFavorite}
                            />
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
