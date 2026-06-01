import { Timestamp } from 'firebase/firestore';

export interface OutfitRecommendation {
    id: string;
    stylistId: string;
    stylistDisplayName: string;
    stylistPhotoUrl?: string | null;
    targetUserId: string;
    items: {
        topId?: string | null;
        bottomId?: string | null;
        shoesId?: string | null;
        accessoryId?: string | null;
    };
    note: string;
    status: 'pending' | 'accepted' | 'rejected';
    rating?: number | null;
    createdAt: Timestamp;
    respondedAt?: Timestamp | null;
}
