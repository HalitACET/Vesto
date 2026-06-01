"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, getDocs, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Globe, ArrowLeft, Users } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { toggleFollow, checkIsFollowing } from "@/lib/firebase/followService";
import type { VestoUser, WardrobeItem } from "@/types";
import Link from "next/link";
import { StylistStatsCard } from "@/components/profile/StylistStatsCard";
import Image from "next/image";

export default function PublicProfileClient({
    userId,
}: {
    userId: string;
}) {
    const tWardrobe = useTranslations("wardrobe");
    const locale = useLocale();
    const router = useRouter();

    const { vestoUser: currentUser } = useAuth();
    const isOwnProfile = currentUser?.uid === userId;

    const [user, setUser] = useState<VestoUser | null>(null);
    const [items, setItems] = useState<WardrobeItem[]>([]);
    const [postCount, setPostCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

    // Follow state
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(true);
    const [followPending, setFollowPending] = useState(false);

    // Load profile data + subscribe to user doc for real-time counter updates
    useEffect(() => {
        setLoading(true);

        // Real-time user subscription for follower/following counter updates
        const userUnsub = onSnapshot(doc(db, "users", userId), (snap) => {
            if (snap.exists()) {
                setUser({ uid: snap.id, ...snap.data() } as VestoUser);
            }
            setLoading(false);
        });

        async function loadExtra() {
            try {
                // Public wardrobe items
                const itemsQuery = query(
                    collection(db, "wardrobeItems"),
                    where("userId", "==", userId),
                    where("isPublic", "==", true),
                    orderBy("createdAt", "desc")
                );
                const itemsSnap = await getDocs(itemsQuery);
                const itemsList = itemsSnap.docs
                    .map((d) => ({ id: d.id, ...d.data() } as WardrobeItem))
                    .filter((item) => !("isArchived" in item && item.isArchived));
                setItems(itemsList);

                // Post count
                const postsSnap = await getDocs(
                    query(
                        collection(db, "forumPosts"),
                        where("authorId", "==", userId),
                        where("isModerated", "==", false)
                    )
                );
                setPostCount(postsSnap.size);
            } catch (err) {
                console.error("Error loading public profile extras:", err);
            }
        }

        loadExtra();
        return () => userUnsub();
    }, [userId]);

    // Check follow status
    useEffect(() => {
        if (!currentUser || isOwnProfile) {
            setFollowLoading(false);
            return;
        }
        checkIsFollowing(userId).then((result) => {
            setIsFollowing(result);
            setFollowLoading(false);
        });
    }, [userId, currentUser, isOwnProfile]);

    const handleToggleFollow = useCallback(async () => {
        if (followPending) return;
        setFollowPending(true);
        // Optimistic update
        setIsFollowing((prev) => !prev);
        try {
            await toggleFollow(userId);
        } catch {
            // Rollback on error
            setIsFollowing((prev) => !prev);
        } finally {
            setFollowPending(false);
        }
    }, [userId, followPending]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-4">
                <p className="text-muted-foreground">Kullanıcı bulunamadı.</p>
                <Button onClick={() => router.push("/")}>Anasayfaya Dön</Button>
            </div>
        );
    }

    const initials = user.displayName
        ? user.displayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "K";

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Top Navigation */}
            <div className="max-w-4xl mx-auto px-4 pt-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group mb-6"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    {locale === "tr" ? "Geri" : "Back"}
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                {/* Profile Header */}
                <div data-testid="public-profile-header" className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <Avatar className="h-24 w-24 border border-border">
                            <AvatarImage src={user.photoURL ?? user.photoUrl ?? undefined} />
                            <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-center sm:text-left min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
                                        {user.displayName}
                                        {user.isStylistModeActive && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-semibold">
                                                ✨ Stilist
                                            </span>
                                        )}
                                    </h1>
                                    {user.username && (
                                        <p className="text-sm font-medium text-muted-foreground mt-0.5">
                                            @{user.username}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                {!isOwnProfile && currentUser && (
                                    <div className="flex justify-center gap-2">
                                        {currentUser.isStylistModeActive && (
                                            <Link href={`/stylist/editor/${userId}`}>
                                                <button
                                                    className="flex items-center gap-2 px-4 py-2 border border-onyx text-onyx rounded font-inter text-sm font-semibold hover:bg-onyx hover:text-pearl transition-colors"
                                                >
                                                    <span className="text-base">✨</span>
                                                    <span>Kombin Öner</span>
                                                </button>
                                            </Link>
                                        )}
                                        {followLoading ? (
                                            <div className="h-9 w-28 bg-muted animate-pulse rounded-md" />
                                        ) : (
                                            <button
                                                onClick={handleToggleFollow}
                                                disabled={followPending}
                                                className={[
                                                    "px-6 py-2 rounded-md font-semibold text-sm transition-all duration-200 border",
                                                    isFollowing
                                                        ? "bg-background text-foreground border-border hover:bg-muted"
                                                        : "bg-foreground text-background border-foreground hover:opacity-90",
                                                    followPending ? "opacity-60 cursor-not-allowed" : "",
                                                ].join(" ")}
                                            >
                                                {isFollowing
                                                    ? (locale === "tr" ? "Takip Ediliyor" : "Following")
                                                    : (locale === "tr" ? "Takip Et" : "Follow")}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {user.bio ? (
                                <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-xl">
                                    {user.bio}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic mt-4">
                                    {locale === "tr" ? "Henüz biyografi eklenmemiş." : "No biography added yet."}
                                </p>
                            )}
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* Stats */}
                    <div className="flex items-center justify-around text-center py-2">
                        <div>
                            <p className="text-xl font-bold text-foreground">
                                {user.wardrobeCount ?? items.length}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {locale === "tr" ? "Kıyafet" : "Clothing"}
                            </p>
                        </div>
                        <div className="h-6 w-px bg-border" />
                        <div>
                            <p className="text-xl font-bold text-foreground">{postCount}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {locale === "tr" ? "Paylaşım" : "Posts"}
                            </p>
                        </div>
                        <div className="h-6 w-px bg-border" />
                        <Link
                            href={`/u/${userId}/followers`}
                            className="group flex flex-col items-center hover:opacity-70 transition-opacity"
                        >
                            <p className="text-xl font-bold text-foreground">
                                {user.followerCount ?? 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 group-hover:underline">
                                {locale === "tr" ? "Takipçi" : "Followers"}
                            </p>
                        </Link>
                        <div className="h-6 w-px bg-border" />
                        <Link
                            href={`/u/${userId}/following`}
                            className="group flex flex-col items-center hover:opacity-70 transition-opacity"
                        >
                            <p className="text-xl font-bold text-foreground">
                                {user.followingCount ?? 0}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 group-hover:underline">
                                {locale === "tr" ? "Takip" : "Following"}
                            </p>
                        </Link>
                    </div>

                    {/* Owner hint */}
                    {isOwnProfile && (
                        <div className="bg-accent/5 border border-accent/15 rounded-xl p-3.5 flex items-center gap-2.5">
                            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                            <p className="text-xs text-accent font-medium">
                                {locale === "tr"
                                    ? "Bu senin profilin. Başkaları bu kıyafetleri görebilir."
                                    : "This is your profile. Other users can view these wardrobe items."}
                            </p>
                        </div>
                    )}
                </div>

                {user.isStylistModeActive && (
                    <StylistStatsCard user={user} />
                )}

                {/* Wardrobe Section */}
                <div className="mt-10 space-y-6">
                    <div className="flex items-center gap-2">
                        <Globe size={15} className="text-accent" />
                        <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            {locale === "tr" ? "PAYLAŞILAN GİYSİLER" : "SHARED CLOTHING"}
                        </h2>
                    </div>

                    {items.length === 0 ? (
                        <div className="bg-card border border-dashed border-border rounded-2xl p-16 text-center">
                            <p className="text-sm text-muted-foreground">
                                {locale === "tr" ? "Henüz herkese açık kıyafet yok" : "No public clothing items yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                            {items.map((item) => (
                                <Card
                                    key={item.id}
                                    data-testid="wardrobe-item-card"
                                    onClick={() => setSelectedItem(item)}
                                    className="group overflow-hidden border-border hover:border-accent/30 transition-all duration-300 cursor-pointer bg-card"
                                >
                                    <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <Image width={800} height={800}
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <CardContent className="p-3">
                                        <p className="text-sm font-medium truncate text-foreground">{item.name}</p>
                                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{item.category}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Read-only details dialog */}
            <Dialog open={selectedItem !== null} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="sm:max-w-md">
                    {selectedItem && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-light">
                                    {selectedItem.name}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <Image width={800} height={800}
                                        src={selectedItem.imageUrl}
                                        alt={selectedItem.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground text-xs block">Kategori</span>
                                        <span className="font-medium capitalize">{tWardrobe(`categories.${selectedItem.category}` as any)}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground text-xs block">Alt Kategori</span>
                                        <span className="font-medium capitalize">{selectedItem.subcategory || "—"}</span>
                                    </div>
                                    {selectedItem.size && (
                                        <div className="col-span-2 mt-1">
                                            <span className="text-muted-foreground text-xs block">Beden</span>
                                            <span className="font-medium">{selectedItem.size}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
