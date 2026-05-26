"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getUsersByStylist } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import type { VestoUser } from "@/types";
import { Search, Users, Shirt, Palette, ChevronRight, Clock } from "lucide-react";
import { motion } from "framer-motion";

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ClientsPage() {
    const t = useTranslations("clients");
    const { vestoUser } = useAuth();
    const [clients, setClients] = useState<VestoUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!vestoUser) return;
        getUsersByStylist(vestoUser.uid)
            .then(setClients)
            .finally(() => setLoading(false));
    }, [vestoUser]);

    function timeAgo(iso?: string) {
        if (!iso) return "—";
        // eslint-disable-next-line react-hooks/purity
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    }

    const filtered = clients.filter((c) => {
        const q = search.toLowerCase();
        return (
            c.displayName.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q)
        );
    });

    const totalWardrobe = clients.reduce((s, c) => s + (c.wardrobeCount ?? 0), 0);
    const totalOutfits = clients.reduce((s, c) => s + (c.outfitCount ?? 0), 0);

    const STAT_CARDS = [
        { key: "totalClients", value: clients.length, icon: Users },
        { key: "totalWardrobe", value: totalWardrobe, icon: Shirt },
        { key: "totalOutfits", value: totalOutfits, icon: Palette },
    ] as const;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Users size={22} className="text-accent" />
                    <div>
                        <h1 className="text-4xl font-light">{t("title")}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">{t("subtitle")}</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {STAT_CARDS.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.div
                                key={s.key}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <Card>
                                    <CardContent className="flex items-center justify-between py-4 px-5">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                                {t(`stats.${s.key}` as Parameters<typeof t>[0])}
                                            </p>
                                            <p className="text-3xl font-light mt-0.5">{s.value}</p>
                                        </div>
                                        <Icon size={18} className="text-muted-foreground" />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={t("searchPlaceholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 text-sm"
                    />
                </div>

                {/* Client Cards */}
                {loading ? (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 rounded-xl" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center text-sm text-muted-foreground">
                        {search ? t("noResults") : t("noClients")}
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map((client, i) => (
                            <motion.div
                                key={client.uid}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="hover:border-primary/40 transition-colors">
                                    <CardContent className="pt-5 pb-4 px-5 space-y-4">
                                        {/* Top */}
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                                                    {getInitials(client.displayName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">
                                                    {client.displayName}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {client.email}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] flex-shrink-0 ${client.status === "active" ? "border-green-500/40 text-green-600" : "border-destructive/40 text-destructive"}`}
                                            >
                                                {t(`statusLabels.${client.status}` as Parameters<typeof t>[0])}
                                            </Badge>
                                        </div>

                                        {/* Stats row */}
                                        <div className="flex gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Shirt size={11} />
                                                {t("itemCounts.wardrobe", { count: client.wardrobeCount ?? 0 })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Palette size={11} />
                                                {t("itemCounts.outfits", { count: client.outfitCount ?? 0 })}
                                            </span>
                                            <span className="flex items-center gap-1 ml-auto">
                                                <Clock size={11} />
                                                {timeAgo(client.lastActive)}
                                            </span>
                                        </div>

                                        {/* Style prefs */}
                                        {client.stylePreferences && client.stylePreferences.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {client.stylePreferences.slice(0, 3).map((pref) => (
                                                    <Badge
                                                        key={pref}
                                                        variant="secondary"
                                                        className="text-[10px] capitalize"
                                                    >
                                                        {pref}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {/* CTA */}
                                        <Link href={`/dashboard/clients/${client.uid}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-xs gap-1.5"
                                            >
                                                {t("viewProfile")}
                                                <ChevronRight size={12} />
                                            </Button>
                                        </Link>
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
