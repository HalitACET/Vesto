"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllUsers } from "@/lib/firebase/firestore";
import type { VestoUser, UserRole, UserStatus } from "@/types";
import {
    Search,
    Users,
    ChevronRight,
    ShieldCheck,
    Sparkles,
    UserIcon,
} from "lucide-react";
import { motion } from "framer-motion";

const ROLE_LABELS: Record<UserRole, string> = {
    user: "Kullanıcı",
    stylist: "Stilist",
    admin: "Admin",
};

const ROLE_VARIANTS: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
    user: "secondary",
    stylist: "default",
    admin: "destructive",
};

const STATUS_VARIANTS: Record<UserStatus, "default" | "secondary" | "outline"> = {
    active: "default",
    suspended: "outline",
};

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(iso?: string) {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}dk önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}s önce`;
    return `${Math.floor(hours / 24)}g önce`;
}

const ROLE_FILTERS: { label: string; value: UserRole | "all" }[] = [
    { label: "Tümü", value: "all" },
    { label: "Kullanıcılar", value: "user" },
    { label: "Stilistler", value: "stylist" },
    { label: "Adminler", value: "admin" },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<VestoUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

    useEffect(() => {
        getAllUsers()
            .then(setUsers)
            .finally(() => setLoading(false));
    }, []);

    const filtered = users.filter((u) => {
        const matchRole = roleFilter === "all" || u.role === roleFilter;
        const q = search.toLowerCase();
        const matchSearch =
            u.displayName.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q);
        return matchRole && matchSearch;
    });

    const stats = {
        total: users.length,
        users: users.filter((u) => u.role === "user").length,
        stylists: users.filter((u) => u.role === "stylist").length,
        suspended: users.filter((u) => u.status === "suspended").length,
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Users size={22} className="text-accent" />
                        <div>
                            <h1 className="text-4xl font-light">Kullanıcı Yönetimi</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                Tüm kayıtlı kullanıcılar ve rollerini yönetin
                            </p>
                        </div>
                    </div>
                    <Link href="/admin">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <ShieldCheck size={13} />
                            Admin Paneli
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: "Toplam", value: stats.total, icon: Users },
                        { label: "Kullanıcı", value: stats.users, icon: UserIcon },
                        { label: "Stilist", value: stats.stylists, icon: Sparkles },
                        { label: "Askıya Alınan", value: stats.suspended, icon: ShieldCheck },
                    ].map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <Card>
                                    <CardContent className="flex items-center justify-between py-4 px-5">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                                {s.label}
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

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="İsim veya e-posta ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 text-sm"
                        />
                    </div>
                    <div className="flex gap-1.5">
                        {ROLE_FILTERS.map((f) => (
                            <Button
                                key={f.value}
                                size="sm"
                                variant={roleFilter === f.value ? "default" : "outline"}
                                className="text-xs"
                                onClick={() => setRoleFilter(f.value)}
                            >
                                {f.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wide">
                            <tr>
                                <th className="text-left px-5 py-3">Kullanıcı</th>
                                <th className="text-left px-5 py-3">Rol</th>
                                <th className="text-left px-5 py-3">Durum</th>
                                <th className="text-right px-5 py-3">Gardırop</th>
                                <th className="text-right px-5 py-3">Kombin</th>
                                <th className="text-right px-5 py-3">Son Aktif</th>
                                <th className="px-5 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading
                                ? Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-5 py-3" colSpan={7}>
                                            <Skeleton className="h-8 w-full rounded-md" />
                                        </td>
                                    </tr>
                                ))
                                : filtered.map((user, i) => (
                                    <motion.tr
                                        key={user.uid}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                                        {getInitials(user.displayName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.displayName}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Badge variant={ROLE_VARIANTS[user.role]} className="text-xs capitalize">
                                                {ROLE_LABELS[user.role]}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Badge
                                                variant={STATUS_VARIANTS[user.status]}
                                                className={`text-xs ${user.status === "suspended" ? "border-destructive/50 text-destructive" : "bg-green-500/15 text-green-600 border-0"}`}
                                            >
                                                {user.status === "active" ? "Aktif" : "Askıda"}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3 text-right text-muted-foreground">
                                            {user.wardrobeCount ?? 0}
                                        </td>
                                        <td className="px-5 py-3 text-right text-muted-foreground">
                                            {user.outfitCount ?? 0}
                                        </td>
                                        <td className="px-5 py-3 text-right text-xs text-muted-foreground">
                                            {timeAgo(user.lastActive)}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Link href={`/admin/users/${user.uid}`}>
                                                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                                    Detay
                                                    <ChevronRight size={13} />
                                                </Button>
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))}
                        </tbody>
                    </table>
                    {!loading && filtered.length === 0 && (
                        <div className="py-16 text-center text-sm text-muted-foreground">
                            Kullanıcı bulunamadı.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
