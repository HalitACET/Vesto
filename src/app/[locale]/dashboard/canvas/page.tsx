"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { createOutfitAction } from "@/app/actions/outfitActions";
import type {
    WardrobeItem,
    OccasionTag,
    OutfitSeason,
    OutfitVisibility,
    CanvasLayoutItem,
    OutfitItemSnapshot,
} from "@/types";

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
            className={`cursor-grab active:cursor-grabbing rounded-lg overflow-hidden border border-border aspect-square transition-opacity ${
                isDragging ? "opacity-40" : "hover:border-accent/40"
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
    const t = useTranslations("canvas");
    const { setNodeRef, isOver } = useDroppable({ id: "canvas" });

    return (
        <div
            ref={setNodeRef}
            className={`relative h-full w-full rounded-2xl border-2 border-dashed transition-colors ${
                isOver ? "border-accent bg-accent/5" : "border-border bg-muted/30"
            }`}
        >
            {canvasItems.length === 0 && !isOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <Sparkles size={32} className="text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">{t("canvasEmpty")}</p>
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

// ── Save Modal ────────────────────────────────────────────────────────────────

const OCCASION_VALUES: OccasionTag[] = ["casual", "formal", "business", "sporty", "evening", "beach"];
const SEASON_VALUES: OutfitSeason[] = ["spring", "summer", "fall", "winter"];

interface SaveModalProps {
    open: boolean;
    onClose: () => void;
    canvasItems: CanvasItem[];
    onSaved: (outfitId: string) => void;
}

function SaveModal({ open, onClose, canvasItems, onSaved }: SaveModalProps) {
    const { vestoUser } = useAuth();
    const t = useTranslations("canvas");
    const tCommon = useTranslations("common");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [occasion, setOccasion] = useState<OccasionTag | null>(null);
    const [seasons, setSeasons] = useState<OutfitSeason[]>([]);
    const [visibility, setVisibility] = useState<OutfitVisibility>("private");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function toggleSeason(s: OutfitSeason) {
        setSeasons((prev) =>
            prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
        );
    }

    function handleSubmit() {
        if (!name.trim()) { setError(t("saveModal.nameRequired")); return; }
        if (canvasItems.length === 0) { setError(t("saveModal.itemsRequired")); return; }
        setError(null);

        const canvasLayout: CanvasLayoutItem[] = canvasItems.map((ci, index) => ({
            itemId: ci.item.id,
            x: ci.x,
            y: ci.y,
            scale: 1,
            rotation: 0,
            zIndex: index + 1,
        }));

        const itemSnapshots: OutfitItemSnapshot[] = canvasItems.map((ci) => ({
            id: ci.item.id,
            imageUrl: ci.item.imageUrl,
            category: ci.item.category,
            dominantColor: ci.item.color[0] ?? "#000000",
        }));

        startTransition(async () => {
            const res = await createOutfitAction({
                name,
                description: description || undefined,
                canvasLayout,
                itemSnapshots,
                occasion,
                season: seasons,
                visibility,
            });

            if (res.ok && res.outfitId) {
                onSaved(res.outfitId);
                onClose();
                setName("");
                setDescription("");
                setOccasion(null);
                setSeasons([]);
                setVisibility("private");
            } else {
                setError(res.error ?? t("saveModal.saveError"));
            }
        });
    }

    const visibilityLabels: Record<OutfitVisibility, string> = {
        private: t("saveModal.visibilityPrivate"),
        public: t("saveModal.visibilityPublic"),
        followers: t("saveModal.visibilityFollowers"),
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("saveModal.title")}</DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Name */}
                    <div>
                        <Label htmlFor="outfit-name" className="text-xs">
                            {t("saveModal.name")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="outfit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t("saveModal.namePlaceholder")}
                            className="mt-1 text-sm"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="outfit-desc" className="text-xs">{t("saveModal.description")}</Label>
                        <textarea
                            id="outfit-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t("saveModal.descriptionPlaceholder")}
                            rows={2}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                        />
                    </div>

                    {/* Occasion */}
                    <div>
                        <Label className="text-xs">{t("saveModal.occasion")}</Label>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {OCCASION_VALUES.map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setOccasion(occasion === value ? null : value)}
                                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                        occasion === value
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                                    }`}
                                >
                                    {t(`occasions.${value}` as Parameters<typeof t>[0])}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Season */}
                    <div>
                        <Label className="text-xs">{t("saveModal.season")}</Label>
                        <div className="mt-1.5 flex gap-1.5">
                            {SEASON_VALUES.map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => toggleSeason(value)}
                                    className={`flex-1 rounded-full border py-1 text-xs transition-colors ${
                                        seasons.includes(value)
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                                    }`}
                                >
                                    {t(`seasons.${value}` as Parameters<typeof t>[0])}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Visibility */}
                    <div>
                        <Label className="text-xs">{t("saveModal.visibility")}</Label>
                        <div className="mt-1.5 flex gap-3">
                            {(["private", "public", "followers"] as OutfitVisibility[]).map((v) => (
                                <label key={v} className="flex cursor-pointer items-center gap-1.5 text-xs">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value={v}
                                        checked={visibility === v}
                                        onChange={() => setVisibility(v)}
                                        className="accent-primary"
                                    />
                                    {visibilityLabels[v]}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {t("saveModal.summary", { count: canvasItems.length })}
                            </span>
                            {(vestoUser?.role === "admin" || vestoUser?.role === "stylist") && " — Week 10"}
                        </p>
                    </div>

                    {error && <p className="text-xs text-destructive">{error}</p>}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isPending}>
                        {tCommon("cancel")}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending || canvasItems.length === 0}>
                        {isPending ? t("saveModal.saving") : t("saveModal.saveButton")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CanvasPage() {
    const { items, loading } = useWardrobe();
    const t = useTranslations("canvas");
    const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
    const [search, setSearch] = useState("");
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [savedToast, setSavedToast] = useState<string | null>(null);

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

    function handleSaved(outfitId: string) {
        setCanvasItems([]);
        setSavedToast(t("savedToast", { id: outfitId.slice(0, 8) }));
        setTimeout(() => setSavedToast(null), 4000);
    }

    const activeItem = activeId && items.find((i) => `picker-${i.id}` === activeId);

    return (
        <DashboardLayout>
            {/* Success toast */}
            {savedToast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-border bg-background px-4 py-3 text-sm shadow-lg">
                    ✓ {savedToast}
                </div>
            )}

            <SaveModal
                open={saveModalOpen}
                onClose={() => setSaveModalOpen(false)}
                canvasItems={canvasItems}
                onSaved={handleSaved}
            />

            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex h-[calc(100vh-8rem)] gap-6">
                    {/* Left — item picker */}
                    <aside className="flex w-64 flex-shrink-0 flex-col gap-4">
                        <div>
                            <h2 className="text-xl font-light mb-1">{t("title")}</h2>
                            <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
                        </div>

                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={t("searchPlaceholder")}
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
                                    {t("noItems")}
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
                            <Badge variant="outline" className="gap-1 border-accent/30 text-accent text-xs">
                                <Sparkles size={10} />
                                {t("itemCount", { count: canvasItems.length })}
                            </Badge>
                            <Button
                                size="sm"
                                className="ml-auto gap-1.5"
                                disabled={canvasItems.length === 0}
                                onClick={() => setSaveModalOpen(true)}
                            >
                                <Save size={14} />
                                {t("save")}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={canvasItems.length === 0}
                                onClick={() => setCanvasItems([])}
                            >
                                <Trash2 size={14} className="mr-1.5" />
                                {t("clear")}
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
