"use client";

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, CloudSun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWardrobe } from '@/hooks/useWardrobe';
import type { WardrobeItem } from '@/types';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface OutfitSuggestion {
    top: WardrobeItem | null;
    bottom: WardrobeItem | null;
    shoes: WardrobeItem | null;
    accessory: WardrobeItem | null;
}

function getRandomItem(items: WardrobeItem[], category: string[]): WardrobeItem | null {
    const filtered = items.filter(i =>
        category.some(c => i.category === c || i.category === c.slice(0, -1))
    );
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
}

export function TodayOutfitWidget({ weather }: { weather?: string }) {
    const t = useTranslations('todayWidget');
    const { items, loading } = useWardrobe();
    const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null);

    function generateSuggestion() {
        if (items.length === 0) return;
        setSuggestion({
            top: getRandomItem(items, ['tops', 'top', 'dresses', 'outerwear']),
            bottom: getRandomItem(items, ['bottoms', 'bottom']),
            shoes: getRandomItem(items, ['shoes', 'footwear']),
            accessory: getRandomItem(items, ['accessories', 'accessory', 'bags', 'jewelry']),
        });
    }

    useEffect(() => {
        if (!loading && items.length > 0) generateSuggestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, items.length]);

    if (loading || items.length === 0) return null;

    const pieces = suggestion
        ? [suggestion.top, suggestion.bottom, suggestion.shoes, suggestion.accessory].filter(Boolean) as WardrobeItem[]
        : [];

    return (
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
            <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <Sparkles size={14} className="text-accent" />
                    {t('title')}
                    {weather && (
                        <span className="ml-auto text-accent font-normal flex items-center gap-1">
                            <CloudSun size={12} />
                            {weather}
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {pieces.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">{t('notEnough')}</p>
                ) : (
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            {pieces.map((item, i) => (
                                <div key={i} className="h-20 w-14 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0">
                                    {item.imageUrl && (
                                        <Image
                                            width={56}
                                            height={80}
                                            src={item.bgRemovedUrl ?? item.imageUrl}
                                            alt={item.name ?? ''}
                                            className={item.bgRemovedUrl ? 'w-full h-full object-contain' : 'w-full h-full object-cover'}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs gap-1.5"
                                onClick={generateSuggestion}
                            >
                                <RefreshCw size={12} />
                                {t('another')}
                            </Button>
                            <Button size="sm" className="h-7 text-xs gap-1.5" asChild>
                                <Link href="/dashboard/canvas">
                                    <Sparkles size={12} />
                                    {t('combine')}
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
