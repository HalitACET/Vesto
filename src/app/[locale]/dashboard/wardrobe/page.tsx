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
import { Plus, Search, Upload, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { ClothingCategory } from "@/types";

type CategoryValue = ClothingCategory | "all";

const CATEGORY_VALUES: CategoryValue[] = [
    "all", "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "bags",
];

export default function WardrobePage() {
    const { items, loading } = useWardrobe();
    const t = useTranslations("wardrobe");
    const tCommon = useTranslations("common");
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [search, setSearch] = useState("");
    const [uploadOpen, setUploadOpen] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [previewFile, setPreviewFile] = useState<string | null>(null);

    const filtered = items.filter((item) => {
        const matchesCategory = activeCategory === "all" || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setPreviewFile(URL.createObjectURL(file));
        }
    }

    function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) setPreviewFile(URL.createObjectURL(file));
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
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={previewFile}
                                            alt="Preview"
                                            className="h-40 w-40 rounded-lg object-cover"
                                        />
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
                                <div>
                                    <Label htmlFor="item-name">{t("upload.itemName")}</Label>
                                    <Input
                                        id="item-name"
                                        placeholder={t("upload.itemNamePlaceholder")}
                                        className="mt-1.5"
                                    />
                                </div>
                                <Button className="w-full h-11">
                                    <Sparkles size={15} className="mr-2" />
                                    {t("upload.analyzeButton")}
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
                                <Card className="group overflow-hidden border-border hover:border-accent/30 transition-all cursor-pointer">
                                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <button className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                            <Heart
                                                size={14}
                                                className={item.isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}
                                            />
                                        </button>
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
                                        <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
