"use client";

import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Shirt, Palette, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

type ActivityStatus = "done" | "pending" | "reviewing";

export default function DashboardHome() {
    const t = useTranslations("dashboard");

    const STATS = [
        { labelKey: "stats.totalUsers", value: "1,248", icon: Users, increment: `+12% ${t("stats.thisMonth")}` },
        { labelKey: "stats.newClothes", value: "3,842", icon: Shirt, increment: `+4% ${t("stats.thisMonth")}` },
        { labelKey: "stats.pendingRequests", value: "156", icon: Palette, increment: `-2% ${t("stats.thisMonth")}` },
        { labelKey: "stats.activeStylists", value: "24", icon: ShieldCheck, increment: t("stats.noChange") },
    ];

    const RECENT_ACTIVITIES: { id: string; user: string; actionKey: string; dateKey: string; status: ActivityStatus }[] = [
        { id: "1", user: "Sophie Laurent", actionKey: "activity.actions.addedWardrobe", dateKey: "activity.dates.min10", status: "done" },
        { id: "2", user: "Marcus Chen", actionKey: "activity.actions.requestedOutfit", dateKey: "activity.dates.min45", status: "pending" },
        { id: "3", user: "Amara Osei", actionKey: "activity.actions.aiColorPending", dateKey: "activity.dates.hour2", status: "reviewing" },
        { id: "4", user: "Elena Volkov", actionKey: "activity.actions.sharedPost", dateKey: "activity.dates.hour4", status: "done" },
        { id: "5", user: "James Park", actionKey: "activity.actions.uploadedCatalog", dateKey: "activity.dates.hour5", status: "done" },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-12 pb-10">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-light tracking-tight">{t("overview.title")}</h1>
                    <p className="text-sm text-muted-foreground mt-2">{t("overview.subtitle")}</p>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {STATS.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.labelKey}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                            >
                                <Card className="hover:border-accent/40 transition-colors bg-card/50 backdrop-blur-sm border-border/60">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                                            {t(stat.labelKey as Parameters<typeof t>[0])}
                                        </CardTitle>
                                        <Icon size={16} className="text-muted-foreground/60" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-light">{stat.value}</div>
                                        <p className="text-xs text-muted-foreground mt-2">{stat.increment}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Recent Activities */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <div className="space-y-4">
                        <h2 className="text-xl font-light">{t("activity.title")}</h2>
                        <div className="rounded-xl border border-border/60 bg-card/30 backdrop-blur-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[200px] text-xs font-semibold uppercase tracking-wider text-muted-foreground h-11">
                                            {t("activity.columns.user")}
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {t("activity.columns.action")}
                                        </TableHead>
                                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {t("activity.columns.date")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {RECENT_ACTIVITIES.map((activity) => (
                                        <TableRow key={activity.id} className="hover:bg-muted/40 transition-colors">
                                            <TableCell className="font-medium text-sm py-4">
                                                {activity.user}
                                            </TableCell>
                                            <TableCell className="text-sm text-foreground/80">
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate max-w-[300px]">
                                                        {t(activity.actionKey as Parameters<typeof t>[0])}
                                                    </span>
                                                    {activity.status === "pending" && (
                                                        <Badge variant="outline" className="border-accent/40 text-accent text-[10px] ml-2 h-4 px-1.5 py-0">
                                                            {t("activity.badge.new")}
                                                        </Badge>
                                                    )}
                                                    {activity.status === "reviewing" && (
                                                        <Badge variant="outline" className="border-blue-500/40 text-blue-500 text-[10px] ml-2 h-4 px-1.5 py-0">
                                                            {t("activity.badge.aiReview")}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-muted-foreground">
                                                {t(activity.dateKey as Parameters<typeof t>[0])}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
