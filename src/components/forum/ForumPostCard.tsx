"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toggleLike, isLiked } from "@/lib/firebase/forumService";
import type { ForumPost } from "@/types";
import { OutfitMiniPreview } from "@/components/outfits/OutfitMiniPreview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Shirt } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { PostDeleteButton } from "./PostDeleteButton";
import { SuggestOutfitSheet } from "./SuggestOutfitSheet";
import { Link } from "@/i18n/navigation";

interface Props {
    post: ForumPost;
    onDelete?: () => void;
    clickable?: boolean;
}

export function ForumPostCard({ post, onDelete, clickable = true }: Props) {
    const { firebaseUser, vestoUser } = useAuth();
    const router = useRouter();
    const t = useTranslations("forum");
    const locale = useLocale();
    const dateLocale = locale === "tr" ? tr : enUS;

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [suggestOpen, setSuggestOpen] = useState(false);

    useEffect(() => {
        if (firebaseUser) {
            isLiked(post.id).then(setLiked);
        } else {
            setLiked(false);
        }
    }, [post.id, firebaseUser]);

    useEffect(() => {
        setLikeCount(post.likeCount);
    }, [post.likeCount]);

    const handleLike = async () => {
        if (!firebaseUser) {
            const currentPath = window.location.pathname;
            router.push(`/login?redirect=${currentPath}`);
            return;
        }

        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

        try {
            await toggleLike(post.id);
        } catch (err) {
            console.error("Error toggling like:", err);
            setLiked(!newLiked);
            setLikeCount((prev) => (!newLiked ? prev + 1 : prev - 1));
        }
    };

    let createdAtDate = new Date();
    if (post.createdAt) {
        if (typeof post.createdAt === "object" && "toDate" in post.createdAt) {
            createdAtDate = (post.createdAt as any).toDate();
        } else {
            createdAtDate = new Date(post.createdAt as any);
        }
    }

    const timeAgoStr = formatDistanceToNow(createdAtDate, {
        addSuffix: true,
        locale: dateLocale,
    });

    const initials = post.authorDisplayName
        ? post.authorDisplayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "K";

    return (
        <>
            <article
                onClick={clickable ? () => router.push(`/dashboard/community/${post.id}`) : undefined}
                className={`bg-card rounded-2xl p-6 border border-border transition-all duration-300 ${
                    clickable
                        ? "cursor-pointer hover:border-accent/30 hover:shadow-md active:scale-[0.99]"
                        : ""
                }`}
            >
                {/* Author Row */}
                <div className="flex items-center gap-3 mb-4">
                    <Link 
                        href={`/u/${post.authorId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0"
                    >
                        <Avatar className="h-9 w-9 hover:opacity-80 transition-opacity">
                            <AvatarImage src={post.authorPhotoUrl ?? undefined} />
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <Link 
                            href={`/u/${post.authorId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block"
                        >
                            <p className="font-inter font-semibold text-sm text-foreground truncate hover:underline">
                                {post.authorDisplayName}
                            </p>
                        </Link>
                        <p className="font-inter text-xs text-muted-foreground">
                            {timeAgoStr}
                        </p>
                    </div>

                    {vestoUser?.uid === post.authorId && onDelete && (
                        <PostDeleteButton postId={post.id} onDelete={onDelete} />
                    )}
                </div>

                {/* Outfit Preview */}
                {post.outfitId && (
                    <div className="my-4">
                        <OutfitMiniPreview outfitId={post.outfitId} />
                    </div>
                )}

                {/* Caption */}
                {post.caption && (
                    <p className="font-inter text-sm text-foreground leading-relaxed mt-4">
                        {post.caption}
                    </p>
                )}

                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border flex-wrap">
                    {/* Like */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleLike();
                        }}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-200"
                        title={!firebaseUser ? t("loginToInteract") : undefined}
                    >
                        <Heart
                            size={16}
                            className={`transition-all duration-300 ${
                                liked ? "fill-destructive text-destructive scale-110" : ""
                            }`}
                        />
                        <span>{t("likeCount", { count: likeCount })}</span>
                    </button>

                    {/* Comment count */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MessageCircle size={16} />
                        <span>{t("commentCount", { count: post.commentCount })}</span>
                    </div>

                    {/* Kombin Öner */}
                    {firebaseUser && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSuggestOpen(true);
                            }}
                            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 active:scale-95 transition-all duration-200 bg-accent/10 hover:bg-accent/20 rounded-full px-3 py-1.5"
                        >
                            <Shirt size={13} />
                            Kombin Öner
                        </button>
                    )}
                </div>
            </article>

            {/* Suggest Outfit Sheet */}
            <SuggestOutfitSheet
                postId={post.id}
                postAuthorId={post.authorId}
                postAuthorName={post.authorDisplayName}
                open={suggestOpen}
                onOpenChange={setSuggestOpen}
            />
        </>
    );
}

