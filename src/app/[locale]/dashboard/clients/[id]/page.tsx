"use client";

import { use, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getUser } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import type { VestoUser } from "@/types";
import {
    ArrowLeft,
    Shirt,
    Palette,
    MapPin,
    Mail,
    Calendar,
    Clock,
    Users,
    Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ClientDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const { vestoUser } = useAuth();
    const router = useRouter();
    const t = useTranslations("clients");
    const locale = useLocale();

    const [client, setClient] = useState<VestoUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUser(id)
            .then((u) => {
                if (u && vestoUser && u.assignedStylistId !== vestoUser.uid) {
                    router.replace("/dashboard/clients");
                    return;
                }
                setClient(u);
            })
            .finally(() => setLoading(false));
    }, [id, vestoUser, router]);

    function formatDate(iso?: string) {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }

    function timeAgo(iso?: string) {
        if (!iso) return "—";
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 max-w-3xl">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            </DashboardLayout>
        );
    }

    if (!client) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <p className="text-muted-foreground">{t("detail.notFound")}</p>
                    <Button variant="outline" onClick={() => router.push("/dashboard/clients")}>
                        {t("detail.goBack")}
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const DETAIL_STATS = [
        { key: "wardrobe", value: client.wardrobeCount ?? 0, icon: Shirt },
        { key: "outfit", value: client.outfitCount ?? 0, icon: Palette },
        { key: "followers", value: client.followersCount ?? 0, icon: Users },
        { key: "following", value: client.followingCount ?? 0, icon: Users },
    ] as const;

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-3xl">
                {/* Back */}
                <Link
                    href="/dashboard/clients"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={14} />
                    {t("detail.backToList")}
                </Link>

                {/* Profile */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardContent className="flex flex-col sm:flex-row gap-6 pt-6">
                            <Avatar className="h-20 w-20 flex-shrink-0">
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                    {getInitials(client.displayName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h2 className="text-2xl font-light">{client.displayName}</h2>
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${client.status === "active" ? "border-green-500/40 text-green-600" : "border-destructive/40 text-destructive"}`}
                                    >
                                        {t(`statusLabels.${client.status}` as Parameters<typeof t>[0])}
                                    </Badge>
                                </div>
                                {client.bio && (
                                    <p className="text-sm text-muted-foreground mb-3">{client.bio}</p>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Mail size={12} /> {client.email}
                                    </span>
                                    {client.location && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={12} /> {client.location}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={12} /> {t("detail.joinedAt")} {formatDate(client.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={12} /> {t("detail.lastActive")} {timeAgo(client.lastActive)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.07 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                    {DETAIL_STATS.map((s) => {
                        const Icon = s.icon;
                        return (
                            <Card key={s.key}>
                                <CardContent className="flex items-center justify-between py-4 px-5">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            {t(`detail.stats.${s.key}` as Parameters<typeof t>[0])}
                                        </p>
                                        <p className="text-2xl font-light mt-0.5">{s.value}</p>
                                    </div>
                                    <Icon size={16} className="text-muted-foreground" />
                                </CardContent>
                            </Card>
                        );
                    })}
                </motion.div>

                {/* Style Preferences */}
                {client.stylePreferences && client.stylePreferences.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Sparkles size={14} className="text-accent" />
                                    {t("detail.stylePreferences")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {client.stylePreferences.map((pref) => (
                                        <Badge key={pref} variant="secondary" className="text-xs capitalize">
                                            {pref}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.17 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">{t("detail.quickActions")}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Link href={`/dashboard/wardrobe?userId=${client.uid}`}>
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                    <Shirt size={13} />
                                    {t("detail.viewWardrobe")}
                                </Button>
                            </Link>
                            <Link href={`/dashboard/canvas?userId=${client.uid}`}>
                                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                                    <Palette size={13} />
                                    {t("detail.createOutfit")}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
