"use client";

import type { WardrobeItem } from "@/types";
import { SlotRegion, type SlotType } from "./SlotRegion";
import Image from "next/image";

// ── Mannequin Tipi ────────────────────────────────────────────────────────────

export type MannequinType = "female" | "male" | "unisex";

export function getMannequinType(gender: string | undefined | null): MannequinType {
    if (gender === "female") return "female";
    if (gender === "male")   return "male";
    return "unisex";
}

// ── Slot State ────────────────────────────────────────────────────────────────

export interface SlotState {
    accessory: WardrobeItem | null;
    top:       WardrobeItem | null;
    bottom:    WardrobeItem | null;
    shoes:     WardrobeItem | null;
}

export const EMPTY_SLOTS: SlotState = {
    accessory: null,
    top:       null,
    bottom:    null,
    shoes:     null,
};

// ── Canvas Boyutu ─────────────────────────────────────────────────────────────

// Mannequin viewBox'ı 400x720 — oranı korumak için
export const CANVAS_W = 400;
export const CANVAS_H = 720;

// ── MannequinCanvas ───────────────────────────────────────────────────────────

interface MannequinCanvasProps {
    slots:          SlotState;
    mannequinType:  MannequinType;
    onClear:        (slot: SlotType) => void;
}

export function MannequinCanvas({ slots, mannequinType, onClear }: MannequinCanvasProps) {
    return (
        <div
            data-testid="mannequin-canvas"
            className="relative mx-auto flex-shrink-0 rounded-2xl overflow-hidden"
            style={{ width: CANVAS_W, height: CANVAS_H }}
        >
            {/* Layer 1: Arka plan — hafif doku */}
            <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-muted/40 rounded-2xl" />

            {/* Layer 2: Mannequin SVG */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Image width={800} height={800}
                src={`/mannequin/${mannequinType}.svg`}
                alt={`${mannequinType} mannequin`}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
            />

            {/* Layer 3: Drop slot'ları */}
            {(["accessory", "top", "bottom", "shoes"] as SlotType[]).map((slotType) => (
                <SlotRegion
                    key={slotType}
                    slotType={slotType}
                    item={slots[slotType]}
                    onClear={onClear}
                />
            ))}

            {/* Boş state overlay */}
            {Object.values(slots).every((v) => v === null) && (
                <div className="absolute inset-0 flex items-end justify-center pb-6 pointer-events-none">
                    <p className="text-[10px] text-muted-foreground/50 tracking-wider uppercase">
                        Kıyafeti slot&apos;a sürükle
                    </p>
                </div>
            )}
        </div>
    );
}
