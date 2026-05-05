"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    getUser,
    updateUserRole,
    updateUserStatus,
    getUsersByRole,
    updateUser,
} from "@/lib/firebase/firestore";
import type { VestoUser, UserRole, UserStatus } from "@/types";
import {
    ArrowLeft,
    Shirt,
    Palette,
    MapPin,
    Mail,
    Calendar,
    Clock,
    ShieldAlert,
    ShieldCheck,
    Users,
} from "lucide-react";
import { motion } from "framer-motion";

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
    { label: "Kullanıcı", value: "user" },
    { label: "Stilist", value: "stylist" },
    { label: "Admin", value: "admin" },
];

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso?: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function timeAgo(iso?: string) {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} dakika önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} saat önce`;
    return `${Math.floor(hours / 24)} gün önce`;
}

export default function AdminUserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();

    const [user, setUser] = useState<VestoUser | null>(null);
    const [stylists, setStylists] = useState<VestoUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [confirm, setConfirm] = useState<"suspend" | "activate" | null>(null);

    useEffect(() => {
        Promise.all([getUser(id), getUsersByRole("stylist")])
            .then(([u, s]) => {
                setUser(u);
                setStylists(s);
            })
            .finally(() => setLoading(false));
    }, [id]);

    async function handleRoleChange(role: UserRole) {
        if (!user) return;
        setSaving(true);
        await updateUserRole(user.uid, role);
        setUser((u) => u && { ...u, role });
        setSaving(false);
    }

    async function handleStatusToggle() {
        if (!user) return;
        const newStatus: UserStatus = user.status === "active" ? "suspended" : "active";
        setSaving(true);
        await updateUserStatus(user.uid, newStatus);
        setUser((u) => u && { ...u, status: newStatus });
        setConfirm(null);
        setSaving(false);
    }

    async function handleStylistAssign(stylistId: string) {
        if (!user) return;
        setSaving(true);
        await updateUser(user.uid, { assignedStylistId: stylistId || undefined });
        setUser((u) => u && { ...u, assignedStylistId: stylistId || undefined });
        setSaving(false);
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 max-w-3xl">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-60 w-full rounded-xl" />
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <p className="text-muted-foreground">Kullanıcı bulunamadı.</p>
                    <Button variant="outline" onClick={() => router.push("/admin/users")}>
                        Geri dön
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const assignedStylist = stylists.find((s) => s.uid === user.assignedStylistId);

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-3xl">
                {/* Back */}
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={14} />
                    Kullanıcı Listesi
                </Link>

                {/* Profile Card */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardContent className="flex flex-col sm:flex-row gap-6 pt-6">
                            <Avatar className="h-20 w-20 flex-shrink-0">
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                    {getInitials(user.displayName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h2 className="text-2xl font-light">{user.displayName}</h2>
                                    <Badge
                                        variant={user.status === "active" ? "default" : "outline"}
                                        className={`text-xs ${user.status === "suspended" ? "border-destructive/50 text-destructive" : "bg-green-500/15 text-green-600 border-0"}`}
                                    >
                                        {user.status === "active" ? "Aktif" : "Askıda"}
                                    </Badge>
                                </div>
                                {user.bio && (
                                    <p className="text-sm text-muted-foreground mb-3">{user.bio}</p>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Mail size={12} /> {user.email}
                                    </span>
                                    {user.location && (
                                        <span className="flex items-center gap-1.5">
                                            <MapPin size={12} /> {user.location}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={12} /> Katılım: {formatDate(user.createdAt)}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={12} /> Son aktif: {timeAgo(user.lastActive)}
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
                    {[
                        { label: "Gardırop", value: user.wardrobeCount ?? 0, icon: Shirt },
                        { label: "Kombin", value: user.outfitCount ?? 0, icon: Palette },
                        { label: "Takipçi", value: user.followersCount ?? 0, icon: Users },
                        { label: "Takip", value: user.followingCount ?? 0, icon: Users },
                    ].map((s) => {
                        const Icon = s.icon;
                        return (
                            <Card key={s.label}>
                                <CardContent className="flex items-center justify-between py-4 px-5">
                                    <div>
                                        <p className="text-xs text-muted-foreground">{s.label}</p>
                                        <p className="text-2xl font-light mt-0.5">{s.value}</p>
                                    </div>
                                    <Icon size={16} className="text-muted-foreground" />
                                </CardContent>
                            </Card>
                        );
                    })}
                </motion.div>

                {/* Admin Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <ShieldCheck size={15} className="text-accent" />
                                Admin İşlemleri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Rol değiştirme */}
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Rol</p>
                                <div className="flex gap-2 flex-wrap">
                                    {ROLE_OPTIONS.map((opt) => (
                                        <Button
                                            key={opt.value}
                                            size="sm"
                                            variant={user.role === opt.value ? "default" : "outline"}
                                            className="text-xs"
                                            disabled={saving || user.role === opt.value}
                                            onClick={() => handleRoleChange(opt.value)}
                                        >
                                            {opt.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Stilist atama */}
                            {user.role === "user" && (
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                        Atanmış Stilist
                                    </p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <select
                                            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                            value={user.assignedStylistId ?? ""}
                                            disabled={saving}
                                            onChange={(e) => handleStylistAssign(e.target.value)}
                                        >
                                            <option value="">— Stilist seçilmedi —</option>
                                            {stylists.map((s) => (
                                                <option key={s.uid} value={s.uid}>
                                                    {s.displayName}
                                                </option>
                                            ))}
                                        </select>
                                        {assignedStylist && (
                                            <span className="text-xs text-muted-foreground">
                                                Şu an: {assignedStylist.displayName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Hesap askıya alma */}
                            <div className="space-y-2 pt-2 border-t border-border">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                    Hesap Durumu
                                </p>
                                {confirm ? (
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm text-muted-foreground">
                                            {confirm === "suspend"
                                                ? "Hesap askıya alınacak. Emin misiniz?"
                                                : "Hesap tekrar aktif edilecek. Emin misiniz?"}
                                        </p>
                                        <Button
                                            size="sm"
                                            variant={confirm === "suspend" ? "destructive" : "default"}
                                            className="text-xs"
                                            disabled={saving}
                                            onClick={handleStatusToggle}
                                        >
                                            {saving ? "..." : "Evet, devam et"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-xs"
                                            onClick={() => setConfirm(null)}
                                        >
                                            İptal
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className={`text-xs gap-1.5 ${user.status === "active" ? "border-destructive/40 text-destructive hover:bg-destructive/5" : "border-green-500/40 text-green-600 hover:bg-green-50/10"}`}
                                        onClick={() => setConfirm(user.status === "active" ? "suspend" : "activate")}
                                    >
                                        {user.status === "active" ? (
                                            <>
                                                <ShieldAlert size={13} />
                                                Hesabı Askıya Al
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck size={13} />
                                                Hesabı Aktif Et
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Style Preferences */}
                {user.stylePreferences && user.stylePreferences.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.17 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Stil Tercihleri</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {user.stylePreferences.map((pref) => (
                                        <Badge key={pref} variant="secondary" className="text-xs capitalize">
                                            {pref}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
}
