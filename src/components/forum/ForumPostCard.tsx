"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
import { FlagIcon } from "lucide-react";
import { reportContent } from "@/lib/firebase/moderationService";
import { toast } from "sonner";

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
                        data-testid="like-button"
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
                        <span data-testid="like-count">{t("likeCount", { count: likeCount })}</span>
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
                            className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/80 active:scale-95 transition-all duration-200 bg-accent/10 hover:bg-accent/20 rounded-full px-3 py-1.5"
                        >
                            <Shirt size={13} />
                            Kombin Öner
                        </button>
                    )}
                    
                    <div className="ml-auto flex items-center">
                        <ReportButton targetType="post" targetId={post.id} />
                    </div>
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

function ReportButton({
    targetType, targetId
}: {
    targetType: 'post' | 'comment';
    targetId: string;
}) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [sending, setSending] = useState(false);

    const handleReport = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!reason) return;
        setSending(true);
        try {
            await reportContent(targetType, targetId, reason, description);
            toast.success('Şikayetin iletildi. İnceleyeceğiz.');
            setOpen(false);
        } catch {
            toast.error('Şikayet gönderilemedi');
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setOpen(true);
                }}
                className="text-stone hover:text-onyx transition p-2 rounded-full hover:bg-mist/50"
                title="Şikayet Et"
            >
                <FlagIcon size={16} className="text-muted-foreground hover:text-red-500 transition-colors" />
            </button>

            {open && typeof document !== 'undefined' && createPortal(
                <div 
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpen(false); }}
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4"
                >
                    <div 
                        onClick={(e) => { e.stopPropagation(); }}
                        className="bg-background rounded-lg p-6 max-w-sm w-full border border-border shadow-lg"
                    >
                        <h3 className="font-playfair text-lg text-foreground mb-4">
                            İçeriği Şikayet Et
                        </h3>

                        <div className="space-y-2 mb-4">
                            {[
                                { key: 'spam', label: 'Spam' },
                                { key: 'inappropriate', label: 'Uygunsuz içerik' },
                                { key: 'harassment', label: 'Taciz / Zorbalık' },
                                { key: 'other', label: 'Diğer' },
                            ].map(r => (
                                <label key={r.key} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r.key}
                                        checked={reason === r.key}
                                        onChange={() => setReason(r.key)}
                                        className="accent-primary"
                                    />
                                    <span className="font-inter text-sm text-foreground">
                                        {r.label}
                                    </span>
                                </label>
                            ))}
                        </div>

                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Açıklama (opsiyonel)"
                            maxLength={280}
                            rows={2}
                            className="w-full border border-input rounded p-2 font-inter text-sm mb-4 resize-none outline-none bg-background text-foreground"
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setOpen(false);
                                }}
                                className="flex-1 py-2 text-muted-foreground font-inter text-sm hover:text-foreground transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleReport}
                                disabled={!reason || sending}
                                className="flex-1 py-2 bg-primary text-primary-foreground rounded font-inter text-sm font-semibold disabled:opacity-50 transition-opacity"
                            >
                                {sending ? 'Gönderiliyor...' : 'Şikayet Et'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

