import {
  collection, query, where, getDocs,
  doc, getDoc, Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserStyleReport } from '@/types/report';

export async function generateUserReport(
  userId: string
): Promise<UserStyleReport> {

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Paralel fetch
  const [
    userDoc,
    wardrobeSnap,
    outfitsSnap,
    forumPostsSnap,
    recentWardrobeSnap,
  ] = await Promise.all([
    getDoc(doc(db, 'users', userId)),
    getDocs(query(
      collection(db, 'wardrobeItems'),
      where('userId', '==', userId),
      where('isArchived', '==', false),
    )),
    getDocs(query(
      collection(db, 'outfits'),
      where('userId', '==', userId),
      where('isArchived', '==', false),
    )),
    getDocs(query(
      collection(db, 'forumPosts'),
      where('authorId', '==', userId),
      where('isArchived', '==', false),
    )),
    getDocs(query(
      collection(db, 'wardrobeItems'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
    )),
  ]);

  const userData = userDoc.data()!;
  const wardrobeItems = wardrobeSnap.docs.map(d => d.data());
  const outfits = outfitsSnap.docs.map(d => d.data());

  // Kategori dağılımı
  const categoryCounts: Record<string, number> = {};
  wardrobeItems.forEach(item => {
    const cat = item.adminOverride?.category
      ?? item.aiAnalysis?.detectedCategory
      ?? 'other';
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  });

  const categoryBreakdown = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: wardrobeItems.length > 0
        ? Math.round((count / wardrobeItems.length) * 100)
        : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Top renkler
  const hexCounts: Record<string, number> = {};
  wardrobeItems.forEach(item => {
    const colors = item.aiAnalysis?.colorHex ?? [];
    colors.slice(0, 2).forEach((hex: string) => {
      if (hex) hexCounts[hex] = (hexCounts[hex] ?? 0) + 1;
    });
  });

  const topColors = Object.entries(hexCounts)
    .map(([hex, count]) => ({ hex, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Top materyaller
  const materialCounts: Record<string, number> = {};
  wardrobeItems.forEach(item => {
    const mat = item.adminOverride?.material
      ?? item.aiAnalysis?.detectedMaterial;
    if (mat) materialCounts[mat] = (materialCounts[mat] ?? 0) + 1;
  });

  const topMaterials = Object.entries(materialCounts)
    .map(([material, count]) => ({ material, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // En çok giyilen outfit
  const mostWorn = outfits.reduce((prev, curr) =>
    (curr.wearCount ?? 0) > (prev?.wearCount ?? 0) ? curr : prev,
    null as any
  );

  // Forum beğeni toplamı
  let totalLikesReceived = 0;
  forumPostsSnap.docs.forEach(d => {
    totalLikesReceived += d.data().likeCount ?? 0;
  });

  return {
    user: {
      uid: userId,
      displayName: userData.displayName,
      photoUrl: userData.photoUrl,
      bio: userData.bio,
      username: userData.username,
      createdAt: userData.createdAt,
    },
    wardrobe: {
      totalItems: wardrobeItems.length,
      publicItems: wardrobeItems.filter(i => i.isPublic).length,
      categoryBreakdown,
      topColors,
      topMaterials,
      recentlyAdded: recentWardrobeSnap.size,
    },
    outfits: {
      totalOutfits: outfits.length,
      totalWearCount: outfits.reduce(
        (sum, o) => sum + (o.wearCount ?? 0), 0
      ),
      favoriteCount: outfits.filter(o => o.isFavorite).length,
      mostWornOutfit: mostWorn ? {
        id: mostWorn.id,
        name: mostWorn.name,
        wearCount: mostWorn.wearCount ?? 0,
      } : undefined,
    },
    social: {
      followerCount: userData.followerCount ?? 0,
      followingCount: userData.followingCount ?? 0,
      forumPostCount: forumPostsSnap.size,
      totalLikesReceived,
      isStylist: userData.isStylistModeActive ?? false,
      stylistStats: userData.isStylistModeActive ? {
        suggestionsSent: userData.suggestionsSent ?? 0,
        suggestionsAccepted: userData.suggestionsAccepted ?? 0,
        acceptRate: userData.suggestionsSent > 0
          ? Math.round(
              (userData.suggestionsAccepted / userData.suggestionsSent) * 100
            )
          : 0,
        averageRating: userData.averageRating ?? 0,
      } : undefined,
    },
    generatedAt: new Date(),
  };
}
