"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { 
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
    Plus, Shirt, Clock, Eye 
} from "lucide-react";
import {
    format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameDay, addMonths, subMonths, isToday
} from "date-fns";
import { tr as trLocale, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

interface WearLog {
    id: string;
    userId: string;
    outfitId: string;
    outfitName: string;
    wornAt: Timestamp | null;
    thumbnailUrl: string | null;
    itemSnapshots: any[] | null;
}

export default function CalendarPage() {
    const { vestoUser } = useAuth();
    const locale = useLocale();
    const t = useTranslations("wearCalendar");
    const dateLocale = locale === "tr" ? trLocale : enUS;

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [wearLogs, setWearLogs] = useState<WearLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

    useEffect(() => {
        if (!vestoUser?.uid) return;
        
        setLoading(true);
        const q = query(
            collection(db, "wearLogs"),
            where("userId", "==", vestoUser.uid),
            orderBy("wornAt", "desc")
        );

        getDocs(q)
            .then((snap) => {
                const logs = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                })) as WearLog[];
                setWearLogs(logs);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching wear logs:", err);
                setLoading(false);
            });
    }, [vestoUser?.uid]);

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    // Get days for calendar grid
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // 1 = Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const getLogsForDay = (day: Date) => {
        return wearLogs.filter((log) => {
            if (!log.wornAt) return false;
            const logDate = log.wornAt.toDate();
            return isSameDay(logDate, day);
        });
    };

    const activeDayLogs = selectedDay ? getLogsForDay(selectedDay) : [];

    const weekDays = t.raw("weekdays") as string[];

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-playfair text-3xl text-foreground">{t("title")}</h1>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("subtitle")}
                        </p>
                    </div>
                    <Button asChild className="gap-2 self-start md:self-auto">
                        <Link href="/dashboard/canvas">
                            <Plus size={16} />
                            {t("newOutfit")}
                        </Link>
                    </Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-[400px] w-full rounded-2xl" />
                        </div>
                        <Skeleton className="h-[460px] w-full rounded-2xl" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Calendar Grid */}
                        <div className="lg:col-span-2">
                            <Card className="border-border bg-card shadow-sm overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-border py-4 px-6">
                                    <CardTitle className="text-base font-medium capitalize">
                                        {format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
                                            <ChevronLeft size={16} />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
                                            <ChevronRight size={16} />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {/* Weekdays header */}
                                    <div className="grid grid-cols-7 border-b border-border text-center bg-muted/20 dark:bg-muted/10 text-xs font-medium text-muted-foreground py-3">
                                        {weekDays.map((d) => (
                                            <div key={d}>{d}</div>
                                        ))}
                                    </div>

                                    {/* Days grid */}
                                    <div className="grid grid-cols-7 grid-rows-6 divide-x divide-y divide-border border-b border-border">
                                        {days.map((day, idx) => {
                                            const dayLogs = getLogsForDay(day);
                                            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                                            const isSelected = selectedDay && isSameDay(day, selectedDay);
                                            
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedDay(day)}
                                                    className={`min-h-[90px] p-2 flex flex-col justify-between cursor-pointer transition-all hover:bg-muted/40 ${
                                                        !isCurrentMonth ? "text-muted-foreground/40 bg-muted/10" : "text-foreground"
                                                    } ${isSelected ? "ring-2 ring-primary ring-inset bg-primary/5" : ""} ${
                                                        isToday(day) ? "bg-accent/5 font-semibold" : ""
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-xs ${isToday(day) ? "text-accent bg-accent/10 px-1.5 py-0.5 rounded-full" : ""}`}>
                                                            {format(day, "d")}
                                                        </span>
                                                        {dayLogs.length > 0 && (
                                                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                                        )}
                                                    </div>
                                                    
                                                    {/* Day Content */}
                                                    <div className="mt-1 flex-1 flex flex-col justify-end gap-1">
                                                        {dayLogs.slice(0, 1).map((log) => (
                                                            <div key={log.id} className="text-[10px] truncate bg-accent/10 text-accent border border-accent/20 px-1 py-0.5 rounded flex items-center gap-1">
                                                                <Shirt size={8} />
                                                                <span className="truncate">{log.outfitName}</span>
                                                            </div>
                                                        ))}
                                                        {dayLogs.length > 1 && (
                                                            <div className="text-[9px] text-muted-foreground text-right">
                                                                {t("more", { count: dayLogs.length - 1 })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Selected Day Details / Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="border-border bg-card h-full flex flex-col shadow-sm">
                                <CardHeader className="border-b border-border py-4 px-6 flex-shrink-0">
                                    <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                                        <CalendarIcon size={14} className="text-accent" />
                                        {selectedDay 
                                            ? format(selectedDay, "d MMMM yyyy", { locale: dateLocale })
                                            : t("selectDay")
                                        }
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 flex-1 overflow-y-auto">
                                    {!selectedDay ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                                            <CalendarIcon size={32} className="stroke-[1.2] mb-3 text-muted-foreground/60" />
                                            <p className="text-sm">{t("selectDayHint")}</p>
                                        </div>
                                    ) : activeDayLogs.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12 space-y-4">
                                            <Shirt size={32} className="stroke-[1.2] text-muted-foreground/60" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{t("noLogsTitle")}</p>
                                                <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">
                                                    {t("noLogsDescription")}
                                                </p>
                                            </div>
                                            <Button asChild size="sm" variant="outline" className="text-xs">
                                                <Link href="/dashboard/outfits">
                                                    {t("pickFromOutfits")}
                                                </Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-xs text-muted-foreground">
                                                {t("dayLogs", { count: activeDayLogs.length })}
                                            </p>
                                            
                                            {activeDayLogs.map((log) => (
                                                <div key={log.id} className="rounded-xl border border-border bg-muted/20 dark:bg-muted/10 p-4 space-y-4 hover:border-foreground/20 transition-all">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <h3 className="text-sm font-medium text-foreground">{log.outfitName}</h3>
                                                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                                <Clock size={11} />
                                                                {log.wornAt ? format(log.wornAt.toDate(), "HH:mm") : ""}
                                                            </p>
                                                        </div>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" asChild>
                                                            <Link href={`/dashboard/outfits/${log.outfitId}`}>
                                                                <Eye size={14} />
                                                            </Link>
                                                        </Button>
                                                    </div>

                                                    {/* Preview */}
                                                    {log.itemSnapshots && log.itemSnapshots.length > 0 && (
                                                        <div className="grid grid-cols-4 gap-1.5 bg-muted/30 p-2 rounded-lg">
                                                            {log.itemSnapshots.map((item: any, i: number) => (
                                                                <div key={i} className="aspect-square relative rounded bg-card overflow-hidden border border-border/50">
                                                                    {item.imageUrl ? (
                                                                        <div className="w-full h-full relative">
                                                                            <Image 
                                                                                src={item.imageUrl} 
                                                                                alt="" 
                                                                                fill 
                                                                                className="object-cover"
                                                                                sizes="50px"
                                                                            />
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
