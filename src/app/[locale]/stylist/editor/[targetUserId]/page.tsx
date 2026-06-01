"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { sendRecommendation } from "@/lib/firebase/stylistService";
import type { VestoUser, WardrobeItem } from "@/types";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WardrobePickerSidebar } from "@/components/canvas/WardrobePickerSidebar";
import { MannequinCanvas, SlotState, EMPTY_SLOTS, getMannequinType } from "@/components/canvas/MannequinCanvas";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import { SlotType } from "@/components/canvas/SlotRegion";
import Image from "next/image";

export default function StylistEditorPage({
    params
}: { params: Promise<{ targetUserId: string }> }) {
    const { targetUserId } = use(params);
    const { vestoUser } = useAuth();
    const router = useRouter();

    const [targetUser, setTargetUser] = useState<VestoUser | null>(null);
    const [publicItems, setPublicItems] = useState<WardrobeItem[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [sending, setSending] = useState(false);

    // Canvas state
    const [slots, setSlots] = useState<SlotState>(EMPTY_SLOTS);
    const [activeDragItem, setActiveDragItem] = useState<WardrobeItem | null>(null);
    const [note, setNote] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    useEffect(() => {
        if (!vestoUser?.isStylistModeActive) {
            router.push("/");
            return;
        }

        async function loadTargetData() {
            try {
                const docSnap = await getDoc(doc(db, "users", targetUserId));
                if (docSnap.exists()) {
                    setTargetUser({ uid: docSnap.id, ...docSnap.data() } as VestoUser);
                }

                const itemsQuery = query(
                    collection(db, "wardrobeItems"),
                    where("userId", "==", targetUserId),
                    where("isPublic", "==", true),
                    orderBy("createdAt", "desc")
                );
                const itemsSnap = await getDocs(itemsQuery);
                const itemsList = itemsSnap.docs
                    .map((d) => ({ id: d.id, ...d.data() } as WardrobeItem))
                    .filter((item) => !("isArchived" in item && item.isArchived));
                setPublicItems(itemsList);
            } catch (error) {
                console.error("Error loading target data:", error);
                setErrorMsg("Veriler yüklenirken hata oluştu.");
            } finally {
                setLoadingData(false);
            }
        }
        loadTargetData();
    }, [targetUserId, vestoUser, router]);

    const handleDragStart = (e: DragStartEvent) => {
        const item = e.active.data.current?.item as WardrobeItem;
        if (item) setActiveDragItem(item);
    };

    const handleDragEnd = (e: DragEndEvent) => {
        setActiveDragItem(null);
        const { over, active } = e;
        if (!over) return;

        const slotId = over.data.current?.slotType as SlotType;
        const item = active.data.current?.item as WardrobeItem;

        if (!item || !slotId) return;

        // Validasyonlar:
        // top -> tops, outerwear, dresses
        // bottom -> bottoms
        // shoes -> shoes
        // accessory -> accessories, bags, jewelry
        let isValid = false;
        if (slotId === "top") {
            isValid = ["tops", "top", "outerwear", "dresses"].includes(item.category);
        } else if (slotId === "bottom") {
            isValid = ["bottoms", "bottom"].includes(item.category);
        } else if (slotId === "shoes") {
            isValid = ["shoes", "footwear"].includes(item.category);
        } else if (slotId === "accessory") {
            isValid = ["accessories", "accessory", "bags", "jewelry"].includes(item.category);
        }

        if (isValid) {
            setSlots(prev => ({ ...prev, [slotId]: item }));
            setErrorMsg("");
        } else {
            setErrorMsg("Bu kıyafet bu alana uygun değil.");
            setTimeout(() => setErrorMsg(""), 3000);
        }
    };

    const handleSend = async () => {
        if (!hasAnyItem) {
            setErrorMsg("En az bir kıyafet seçmelisiniz.");
            setTimeout(() => setErrorMsg(""), 3000);
            return;
        }

        setSending(true);
        setErrorMsg("");
        try {
            await sendRecommendation(
                targetUserId,
                {
                    topId: slots.top?.id ?? null,
                    bottomId: slots.bottom?.id ?? null,
                    shoesId: slots.shoes?.id ?? null,
                    accessoryId: slots.accessory?.id ?? null,
                },
                note
            );
            setSuccessMsg("Kombin önerisi başarıyla gönderildi! ✨");
            setTimeout(() => {
                setSuccessMsg("");
                router.back();
            }, 2000);
        } catch (error) {
            console.error("Error sending recommendation:", error);
            setErrorMsg("Gönderilirken bir hata oluştu.");
            setSending(false);
        }
    };

    const handleClearSlot = (slot: SlotType) => {
        setSlots(prev => ({ ...prev, [slot]: null }));
    };

    if (!vestoUser?.isStylistModeActive) return null;

    const hasAnyItem = slots.top || slots.bottom || slots.shoes || slots.accessory;

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group mb-2"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            Geri Dön
                        </button>
                        <h1 className="font-playfair text-2xl font-semibold text-foreground">
                            {targetUser?.displayName ?? "Kullanıcı"} için Kombin
                        </h1>
                    </div>
                    <Button
                        onClick={handleSend}
                        disabled={!hasAnyItem || sending}
                        className="gap-2"
                    >
                        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Gönder
                    </Button>
                </div>

                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex flex-1 gap-6 overflow-hidden min-h-0 bg-card border border-border rounded-xl p-4">
                        {/* Sol: Sidebar */}
                        <WardrobePickerSidebar items={publicItems} loading={loadingData} />

                        {/* Sağ: Mannequin ve Not alanı */}
                        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto">
                            <MannequinCanvas
                                slots={slots}
                                mannequinType={getMannequinType(targetUser?.gender)}
                                onClear={handleClearSlot}
                            />
                            
                            <div className="w-full max-w-[400px] mt-6">
                                {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}
                                {successMsg && <p className="text-green-500 text-sm mb-2">{successMsg}</p>}
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Bu kombin hakkında bir not ekleyin (İsteğe bağlı)..."
                                    maxLength={280}
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    rows={3}
                                />
                                <div className="text-right text-xs text-muted-foreground mt-1">
                                    {note.length} / 280
                                </div>
                            </div>
                        </div>
                    </div>

                    <DragOverlay dropAnimation={null}>
                        {activeDragItem && (
                            <div className="h-20 w-20 rounded-xl overflow-hidden border border-primary/50 shadow-xl scale-105 bg-background">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <Image width={800} height={800}
                                    src={activeDragItem.bgRemovedUrl || activeDragItem.imageUrl || ""}
                                    alt=""
                                    className="h-full w-full object-contain p-1"
                                />
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>
            </div>
        </DashboardLayout>
    );
}
