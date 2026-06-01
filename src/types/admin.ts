export interface AiMonitorItem {
  id: string;
  userId: string;
  userDisplayName?: string;
  imageUrl: string;
  bgRemovedUrl?: string | null;
  uploadStatus: 'uploading' | 'ready' | 'analyzing' | 'failed';
  aiAnalysis: {
    dominantColors: string[];
    colorHex: string[];
    detectedCategory: string;
    detectedSubcategory: string;
    detectedMaterial: string | null;
    patternType: string;
    confidence: number;
    analyzedAt: any;
  } | null;
  createdAt: any;

  // Admin override fields
  adminOverride?: {
    category?: string;
    subcategory?: string;
    material?: string;
    overriddenAt: any;
    overriddenBy: string;  // admin uid
  } | null;
}
