import type { ClothingCategory } from '@/types';

const CATEGORY_MAP: Record<string, ClothingCategory> = {
    top: 'tops',
    bottom: 'bottoms',
    footwear: 'shoes',
    accessory: 'accessories',
    // canonical mappings
    tops: 'tops',
    bottoms: 'bottoms',
    shoes: 'shoes',
    accessories: 'accessories',
    dresses: 'dresses',
    outerwear: 'outerwear',
    bags: 'bags',
    jewelry: 'jewelry',
};

export function normalizeCategory(raw: string): ClothingCategory {
    return (CATEGORY_MAP[raw?.toLowerCase()] ?? 'accessories') as ClothingCategory;
}

export function normalizeCategoryArray(categories: string[]): ClothingCategory[] {
    return [...new Set(categories.map(normalizeCategory))];
}
