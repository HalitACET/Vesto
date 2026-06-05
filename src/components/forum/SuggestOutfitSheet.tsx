"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Shirt, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserWardrobe } from "@/hooks/useUserWardrobe";
import { addOutfitSuggestionComment } from "@/lib/firebase/forumService";
import type { WardrobeItem } from "@/types";

interface Props {
    postId: string;
    postAuthorId: string;
    postAuthorName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

type SlotKey = "topId" | "bottomId" | "shoesId" | "accessoryId";
type CategoryTab = "tops" | "bottoms" | "shoes" | "accessories";

const TABS: { key: CategoryTab; slot: SlotKey; label: string; emoji: string }[] = [
    { key: "tops", slot: "topId", label: "Üstler", emoji: "👕" },
    { key: "bottoms", slot: "bottomId", label: "Altlar", emoji: "👖" },
    { key: "shoes", slot: "shoesId", label: "Ayakkabılar", emoji: "👟" },
    { key: "accessories", slot: "accessoryId", label: "Aksesuarlar", emoji: "💍" },
];

function ItemSelectCard({
    item,
    selected,
    onSelect,
}: {
    item: WardrobeItem;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            onClick={onSelect}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 active:scale-95 ${
                selected
                    ? "border-accent ring-2 ring-accent/40 shadow-md"
                    : "border-border hover:border-muted-foreground/40"
            }`}
        >
            {(() => {
                const src = item.bgRemovedUrl || item.thumbnailUrl || item.imageUrl;
                return src ? (
                    <Image
                        src={src}
                        alt={item.name || item.brand || "Kıyafet"}
                        fill
                        className="object-contain bg-muted/10 p-1"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/10 text-[10px] text-muted-foreground">
                        Görsel Yok
                    </div>
                );
            })()}
            {selected && (
                <div className="absolute inset-0 bg-accent/10 flex items-center justify-center">
                    <div className="bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
                        ✓
                    </div>
                </div>
            )}
            {item.name && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1">
                    <p className="text-[9px] text-white truncate leading-tight">{item.name}</p>
                </div>
            )}
        </button>
    );
}

export function SuggestOutfitSheet({
    postId,
    postAuthorId,
    postAuthorName,
    open,
    onOpenChange,
    onSuccess,
}: Props) {
    const { grouped, loading } = useUserWardrobe(open ? postAuthorId : null);
    const [activeTab, setActiveTab] = useState<CategoryTab>("tops");
    const [selection, setSelection] = useState<Record<SlotKey, string | null>>({
        topId: null,
        bottomId: null,
        shoesId: null,
        accessoryId: null,
    });
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [noteExpanded, setNoteExpanded] = useState(false);

    if (!open) return null;

    const activeSlot = TABS.find((t) => t.key === activeTab)!.slot;
    const currentItems = grouped[activeTab] ?? [];

    const toggleItem = (item: WardrobeItem) => {
        setSelection((prev) => ({
            ...prev,
            [activeSlot]: prev[activeSlot] === item.id ? null : item.id,
        }));
    };

    const selectedCount = Object.values(selection).filter(Boolean).length;
    const hasSelection = selectedCount > 0;

    const handleSubmit = async () => {
        if (!hasSelection) return;
        setSubmitting(true);
        try {
            await addOutfitSuggestionComment(postId, {
                topId: selection.topId,
                bottomId: selection.bottomId,
                shoesId: selection.shoesId,
                accessoryId: selection.accessoryId,
                note: note.trim() || undefined,
            });
            // Reset
            setSelection({ topId: null, bottomId: null, shoesId: null, accessoryId: null });
            setNote("");
            setNoteExpanded(false);
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Error submitting outfit suggestion:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />

            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 max-w-2xl mx-auto bg-card border border-border border-b-0 rounded-t-3xl shadow-2xl animate-slide-up max-h-[85vh] flex flex-col">
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                    <div className="w-10 h-1 rounded-full bg-border" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border flex-shrink-0">
                    <div>
                        <h2 className="font-playfair text-xl text-foreground">Kombin Öner</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            <span className="font-medium text-foreground">{postAuthorName}</span>
                            &apos;in dolabından seç
                        </p>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground active:scale-95"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Preview + Tabs + Grid — scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {/* Mini 2x2 preview */}
                    <div className="px-5 pt-4 pb-2">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                            Seçilen Kombin
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                            {TABS.map((tab) => {
                                const itemId = selection[tab.slot];
                                const item = itemId
                                    ? grouped[tab.key]?.find((i) => i.id === itemId)
                                    : null;
                                return (
                                    <div
                                        key={tab.key}
                                        className="aspect-square rounded-lg border-2 border-dashed border-border bg-muted/20 overflow-hidden relative flex items-center justify-center"
                                    >
                                        {item ? (
                                            (() => {
                                                const src = item.bgRemovedUrl || item.thumbnailUrl || item.imageUrl;
                                                return src ? (
                                                    <Image
                                                        src={src}
                                                        alt={item.name || "Kıyafet"}
                                                        fill
                                                        className="object-contain p-1"
                                                    />
                                                ) : (
                                                    <span className="text-[10px] opacity-50">Yok</span>
                                                );
                                            })()
                                        ) : (
                                            <span className="text-lg opacity-40">{tab.emoji}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-1 px-5 py-2 border-b border-border overflow-x-auto">
                        {TABS.map((tab) => {
                            const isSelected = selection[tab.slot] !== null;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 ${
                                        activeTab === tab.key
                                            ? "bg-foreground text-background"
                                            : "bg-muted/40 text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    <span>{tab.emoji}</span>
                                    <span>{tab.label}</span>
                                    {isSelected && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Items Grid */}
                    <div className="px-5 py-3">
                        {loading ? (
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded-xl bg-muted/30 animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : currentItems.length === 0 ? (
                            <div className="text-center py-10">
                                <Shirt size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    Bu kategoride herkese açık kıyafet yok.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {currentItems.map((item) => (
                                    <ItemSelectCard
                                        key={item.id}
                                        item={item}
                                        selected={selection[activeSlot] === item.id}
                                        onSelect={() => toggleItem(item)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Note section */}
                    <div className="px-5 pb-3">
                        <button
                            onClick={() => setNoteExpanded((e) => !e)}
                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {noteExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            Not ekle (opsiyonel)
                        </button>
                        {noteExpanded && (
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Bu kombini neden önerdiğini yaz..."
                                maxLength={200}
                                rows={2}
                                className="mt-2 w-full bg-muted/30 text-foreground text-sm border border-border rounded-xl p-3 outline-none resize-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 placeholder:text-muted-foreground/40 font-inter"
                            />
                        )}
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="px-5 py-4 border-t border-border flex-shrink-0 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                        {selectedCount > 0
                            ? `${selectedCount} parça seçildi`
                            : "Henüz parça seçilmedi"}
                    </p>
                    <Button
                        onClick={handleSubmit}
                        disabled={!hasSelection || submitting}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all duration-200 rounded-xl h-11 px-6 font-medium"
                    >
                        {submitting ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            "Öneriyi Paylaş"
                        )}
                    </Button>
                </div>
            </div>
        </>
    );
}
