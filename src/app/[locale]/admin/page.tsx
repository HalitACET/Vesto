"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    CheckCircle,
    XCircle,
    PencilLine,
    Users,
    Shirt,
    Sparkles,
    ShieldCheck,
    Flag,
    ArrowRight,
    AlertTriangle,
} from "lucide-react";
import {
    approveWardrobeItem,
    rejectWardrobeItem,
    correctWardrobeItem,
    fetchAIQueue,
} from "@/app/actions/adminActions";
import type { WardrobeItem, AdminReviewStatus, ClothingCategory } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterStatus = "all" | "pending" | "approved" | "corrected" | "rejected";
type ModalMode = "correct" | "reject" | null;

interface CorrectForm {
    color: string;
    material: string;
    pattern: string;
    category: string;
    notes: string;
}

// ── AI Tag Validation Tab ─────────────────────────────────────────────────────

function AITagValidationTab() {
    const t = useTranslations("admin");
    const tCommon = useTranslations("common");

    const [items, setItems] = useState<WardrobeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>("all");
    const [lowConfidenceOnly, setLowConfidenceOnly] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const [rejectNotes, setRejectNotes] = useState("");
    const [correctForm, setCorrectForm] = useState<CorrectForm>({
        color: "", material: "", pattern: "", category: "", notes: "",
    });
    const [isPending, startTransition] = useTransition();
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    function showToast(msg: string) {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    }

    async function loadItems() {
        setLoading(true);
        const result = await fetchAIQueue(filter === "all" ? "all" : filter as AdminReviewStatus);
        if (result.ok && result.items) setItems(result.items as WardrobeItem[]);
        setLoading(false);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    useEffect(() => { void loadItems(); }, [filter]);

    const displayed = lowConfidenceOnly
        ? items.filter((i) => (i.aiAnalysis?.confidence ?? 1) < 0.7)
        : items;

    function openCorrect(itemId: string) {
        setActiveItemId(itemId);
        setCorrectForm({ color: "", material: "", pattern: "", category: "", notes: "" });
        setModalMode("correct");
    }

    function openReject(itemId: string) {
        setActiveItemId(itemId);
        setRejectNotes("");
        setModalMode("reject");
    }

    function handleApprove(itemId: string) {
        startTransition(async () => {
            const res = await approveWardrobeItem({ itemId });
            showToast(res.ok ? t("aiQueue.toast.approved") : t("aiQueue.toast.error", { message: res.error ?? "?" }));
            if (res.ok) void loadItems();
        });
    }

    function handleRejectSubmit() {
        if (!activeItemId) return;
        startTransition(async () => {
            const res = await rejectWardrobeItem({ itemId: activeItemId, notes: rejectNotes });
            if (res.ok) {
                setModalMode(null);
                showToast(t("aiQueue.toast.rejected"));
                void loadItems();
            } else {
                showToast(t("aiQueue.toast.error", { message: res.error ?? "?" }));
            }
        });
    }

    function handleCorrectSubmit() {
        if (!activeItemId) return;
        const corrections: { color?: string; material?: string; pattern?: string; category?: ClothingCategory } = {};
        if (correctForm.color) corrections.color = correctForm.color;
        if (correctForm.material) corrections.material = correctForm.material;
        if (correctForm.pattern) corrections.pattern = correctForm.pattern;
        if (correctForm.category) corrections.category = correctForm.category as ClothingCategory;

        startTransition(async () => {
            const res = await correctWardrobeItem({
                itemId: activeItemId,
                corrections,
                notes: correctForm.notes || undefined,
            });
            if (res.ok) {
                setModalMode(null);
                showToast(t("aiQueue.toast.corrected"));
                void loadItems();
            } else {
                showToast(t("aiQueue.toast.error", { message: res.error ?? "?" }));
            }
        });
    }

    const reviewStatusBadge: Record<string, { label: string; className: string }> = {
        approved: { label: t("aiQueue.statusBadge.approved"), className: "bg-green-500/15 text-green-600 border-0" },
        rejected: { label: t("aiQueue.statusBadge.rejected"), className: "bg-destructive/15 text-destructive border-0" },
        corrected: { label: t("aiQueue.statusBadge.corrected"), className: "bg-amber-500/15 text-amber-600 border-0" },
    };

    const FILTER_KEYS: FilterStatus[] = ["all", "pending", "approved", "corrected", "rejected"];
    const CORRECT_FIELDS = ["color", "material", "pattern", "category"] as const;

    return (
        <div className="space-y-4">
            {/* Toast */}
            {toastMsg && (
                <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-border bg-background px-4 py-3 text-sm shadow-lg">
                    {toastMsg}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 rounded-lg border border-border p-1">
                    {FILTER_KEYS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`rounded-md px-3 py-1 text-xs transition-colors ${
                                filter === s
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {t(`aiQueue.filters.${s}` as Parameters<typeof t>[0])}
                        </button>
                    ))}
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <input
                        type="checkbox"
                        checked={lowConfidenceOnly}
                        onChange={(e) => setLowConfidenceOnly(e.target.checked)}
                        className="rounded"
                    />
                    <AlertTriangle size={12} className="text-amber-500" />
                    {t("aiQueue.lowConfidence")}
                </label>

                <span className="ml-auto text-xs text-muted-foreground">
                    {t("aiQueue.itemCount", { count: displayed.length })}
                </span>
            </div>

            {/* List */}
            {loading ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                    {t("aiQueue.loading")}
                </div>
            ) : displayed.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <Sparkles size={28} className="text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">
                            {filter === "pending" ? t("aiQueue.emptyPending") : t("aiQueue.emptyFilter")}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {displayed.map((item) => {
                        const ai = item.aiAnalysis;
                        const review = item.adminReview;
                        const confidencePct = ai ? Math.round(ai.confidence * 100) : null;
                        const isLow = ai ? ai.confidence < 0.7 : false;
                        const statusInfo = review ? reviewStatusBadge[review.status] : null;

                        return (
                            <Card
                                key={item.id}
                                className={`transition-all ${
                                    review?.status === "approved" ? "border-green-500/25 bg-green-50/5" :
                                    review?.status === "rejected" ? "border-destructive/25 bg-destructive/5" :
                                    review?.status === "corrected" ? "border-amber-500/25 bg-amber-50/5" : ""
                                }`}
                            >
                                <CardContent className="flex items-center gap-5 py-4">
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                                        {item.imageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Shirt size={20} className="text-muted-foreground/40" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                            <Badge variant="outline" className="text-[10px] capitalize flex-shrink-0">
                                                {item.category}
                                            </Badge>
                                        </div>
                                        <div className="mt-1.5 flex flex-wrap gap-1">
                                            {ai?.tags?.slice(0, 5).map((tag) => (
                                                <Badge key={tag.id} variant="secondary" className="text-[10px]">{tag.label}</Badge>
                                            ))}
                                            {ai?.material && <Badge variant="secondary" className="text-[10px]">{ai.material}</Badge>}
                                            {ai?.pattern && <Badge variant="secondary" className="text-[10px]">{ai.pattern}</Badge>}
                                        </div>
                                        {review?.corrections && (
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                <span className="text-[10px] text-amber-600">{t("aiQueue.corrections")}</span>
                                                {Object.entries(review.corrections).map(([k, v]) => (
                                                    <Badge key={k} className="text-[10px] bg-amber-500/15 text-amber-700 border-0">
                                                        {k}: {v}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mt-1 flex items-center gap-3">
                                            {confidencePct !== null && (
                                                <p className={`text-xs ${isLow ? "text-amber-500" : "text-muted-foreground"}`}>
                                                    {isLow && <AlertTriangle size={10} className="inline mr-0.5" />}
                                                    {t("aiQueue.confidence")} <span className="font-medium">{confidencePct}%</span>
                                                </p>
                                            )}
                                            {statusInfo && (
                                                <Badge className={statusInfo.className + " text-[10px]"}>{statusInfo.label}</Badge>
                                            )}
                                            {review?.notes && (
                                                <p className="text-xs text-muted-foreground italic truncate max-w-xs">
                                                    &ldquo;{review.notes}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-shrink-0 gap-2">
                                        <Button size="sm" variant="outline" className="gap-1 border-green-500/40 text-green-600 hover:bg-green-50/10" disabled={isPending} onClick={() => handleApprove(item.id)}>
                                            <CheckCircle size={12} />
                                            {t("aiQueue.actions.approve")}
                                        </Button>
                                        <Button size="sm" variant="outline" className="gap-1 border-amber-500/40 text-amber-600 hover:bg-amber-50/10" disabled={isPending} onClick={() => openCorrect(item.id)}>
                                            <PencilLine size={12} />
                                            {t("aiQueue.actions.correct")}
                                        </Button>
                                        <Button size="sm" variant="outline" className="gap-1 border-destructive/40 text-destructive hover:bg-destructive/5" disabled={isPending} onClick={() => openReject(item.id)}>
                                            <XCircle size={12} />
                                            {t("aiQueue.actions.reject")}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* ── Correct Modal ── */}
            <Dialog open={modalMode === "correct"} onOpenChange={(o) => !o && setModalMode(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("correctModal.title")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-xs text-muted-foreground">{t("correctModal.hint")}</p>
                        {CORRECT_FIELDS.map((field) => (
                            <div key={field}>
                                <Label htmlFor={`correct-${field}`} className="text-xs">
                                    {t(`correctModal.fields.${field}` as Parameters<typeof t>[0])}
                                </Label>
                                <Input
                                    id={`correct-${field}`}
                                    value={correctForm[field]}
                                    onChange={(e) => setCorrectForm((p) => ({ ...p, [field]: e.target.value }))}
                                    placeholder={t(`correctModal.placeholders.${field}` as Parameters<typeof t>[0])}
                                    className="mt-1 text-sm"
                                />
                            </div>
                        ))}
                        <div>
                            <Label htmlFor="correct-notes" className="text-xs">{t("correctModal.notes")}</Label>
                            <Input
                                id="correct-notes"
                                value={correctForm.notes}
                                onChange={(e) => setCorrectForm((p) => ({ ...p, notes: e.target.value }))}
                                placeholder={t("correctModal.notesPlaceholder")}
                                className="mt-1 text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setModalMode(null)}>{tCommon("cancel")}</Button>
                        <Button onClick={handleCorrectSubmit} disabled={isPending}>
                            {isPending ? t("correctModal.saving") : t("correctModal.save")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Reject Modal ── */}
            <Dialog open={modalMode === "reject"} onOpenChange={(o) => !o && setModalMode(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("rejectModal.title")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-sm text-muted-foreground">{t("rejectModal.description")}</p>
                        <div>
                            <Label htmlFor="reject-notes" className="text-xs">{t("rejectModal.reason")}</Label>
                            <textarea
                                id="reject-notes"
                                value={rejectNotes}
                                onChange={(e) => setRejectNotes(e.target.value)}
                                placeholder={t("rejectModal.reasonPlaceholder")}
                                rows={3}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setModalMode(null)}>{tCommon("cancel")}</Button>
                        <Button variant="destructive" onClick={handleRejectSubmit} disabled={isPending || !rejectNotes.trim()}>
                            {isPending ? t("rejectModal.saving") : t("rejectModal.reject")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ── Mock flagged posts ─────────────────────────────────────────────────────────

const MOCK_FLAGGED_POSTS = [
    { id: "p1", author: "Anonymous", title: "Selling branded items — best prices!", reason: "Spam / commercial", time: "3h ago" },
    { id: "p2", author: "User123", title: "Is this design stolen from Zara?", reason: "IP concern", time: "1d ago" },
];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
    const t = useTranslations("admin");

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <ShieldCheck size={24} className="text-accent" />
                    <div>
                        <h1 className="text-4xl font-light">{t("title")}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">{t("subtitle")}</p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="ai-tags">
                    <TabsList>
                        <TabsTrigger value="users">{t("tabs.users")}</TabsTrigger>
                        <TabsTrigger value="ai-tags">{t("tabs.aiTags")}</TabsTrigger>
                        <TabsTrigger value="moderation">{t("tabs.moderation")}</TabsTrigger>
                    </TabsList>

                    {/* Users tab */}
                    <TabsContent value="users" className="mt-6">
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                                <Users size={32} className="text-muted-foreground/40" />
                                <div>
                                    <p className="font-medium">{t("users.heading")}</p>
                                    <p className="text-sm text-muted-foreground mt-1">{t("users.description")}</p>
                                </div>
                                <Link href="/admin/users">
                                    <Button className="gap-2">
                                        {t("users.goButton")}
                                        <ArrowRight size={15} />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Tag Validation tab */}
                    <TabsContent value="ai-tags" className="mt-6">
                        <AITagValidationTab />
                    </TabsContent>

                    {/* Moderation tab */}
                    <TabsContent value="moderation" className="mt-6">
                        <div className="space-y-4">
                            {MOCK_FLAGGED_POSTS.map((post) => (
                                <Card key={post.id} className="border-amber-500/20">
                                    <CardContent className="flex items-start justify-between gap-4 py-5">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Flag size={13} className="text-amber-500" />
                                                <Badge variant="outline" className="border-amber-500/30 text-amber-600 text-[10px]">
                                                    {post.reason}
                                                </Badge>
                                            </div>
                                            <p className="font-medium text-sm">{post.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {post.author} · {post.time}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button size="sm" variant="outline" className="text-xs">
                                                {t("moderation.remove")}
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-xs">
                                                {t("moderation.dismiss")}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
