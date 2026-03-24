"use client";

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

const STATS = [
    { label: "Toplam Kullanıcı", value: "1,248", icon: Users, increment: "+12% bu ay" },
    { label: "Yeni Yüklenen Kıyafetler", value: "3,842", icon: Shirt, increment: "+4% bu ay" },
    { label: "Bekleyen Kombin Talepleri", value: "156", icon: Palette, increment: "-2% bu ay" },
    { label: "Aktif Stilistler", value: "24", icon: ShieldCheck, increment: "Değişim yok" },
];

const RECENT_ACTIVITIES = [
    { id: "1", user: "Sophie Laurent", action: "Yeni bir kapsül gardırop ekledi", date: "10 dk önce", status: "Tamamlandı" },
    { id: "2", user: "Marcus Chen", action: "Kombin önerisi talep etti", date: "45 dk önce", status: "Beklemede" },
    { id: "3", user: "Amara Osei", action: "Yapay zeka renk tespiti onayı bekliyor", date: "2 saat önce", status: "İnceleniyor" },
    { id: "4", user: "Elena Volkov", action: "Topluluk formunda paylaşım yaptı", date: "4 saat önce", status: "Tamamlandı" },
    { id: "5", user: "James Park", action: "Yeni kıyafet kataloğu yükledi", date: "5 saat önce", status: "Tamamlandı" },
];

export default function DashboardHome() {
    return (
        <DashboardLayout>
            <div className="space-y-12 pb-10">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-light tracking-tight">Genel Bakış</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Platformdaki tüm aktiviteleri ve temel metrikleri buradan izleyebilirsiniz.
                    </p>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {STATS.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                            >
                                <Card className="hover:border-accent/40 transition-colors bg-card/50 backdrop-blur-sm border-border/60">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                                            {stat.label}
                                        </CardTitle>
                                        <Icon size={16} className="text-muted-foreground/60" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-light">{stat.value}</div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {stat.increment}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Recent Activities DataTable */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <div className="space-y-4">
                        <h2 className="text-xl font-light">Son Aktiviteler</h2>
                        <div className="rounded-xl border border-border/60 bg-card/30 backdrop-blur-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[200px] text-xs font-semibold uppercase tracking-wider text-muted-foreground h-11">
                                            Kullanıcı Adı
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            İşlem Tipi
                                        </TableHead>
                                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Tarih
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
                                                    <span className="truncate max-w-[300px]">{activity.action}</span>
                                                    {activity.status === "Beklemede" && (
                                                        <Badge variant="outline" className="border-accent/40 text-accent text-[10px] ml-2 h-4 px-1.5 py-0">
                                                            Yeni
                                                        </Badge>
                                                    )}
                                                    {activity.status === "İnceleniyor" && (
                                                        <Badge variant="outline" className="border-blue-500/40 text-blue-500 text-[10px] ml-2 h-4 px-1.5 py-0">
                                                            AI Kontrolü
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-muted-foreground">
                                                {activity.date}
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
