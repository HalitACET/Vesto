"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core";
import { Save, Trash2, Sparkles, User } from "lucide-react";

import { DashboardLayout }       from "@/components/layout/DashboardLayout";
import { MannequinCanvas, getMannequinType, EMPTY_SLOTS } from "@/components/canvas/MannequinCanvas";
import { WardrobePickerSidebar } from "@/components/canvas/WardrobePickerSidebar";
import { isValidForSlot }        from "@/components/canvas/SlotRegion";
import { Button }                from "@/components/ui/button";
import { Badge }                 from "@/components/ui/badge";
import { Input }                 from "@/components/ui/input";
import { Label }                 from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useWardrobe }           from "@/hooks/useWardrobe";
import { useAuth }               from "@/hooks/useAuth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

import type {
    WardrobeItem,
    OccasionTag,
    OutfitSeason,
    OutfitVisibility,
    CanvasLayoutItem,
    OutfitItemSnapshot,
} from "@/types";
import type { SlotType }                     from "@/components/canvas/SlotRegion";
import type { MannequinType, SlotState }     from "@/components/canvas/MannequinCanvas";

// ── Slot pozisyon → canvas koordinat çevirisi ─────────────────────────────────
// Firestore'a yazılan canvasLayout, slot ordinal olarak saklanır

const SLOT_ORDINAL: Record<SlotType, number> = {
    accessory: 0,
    top:       1,
    bottom:    2,
    shoes:     3,
};

// ── Save Modal ────────────────────────────────────────────────────────────────

const OCCASION_VALUES: OccasionTag[]  = ["casual", "formal", "business", "sporty", "evening", "beach"];
const SEASON_VALUES:   OutfitSeason[] = ["spring", "summer", "fall", "winter"];

interface SaveModalProps {
    open:      boolean;
    onClose:   () => void;
    slots:     SlotState;
    onSaved:   (outfitId: string) => void;
    vestoUser: any;
}

