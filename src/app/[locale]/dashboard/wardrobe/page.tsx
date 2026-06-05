"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useWardrobe } from "@/hooks/useWardrobe";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Upload, Sparkles, Heart, Loader2, X, Globe, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { storage, db, auth } from "@/lib/firebase/config";
import type { ClothingCategory, WardrobeItem } from "@/types";
import { toggleItemPublic } from "@/lib/firebase/profileService";
import Image from "next/image";

const SUBCATEGORIES: Record<string, string[]> = {
    tops: ["tshirt", "shirt", "sweater", "hoodie", "blouse", "tanktop"],
    bottoms: ["pants", "jeans", "shorts", "skirt", "leggings"],
    dresses: ["casual", "formal", "maxi", "mini"],
    outerwear: ["jacket", "coat", "blazer", "vest"],
    shoes: ["sneakers", "boots", "heels", "sandals", "flats"],
    accessories: ["hat", "scarf", "gloves", "belt", "sunglasses"],
    bags: ["backpack", "handbag", "totebag", "clutch"],
    jewelry: ["necklace", "bracelet", "earrings", "ring", "watch"],
};

type CategoryValue = ClothingCategory | "all";

const CATEGORY_VALUES: CategoryValue[] = [
    "all", "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "bags",
];

export default function WardrobePage() {
    const { items, loading } = useWardrobe();
    const t = useTranslations("wardrobe");
    const tCommon = useTranslations("common");
    const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [uploadOpen, setUploadOpen] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewFile, setPreviewFile] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add Item states
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState<ClothingCategory>("tops");
    const [subcategory, setSubcategory] = useState("");
    const [size, setSize] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    const filtered = items.filter((item) => {
        const matchesCategory = activeCategory === "all" || item.category === activeCategory;
        const matchesSearch = (item.name || "").toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            setPreviewFile(URL.createObjectURL(file));
        }
    }

    function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewFile(URL.createObjectURL(file));
        }
    }

    async function handleSubmit() {
        if (!imageFile || !itemName || !category || !subcategory) {
            return;
        }

        setIsSubmitting(true);
        try {
            const itemId = crypto.randomUUID();
            const userId = auth.currentUser!.uid;

            // 1. Create Firestore document (optimistic)
            const docRef = doc(db, "wardrobeItems", itemId);
            await setDoc(docRef, {
                id: itemId,
                userId,
                name: itemName,
                brand: "",
                category,
                subcategory,
                size,
                color: [],
                isPublic,
                isArchived: false,
                isFavorite: false,
                uploadStatus: "uploading",
                usageCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // 2. Upload to Storage with correct path for Cloud Function
            const storagePath = `wardrobe/${userId}/${itemId}/original.jpg`;
            const storageRef = ref(storage, storagePath);
            const snapshot = await uploadBytes(storageRef, imageFile);
            const downloadUrl = await getDownloadURL(snapshot.ref);

            // 3. Update Firestore with URLs
            await updateDoc(docRef, {
                imageUrl: downloadUrl,
                imagePath: storagePath,
                uploadStatus: "ready",
                updatedAt: serverTimestamp(),
            });

            setUploadOpen(false);
            resetForm();
        } catch (error) {
            console.error("Add item error:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    function resetForm() {
        setImageFile(null);
        setPreviewFile(null);
        setItemName("");
        setCategory("tops");
        setSubcategory("");
        setSize("");
        setIsPublic(false);
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-4xl font-light">{t("title")}</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {loading
                                ? tCommon("loading")
                                : t("itemCount", { count: items.length })}
                        </p>
                    </div>
                    <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                        <Button onClick={() => setUploadOpen(true)}>
                            <Plus size={16} className="mr-2" />
                            {t("addItem")}
                        </Button>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-light">
                                    {t("upload.title")}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-5 pt-2">
                                {/* Drop zone */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    className={`relative rounded-xl border-2 border-dashed transition-colors ${
                                        dragOver ? "border-accent bg-accent/5" : "border-border"
                                    } flex flex-col items-center justify-center gap-3 p-10 cursor-pointer`}
                                    onClick={() => document.getElementById("file-upload")?.click()}
                                >
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileInput}
                                    />
                                    {previewFile ? (
                                        <div className="relative group/preview">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <Image width={800} height={800}
                                                src={previewFile}
                                                alt="Preview"
                                                className="h-40 w-40 rounded-lg object-cover"
                                            />
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setPreviewFile(null); setImageFile(null); }}
                                                className="absolute -top-2 -right-2 bg-background border border-border p-1 rounded-full opacity-0 group-hover/preview:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={28} className="text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground text-center">
                                                {t("upload.dropzone")}
                                            </p>
                                            <Badge variant="outline" className="gap-1 border-accent/30 text-accent text-xs">
                                                <Sparkles size={10} />
                                                {t("upload.aiTag")}
                                            </Badge>
                                        </>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <Label htmlFor="item-name">{t("upload.itemName")}</Label>
                                        <Input
                                            id="item-name"
                                            value={itemName}
                                            onChange={(e) => setItemName(e.target.value)}
                                            placeholder={t("upload.itemNamePlaceholder")}
                                            className="mt-1.5"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>{t("upload.category") || "Kategori"}</Label>
                                        <select 
                                            value={category} 
                                            onChange={(e) => { setCategory(e.target.value as ClothingCategory); setSubcategory(""); }}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                        >
                                            {CATEGORY_VALUES.filter(v => v !== "all").map(v => (
                                                <option key={v} value={v}>{t(`categories.${v}` as any)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>{t("upload.subcategory") || "Alt Kategori"}</Label>
                                        <select 
                                            value={subcategory} 
                                            onChange={(e) => setSubcategory(e.target.value)}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                        >
                                            <option value="">Seçiniz...</option>
                                            {SUBCATEGORIES[category].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <Label htmlFor="item-size">{t("upload.size") || "Beden (Opsiyonel)"}</Label>
                                        <Input
                                            id="item-size"
                                            value={size}
                                            onChange={(e) => setSize(e.target.value)}
                                            placeholder="M, 42, 32/34..."
                                            className="mt-1.5"
                                        />
                                    </div>

                                    {/* Visibility Toggle */}
                                    <div className="col-span-2">
                                        <Label className="mb-2 block">Görünürlük</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsPublic(false)}
                                                className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-95 ${
                                                    !isPublic
                                                        ? "border-foreground bg-foreground text-background"
                                                        : "border-border text-muted-foreground hover:border-muted-foreground/50"
                                                }`}
                                            >
                                                <Lock size={15} className="flex-shrink-0" />
                                                <div className="text-left">
                                                    <p className="leading-none">Gizli</p>
                                                    <p className={`text-[10px] mt-0.5 leading-none ${
                                                        !isPublic ? "opacity-60" : "text-muted-foreground/60"
                                                    }`}>Sadece sen görebilirsin</p>
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsPublic(true)}
                                                className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-95 ${
                                                    isPublic
                                                        ? "border-accent bg-accent/10 text-accent"
                                                        : "border-border text-muted-foreground hover:border-muted-foreground/50"
                                                }`}
                                            >
                                                <Globe size={15} className="flex-shrink-0" />
                                                <div className="text-left">
                                                    <p className="leading-none">Herkese Açık</p>
                                                    <p className={`text-[10px] mt-0.5 leading-none ${
                                                        isPublic ? "opacity-60" : "text-muted-foreground/60"
                                                    }`}>Kombin önerisine dahil edilebilir</p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    className="w-full h-11" 
                                    onClick={handleSubmit} 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={15} /> : (
                                        <>
                                            <Sparkles size={15} className="mr-2" />
                                            {t("upload.analyzeButton")}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={t("searchPlaceholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
                            {CATEGORY_VALUES.map((value) => (
                                <TabsTrigger
                                    key={value}
                                    value={value}
                                    data-testid="category-filter"
                                    className="rounded-full border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary text-xs"
                                >
                                    {t(`categories.${value}` as Parameters<typeof t>[0])}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-20 text-center">
                        <p className="text-muted-foreground text-sm">{t("noItems")}</p>
                        {items.length === 0 && (
                            <Button size="sm" className="mt-4" onClick={() => setUploadOpen(true)}>
                                {t("addFirstItem")}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {filtered.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                            >
                                <Card 
                                    data-testid="wardrobe-item-card"
                                    onClick={() => setSelectedItem(item)}
                                    className="group overflow-hidden border-border hover:border-accent/30 transition-all cursor-pointer"
                                >
                                    <div className="relative aspect-[3/4] overflow-hidden bg-muted flex items-center justify-center">
                                        {item.imageUrl ? (
                                            <Image width={800} height={800}
                                                src={item.imageUrl}
                                                alt={item.name || "Kıyafet"}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground text-center">Görsel Yok</span>
                                        )}
                                        <button 
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    await updateDoc(doc(db, "wardrobeItems", item.id), {
                                                        isFavorite: !item.isFavorite,
                                                        updatedAt: serverTimestamp()
                                                    });
                                                } catch (err) {
                                                    console.error("Error toggling favorite:", err);
                                                }
                                            }}
                                            className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm active:scale-90"
                                        >
                                            <Heart
                                                size={14}
                                                className={item.isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}
                                            />
                                        </button>
                                        {/* Visibility badge */}
                                        <div className="absolute top-2 left-2">
                                            {(item as any).isPublic ? (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-medium bg-accent/90 text-accent-foreground rounded-full px-1.5 py-0.5 backdrop-blur-sm">
                                                    <Globe size={8} />
                                                    Açık
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-medium bg-background/80 text-muted-foreground rounded-full px-1.5 py-0.5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Lock size={8} />
                                                    Gizli
                                                </span>
                                            )}
                                        </div>
                                        {item.aiAnalysis && (
                                            <div className="absolute bottom-2 left-2">
                                                <Badge className="gap-1 text-[10px] bg-background/80 text-foreground border-0 backdrop-blur-sm">
                                                    <Sparkles size={9} />
                                                    {t("aiTagged")}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-3">
                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                        <div className="flex items-center justify-between gap-1 mt-0.5">
                                            <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Item Details Dialog */}
            <Dialog open={selectedItem !== null} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="sm:max-w-md">
                    {selectedItem && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-light">
                                    {selectedItem.name}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {selectedItem.imageUrl ? (
                                        <Image width={800} height={800}
                                            src={selectedItem.imageUrl}
                                            alt={selectedItem.name || "Kıyafet Detayı"}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                                            Görsel Yok
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground text-xs block">Kategori</span>
                                        <span className="font-medium capitalize">{t(`categories.${selectedItem.category}` as any)}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs block">Alt Kategori</span>
                                        <span className="font-medium capitalize">{selectedItem.subcategory || "—"}</span>
                                    </div>
                                    {selectedItem.size && (
                                        <div className="col-span-2 mt-1">
                                            <span className="text-muted-foreground text-xs block">Beden</span>
                                            <span className="font-medium">{selectedItem.size}</span>
                                        </div>
                                    )}
                                    {selectedItem.notes && (
                                        <div className="col-span-2 mt-1">
                                            <span className="text-muted-foreground text-xs block">Notlar</span>
                                            <span className="text-muted-foreground">{selectedItem.notes}</span>
                                        </div>
                                    )}
                                </div>

                                <hr className="border-border" />

                                {/* Per-item visibility toggle */}
                                <div className="flex items-center justify-between py-1">
                                    <div>
                                        <p className="font-inter text-sm font-medium text-foreground">
                                            Herkese Açık
                                        </p>
                                        <p className="font-inter text-xs text-muted-foreground">
                                            Bu kıyafeti profilinde göster
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const newVal = !selectedItem.isPublic;
                                            try {
                                                await toggleItemPublic(selectedItem.id, newVal);
                                                setSelectedItem({
                                                    ...selectedItem,
                                                    isPublic: newVal
                                                });
                                            } catch (err) {
                                                console.error("Error toggling item visibility:", err);
                                            }
                                        }}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            selectedItem.isPublic ? "bg-accent" : "bg-muted"
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                                                selectedItem.isPublic ? "translate-x-5" : "translate-x-0"
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
