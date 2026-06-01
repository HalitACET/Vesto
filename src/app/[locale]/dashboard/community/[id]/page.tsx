"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { subscribeComments, addComment, subscribeMyCommentLikes, toggleCommentLike } from "@/lib/firebase/forumService";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ForumPostCard } from "@/components/forum/ForumPostCard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Send, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import type { ForumPost, ForumComment } from "@/types/forum";
import { OutfitSuggestionComment } from "@/components/forum/OutfitSuggestionComment";

export default function ForumPostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations("forum");
    const locale = useLocale();
    const dateLocale = locale === "tr" ? tr : enUS;
    const { firebaseUser, vestoUser } = useAuth();

    const [post, setPost] = useState<ForumPost | null>(null);
    const [comments, setComments] = useState<ForumComment[]>([]);
    const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
    const [replyingTo, setReplyingTo] = useState<ForumComment | null>(null);
    const [loadingPost, setLoadingPost] = useState(true);
    const [loadingComments, setLoadingComments] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const postId = params.id as string;

    // Fetch and subscribe to post changes
    useEffect(() => {
        if (!postId) return;
        setLoadingPost(true);

        const unsub = onSnapshot(doc(db, "forumPosts", postId), (docSnap) => {
            if (docSnap.exists()) {
                setPost({ id: docSnap.id, ...docSnap.data() } as ForumPost);
            } else {
                setPost(null);
            }
            setLoadingPost(false);
        });

        return unsub;
    }, [postId]);

    // Subscribe to comments
    useEffect(() => {
        if (!postId) return;
        setLoadingComments(true);

        const unsub = subscribeComments(postId, (list) => {
            setComments(list);
            setLoadingComments(false);
        });

        return unsub;
    }, [postId]);

    // Subscribe to comment likes
    useEffect(() => {
        if (!postId || !firebaseUser) {
            setLikedCommentIds([]);
            return;
        }
        const unsub = subscribeMyCommentLikes((ids) => {
            setLikedCommentIds(ids);
        });
        return unsub;
    }, [postId, firebaseUser]);

    const handleSendComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || submitting || !firebaseUser) return;

        setSubmitting(true);
        try {
            await addComment(
                postId, 
                commentText.trim(),
                replyingTo ? (replyingTo.parentId || replyingTo.id) : null,
                replyingTo ? replyingTo.authorDisplayName : null
            );
            setCommentText("");
            setReplyingTo(null);
        } catch (err) {
            console.error("Error sending comment:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingPost) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                    <Skeleton className="h-6 w-24 mb-4" />
                    <Skeleton className="h-64 w-full rounded-2xl animate-pulse" />
                </div>
            </DashboardLayout>
        );
    }

    if (!post || post.isArchived) {
        return (
            <DashboardLayout>
                <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
                    <p className="text-muted-foreground text-sm">Gönderi bulunamadı veya silinmiş.</p>
                    <Button
                        onClick={() => router.push("/dashboard/community")}
                        variant="outline"
                        className="rounded-md transition-all active:scale-95 duration-200"
                    >
                        Topluluğa Geri Dön
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    // Process comments with likes status
    const commentsWithLikes = comments.map(c => ({
        ...c,
        isLikedByMe: likedCommentIds.includes(c.id)
    }));

    // Filter root comments and replies
    const rootComments = commentsWithLikes.filter(c => !c.parentId);
    const repliesByParentId = commentsWithLikes.reduce<Record<string, typeof commentsWithLikes>>((acc, comment) => {
        if (comment.parentId) {
            if (!acc[comment.parentId]) acc[comment.parentId] = [];
            acc[comment.parentId].push(comment);
        }
        return acc;
    }, {});

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
                {/* Back Link */}
                <button
                    onClick={() => router.push("/dashboard/community")}
                    className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-all active:scale-95 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    {t("title")}
                </button>

                {/* The Post Card */}
                <ForumPostCard 
                    post={post} 
                    onDelete={() => router.push("/dashboard/community")} 
                    clickable={false}
                />

                {/* Comments Section */}
                <div className="space-y-6">
                    <h3 className="font-playfair text-xl text-foreground">
                        {t("commentCount", { count: post.commentCount })}
                    </h3>

                    {/* New Comment Input */}
                    {firebaseUser ? (
                        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                            {replyingTo && (
                                <div className="flex items-center justify-between bg-accent/5 px-4 py-2 border-b border-border text-xs text-accent-foreground font-medium">
                                    <span>
                                        <strong>@{replyingTo.authorDisplayName}</strong> kullanıcısına yanıt veriliyor
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={() => setReplyingTo(null)}
                                        className="text-muted-foreground hover:text-foreground font-semibold hover:scale-105 transition-transform"
                                    >
                                        Vazgeç
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSendComment} className="flex gap-3 items-start p-4 bg-transparent">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                    <AvatarImage src={vestoUser?.photoUrl ?? undefined} />
                                    <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                                        {vestoUser?.displayName?.slice(0, 2).toUpperCase() ?? "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 relative">
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder={replyingTo ? "Yanıtınızı yazın..." : t("comment")}
                                        rows={2}
                                        className="w-full bg-muted/30 text-foreground text-sm border border-border rounded-xl p-3 pr-10 outline-none resize-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 placeholder:text-muted-foreground/40 font-inter"
                                        maxLength={280}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!commentText.trim() || submitting}
                                        className="absolute right-3 bottom-4 text-muted-foreground hover:text-primary disabled:opacity-30 disabled:hover:text-muted-foreground transition-all duration-200 active:scale-90"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-muted/10 p-4 rounded-xl border border-dashed border-border text-center">
                            <p className="text-xs text-muted-foreground mb-3">{t("loginToInteract")}</p>
                            <Button
                                variant="outline"
                                onClick={() => router.push(`/login?redirect=/dashboard/community/${postId}`)}
                                className="h-8 text-xs rounded-md transition-all active:scale-95 duration-200"
                            >
                                Giriş Yap
                            </Button>
                        </div>
                    )}

                    {/* Comments List */}
                    {loadingComments ? (
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-full rounded-xl" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                        </div>
                    ) : rootComments.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic text-center py-6">
                            Henüz yorum yapılmamış. İlk yorumu sen yaz!
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {rootComments.map((comment) => {
                                return (
                                    <div key={comment.id} className="space-y-3">
                                        <CommentItem 
                                            comment={comment}
                                            onReply={() => setReplyingTo(comment)}
                                            onLike={() => toggleCommentLike(comment.id)}
                                            dateLocale={dateLocale}
                                        />
                                        
                                        {/* Replies list */}
                                        {repliesByParentId[comment.id]?.map((reply) => (
                                            <div key={reply.id} className="ml-10 border-l border-border pl-4">
                                                <CommentItem 
                                                    comment={reply}
                                                    onReply={() => setReplyingTo(reply)}
                                                    onLike={() => toggleCommentLike(reply.id)}
                                                    dateLocale={dateLocale}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function CommentItem({
    comment,
    onReply,
    onLike,
    dateLocale
}: {
    comment: ForumComment;
    onReply: () => void;
    onLike: () => void;
    dateLocale: any;
}) {
    if (comment.commentType === "outfit_suggestion" && comment.outfitSuggestion) {
        return (
            <OutfitSuggestionComment
                comment={comment}
                onReply={onReply}
                onLike={onLike}
            />
        );
    }

    let commentDate = new Date();
    if (comment.createdAt) {
        if (typeof comment.createdAt === "object" && "toDate" in comment.createdAt) {
            commentDate = (comment.createdAt as any).toDate();
        } else {
            commentDate = new Date(comment.createdAt as any);
        }
    }

    const initials = comment.authorDisplayName
        ? comment.authorDisplayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : "K";

    return (
        <div className="flex gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
            <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.authorPhotoUrl ?? undefined} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-xs text-foreground truncate flex items-center gap-1.5 flex-wrap">
                        <span>{comment.authorDisplayName}</span>
                        {comment.replyToDisplayName && (
                            <span className="text-[10px] font-normal text-muted-foreground flex items-center gap-1">
                                <span>↳</span>
                                <span className="font-semibold text-accent-foreground">@{comment.replyToDisplayName}</span>
                            </span>
                        )}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(commentDate, { addSuffix: true, locale: dateLocale })}
                    </span>
                </div>
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-inter">
                    {comment.text}
                </p>

                {/* Actions Row */}
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1.5">
                    <button 
                        data-testid="like-button"
                        type="button"
                        onClick={onLike}
                        className={`flex items-center gap-1 transition-all active:scale-90 ${comment.isLikedByMe ? 'text-red-500 font-medium' : 'hover:text-foreground'}`}
                    >
                        <Heart size={12} className={comment.isLikedByMe ? "fill-current" : ""} />
                        <span data-testid="like-count">{comment.likeCount || 0}</span>
                    </button>
                    <button 
                        type="button"
                        onClick={onReply}
                        className="hover:text-foreground transition-all active:scale-95 font-medium"
                    >
                        Yanıtla
                    </button>
                </div>
            </div>
        </div>
    );
}