function SaveModal({ open, onClose, slots, onSaved, vestoUser }: SaveModalProps) {
    const t       = useTranslations("canvas");
    const tCommon = useTranslations("common");

    const [name,       setName]       = useState("");
    const [description,setDescription]= useState("");
    const [occasion,   setOccasion]   = useState<OccasionTag | null>(null);
    const [seasons,    setSeasons]    = useState<OutfitSeason[]>([]);
    const [visibility, setVisibility] = useState<OutfitVisibility>("private");
    const [error,      setError]      = useState<string | null>(null);
    const [isPending,  startTransition] = useTransition();

    const filledSlots = Object.entries(slots).filter(([, item]) => item !== null) as [SlotType, WardrobeItem][];
    const itemCount   = filledSlots.length;

    function toggleSeason(s: OutfitSeason) {
        setSeasons((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
    }

    function handleSubmit() {
        if (!name.trim())   { setError(t("saveModal.nameRequired"));  return; }
        if (itemCount === 0){ setError(t("saveModal.itemsRequired")); return; }
        if (!vestoUser) { setError("Önce giriş yapmalısınız"); return; }
        setError(null);

        startTransition(async () => {
            try {
                const outfitData = {
                    userId: vestoUser.uid,
                    name: name.trim() || 'Yeni Kombin',
                    items: {
                        topId: slots.top?.id || null,
                        bottomId: slots.bottom?.id || null,
                        shoesId: slots.shoes?.id || null,
                        accessoryId: slots.accessory?.id || null,
                    },
                    tags: [],
                    createdAt: serverTimestamp(),
                    lastWorn: null,
                    wearCount: 0,
                    isFavorite: false,
                    isArchived: false,
                };
                
                const docRef = await addDoc(collection(db, 'outfits'), outfitData);
                onSaved(docRef.id);
                onClose();
                setName(""); setDescription(""); setOccasion(null); setSeasons([]); setVisibility("private");
            } catch (err: any) {
                console.error('Save outfit error:', err);
                if (err.code === 'permission-denied') {
                    setError('Yetki hatası. Lütfen tekrar giriş yapın.');
                } else {
                    setError('Kombin kaydedilemedi. Tekrar deneyin.');
                }
            }
        });
    }

    const visibilityLabels: Record<OutfitVisibility, string> = {
        private:   t("saveModal.visibilityPrivate"),
        public:    t("saveModal.visibilityPublic"),
        followers: t("saveModal.visibilityFollowers"),
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t("saveModal.title")}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
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
                                {t("saveModal.summary", { count: itemCount })}
                            </span>
                            {" "}kaydedilecek
                        </p>
                    </div>

                    {error && <p className="text-xs text-destructive">{error}</p>}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isPending}>
                        {tCommon("cancel")}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending || itemCount === 0}>
                        {isPending ? t("saveModal.saving") : t("saveModal.saveButton")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Main Canvas Page ──────────────────────────────────────────────────────────

export default function CanvasPage() {
    const { items, loading }     = useWardrobe();
    const { vestoUser }          = useAuth();

    const [slots,         setSlots]         = useState<SlotState>(EMPTY_SLOTS);
    const [activeId,      setActiveId]      = useState<UniqueIdentifier | null>(null);
    const [saveModalOpen, setSaveModalOpen] = useState(false);
    const [savedToast,    setSavedToast]    = useState<string | null>(null);

    // Mannequin tipini kullanıcı cinsiyetinden belirle
    const mannequinType: MannequinType = getMannequinType(vestoUser?.gender);

    // Sürüklenen öğeyi bul (DragOverlay için)
    const activeItem = activeId
        ? items.find((i) => `wardrobe-${i.id}` === String(activeId))
        : null;

    const filledCount = Object.values(slots).filter(Boolean).length;

    // ── Drag handlers ─────────────────────────────────────────────────────────

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id);
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveId(null);

        const overId = event.over?.id as string | undefined;
        if (!overId?.startsWith("slot-")) return;

        const slotType = overId.replace("slot-", "") as SlotType;
        const item     = event.active.data.current?.item as WardrobeItem | undefined;
        if (!item) return;

        // Kategori validasyonu — uyumsuz kategori → sessizce reddet
        if (!isValidForSlot(item.category, slotType)) return;

        setSlots((prev) => ({ ...prev, [slotType]: item }));
    }

    function handleSlotClear(slot: SlotType) {
        setSlots((prev) => ({ ...prev, [slot]: null }));
    }

    function handleClearAll() {
        setSlots(EMPTY_SLOTS);
    }

    function handleSaved(outfitId: string) {
        setSlots(EMPTY_SLOTS);
        setSavedToast(`Kombin kaydedildi! #${outfitId.slice(0, 8)}`);
        setTimeout(() => setSavedToast(null), 4000);
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <DashboardLayout>
            {/* Success toast */}
            {savedToast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-border bg-background px-4 py-3 text-sm shadow-lg animate-in slide-in-from-bottom-2">
                    ✓ {savedToast}
                </div>
            )}

            <SaveModal
                open={saveModalOpen}
                onClose={() => setSaveModalOpen(false)}
                slots={slots}
                onSaved={handleSaved}
                vestoUser={vestoUser}
            />

            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden">

                    {/* Sol — Wardrobe Picker */}
                    <WardrobePickerSidebar items={items} loading={loading} />

                    {/* Orta — Mannequin Canvas */}
                    <div className="flex flex-1 flex-col gap-3 overflow-hidden">
                        {/* Toolbar */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div>
                                <h1 className="text-lg font-light tracking-wide">Stylist Canvas</h1>
                                <p className="text-xs text-muted-foreground">
                                    Kıyafetleri slot&apos;lara sürükleyerek kombin oluştur
                                </p>
                            </div>

                            <div className="ml-auto flex items-center gap-2">
                                {/* Mannequin tipi badge */}
                                <Badge variant="outline" className="gap-1 text-xs border-border/50">
                                    <User size={9} />
                                    {mannequinType}
                                </Badge>

                                {/* Dolu slot sayısı */}
                                <Badge variant="outline" className="gap-1 text-xs border-accent/30 text-accent">
                                    <Sparkles size={9} />
                                    {filledCount} / 4
                                </Badge>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={filledCount === 0}
                                    onClick={handleClearAll}
                                    className="gap-1.5 text-xs h-8"
                                >
                                    <Trash2 size={13} />
                                    Temizle
                                </Button>

                                <Button
                                    size="sm"
                                    disabled={filledCount === 0}
                                    onClick={() => setSaveModalOpen(true)}
                                    className="gap-1.5 text-xs h-8"
                                >
                                    <Save size={13} />
                                    Kombini Kaydet
                                </Button>
                            </div>
                        </div>

                        {/* Canvas alanı — scroll edilebilir */}
                        <div className="flex-1 overflow-y-auto flex justify-center py-4">
                            <MannequinCanvas
                                slots={slots}
                                mannequinType={mannequinType}
                                onClear={handleSlotClear}
                            />
                        </div>
                    </div>
                </div>

                {/* Drag overlay — sürüklenirken gösteri */}
                <DragOverlay dropAnimation={null}>
                    {activeItem && (
                        <div className="w-20 rounded-xl overflow-hidden shadow-2xl opacity-90 rotate-3 border border-border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={activeItem.bgRemovedUrl ?? activeItem.imageUrl ?? ""}
                                alt={activeItem.name ?? ""}
                                className={`w-full aspect-square ${activeItem.bgRemovedUrl ? "object-contain" : "object-cover"}`}
                            />
                        </div>
                    )}
                </DragOverlay>
            </DndContext>
        </DashboardLayout>
    );
}
