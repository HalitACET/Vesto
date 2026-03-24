"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useWeather } from "@/hooks/useWeather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Shirt,
    Sparkles,
    CloudSun,
    TrendingUp,
    Plus,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    }),
};

export default function DashboardPage() {
    const { vestoUser } = useAuth();
    const { items, loading: wardrobeLoading } = useWardrobe();
    const { weather, loading: weatherLoading } = useWeather();

    const stats = [
        {
            label: "Wardrobe Items",
            value: wardrobeLoading ? null : items.length,
            icon: Shirt,
            href: "/dashboard/wardrobe",
            color: "text-foreground",
        },
        {
            label: "Outfits Created",
            value: wardrobeLoading ? null : vestoUser?.outfitCount ?? 0,
            icon: Sparkles,
            href: "/dashboard/outfits",
            color: "text-accent",
        },
        {
            label: "Today's Weather",
            value: weatherLoading ? null : weather ? `${weather.temperature}°C` : "—",
            icon: CloudSun,
            href: "/dashboard/outfits",
            color: "text-foreground",
        },
        {
            label: "Style Score",
            value: "—",
            icon: TrendingUp,
            href: "/dashboard",
            color: "text-accent",
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Header */}
                <motion.div initial="hidden" animate="visible">
                    <motion.div custom={0} variants={fadeUp}>
                        <p className="text-sm text-muted-foreground mb-1">Good morning,</p>
                        <h1 className="text-4xl font-light">
                            {vestoUser?.displayName?.split(" ")[0] ?? "Welcome"}
                        </h1>
                    </motion.div>
                </motion.div>

                {/* Stats grid */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                custom={i + 1}
                                variants={fadeUp}
                                initial="hidden"
                                animate="visible"
                            >
                                <Link href={stat.href}>
                                    <Card className="group hover:border-accent/40 hover:shadow-sm transition-all cursor-pointer">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-xs text-muted-foreground font-normal tracking-wide uppercase">
                                                {stat.label}
                                            </CardTitle>
                                            <Icon
                                                size={16}
                                                className={`${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`}
                                            />
                                        </CardHeader>
                                        <CardContent>
                                            {stat.value === null ? (
                                                <Skeleton className="h-8 w-16" />
                                            ) : (
                                                <span className="text-3xl font-light">{stat.value}</span>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Quick actions */}
                <motion.div
                    custom={5}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap gap-3"
                >
                    <Button asChild>
                        <Link href="/dashboard/wardrobe">
                            <Plus size={16} className="mr-2" />
                            Add clothing
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/canvas">
                            <Sparkles size={16} className="mr-2" />
                            Build outfit
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/community">
                            <ArrowRight size={16} className="mr-2" />
                            Explore community
                        </Link>
                    </Button>
                </motion.div>

                {/* Weather card */}
                {weather && (
                    <motion.div
                        custom={6}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                    >
                        <Card className="border-accent/20 bg-gradient-to-r from-card to-muted/30">
                            <CardContent className="flex items-center gap-6 py-6">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={weather.icon} alt={weather.description} className="h-16 w-16" />
                                <div>
                                    <p className="text-sm text-muted-foreground">{weather.city}</p>
                                    <p className="text-3xl font-light">{weather.temperature}°C</p>
                                    <p className="text-sm capitalize text-muted-foreground">
                                        {weather.description}
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <Badge variant="outline" className="border-accent/40 text-accent">
                                        View outfit suggestions →
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Wardrobe preview */}
                <motion.div
                    custom={7}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-light">Recent wardrobe</h2>
                        <Link
                            href="/dashboard/wardrobe"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            View all <ArrowRight size={13} />
                        </Link>
                    </div>

                    {wardrobeLoading ? (
                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="aspect-square rounded-xl" />
                            ))}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border p-16 text-center">
                            <Shirt size={32} className="mx-auto mb-4 text-muted-foreground/40" />
                            <p className="text-muted-foreground text-sm">
                                Your wardrobe is empty.
                            </p>
                            <Button size="sm" className="mt-4" asChild>
                                <Link href="/dashboard/wardrobe">Add first item</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                            {items.slice(0, 4).map((item) => (
                                <div
                                    key={item.id}
                                    className="group aspect-square rounded-xl overflow-hidden border border-border bg-muted relative"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs font-medium truncate">{item.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
