"use client";

import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useOutfits } from "@/hooks/useOutfits";
import { useWeather } from "@/hooks/useWeather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Plus, Shirt, Palette, CloudSun, ArrowRight, Sparkles } from "lucide-react";
import type { VestoUser } from "@/types";
import Image from "next/image";

// ── Components ───────────────────────────────────────────────────────────────

function WelcomeHeader({ user }: { user: VestoUser | null }) {
    const t = useTranslations("dashboard");
    return (
        <div className="mb-8">
            <h1 className="text-4xl font-light tracking-tight text-foreground" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                {t("welcomeTitle", { name: user?.displayName?.split(" ")[0] ?? "User" })}
            </h1>
        </div>
    );
}

function WardrobeSummary({ userId }: { userId: string }) {
    const t = useTranslations("dashboard");
    const { items, loading } = useWardrobe();

    if (loading) return <Skeleton className="h-32 w-full rounded-2xl" />;

    if (items.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <Shirt size={32} className="text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground max-w-xs">
                        {t("emptyWardrobe")}
                    </p>
                    <div className="mt-4 flex gap-4 grayscale opacity-50">
                        <div className="h-8 w-24 bg-foreground rounded flex items-center justify-center text-[10px] text-background">App Store</div>
                        <div className="h-8 w-24 bg-foreground rounded flex items-center justify-center text-[10px] text-background">Google Play</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <Shirt size={14} />
                    {t("wardrobeSummary", { count: items.length })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 overflow-hidden">
                    {items.slice(0, 5).map((item) => (
                        <div key={item.id} className="h-16 w-12 rounded-md overflow-hidden border border-border flex items-center justify-center bg-muted">
                            {item.imageUrl ? (
                                <Image width={800} height={800} src={item.imageUrl} alt={item.name || "Kıyafet"} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-[10px] text-muted-foreground text-center">Resim<br/>Yok</span>
                            )}
                        </div>
                    ))}
                    {items.length > 5 && (
                        <div className="h-16 w-12 rounded-md bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                            +{items.length - 5}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function TodayWeatherSummary({ city }: { city?: string }) {
    const t = useTranslations("dashboard");
    const { weather, loading } = useWeather(city || "Bursa");

    if (loading) return <Skeleton className="h-32 w-full rounded-2xl" />;

    return (
        <Card className="bg-accent/5 border-accent/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold tracking-wider text-accent uppercase flex items-center gap-2">
                    <CloudSun size={14} />
                    {t("todaySummary", {
                        city: weather?.city ?? "Bursa",
                        temp: weather?.temperature ?? 0,
                        condition: weather?.condition ?? "cloudy"
                    })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <div className="text-3xl font-light">{weather?.temperature}°C</div>
                    <p className="text-sm text-muted-foreground capitalize">{weather?.description}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function RecentOutfits({ userId }: { userId: string }) {
    const t = useTranslations("dashboard");
    const { outfits, loading } = useOutfits();

    if (loading) return <Skeleton className="h-32 w-full rounded-2xl" />;

    return (
        <Card className="bg-card/50 backdrop-blur-sm border-border/60">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <Palette size={14} />
                    {t("recentOutfits", { count: outfits.length })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {outfits.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Henüz bir outfit oluşturmadın.</p>
                ) : (
                    <div className="flex gap-2 overflow-hidden">
                        {outfits.slice(0, 3).map((outfit) => (
                            <div key={outfit.id} className="h-16 w-16 rounded-md overflow-hidden border border-border bg-muted grid grid-cols-2">
                                {outfit.itemSnapshots?.slice(0, 4).map((snap) => (
                                    snap.imageUrl ? (
                                        <Image width={800} height={800} key={snap.id} src={snap.imageUrl} alt="Kombin parçası" className="h-full w-full object-cover" />
                                    ) : (
                                        <div key={snap.id} className="h-full w-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">Yok</div>
                                    )
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function StylistStatsPlaceholder() {
    const t = useTranslations("dashboard");
    return (
        <Card className="border-accent/30 bg-accent/5">
            <CardHeader>
                <CardTitle className="text-sm font-medium">{t("stylistStatsTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                    <Sparkles size={14} className="text-accent" />
                    {t("stylistStatsPlaceholder")}
                </div>
            </CardContent>
        </Card>
    );
}

function CreateOutfitCTA() {
    const t = useTranslations("dashboard");
    return (
        <Button asChild size="lg" className="w-full h-14 text-base gap-2 group">
            <Link href="/dashboard/canvas">
                <Plus size={18} />
                {t("createOutfit")}
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
        </Button>
    );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
    const { vestoUser, loading: authLoading } = useAuth();

    if (authLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <Skeleton className="h-10 w-48" />
                    <div className="grid gap-6 md:grid-cols-2">
                        <Skeleton className="h-32" />
                        <Skeleton className="h-32" />
                    </div>
                    <Skeleton className="h-32" />
                    <Skeleton className="h-14" />
                </div>
            </DashboardLayout>
        );
    }

    if (!vestoUser) return null;

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 max-w-4xl"
            >
                <WelcomeHeader user={vestoUser} />

                <div className="grid gap-6 md:grid-cols-2">
                    <WardrobeSummary userId={vestoUser.uid} />
                    <TodayWeatherSummary city={vestoUser.location} />
                </div>

                <RecentOutfits userId={vestoUser.uid} />

                {vestoUser.role === "stylist" && <StylistStatsPlaceholder />}

                <CreateOutfitCTA />
            </motion.div>
        </DashboardLayout>
    );
}
