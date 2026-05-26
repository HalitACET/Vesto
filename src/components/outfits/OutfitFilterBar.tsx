"use client";

import { useTranslations } from "next-intl";

export type FilterType = 'all' | 'favorites' | 'recent';

interface Props {
    value: FilterType;
    onChange: (value: FilterType) => void;
}

export function OutfitFilterBar({ value, onChange }: Props) {
    const t = useTranslations("outfits");

    return (
        <div className="flex items-center gap-2 mb-12 overflow-x-auto pb-2 scrollbar-none">
            <button
                onClick={() => onChange('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-200 active:scale-95 ${
                    value === 'all'
                        ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                        : 'bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground'
                }`}
            >
                {t("filterAll")}
            </button>
            <button
                onClick={() => onChange('favorites')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-200 active:scale-95 ${
                    value === 'favorites'
                        ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                        : 'bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground'
                }`}
            >
                {t("filterFavorites")}
            </button>
            <button
                onClick={() => onChange('recent')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-200 active:scale-95 ${
                    value === 'recent'
                        ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                        : 'bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted hover:text-foreground'
                }`}
            >
                {t("filterRecentlyWorn")}
            </button>
        </div>
    );
}
