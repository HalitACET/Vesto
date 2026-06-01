import { Timestamp } from "firebase/firestore";

export interface ForumPost {
    id: string;
    authorId: string;
    authorDisplayName: string;
    authorPhotoUrl?: string | null;
    outfitId?: string | null;
    caption: string;
    likeCount: number;
    commentCount: number;
    createdAt: Timestamp;
    isModerated: boolean;
    isArchived: boolean;
    moderationReason?: string | null;
    moderatedAt?: Timestamp | null;
    moderatedBy?: string | null;
    // client-side computed
    isLikedByMe?: boolean;
}

// Outfit suggestion payload embedded in outfit-suggestion comments
export interface OutfitSuggestionPayload {
    topId: string | null;
    bottomId: string | null;
    shoesId: string | null;
    accessoryId: string | null;
    note?: string;
}

export interface ForumComment {
    id: string;
    postId: string;
    authorId: string;
    authorDisplayName: string;
    authorPhotoUrl?: string | null;
    text: string;
    createdAt: Timestamp;
    isArchived: boolean;
    isModerated?: boolean;
    moderatedAt?: Timestamp | null;
    likeCount: number; // added
    parentId?: string | null; // added
    replyToDisplayName?: string | null; // added
    isLikedByMe?: boolean; // client-side computed
    // Outfit suggestion fields (optional — only on outfit suggestion comments)
    commentType?: "text" | "outfit_suggestion";
    outfitSuggestion?: OutfitSuggestionPayload;
}

export interface ForumLike {
    postId: string;
    userId: string;
    createdAt: Timestamp;
}

