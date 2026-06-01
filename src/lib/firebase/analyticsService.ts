import {
  collection, query, where, getDocs,
  orderBy, limit, Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  PlatformStats, CategoryStat,
  ColorStat, DailyStat, StylistStat
} from '@/types/analytics';

// ─── PLATFORM ÖZET ──────────────────────────────

export async function getPlatformStats(): Promise<PlatformStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const [
    users,
    wardrobeItems,
    outfits,
    forumPosts,
    recommendations,
    activeStylists,
    newToday,
    newThisWeek,
  ] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'wardrobeItems')),
    getDocs(query(
      collection(db, 'outfits'),
      where('isArchived', '==', false),
    )),
    getDocs(query(
      collection(db, 'forumPosts'),
      where('isArchived', '==', false),
    )),
    getDocs(collection(db, 'outfitRecommendations')),
    getDocs(query(
      collection(db, 'users'),
      where('isStylistModeActive', '==', true),
    )),
    getDocs(query(
      collection(db, 'users'),
      where('createdAt', '>=', Timestamp.fromDate(todayStart)),
    )),
    getDocs(query(
      collection(db, 'users'),
      where('createdAt', '>=', Timestamp.fromDate(weekStart)),
    )),
  ]);

  return {
    totalUsers: users.size,
    totalWardrobeItems: wardrobeItems.size,
    totalOutfits: outfits.size,
    totalForumPosts: forumPosts.size,
    totalRecommendations: recommendations.size,
    activeStylists: activeStylists.size,
    newUsersToday: newToday.size,
    newUsersThisWeek: newThisWeek.size,
  };
}

// ─── KATEGORİ DAĞILIMI ──────────────────────────

export async function getCategoryStats(): Promise<CategoryStat[]> {
  const snap = await getDocs(collection(db, 'wardrobeItems'));

  const counts: Record<string, number> = {};
  let total = 0;

  snap.docs.forEach(doc => {
    const data = doc.data();
    const category =
      data.adminOverride?.category
      ?? data.aiAnalysis?.detectedCategory
      ?? 'other';

    counts[category] = (counts[category] ?? 0) + 1;
    total++;
  });

  return Object.entries(counts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: total > 0
        ? Math.round((count / total) * 100)
        : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// ─── RENK TRENDİ ───────────────────────────────

export async function getColorStats(): Promise<ColorStat[]> {
  const snap = await getDocs(query(
    collection(db, 'wardrobeItems'),
    where('aiAnalysis', '!=', null),
    limit(500),
  ));

  const hexCounts: Record<string, number> = {};

  snap.docs.forEach(doc => {
    const colors = doc.data().aiAnalysis?.colorHex ?? [];
    colors.slice(0, 2).forEach((hex: string) => {
      if (hex) hexCounts[hex] = (hexCounts[hex] ?? 0) + 1;
    });
  });

  return Object.entries(hexCounts)
    .map(([hex, count]) => ({
      hex,
      count,
      label: hex,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);  // Top 15 renk
}

// ─── KULLANICI BÜYÜME ───────────────────────────

export async function getUserGrowthStats(
  days: number = 30
): Promise<DailyStat[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const snap = await getDocs(query(
    collection(db, 'users'),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    orderBy('createdAt', 'asc'),
  ));

  // Günlere göre grupla
  const dailyCounts: Record<string, number> = {};

  // Boş günleri oluştur
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().split('T')[0];
    dailyCounts[key] = 0;
  }

  // Gerçek verileri doldur
  snap.docs.forEach(doc => {
    const createdAt = doc.data().createdAt?.toDate();
    if (!createdAt) return;
    const key = createdAt.toISOString().split('T')[0];
    if (key in dailyCounts) {
      dailyCounts[key]++;
    }
  });

  return Object.entries(dailyCounts).map(([date, count]) => ({
    date,
    count,
  }));
}

// ─── STİLİST İSTATİSTİKLERİ ────────────────────

export async function getStylistStats(): Promise<StylistStat[]> {
  const snap = await getDocs(query(
    collection(db, 'users'),
    where('isStylistModeActive', '==', true),
    orderBy('suggestionsAccepted', 'desc'),
    limit(20),
  ));

  return snap.docs.map(doc => {
    const data = doc.data();
    const sent = data.suggestionsSent ?? 0;
    const accepted = data.suggestionsAccepted ?? 0;

    return {
      uid: doc.id,
      displayName: data.displayName ?? 'Bilinmeyen',
      suggestionsSent: sent,
      suggestionsAccepted: accepted,
      acceptRate: sent > 0
        ? Math.round((accepted / sent) * 100)
        : 0,
      averageRating: data.averageRating ?? 0,
    };
  });
}

// ─── FORUM İSTATİSTİKLERİ ──────────────────────

export async function getForumStats(): Promise<DailyStat[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const snap = await getDocs(query(
    collection(db, 'forumPosts'),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    orderBy('createdAt', 'asc'),
  ));

  const dailyCounts: Record<string, number> = {};

  for (let i = 0; i <= 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    dailyCounts[date.toISOString().split('T')[0]] = 0;
  }

  snap.docs.forEach(doc => {
    const createdAt = doc.data().createdAt?.toDate();
    if (!createdAt) return;
    const key = createdAt.toISOString().split('T')[0];
    if (key in dailyCounts) dailyCounts[key]++;
  });

  return Object.entries(dailyCounts).map(([date, count]) => ({
    date, count,
  }));
}
