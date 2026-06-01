// ─── Enums ────────────────────────────────────────────────────────────────────

export type ClothingCategory =
    | "tops" | "top"
    | "bottoms" | "bottom"
    | "dresses"
    | "outerwear"
    | "shoes" | "footwear"
    | "accessories" | "accessory"
    | "bags"
    | "jewelry";

export type Season = "spring" | "summer" | "autumn" | "winter" | "all";

export type OutfitSeason = "spring" | "summer" | "fall" | "winter";

export type OutfitVisibility = "private" | "public" | "followers";

export type OutfitSource = "manual" | "ai_suggestion" | "stylist_recommendation";

export type OutfitStatus = "draft" | "pending_acceptance" | "accepted" | "rejected";

export type AdminReviewStatus = "pending" | "approved" | "rejected" | "corrected";

export type OccasionTag =
    | "casual"
    | "formal"
    | "business"
    | "sporty"
    | "evening"
    | "beach";

export type WeatherCondition =
    | "sunny"
    | "cloudy"
    | "rainy"
    | "snowy"
    | "windy"
    | "hot"
    | "cold";

export type UserRole = "user" | "stylist" | "admin";

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface StyleTag {
    id: string;
    label: string;
    color?: string;
    aiGenerated?: boolean;
}

export interface AIAnalysis {
    dominantColors: string[];
    category: ClothingCategory;
    pattern?: string;
    material?: string;
    tags: StyleTag[];
    confidence: number;
    validatedByAdmin?: boolean;
}

// Nullable — backward compatible with mobile (missing field = not reviewed yet)
export interface AdminReview {
    status: AdminReviewStatus;
    reviewedBy: string;       // Admin UID
    reviewedAt: string;       // ISO timestamp
    corrections: {
        color?: string;
        material?: string;
        pattern?: string;
        category?: string;
    } | null;
    notes: string | null;
}

export interface WardrobeItem {
    id: string;
    userId: string;
    name: string;
    category: ClothingCategory;
    subcategory?: string;
    size?: string;
    imageUrl: string;
    thumbnailUrl?: string;
    bgRemovedUrl?: string;   // Cloud Function tarafından doldurulur (PNG, transparent BG)
    brand?: string;
    color: string[];
    season: Season[];
    occasions: OccasionTag[];
    aiAnalysis?: AIAnalysis;
    adminReview?: AdminReview | null;  // null = not reviewed; nullable → mobile backward compat
    isFavorite: boolean;
    isPublic: boolean;
    isArchived?: boolean;
    wearCount: number;
    lastWornAt?: string;
    purchaseDate?: string;
    price?: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OutfitItem {
    wardrobeItemId: string;
    position: { x: number; y: number };
    zIndex: number;
    scale?: number;
}

export interface CanvasLayoutItem {
    itemId: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    zIndex: number;
}

export interface OutfitItemSnapshot {
    id: string;
    imageUrl: string;
    category: ClothingCategory;
    dominantColor: string;
}

export interface Outfit {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    // Legacy field — kept for mobile backward compat
    items: OutfitItem[];
    // New fields for canvas-based outfits
    itemIds: string[];
    itemSnapshots: OutfitItemSnapshot[];
    canvasLayout: CanvasLayoutItem[];
    occasion: OccasionTag | null;
    season: OutfitSeason[];
    visibility: OutfitVisibility;
    source: OutfitSource;
    // Stylist recommendation fields — nullable for backward compat
    recommendedBy: string | null;
    status: OutfitStatus;
    acceptedAt: string | null;
    likeCount: number;
    commentCount: number;
    aiGenerated?: boolean;
    weather?: WeatherCondition[];
    thumbnailUrl?: string;
    // Legacy — kept for mobile backward compat
    likes?: number;
    isPublic?: boolean;
    isFavorite?: boolean;
    isArchived?: boolean;
    wearCount?: number;
    lastWornAt?: string;
    lastWorn?: string;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

export type UserStatus = "active" | "suspended";

export interface VestoUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    photoUrl?: string; // Consistency with mobile requested in prompt
    role: UserRole;
    status: UserStatus;
    isStylistModeActive: boolean; // Hafta 12
    profileSetupCompleted: boolean; // Hafta 8 Fix
    gender?: string;
    birthYear?: number;
    bio: string;
    username?: string;
    wardrobePublic: boolean;
    location?: string;
    stylePreferences?: OccasionTag[];
    wardrobeCount?: number;
    outfitCount?: number;
    followerCount?: number;   // YENİ — Hafta 11b
    followingCount?: number;
    suggestionsSent: number;
    suggestionsAccepted: number;
    averageRating: number;
    ratingCount: number;
    assignedStylistId?: string;
    lastActive?: string;
    strikes?: number;
    isSuspended?: boolean;
    createdAt: string;
}

import { Timestamp } from 'firebase/firestore';

export interface AppNotification {
    id: string;
    userId: string;
    type: 'recommendation' | 'accepted' | 'rejected' | 'follow';
    title: string;
    body: string;
    relatedId?: string | null;
    isRead: boolean;
    createdAt: Timestamp;
}

export interface WeatherData {
    city: string;
    temperature: number;
    feelsLike: number;
    condition: WeatherCondition;
    humidity: number;
    windSpeed: number;
    icon: string;
    description: string;
}

export interface OutfitSuggestion {
    outfit: Outfit;
    reason: string;
    weatherMatch: number;
    score: number;
}

// ─── Forum / Community ────────────────────────────────────────────────────────

export * from "./forum";

// ─── Admin / Stylist ──────────────────────────────────────────────────────────

export interface AITagValidationItem {
    wardrobeItemId: string;
    userId: string;
    imageUrl: string;
    aiAnalysis: AIAnalysis;
    submittedAt: string;
}

export interface StyleRecommendation {
    id: string;
    stylistId: string;
    userId: string;
    outfit: Outfit;
    message: string;
    createdAt: string;
    isAccepted?: boolean;
}

export * from "./stylist";

export interface Report {
    id: string;
    reporterId: string;
    reporterDisplayName: string;
    targetType: 'post' | 'comment';
    targetId: string;
    reason: 'spam' | 'inappropriate' | 'harassment' | 'other';
    description?: string;
    status: 'pending' | 'resolved' | 'dismissed';
    createdAt: Timestamp;
    resolvedAt: Timestamp | null;
    resolvedBy: string | null;
}

