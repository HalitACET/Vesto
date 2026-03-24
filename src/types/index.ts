// ─── Enums ────────────────────────────────────────────────────────────────────

export type ClothingCategory =
    | "tops"
    | "bottoms"
    | "dresses"
    | "outerwear"
    | "shoes"
    | "accessories"
    | "bags"
    | "jewelry";

export type Season = "spring" | "summer" | "autumn" | "winter" | "all";

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

export interface WardrobeItem {
    id: string;
    userId: string;
    name: string;
    category: ClothingCategory;
    imageUrl: string;
    thumbnailUrl?: string;
    brand?: string;
    color: string[];
    season: Season[];
    occasions: OccasionTag[];
    aiAnalysis?: AIAnalysis;
    isFavorite: boolean;
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

export interface Outfit {
    id: string;
    userId: string;
    name: string;
    items: OutfitItem[];
    occasion: OccasionTag;
    season: Season[];
    aiGenerated?: boolean;
    weather?: WeatherCondition[];
    thumbnailUrl?: string;
    likes: number;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface VestoUser {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    bio?: string;
    location?: string;
    stylePreferences?: OccasionTag[];
    wardrobeCount?: number;
    outfitCount?: number;
    followersCount?: number;
    followingCount?: number;
    createdAt: string;
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

export interface ForumPost {
    id: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    title: string;
    content: string;
    imageUrl?: string;
    tags: string[];
    likes: number;
    comments: number;
    isModerated: boolean;
    isPinned: boolean;
    createdAt: string;
}

export interface ForumComment {
    id: string;
    postId: string;
    authorId: string;
    authorName: string;
    content: string;
    likes: number;
    createdAt: string;
}

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
