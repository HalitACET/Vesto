export interface PlatformStats {
  totalUsers: number;
  totalWardrobeItems: number;
  totalOutfits: number;
  totalForumPosts: number;
  totalRecommendations: number;
  activeStylists: number;
  newUsersToday: number;
  newUsersThisWeek: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

export interface ColorStat {
  hex: string;
  count: number;
  label: string;
}

export interface DailyStat {
  date: string;  // 'YYYY-MM-DD'
  count: number;
}

export interface StylistStat {
  uid: string;
  displayName: string;
  suggestionsSent: number;
  suggestionsAccepted: number;
  acceptRate: number;
  averageRating: number;
}
