"use client";

import { useDroppable } from "@dnd-kit/core";
import { X, Plus } from "lucide-react";
import type { WardrobeItem, ClothingCategory } from "@/types";
import Image from "next/image";

// ── Slot Tipleri ──────────────────────────────────────────────────────────────

export type SlotType = "accessory" | "top" | "bottom" | "shoes";

// Hangi kategori hangi slot'a düşer
const SLOT_VALID_CATEGORIES: Record<SlotType, ClothingCategory[]> = {
    accessory: ["accessories", "accessory", "jewelry", "bags"],
    top:       ["tops", "top", "outerwear", "dresses"],
    bottom:    ["bottoms", "bottom", "dresses"],
    shoes:     ["shoes", "footwear"],
};

export function isValidForSlot(itemCategory: ClothingCategory, slot: SlotType): boolean {
    return SLOT_VALID_CATEGORIES[slot]?.includes(itemCategory) ?? false;
}

// Slot meta bilgileri
const SLOT_META: Record<SlotType, { label: string; hint: string; icon: string }> = {
    accessory: { label: "Aksesuar",  hint: "Şapka, çanta, takı...", icon: "◈"  },
    top:       { label: "Üst",       hint: "Tişört, gömlek, ceket...", icon: "▣" },
    bottom:    { label: "Alt",       hint: "Pantolon, etek...", icon: "▥"        },
    shoes:     { label: "Ayakkabı",  hint: "Sürükle veya tıkla", icon: "⊕"     },
};

// ── Slot Position Config (mannequin koordinatları) ────────────────────────────

export interface SlotPosition {
    top: number;      // px
    height: number;   // px
    widthPct: number; // % of canvas width (0-100)
}

export const SLOT_POSITIONS: Record<SlotType, SlotPosition> = {
    accessory: { top: 10,  height: 110, widthPct: 50 },
    top:       { top: 120, height: 210, widthPct: 70 },
    bottom:    { top: 330, height: 210, widthPct: 65 },
    shoes:     { top: 548, height: 140, widthPct: 60 },
};

// ── SlotRegion Component ──────────────────────────────────────────────────────

interface SlotRegionProps {
    slotType: SlotType;
    item: WardrobeItem | null;
    onClear: (slot: SlotType) => void;
}

export function SlotRegion({ slotType, item, onClear }: SlotRegionProps) {
    const pos    = SLOT_POSITIONS[slotType];
    const meta   = SLOT_META[slotType];

    const { setNodeRef, isOver } = useDroppable({
        id: `slot-${slotType}`,
        data: { slotType },
    });

    const imgSrc = item ? (item.bgRemovedUrl ?? item.imageUrl) : null;

    return (
        <div
            ref={setNodeRef}
            className={`
                absolute left-1/2 -translate-x-1/2 rounded-xl
                flex items-center justify-center
                transition-all duration-200
                ${item
                    ? "bg-transparent"
                    : isOver
                        ? "bg-primary/10 border-2 border-primary/60 border-dashed"
                        : "bg-background/20 border border-dashed border-border/60 hover:border-border"
                }
            `}
            style={{
                top:    pos.top,
                height: pos.height,
                width:  `${pos.widthPct}%`,
            }}
        >
            {item ? (
                // Dolu slot — kıyafet görseli
                <div className="relative w-full h-full group">
                    {imgSrc ? (
                        <Image width={800} height={800}
                            src={imgSrc}
                            alt={item.name ?? slotType}
                            className={`
                                w-full h-full rounded-xl
                                ${item.bgRemovedUrl ? "object-contain drop-shadow-lg" : "object-cover opacity-90"}
                            `}
                            draggable={false}
                        />
                    ) : null}
                    {/* Kaldır butonu */}
                    <button
                        onClick={() => onClear(slotType)}
                        className="
                            absolute -top-2 -right-2 w-5 h-5 rounded-full
                            bg-destructive text-destructive-foreground
                            flex items-center justify-center
                            opacity-0 group-hover:opacity-100
                            transition-opacity shadow-md z-10
                        "
                        aria-label={`${meta.label} kaldır`}
                    >
                        <X size={10} strokeWidth={3} />
                    </button>
                </div>
            ) : (
                // Boş slot — placeholder
                <div className={`
                    flex flex-col items-center justify-center gap-1 text-center pointer-events-none
                    transition-opacity ${isOver ? "opacity-80" : "opacity-40"}
                `}>
                    <span className="text-lg text-muted-foreground">
                        {isOver ? "⬇" : <Plus size={16} className="text-muted-foreground" />}
                    </span>
                    <span className="text-[9px] font-semibold tracking-widest uppercase text-muted-foreground">
                        {meta.label}
                    </span>
                    {!isOver && (
                        <span className="text-[8px] text-muted-foreground/60 max-w-[80%]">
                            {meta.hint}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
