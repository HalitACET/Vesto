"use client";

import { useTranslations } from 'next-intl';
import { X, Heart, Globe, Lock, Calendar, Tag, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { WardrobeItem } from '@/types';
import Image from 'next/image';

interface ItemDetailModalProps {
    item: WardrobeItem | null;
    open: boolean;
    onClose: () => void;
}

// Maps both web and mobile category values to itemDetail.categories keys
const CATEGORY_KEYS: Record<string, string> = {
    tops: 'tops', top: 'tops',
    bottoms: 'bottoms', bottom: 'bottoms',
    dresses: 'dresses',
    outerwear: 'outerwear',
    shoes: 'shoes', footwear: 'shoes',
    accessories: 'accessories', accessory: 'accessories',
    bags: 'bags',
    jewelry: 'jewelry',
};

export function ItemDetailModal({ item, open, onClose }: ItemDetailModalProps) {
    const t = useTranslations('itemDetail');
    if (!item) return null;

    const imgSrc = item.bgRemovedUrl ?? item.imageUrl;
    const ai = item.aiAnalysis;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                    {/* Image */}
                    <div className="relative bg-muted min-h-[300px] sm:min-h-[400px]">
                        {imgSrc ? (
                            <Image
                                src={imgSrc}
                                alt={item.name || t('itemFallback')}
                                fill
                                className={item.bgRemovedUrl ? 'object-contain p-4 drop-shadow-xl' : 'object-cover'}
                                sizes="(max-width: 640px) 100vw, 50vw"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">{t('noImage')}</div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-5 overflow-y-auto max-h-[500px]">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">{item.name || t('itemFallback')}</h2>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {CATEGORY_KEYS[item.category] ? t(`categories.${CATEGORY_KEYS[item.category]}`) : item.category}
                                </p>
                            </div>
                            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Meta badges */}
                        <div className="flex flex-wrap gap-2">
                            {item.brand && <Badge variant="outline">{item.brand}</Badge>}
                            {item.size && <Badge variant="secondary">{t('size', { size: item.size })}</Badge>}
                            <Badge variant="outline" className="gap-1">
                                {item.isPublic ? <Globe size={11} /> : <Lock size={11} />}
                                {item.isPublic ? t('public') : t('private')}
                            </Badge>
                            {item.isFavorite && (
                                <Badge variant="outline" className="gap-1 text-rose-500 border-rose-200">
                                    <Heart size={11} fill="currentColor" /> {t('favorite')}
                                </Badge>
                            )}
                        </div>

                        {/* Colors */}
                        {item.color && item.color.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('colors')}</p>
                                <div className="flex gap-2 flex-wrap">
                                    {item.color.map((c, i) => (
                                        <div key={i} className="flex items-center gap-1.5">
                                            <div
                                                className="w-5 h-5 rounded-full border border-border shadow-sm"
                                                style={{ backgroundColor: c }}
                                            />
                                            <span className="text-xs text-muted-foreground">{c}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* AI Analysis */}
                        {ai && (
                            <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                    <Sparkles size={11} className="text-accent" />
                                    {t('aiAnalysis')}
                                </p>
                                {ai.dominantColors && ai.dominantColors.length > 0 && (
                                    <div className="flex gap-1.5">
                                        {ai.dominantColors.slice(0, 5).map((c, i) => (
                                            <div key={i} title={c} className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                )}
                                {ai.material && (
                                    <p className="text-xs text-muted-foreground">{t('material')} <span className="text-foreground font-medium">{ai.material}</span></p>
                                )}
                                {ai.pattern && (
                                    <p className="text-xs text-muted-foreground">{t('pattern')} <span className="text-foreground font-medium">{ai.pattern}</span></p>
                                )}
                                {ai.confidence !== undefined && (
                                    <p className="text-xs text-muted-foreground">{t('confidence')} <span className="text-foreground font-medium">{Math.round(ai.confidence * 100)}%</span></p>
                                )}
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-border p-3 text-center">
                                <p className="text-xl font-light">{item.wearCount ?? 0}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{t('wearCount')}</p>
                            </div>
                            {item.price && (
                                <div className="rounded-lg border border-border p-3 text-center">
                                    <p className="text-xl font-light">₺{item.price}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{t('price')}</p>
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        {item.notes && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{t('notes')}</p>
                                <p className="text-sm text-foreground">{item.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
