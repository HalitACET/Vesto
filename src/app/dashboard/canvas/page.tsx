"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useWardrobe } from "@/hooks/useWardrobe";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    useDraggable,
    useDroppable,
    type UniqueIdentifier,
} from "@dnd-kit/core";
import { Sparkles, Save, Trash2, Search } from "lucide-react";
import { motion } from "framer-motion";
import type { WardrobeItem } from "@/types";

// ── Draggable item from picker ────────────────────────────────────────────────
function DraggablePickerItem({ item }: { item: WardrobeItem }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `picker-${item.id}`,
        data: { item },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`cursor-grab active:cursor-grabbing rounded-lg overflow-hidden border border-border aspect-square transition-opacity ${isDragging ? "opacity-40" : "hover:border-accent/40"
                }`}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        </div>
    );
}

// ── Canvas drop zone ──────────────────────────────────────────────────────────
interface CanvasItem {
    item: WardrobeItem;
    x: number;
    y: number;
    id: string;
}

function CanvasZone({
    canvasItems,
    onRemove,
}: {
    canvasItems: CanvasItem[];
    onRemove: (id: string) => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

    return (
        <div
            ref={setNodeRef}
            className={`relative h-full w-full rounded-2xl border-2 border-dashed transition-colors ${isOver ? "border-accent bg-accent/5" : "border-border bg-muted/30"
                }`}
        >
            {canvasItems.length === 0 && !isOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <Sparkles size={32} className="text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">
                        Drag clothing items here to build your outfit
                    </p>
                </div>
            )}
            {canvasItems.map((ci) => (
                <div
                    key={ci.id}
                    className="group absolute"
                    style={{ left: ci.x, top: ci.y, width: 120 }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={ci.item.imageUrl}
                        alt={ci.item.name}
                        className="rounded-lg object-cover w-full aspect-[3/4] border border-border shadow-md"
                    />
                    <button
                        onClick={() => onRemove(ci.id)}
                        className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={10} />
                    </button>
                </div>
            ))}
        </div>
    );
}

export default function CanvasPage() {
    const { items, loading } = useWardrobe();
    const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [search, setSearch] = useState("");
    const [outfitName, setOutfitName] = useState("");

    const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id);
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveId(null);
        if (event.over?.id === "canvas" && event.active.data.current?.item) {
            const item = event.active.data.current.item as WardrobeItem;
            const rect = event.over.rect;
            setCanvasItems((prev) => [
                ...prev,
                {
                    id: `${item.id}-${Date.now()}`,
                    item,
                    x: Math.max(0, (rect?.width ?? 600) / 2 - 60),
                    y: Math.max(0, (rect?.height ?? 500) / 2 - 80),
                },
            ]);
        }
    }

    const activeItem =
        activeId && items.find((i) => `picker-${i.id}` === activeId);

    return (
        <DashboardLayout>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex h-[calc(100vh-8rem)] gap-6">
                    {/* Left — item picker */}
                    <aside className="flex w-64 flex-shrink-0 flex-col gap-4">
                        <div>
                            <h2 className="text-xl font-light mb-1">Stylist Canvas</h2>
                            <p className="text-xs text-muted-foreground">
                                Drag items to build your outfit
                            </p>
                        </div>

                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search wardrobe..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 text-sm"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <Skeleton key={i} className="aspect-square rounded-lg" />
                                    ))}
                                </div>
                            ) : filtered.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-8">
                                    No items found.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {filtered.map((item) => (
                                        <DraggablePickerItem key={item.id} item={item} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Right — canvas */}
                    <div className="flex flex-1 flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <Input
                                placeholder="Outfit name..."
                                value={outfitName}
                                onChange={(e) => setOutfitName(e.target.value)}
                                className="max-w-xs text-sm"
                            />
                            <Badge variant="outline" className="gap-1 border-accent/30 text-accent text-xs">
                                <Sparkles size={10} />
                                {canvasItems.length} items
                            </Badge>
                            <Button
                                size="sm"
                                className="ml-auto"
                                disabled={canvasItems.length === 0}
                            >
                                <Save size={14} className="mr-1.5" />
                                Save outfit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={canvasItems.length === 0}
                                onClick={() => setCanvasItems([])}
                            >
                                <Trash2 size={14} className="mr-1.5" />
                                Clear
                            </Button>
                        </div>
                        <div className="flex-1">
                            <CanvasZone
                                canvasItems={canvasItems}
                                onRemove={(id) =>
                                    setCanvasItems((prev) => prev.filter((ci) => ci.id !== id))
                                }
                            />
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeItem && (
                        <div className="w-24 rounded-lg overflow-hidden shadow-2xl opacity-90 rotate-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={activeItem.imageUrl}
                                alt={activeItem.name}
                                className="w-full aspect-[3/4] object-cover"
                            />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </DashboardLayout>
    );
}
