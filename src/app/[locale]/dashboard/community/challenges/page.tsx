"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOutfits } from "@/hooks/useOutfits";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc, increment } from "firebase/firestore";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Challenge,
    ChallengeEntry,
    createChallenge,
    subscribeToChallenges,
    joinChallenge,
    subscribeToChallengeEntries
} from "@/lib/firebase/challengeService";
import { 
    Trophy, Users, Calendar, Heart, 
    ArrowRight, Plus, X, Globe, Lock, ArrowLeft, Clock
} from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import confetti from "canvas-confetti";

export default function ChallengesPage() {
    const { vestoUser } = useAuth();
    const { outfits, loading: loadingOutfits } = useOutfits();
    const locale = useLocale();
    const t = useTranslations("challenges");
    const tCommon = useTranslations("common");
    const dateLocale = locale === "tr" ? tr : enUS;

    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [entries, setEntries] = useState<ChallengeEntry[]>([]);
    const [loadingEntries, setLoadingEntries] = useState(false);

    // Winner states
    const [winnerModalOpen, setWinnerModalOpen] = useState(false);
    const [winnerEntry, setWinnerEntry] = useState<ChallengeEntry | null>(null);

    // Join modal state
    const [joinOpen, setJoinOpen] = useState(false);
    const [selectedOutfitId, setSelectedOutfitId] = useState<string>("");
    const [joinNote, setJoinNote] = useState("");
    const [joining, setJoining] = useState(false);

    // Create modal state
    const [createOpen, setCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newTheme, setNewTheme] = useState("");
    const [newEndsAt, setNewEndsAt] = useState("");
    const [creating, setCreating] = useState(false);

    // Subscribe to challenges list
    useEffect(() => {
        const unsub = subscribeToChallenges((data) => {
            setChallenges(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Subscribe to entries for selected challenge
    useEffect(() => {
        if (!selectedChallenge) {
            setEntries([]);
            return;
        }

        setLoadingEntries(true);
        const unsub = subscribeToChallengeEntries(selectedChallenge.id, (data) => {
            setEntries(data);
            setLoadingEntries(false);
        });
        return () => unsub();
    }, [selectedChallenge]);

    // Winner detection and modal trigger
    useEffect(() => {
        if (!selectedChallenge || entries.length === 0) {
            setWinnerEntry(null);
            return;
        }

        const now = new Date();
        const challengeEndsDate = selectedChallenge.endsAt?.toDate ? selectedChallenge.endsAt.toDate() : new Date(selectedChallenge.endsAt as any);
        const isChallengeEnded = now > challengeEndsDate;
        const daysPassedSinceEnd = isChallengeEnded ? differenceInDays(now, challengeEndsDate) : 0;

        if (!isChallengeEnded) {
            setWinnerEntry(null);
            return;
        }

        const winner = entries.reduce((prev, current) => (prev.likeCount > current.likeCount) ? prev : current);
        setWinnerEntry(winner);

        // Show confetti only if within 7 days and haven't seen it
        if (daysPassedSinceEnd <= 7) {
            const cacheKey = `winner_seen_${selectedChallenge.id}`;
            if (!localStorage.getItem(cacheKey)) {
                setWinnerModalOpen(true);
                triggerConfetti();
                localStorage.setItem(cacheKey, "true");
            }
        }
    }, [selectedChallenge, entries]);

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const handleCreateChallenge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vestoUser || !newTitle.trim() || !newEndsAt) return;

        setCreating(true);
        try {
            await createChallenge({
                title: newTitle.trim(),
                description: newDesc.trim(),
                theme: newTheme.trim(),
                createdBy: vestoUser.uid,
                createdByName: vestoUser.displayName || t("creatorFallback"),
                endsAt: new Date(newEndsAt)
            });
            setCreateOpen(false);
            setNewTitle("");
            setNewDesc("");
            setNewTheme("");
            setNewEndsAt("");
        } catch (err) {
            console.error("Failed to create challenge:", err);
        } finally {
            setCreating(false);
        }
    };

    const handleJoinChallenge = async () => {
        if (!selectedChallenge || !selectedOutfitId || !vestoUser) return;

        setJoining(true);
        try {
            await joinChallenge(
                selectedChallenge.id,
                vestoUser.uid,
                vestoUser.displayName || t("participantFallback"),
                selectedOutfitId,
                joinNote
            );
            setJoinOpen(false);
            setSelectedOutfitId("");
            setJoinNote("");
        } catch (err) {
            console.error("Failed to join challenge:", err);
        } finally {
            setJoining(false);
        }
    };

    const handleVoteEntry = async (entryId: string) => {
        if (!selectedChallenge || !vestoUser) return;
        try {
            // Simple direct like count increment (can be improved with transactions or likes subcol)
            await updateDoc(doc(db, "challenges", selectedChallenge.id, "entries", entryId), {
                likeCount: increment(1)
            });
        } catch (err) {
            console.error("Failed to vote:", err);
        }
    };

    const timeLeft = (endsAt: any) => {
        if (!endsAt) return "";
        const endsDate = endsAt.toDate();
        if (endsDate < new Date()) {
            return t("ended");
        }
        return formatDistanceToNow(endsDate, { addSuffix: true, locale: dateLocale });
    };

    const isChallengeActive = (c: Challenge) => {
        if (!c.endsAt) return false;
        return c.endsAt.toDate() > new Date();
    };

    const activeChallenges = challenges.filter(isChallengeActive);
    const finishedChallenges = challenges.filter(c => !isChallengeActive(c));

    const userHasJoined = selectedChallenge && entries.some(e => e.userId === vestoUser?.uid);

    // Winner logic derived state for render
    const now = new Date();
    const challengeEndsDate = selectedChallenge?.endsAt?.toDate ? selectedChallenge.endsAt.toDate() : (selectedChallenge?.endsAt ? new Date(selectedChallenge.endsAt as any) : null);
    const isChallengeEnded = challengeEndsDate ? now > challengeEndsDate : false;
    const daysPassedSinceEnd = (isChallengeEnded && challengeEndsDate) ? differenceInDays(now, challengeEndsDate) : 0;

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl">
                {selectedChallenge ? (
                    /* CHALLENGE DETAIL VIEW */
                    <div className="space-y-8">
                        <button
                            onClick={() => setSelectedChallenge(null)}
                            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            {t("back")}
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                            <div className="space-y-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold">
                                    <Trophy size={12} />
                                    {t("detailBadge")}
                                </span>
                                <h1 className="font-playfair text-3xl text-foreground">{selectedChallenge.title}</h1>
                                <p className="text-sm text-muted-foreground max-w-2xl">{selectedChallenge.description}</p>
                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
                                    <span className="flex items-center gap-1.5">
                                        <Users size={14} />
                                        {t("participants", { count: selectedChallenge.participantCount })}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {t("endsAt", { time: timeLeft(selectedChallenge.endsAt) })}
                                    </span>
                                    {selectedChallenge.theme && (
                                        <span className="border border-border px-2 py-0.5 rounded text-[10px]">
                                            {t("theme", { theme: selectedChallenge.theme })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {isChallengeActive(selectedChallenge) && !userHasJoined && (
                                <Button className="gap-2" onClick={() => setJoinOpen(true)}>
                                    <Plus size={16} />
                                    {t("join")}
                                </Button>
                            )}
                            {userHasJoined && (
                                <span className="text-xs text-accent font-medium bg-accent/5 border border-accent/15 px-4 py-2 rounded-xl">
                                    {t("joined")}
                                </span>
                            )}
                        </div>

                        {/* Submissions Grid */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-medium text-foreground">{t("entriesTitle")}</h2>
                            
                            {loadingEntries ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map(n => <Skeleton key={n} className="h-64 rounded-xl" />)}
                                </div>
                            ) : entries.length === 0 ? (
                                <div className="text-center text-muted-foreground py-16 border border-dashed border-border rounded-2xl">
                                    {t("noEntries")}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {entries.map((entry) => {
                                        const isWinner = isChallengeEnded && daysPassedSinceEnd <= 7 && winnerEntry?.id === entry.id;
                                        return (
                                        <Card key={entry.id} className={`overflow-hidden border transition-all group relative ${isWinner ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-border hover:border-accent/20'}`}>
                                            <CardContent className="p-4 space-y-4">
                                                {isWinner && (
                                                    <div className="absolute top-2 right-2 bg-gradient-to-tr from-amber-400 to-yellow-500 text-white p-1.5 rounded-full shadow-lg transform rotate-12 z-10 flex items-center justify-center">
                                                        <Trophy size={14} className="drop-shadow-sm" />
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between gap-3 pt-1">
                                                    <div>
                                                        <h3 className="font-semibold text-sm text-foreground">{entry.userName}</h3>
                                                        <p className="text-[10px] text-muted-foreground">
                                                            {entry.createdAt 
                                                                ? formatDistanceToNow(
                                                                    typeof entry.createdAt.toDate === 'function' ? entry.createdAt.toDate() : new Date(entry.createdAt as any), 
                                                                    { addSuffix: true, locale: dateLocale }
                                                                  ) 
                                                                : t("justNow")
                                                            }
                                                        </p>
                                                    </div>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50/15"
                                                        onClick={() => handleVoteEntry(entry.id)}
                                                    >
                                                        <Heart size={14} className="fill-red-500/0 hover:fill-current text-current" />
                                                        {entry.likeCount}
                                                    </Button>
                                                </div>

                                                {entry.note && (
                                                    <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/30 p-2 rounded">
                                                        &ldquo;{entry.note}&rdquo;
                                                    </p>
                                                )}
                                                
                                                <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                                                    <a href={`/dashboard/outfits/${entry.outfitId}`}>
                                                        {t("viewOutfit")}
                                                        <ArrowRight size={12} className="ml-1.5" />
                                                    </a>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* MAIN LISTING VIEW */
                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b border-border pb-6">
                            <div>
                                <h1 className="font-playfair text-3xl text-foreground flex items-center gap-2">
                                    <Trophy className="text-accent" />
                                    {t("title")}
                                </h1>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {t("subtitle")}
                                </p>
                            </div>
                            
                            {vestoUser && (vestoUser.role === "admin" || vestoUser.role === "stylist") && (
                                <Button className="gap-2" onClick={() => setCreateOpen(true)}>
                                    <Plus size={16} />
                                    {t("create")}
                                </Button>
                            )}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map(n => <Skeleton key={n} className="h-48 rounded-xl" />)}
                            </div>
                        ) : challenges.length === 0 ? (
                            <div className="text-center text-muted-foreground py-16 border border-dashed border-border rounded-2xl">
                                {t("noChallenges")}
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {/* Active Challenges */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-medium text-foreground">{t("active")}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {activeChallenges.map((challenge) => (
                                            <Card key={challenge.id} className="border-border hover:border-accent/30 transition-all cursor-pointer bg-card flex flex-col justify-between" onClick={() => setSelectedChallenge(challenge)}>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-base font-semibold leading-tight text-foreground">
                                                        {challenge.title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <p className="text-xs text-muted-foreground line-clamp-3">{challenge.description}</p>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                                                        <span className="flex items-center gap-1">
                                                            <Users size={12} />
                                                            {t("participantsLower", { count: challenge.participantCount })}
                                                        </span>
                                                        <span className="flex items-center gap-1 font-medium text-accent">
                                                            <Clock size={12} />
                                                            {timeLeft(challenge.endsAt)}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                {/* Finished Challenges */}
                                {finishedChallenges.length > 0 && (
                                    <div className="space-y-4 pt-4">
                                        <h2 className="text-lg font-medium text-foreground">{t("finished")}</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {finishedChallenges.map((challenge) => (
                                                <Card key={challenge.id} className="border-border/40 bg-card opacity-70 hover:opacity-100 transition-opacity cursor-pointer flex flex-col justify-between" onClick={() => setSelectedChallenge(challenge)}>
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-sm font-semibold text-foreground truncate">
                                                            {challenge.title}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <p className="text-xs text-muted-foreground line-clamp-2">{challenge.description}</p>
                                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/20">
                                                            <span className="flex items-center gap-1">
                                                                <Users size={11} />
                                                                {t("participantsLower", { count: challenge.participantCount })}
                                                            </span>
                                                            <span className="border border-border/30 px-2 py-0.5 rounded text-[9px] bg-muted/20">
                                                                {t("finishedBadge")}
                                                            </span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* JOIN CHALLENGE DIALOG */}
                <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t("joinDialog.title")}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs">{t("joinDialog.pickOutfit")} <span className="text-destructive">*</span></Label>
                                {loadingOutfits ? (
                                    <Skeleton className="h-10 w-full" />
                                ) : outfits.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">{t("joinDialog.needOutfit")}</p>
                                ) : (
                                    <select
                                        value={selectedOutfitId}
                                        onChange={(e) => setSelectedOutfitId(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">{t("joinDialog.pickPlaceholder")}</option>
                                        {outfits.map(o => (
                                            <option key={o.id} value={o.id}>{o.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">{t("joinDialog.note")}</Label>
                                <textarea
                                    value={joinNote}
                                    onChange={(e) => setJoinNote(e.target.value)}
                                    placeholder={t("joinDialog.notePlaceholder")}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setJoinOpen(false)} disabled={joining}>{tCommon("cancel")}</Button>
                            <Button onClick={handleJoinChallenge} disabled={joining || !selectedOutfitId}>
                                {joining ? t("joinDialog.joining") : t("joinDialog.submit")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* CREATE CHALLENGE DIALOG */}
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t("createDialog.title")}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateChallenge} className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs">{t("createDialog.name")} <span className="text-destructive">*</span></Label>
                                <Input
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder={t("createDialog.namePlaceholder")}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">{t("createDialog.description")}</Label>
                                <textarea
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    placeholder={t("createDialog.descriptionPlaceholder")}
                                    rows={3}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">{t("createDialog.theme")}</Label>
                                <Input
                                    value={newTheme}
                                    onChange={(e) => setNewTheme(e.target.value)}
                                    placeholder={t("createDialog.themePlaceholder")}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">{t("createDialog.endsAt")} <span className="text-destructive">*</span></Label>
                                <Input
                                    type="datetime-local"
                                    value={newEndsAt}
                                    onChange={(e) => setNewEndsAt(e.target.value)}
                                    required
                                />
                            </div>
                            <DialogFooter className="pt-2">
                                <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)} disabled={creating}>{tCommon("cancel")}</Button>
                                <Button type="submit" disabled={creating}>
                                    {creating ? t("createDialog.creating") : t("createDialog.submit")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
            {/* Winner Modal */}
            <Dialog open={winnerModalOpen} onOpenChange={setWinnerModalOpen}>
                <DialogContent className="sm:max-w-md border-amber-500/30 bg-background/95 backdrop-blur-xl shadow-2xl shadow-amber-500/20">
                    <DialogHeader className="hidden"><DialogTitle>{t("winner.dialogTitle")}</DialogTitle></DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 rounded-full" />
                            <Trophy size={64} className="text-amber-500 drop-shadow-md relative z-10" />
                        </div>
                        <h2 className="font-playfair text-3xl font-bold text-foreground relative z-10">{t("winner.title")}</h2>
                        <div className="bg-muted/30 border border-amber-500/20 rounded-xl p-5 w-full relative z-10">
                            <p className="text-xs uppercase tracking-widest text-amber-500/80 font-bold mb-2">{t("winner.mostLiked")}</p>
                            <p className="text-2xl font-semibold text-foreground">{winnerEntry?.userName}</p>
                            <p className="text-sm text-muted-foreground mt-2">{t("winner.likes", { count: winnerEntry?.likeCount ?? 0 })}</p>
                        </div>
                        <Button 
                            className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-white relative z-10" 
                            onClick={() => setWinnerModalOpen(false)}
                        >
                            {t("winner.congrats")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
