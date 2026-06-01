"use client";

import { useDraggable } from "@dnd-kit/core";
import type { WardrobeItem, ClothingCategory } from "@/types";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

// ── Kategori → slot eşleşmesi ─────────────────────────────────────────────────

type FilterGroup = "all" | "top" | "bottom" | "dresses" | "outerwear" | "shoes" | "accessory" | "bags" | "jewelry";

const FILTER_TABS: { value: FilterGroup; label: string }[] = [
    { value: "all",        label: "Tümü"      },
    { value: "top",        label: "Üst"       },
    { value: "bottom",     label: "Alt"        },
    { value: "dresses",    label: "Elbise"    },
    { value: "outerwear",  label: "Dış Giyim" },
    { value: "shoes",      label: "Ayakkabı"  },
    { value: "accessory",  label: "Aksesuar"  },
    { value: "bags",       label: "Çanta"     },
    { value: "jewelry",    label: "Takı"      },
];

// ── Draggable Item ────────────────────────────────────────────────────────────

function DraggableItem({ item }: { item: WardrobeItem }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `wardrobe-${item.id}`,
        data: { item },
    });

    const imgSrc = item.bgRemovedUrl || item.imageUrl;

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`
                relative cursor-grab active:cursor-grabbing rounded-xl overflow-hidden
                border border-border aspect-square transition-all duration-150
                ${isDragging
                    ? "opacity-30 scale-95"
                    : "hover:border-primary/50 hover:shadow-md hover:scale-[1.02]"
                }
                bg-muted/30
            `}
        >
            {imgSrc ? (
                <Image width={800} height={800}
                    src={imgSrc}
                    alt={item.name ?? "Kıyafet"}
                    className={`h-full w-full ${item.bgRemovedUrl ? "object-contain p-1" : "object-cover"}`}
                    draggable={false}
                />
            ) : null}
            {/* Kategori badge */}
            <span className="absolute bottom-1 left-1 text-[9px] leading-none bg-background/80 backdrop-blur-sm rounded px-1 py-0.5 text-muted-foreground capitalize">
                {item.category === "tops" ? "top" : item.category === "bottoms" ? "bottom" : item.category === "shoes" ? "footwear" : item.category === "accessories" ? "accessory" : item.category}
            </span>
        </div>
    );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface WardrobePickerSidebarProps {
    items: WardrobeItem[];
    loading: boolean;
}

export function WardrobePickerSidebar({ items, loading }: WardrobePickerSidebarProps) {
    const [search, setSearch]   = useState("");
    const [filter, setFilter]   = useState<FilterGroup>("all");

    const filtered = items.filter((item) => {
        let matchesFilter = filter === "all";
        if (!matchesFilter) {
            if (filter === "top") matchesFilter = item.category === "top" || item.category === "tops";
            else if (filter === "bottom") matchesFilter = item.category === "bottom" || item.category === "bottoms";
            else if (filter === "shoes") matchesFilter = item.category === "shoes" || item.category === "footwear";
            else if (filter === "accessory") matchesFilter = item.category === "accessory" || item.category === "accessories";
            else matchesFilter = item.category === filter;
        }
        
        const matchesSearch = (item.name || "").toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <aside className="flex w-60 flex-shrink-0 flex-col gap-3 h-full">
            {/* Başlık */}
            <div>
                <h2 className="text-base font-medium tracking-wide">Dolabım</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Kıyafeti slot'a sürükle</p>
            </div>

            {/* Arama */}
            <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 text-xs h-8"
                />
            </div>

            {/* Kategori filtresi — yatay scroll */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`
                            flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors
                            ${filter === tab.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/70"
                            }
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
                {loading ? (
                    <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-square rounded-xl" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-10">
                        Parça bulunamadı
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {filtered.map((item) => (
                            <DraggableItem key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
