'use client';

import { useState, useEffect } from 'react';
import {
  getPlatformStats, getCategoryStats,
  getColorStats, getUserGrowthStats,
  getStylistStats, getForumStats,
} from '@/lib/firebase/analyticsService';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { StylistStat } from '@/types/analytics';
import { exportToCsv } from '@/lib/pdf/pdfService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const LineChart: any = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false });
const Line: any = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false });
const BarChart: any = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar: any = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const XAxis: any = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis: any = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid: any = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip: any = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer: any = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });

import { Suspense } from 'react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [forumActivity, setForumActivity] = useState<any[]>([]);
  const [stylists, setStylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getPlatformStats(),
      getCategoryStats(),
      getColorStats(),
      getUserGrowthStats(30),
      getForumStats(),
      getStylistStats(),
    ]).then(([s, c, col, ug, fa, st]) => {
      setStats(s);
      setCategories(c);
      setColors(col);
      setUserGrowth(ug);
      setForumActivity(fa);
      setStylists(st);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout>
    <div className="p-6 space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-playfair text-2xl text-onyx">
          Platform İstatistikleri
        </h1>
        <p className="font-inter text-sm text-stone mt-1">
          Vesto'nun büyümesi ve içerik trendleri
        </p>
      </div>

      {loading ? <AnalyticsSkeleton /> : (
        <>
          <Suspense fallback={<StatsSkeleton />}>
            <PlatformSummary stats={stats} />
          </Suspense>

      {/* Kullanıcı Büyüme Grafiği */}
      <Suspense fallback={<ChartSkeleton />}>
        <ChartCard title="Kullanıcı Büyümesi (Son 30 Gün)">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={userGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
            <XAxis
              dataKey="date"
              tick={{ fontFamily: 'Inter', fontSize: 11 }}
              tickFormatter={(val: string) => val.slice(5)}  // MM-DD göster
            />
            <YAxis tick={{ fontFamily: 'Inter', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                fontFamily: 'Inter',
                fontSize: 12,
                border: '1px solid #E8E8E8',
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#0A0A0A"
              strokeWidth={2}
              dot={false}
              name="Yeni Kullanıcı"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
      </Suspense>

      {/* İki Kolon: Kategori + Renk */}
      <div className="grid grid-cols-2 gap-6">

        {/* Kategori Dağılımı */}
        <Suspense fallback={<ChartSkeleton />}>
        <ChartCard
          title="Kıyafet Kategori Dağılımı"
          action={
            <button
              onClick={() => exportToCsv(
                categories.map(c => ({
                  Kategori: c.category,
                  Adet: c.count,
                  Yüzde: `%${c.percentage}`,
                })),
                'vesto-kategori-istatistik.csv'
              )}
              className="px-3 py-1 border border-border text-muted-foreground rounded text-xs hover:border-foreground hover:text-foreground"
            >
              CSV İndir
            </button>
          }
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categories.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
              <XAxis
                type="number"
                tick={{ fontFamily: 'Inter', fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fontFamily: 'Inter', fontSize: 11 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  fontFamily: 'Inter',
                  fontSize: 12,
                  border: '1px solid #E8E8E8',
                }}
              />
              <Bar dataKey="count" fill="#0A0A0A" name="Kıyafet Sayısı" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        </Suspense>

        {/* Renk Trendleri */}
        <Suspense fallback={<ChartSkeleton />}>
        <ChartCard title="En Popüler Renkler">
          <div className="flex flex-wrap gap-2 p-2">
            {colors.map((color) => (
              <div
                key={color.hex}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-10 h-10 rounded-full border border-mist
                               shadow-sm"
                  style={{ backgroundColor: color.hex }}
                  title={color.hex}
                />
                <span className="font-inter text-xs text-stone">
                  {color.count}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
        </Suspense>

      </div>

      {/* Forum Aktivitesi */}
      <Suspense fallback={<ChartSkeleton />}>
      <ChartCard title="Forum Aktivitesi (Son 30 Gün)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={forumActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
            <XAxis
              dataKey="date"
              tick={{ fontFamily: 'Inter', fontSize: 11 }}
              tickFormatter={(val: string) => val.slice(5)}
            />
            <YAxis tick={{ fontFamily: 'Inter', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                fontFamily: 'Inter',
                fontSize: 12,
                border: '1px solid #E8E8E8',
              }}
            />
            <Bar
              dataKey="count"
              fill="#737373"
              name="Yeni Post"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      </Suspense>

      {/* Stilist Leaderboard */}
      <Suspense fallback={<ChartSkeleton />}>
      <ChartCard title="Top Stilistler">
        <StylistLeaderboard stylists={stylists} />
      </ChartCard>
      </Suspense>

        </>
      )}

    </div>
    </DashboardLayout>
  );
}

// ─── ALT COMPONENTLER ───────────────────────────

function PlatformSummary({ stats }: { stats: any }) {
  const cards = [
    { label: 'Toplam Kullanıcı', value: stats.totalUsers,
      sub: `+${stats.newUsersToday} bugün` },
    { label: 'Kıyafet', value: stats.totalWardrobeItems },
    { label: 'Kombin', value: stats.totalOutfits },
    { label: 'Forum Post', value: stats.totalForumPosts },
    { label: 'Kombin Önerisi', value: stats.totalRecommendations },
    { label: 'Aktif Stilist', value: stats.activeStylists },
    { label: 'Bu Hafta Kayıt', value: stats.newUsersThisWeek,
      highlight: true },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            'rounded-lg p-4',
            card.highlight ? 'bg-onyx text-pearl' : 'bg-mist'
          )}
        >
          <div className={cn(
            'font-playfair text-3xl',
            card.highlight ? 'text-pearl' : 'text-onyx'
          )}>
            {card.value}
          </div>
          <div className={cn(
            'font-inter text-xs mt-1',
            card.highlight ? 'text-pearl/70' : 'text-stone'
          )}>
            {card.label}
          </div>
          {card.sub && (
            <div className={cn(
              'font-inter text-xs mt-0.5',
              card.highlight ? 'text-pearl/50' : 'text-stone/70'
            )}>
              {card.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title, children, action
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-playfair text-lg text-foreground">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

function StylistLeaderboard({ stylists }: { stylists: StylistStat[] }) {
  if (stylists.length === 0) {
    return (
      <p className="font-inter text-sm text-stone text-center py-8">
        Henüz aktif stilist yok
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-mist">
            <th className="text-left pb-3 font-inter text-xs
                           font-semibold uppercase tracking-widest
                           text-stone">
              #
            </th>
            <th className="text-left pb-3 font-inter text-xs
                           font-semibold uppercase tracking-widest
                           text-stone">
              Stilist
            </th>
            <th className="text-right pb-3 font-inter text-xs
                           font-semibold uppercase tracking-widest
                           text-stone">
              Öneri
            </th>
            <th className="text-right pb-3 font-inter text-xs
                           font-semibold uppercase tracking-widest
                           text-stone">
              Kabul
            </th>
            <th className="text-right pb-3 font-inter text-xs
                           font-semibold uppercase tracking-widest
                           text-stone">
              Oran
            </th>
            <th className="text-right pb-3 font-inter text-xs
                           font-semibold uppercase tracking-widest
                           text-stone">
              Puan
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-mist">
          {stylists.map((stylist, i) => (
            <tr key={stylist.uid} className="hover:bg-mist/20">
              <td className="py-3 font-inter text-sm text-stone">
                {i + 1}
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-mist
                                  flex items-center justify-center">
                    <span className="font-inter text-xs text-onyx">
                      {stylist.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-inter text-sm text-onyx">
                    {stylist.displayName}
                  </span>
                  {stylist.acceptRate >= 70 &&
                   stylist.suggestionsSent >= 5 && (
                    <span className="text-amber-500 text-xs">✓</span>
                  )}
                </div>
              </td>
              <td className="py-3 text-right font-inter text-sm text-onyx">
                {stylist.suggestionsSent}
              </td>
              <td className="py-3 text-right font-inter text-sm text-onyx">
                {stylist.suggestionsAccepted}
              </td>
              <td className="py-3 text-right">
                <span className={cn(
                  'font-inter text-sm font-semibold',
                  stylist.acceptRate >= 70
                    ? 'text-green-600'
                    : stylist.acceptRate >= 50
                      ? 'text-amber-600'
                      : 'text-stone'
                )}>
                  %{stylist.acceptRate}
                </span>
              </td>
              <td className="py-3 text-right font-inter text-sm text-onyx">
                {stylist.averageRating > 0
                  ? `★ ${stylist.averageRating.toFixed(1)}`
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-mist rounded" />
      <StatsSkeleton />
      <ChartSkeleton />
      <div className="grid grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 animate-pulse">
      {[1,2,3,4,5,6,7].map(i => (
        <div key={i} className="h-20 bg-mist rounded-lg" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-80 bg-mist rounded-lg animate-pulse" />;
}
