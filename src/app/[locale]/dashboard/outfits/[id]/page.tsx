"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ItemThumb } from "@/components/outfits/ItemThumb";
import { ArrowLeft, Heart, Pencil, Calendar, ShoppingBag, Share2 } from "lucide-react";
import { format } from "date-fns";
import { tr as trLocale, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import type { Outfit } from "@/types";
import { ShareOutfitDialog } from "@/components/forum/ShareOutfitDialog";

export default function OutfitDetailPage() {
    const params = useParams();
    const router = useRouter();
    const locale = useLocale();
    const dateLocale = locale === "tr" ? trLocale : enUS;

    const [outfit, setOutfit] = useState<Outfit | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    const outfitId = params.id as string;

    useEffect(() => {
        if (!outfitId) return;
        setLoading(true);
        getDoc(doc(db, "outfits", outfitId))
            .then((snap) => {
                if (!snap.exists()) {
                    setNotFound(true);
                } else {
                    setOutfit({ id: snap.id, ...snap.data() } as Outfit);
                }
                setLoading(false);
            })
            .catch(() => {
                setNotFound(true);
                setLoading(false);
            });
    }, [outfitId]);

    const handleToggleFavorite = async () => {
        if (!outfit) return;
        const next = !outfit.isFavorite;
        setOutfit((prev) => prev ? { ...prev, isFavorite: next } : prev);
        try {
            await updateDoc(doc(db, "outfits", outfitId), { isFavorite: next });
        } catch {
            setOutfit((prev) => prev ? { ...prev, isFavorite: !next } : prev);
        }
    };

    const getSlotId = (slot: "top" | "bottom" | "shoes" | "accessory"): string | null => {
        if (!outfit?.items) return null;
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

    let createdAtDate = new Date();
    if (outfit?.createdAt) {
        if (typeof outfit.createdAt === "object" && "toDate" in outfit.createdAt) {
            createdAtDate = (outfit.createdAt as any).toDate();
        } else if (typeof outfit.createdAt === "string") {
            createdAtDate = new Date(outfit.createdAt);
        }
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
                    <Skeleton className="h-8 w-32 mb-8" />
                    <Skeleton className="h-12 w-64 mb-4" />
                    <Skeleton className="h-96 w-full rounded-2xl" />
                </div>
            </DashboardLayout>
        );
    }

    if (notFound) {
        return (
            <DashboardLayout>
                <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl text-center">
                    <p className="text-muted-foreground mb-6">Kombin bulunamadı.</p>
                    <Button onClick={() => router.push("/dashboard/outfits")} variant="outline" className="rounded-md transition-all active:scale-95 duration-200">
                        Kombinlerime Dön
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
                {/* Back */}
                <button
                    onClick={() => router.push("/dashboard/outfits")}
                    className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-all active:scale-95 mb-10 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    Kombinlerim
                </button>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2 font-medium">
                            KOMBİN DETAYI
                        </p>
                        <h1 className="font-playfair text-4xl text-foreground leading-tight">
                            {outfit?.name || "İsimsiz Kombin"}
                        </h1>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                        <Button
                            variant="outline"
                            className="h-10 px-5 rounded-md border-border text-foreground hover:bg-muted active:scale-95 transition-all duration-200"
                            onClick={() => setShareOpen(true)}
                        >
                            <Share2 size={14} className="mr-2" />
                            Forum&apos;da Paylaş
                        </Button>
                        <Button
                            variant="outline"
                            className="h-10 px-5 rounded-md border-border text-foreground hover:bg-muted active:scale-95 transition-all duration-200"
                            onClick={() => router.push(`/dashboard/canvas?edit=${outfitId}`)}
                        >
                            <Pencil size={14} className="mr-2" />
                            Düzenle
                        </Button>
                        <Button
                            variant="outline"
                            className={`h-10 w-10 p-0 rounded-md transition-all active:scale-95 duration-200 ${
                                outfit?.isFavorite
                                    ? "bg-red-50 dark:bg-red-950/20 text-red-500 border-red-200 dark:border-red-800"
                                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                            onClick={handleToggleFavorite}
                        >
                            <Heart size={16} className={outfit?.isFavorite ? "fill-current" : ""} />
                        </Button>
                    </div>
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                    {/* Left: 2x2 outfit preview */}
                    <div className="grid grid-cols-2 gap-3 aspect-square bg-muted/20 dark:bg-muted/10 rounded-2xl p-5 border border-border">
                        <ItemThumb itemId={getSlotId("top")} />
                        <ItemThumb itemId={getSlotId("bottom")} />
                        <ItemThumb itemId={getSlotId("shoes")} />
                        <ItemThumb itemId={getSlotId("accessory")} />
                    </div>

                    {/* Right: Metadata */}
                    <div className="flex flex-col gap-6 py-2">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/20 dark:bg-muted/10 rounded-xl p-5 border border-border">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <ShoppingBag size={14} />
                                    <span className="text-xs uppercase tracking-wider font-medium">Kez Giyildi</span>
                                </div>
                                <p className="font-playfair text-3xl text-foreground">
                                    {outfit?.wearCount ?? 0}
                                </p>
                            </div>
                            <div className="bg-muted/20 dark:bg-muted/10 rounded-xl p-5 border border-border">
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Calendar size={14} />
                                    <span className="text-xs uppercase tracking-wider font-medium">Oluşturuldu</span>
                                </div>
                                <p className="font-playfair text-lg text-foreground leading-tight">
                                    {outfit ? format(createdAtDate, "d MMM yyyy", { locale: dateLocale }) : "—"}
                                </p>
                            </div>
                        </div>

                        {/* Occasion */}
                        {outfit?.occasion && (
                            <div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Vesile</p>
                                <Badge variant="outline" className="capitalize border-border text-foreground">
                                    {outfit.occasion}
                                </Badge>
                            </div>
                        )}

                        {/* Season */}
                        {outfit?.season && outfit.season.length > 0 && (
                            <div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Sezon</p>
                                <div className="flex flex-wrap gap-2">
                                    {outfit.season.map((s) => (
                                        <Badge key={s} variant="outline" className="capitalize border-border text-foreground">
                                            {s}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {outfit?.tags && outfit.tags.length > 0 && (
                            <div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Etiketler</p>
                                <div className="flex flex-wrap gap-2">
                                    {outfit.tags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="border-border text-muted-foreground">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {outfit?.description && (
                            <div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Notlar</p>
                                <p className="text-sm text-foreground leading-relaxed">{outfit.description}</p>
                            </div>
                        )}

                        {/* Visibility */}
                        {outfit?.visibility && (
                            <div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">Görünürlük</p>
                                <Badge
                                    variant="outline"
                                    className={`border-border capitalize ${
                                        outfit.visibility === "public"
                                            ? "text-green-700 dark:text-green-400 border-green-200/30 dark:border-green-800/40 bg-green-50/50 dark:bg-green-950/20"
                                            : "text-muted-foreground"
                                    }`}
                                >
                                    {outfit.visibility === "private"
                                        ? "Gizli"
                                        : outfit.visibility === "public"
                                        ? "Herkese açık"
                                        : "Takipçiler"}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>

                <ShareOutfitDialog
                    open={shareOpen}
                    onOpenChange={setShareOpen}
                    outfitId={outfitId}
                    outfitName={outfit?.name}
                />
            </div>
        </DashboardLayout>
    );
}
