export interface UserStyleReport {
  user: {
    uid: string;
    displayName: string;
    photoUrl?: string;
    bio?: string;
    username?: string;
    createdAt: any;
  };
  wardrobe: {
    totalItems: number;
    publicItems: number;
    categoryBreakdown: { category: string; count: number; percentage: number }[];
    topColors: { hex: string; count: number }[];
    topMaterials: { material: string; count: number }[];
    recentlyAdded: number;  // son 30 günde eklenen
  };
  outfits: {
    totalOutfits: number;
    totalWearCount: number;
    favoriteCount: number;
    mostWornOutfit?: {
      id: string;
      name: string;
      wearCount: number;
    };
  };
  social: {
    followerCount: number;
    followingCount: number;
    forumPostCount: number;
    totalLikesReceived: number;
    isStylist: boolean;
    stylistStats?: {
      suggestionsSent: number;
      suggestionsAccepted: number;
      acceptRate: number;
      averageRating: number;
    };
  };
  generatedAt: Date;
}
