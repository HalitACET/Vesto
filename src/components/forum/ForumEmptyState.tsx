"use client";

import { useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";

export function ForumEmptyState() {
    const t = useTranslations("forum");

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-muted/10 rounded-2xl border border-dashed border-border">
            <div className="p-4 rounded-full bg-muted mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-playfair text-xl text-foreground mb-2">
                {t("emptyTitle")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
                {t("emptyDesc")}
            </p>
        </div>
    );
}
