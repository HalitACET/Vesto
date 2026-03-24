"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useWeather } from "@/hooks/useWeather";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Heart, Share2, CloudSun } from "lucide-react";
import { motion } from "framer-motion";

// Mock outfit suggestions for scaffolding purposes
const MOCK_OUTFITS = [
    {
        id: "1",
        name: "Minimalist Monday",
        occasion: "business",
        score: 96,
        weatherMatch: 98,
        reason: "Perfect for the mild temperature today. Clean lines match your current wardrobe.",
        colors: ["#1a1a1a", "#f5f5f0", "#c8a97e"],
        items: ["White linen shirt", "Tailored trousers", "Oxford shoes"],
    },
    {
        id: "2",
        name: "Weekend Casual",
        occasion: "casual",
        score: 88,
        weatherMatch: 91,
        reason: "Laid-back but put-together. Great for the sunny forecast.",
        colors: ["#e8ddd0", "#6b5c4e", "#a0956a"],
        items: ["Cream knit sweater", "Dark jeans", "White sneakers"],
    },
    {
        id: "3",
        name: "Evening Elegance",
        occasion: "evening",
        score: 94,
        weatherMatch: 85,
        reason: "Sophisticated layering ideal for an evening out.",
        colors: ["#0a0a0a", "#c8a97e", "#2d2d2d"],
        items: ["Black blazer", "Gold accessories", "Cigarette trousers"],
    },
    {
        id: "4",
        name: "Street Smart",
        occasion: "casual",
        score: 82,
        weatherMatch: 79,
        reason: "Urban edge meets comfort — suitable for cooler conditions.",
        colors: ["#2a2a2a", "#d4cfc9", "#8b7355"],
        items: ["Oversized jacket", "Neutral tee", "Cargo pants"],
    },
];

export default function OutfitsPage() {
    const { weather, loading: weatherLoading } = useWeather();

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-light">Outfit Suggestions</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        AI-curated looks tailored to today&apos;s weather &amp; your style.
                    </p>
                </div>

                {/* Weather strip */}
                <Card className="border-accent/20">
                    <CardContent className="flex items-center gap-5 py-5">
                        <CloudSun size={28} className="text-accent" />
                        {weatherLoading ? (
                            <Skeleton className="h-6 w-48" />
                        ) : weather ? (
                            <div>
                                <p className="font-medium">
                                    {weather.city} — {weather.temperature}°C,{" "}
                                    <span className="capitalize">{weather.description}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Feels like {weather.feelsLike}°C · {weather.humidity}% humidity
                                </p>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                Weather unavailable — add your OpenWeather API key to enable smart suggestions.
                            </p>
                        )}
                        <Badge variant="outline" className="ml-auto border-accent/30 text-accent gap-1">
                            <Sparkles size={10} />
                            AI matched
                        </Badge>
                    </CardContent>
                </Card>

                {/* Outfit cards */}
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    {MOCK_OUTFITS.map((outfit, i) => (
                        <motion.div
                            key={outfit.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        >
                            <Card className="group overflow-hidden hover:border-accent/40 hover:shadow-md transition-all">
                                {/* Color palette preview */}
                                <div className="flex h-40 relative overflow-hidden">
                                    {outfit.colors.map((color, ci) => (
                                        <div
                                            key={ci}
                                            className="flex-1 transition-all group-hover:flex-none group-hover:first:flex-[2]"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <div className="absolute inset-0 flex flex-col items-start justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
                                        <h3
                                            className="text-white font-medium text-lg leading-tight"
                                            style={{ fontFamily: "Cormorant Garamond, serif" }}
                                        >
                                            {outfit.name}
                                        </h3>
                                        <Badge className="mt-1 capitalize text-[10px] bg-white/20 text-white border-0 backdrop-blur-sm">
                                            {outfit.occasion}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-4 space-y-3">
                                    {/* Score */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-muted-foreground">Style score</span>
                                                <span className="text-xs font-medium">{outfit.score}%</span>
                                            </div>
                                            <div className="h-1 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className="h-full bg-accent rounded-full"
                                                    style={{ width: `${outfit.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items list */}
                                    <ul className="space-y-1">
                                        {outfit.items.map((item) => (
                                            <li key={item} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                <span className="h-1 w-1 rounded-full bg-accent/60" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>

                                    <p className="text-[11px] text-muted-foreground leading-relaxed border-t border-border pt-3">
                                        {outfit.reason}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-1">
                                        <Button size="sm" className="flex-1 h-8 text-xs">
                                            <Sparkles size={12} className="mr-1" />
                                            Wear this
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-8 px-2">
                                            <Heart size={13} />
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-8 px-2">
                                            <Share2 size={13} />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
