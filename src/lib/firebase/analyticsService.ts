"use server";

import { adminDb } from '@/lib/firebase/admin';
import { getServerSession } from '@/lib/firebase/serverAuth';
import {
  PlatformStats, CategoryStat,
  ColorStat, DailyStat, StylistStat
} from '@/types/analytics';

async function requireAdmin() {
  const session = await getServerSession();
  if (!session || session.role !== 'admin') {
    throw new Error('Yetkisiz islem');
  }
}

// ─── PLATFORM OZET ──────────────────────────────

export async function getPlatformStats(): Promise<PlatformStats> {
  await requireAdmin();
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
    adminDb.collection('users').count().get(),
    adminDb.collection('wardrobeItems').count().get(),
    adminDb.collection('outfits').where('isArchived', '==', false).count().get(),
    adminDb.collection('forumPosts').where('isArchived', '==', false).count().get(),
    adminDb.collection('outfitRecommendations').count().get(),
    adminDb.collection('users').where('isStylistModeActive', '==', true).count().get(),
    adminDb.collection('users').where('createdAt', '>=', todayStart).count().get(),
    adminDb.collection('users').where('createdAt', '>=', weekStart).count().get(),
  ]);

  return {
    totalUsers: users.data().count,
    totalWardrobeItems: wardrobeItems.data().count,
    totalOutfits: outfits.data().count,
    totalForumPosts: forumPosts.data().count,
    totalRecommendations: recommendations.data().count,
    activeStylists: activeStylists.data().count,
    newUsersToday: newToday.data().count,
    newUsersThisWeek: newThisWeek.data().count,
  };
}

// ─── KATEGORI DAGILIMI ──────────────────────────

export async function getCategoryStats(): Promise<CategoryStat[]> {
  await requireAdmin();
  const snap = await adminDb.collection('wardrobeItems').get();

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

// ─── RENK TRENDI ───────────────────────────────

export async function getColorStats(): Promise<ColorStat[]> {
  await requireAdmin();
  const snap = await adminDb.collection('wardrobeItems')
    .orderBy('createdAt', 'desc')
    .limit(500)
    .get();

  const hexCounts: Record<string, number> = {};

  snap.docs.forEach(doc => {
    const data = doc.data();
    const colors = data.aiAnalysis?.dominantColors ?? data.aiAnalysis?.colorHex ?? data.color ?? [];
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
    .slice(0, 15);
}

// ─── KULLANICI BUYUME ───────────────────────────

export async function getUserGrowthStats(
  days: number = 30
): Promise<DailyStat[]> {
  await requireAdmin();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const snap = await adminDb.collection('users')
    .where('createdAt', '>=', startDate)
    .orderBy('createdAt', 'asc')
    .get();

  const dailyCounts: Record<string, number> = {};

  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().split('T')[0];
    dailyCounts[key] = 0;
  }

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

// ─── STILIST ISTATISTIKLERI ────────────────────

export async function getStylistStats(): Promise<StylistStat[]> {
  await requireAdmin();
  const snap = await adminDb.collection('users')
    .where('isStylistModeActive', '==', true)
    .orderBy('suggestionsAccepted', 'desc')
    .limit(20)
    .get();

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

// ─── FORUM ISTATISTIKLERI ──────────────────────

export async function getForumStats(): Promise<DailyStat[]> {
  await requireAdmin();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const snap = await adminDb.collection('forumPosts')
    .where('createdAt', '>=', startDate)
    .orderBy('createdAt', 'asc')
    .get();

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
