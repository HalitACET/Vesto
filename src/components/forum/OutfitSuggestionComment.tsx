"use client";

import { useLocale } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { Shirt, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ItemThumb } from "@/components/outfits/ItemThumb";
import type { ForumComment } from "@/types/forum";

interface Props {
    comment: ForumComment;
    onReply?: () => void;
    onLike?: () => void;
}

export function OutfitSuggestionComment({ comment, onReply, onLike }: Props) {
    const locale = useLocale();
    const dateLocale = locale === "tr" ? tr : enUS;

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

    const s = comment.outfitSuggestion;

    return (
        <div className="flex gap-3 bg-card border border-accent/20 rounded-2xl p-4 shadow-sm">
            {/* Avatar */}
            <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.authorPhotoUrl ?? undefined} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                    {initials}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-3">
                {/* Header row */}
                <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-xs text-foreground truncate">
                            {comment.authorDisplayName}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-accent bg-accent/10 rounded-full px-2 py-0.5">
                            <Shirt size={10} />
                            Kombin Önerisi
                        </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(commentDate, { addSuffix: true, locale: dateLocale })}
                    </span>
                </div>

                {/* 2x2 outfit grid */}
                {s && (
                    <div className="grid grid-cols-2 gap-1.5 w-full max-w-[200px] aspect-square bg-muted/20 rounded-xl p-2 border border-border">
                        <ItemThumb itemId={s.topId ?? null} />
                        <ItemThumb itemId={s.bottomId ?? null} />
                        <ItemThumb itemId={s.shoesId ?? null} />
                        <ItemThumb itemId={s.accessoryId ?? null} />
                    </div>
                )}

                {/* Optional note */}
                {s?.note && (
                    <p className="text-xs text-foreground leading-relaxed font-inter">
                        {s.note}
                    </p>
                )}

                {/* Actions Row */}
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1">
                    {onLike && (
                        <button 
                            type="button"
                            onClick={onLike}
                            className={`flex items-center gap-1 transition-all active:scale-90 ${comment.isLikedByMe ? 'text-red-500 font-medium' : 'hover:text-foreground'}`}
                        >
                            <Heart size={12} className={comment.isLikedByMe ? "fill-current" : ""} />
                            <span>{comment.likeCount || 0}</span>
                        </button>
                    )}
                    {onReply && (
                        <button 
                            type="button"
                            onClick={onReply}
                            className="hover:text-foreground transition-all active:scale-95 font-medium"
                        >
                            Yanıtla
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
