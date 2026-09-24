"use client";

import { useTranslations } from 'next-intl';
import { BarChart, AlertCircle, TrendingUp, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserStyleReport } from '@/types/report';

interface StyleInsightsProps {
    report: UserStyleReport | null;
}

export function StyleInsights({ report }: StyleInsightsProps) {
    const t = useTranslations('styleInsights');
    if (!report) return null;

    const { wardrobe, outfits } = report;

    const insights: { icon: React.ElementType; color: string; text: string }[] = [];

    // Color dominance insight
    const topColors = wardrobe.topColors ?? [];
    if (topColors.length > 0) {
        const topColor = topColors[0];
        insights.push({
            icon: TrendingUp,
            color: 'text-blue-500',
            text: t('topColor', { hex: topColor.hex, count: topColor.count }),
        });
    }

    // Category balance insight
    const categories = wardrobe.categoryBreakdown ?? [];
    const topCat = categories[0];
    if (topCat) {
        insights.push({
            icon: Package,
            color: 'text-purple-500',
            text: t('topCategory', { percentage: topCat.percentage, category: topCat.category }),
        });
    }

    // Missing categories
    const presentCats = categories.map(c => c.category);
    const allCats = ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories'];
    const missing = allCats.filter(c => !presentCats.some(p => p === c || p === c.slice(0, -1)));
    if (missing.length > 0) {
        insights.push({
            icon: AlertCircle,
            color: 'text-amber-500',
            text: t('missing', { list: missing.join(', ') }),
        });
    }

    // Wear count insight
    const totalWearCount = outfits.totalWearCount ?? 0;
    const totalItems = wardrobe.totalItems ?? 0;
    if (totalItems > 0) {
        const avg = (totalWearCount / totalItems).toFixed(1);
        insights.push({
            icon: TrendingUp,
            color: 'text-emerald-500',
            text: `${t('avgWear', { avg })} ${Number(avg) < 2 ? t('avgWearLow') : t('avgWearGood')}`,
        });
    }

    if (insights.length === 0) return null;

    return (
        <Card className="border-accent/20">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <BarChart size={15} className="text-accent" />
                    {t('title')}
                    <Badge variant="secondary" className="text-[10px] ml-1">{t('newBadge')}</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {insights.map((insight, i) => {
                    const Icon = insight.icon;
                    return (
                        <div key={i} className="flex gap-3 rounded-lg bg-muted/50 p-3">
                            <Icon size={16} className={`${insight.color} flex-shrink-0 mt-0.5`} />
                            <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
