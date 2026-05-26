"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function OutfitEmptyState() {
    const t = useTranslations("outfits");
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border rounded-xl mt-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <Plus className="text-muted-foreground" size={24} />
            </div>

            <h3 className="font-playfair text-2xl text-foreground mb-3">
                {t("emptyTitle")}
            </h3>

            <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
                {t("emptyDescription")}
            </p>

            <Button
                onClick={() => router.push("/dashboard/canvas")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 duration-200 rounded-md h-12 px-8"
            >
                {t("createFirstOutfit")}
            </Button>
        </div>
    );
}
