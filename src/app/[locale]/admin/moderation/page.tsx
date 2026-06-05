'use client';

import { useState, useEffect } from 'react';
import { getModerationStats } from '@/lib/firebase/moderationService';
import { ReportsTab } from '@/components/admin/moderation/ReportsTab';
import { PostsTab } from '@/components/admin/moderation/PostsTab';
import { CommentsTab } from '@/components/admin/moderation/CommentsTab';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

type TabType = 'reports' | 'posts' | 'comments';

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('reports');
  const [stats, setStats] = useState({
    pendingReports: 0,
    totalPosts: 0,
    moderatedPosts: 0,
  });

  useEffect(() => {
    getModerationStats().then(setStats);
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-playfair text-2xl text-onyx">
          Forum Moderasyonu
        </h1>
        <p className="font-inter text-sm text-stone mt-1">
          Şikayetleri incele, içerik kaldır, kullanıcı uyar
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className={cn(
          'rounded-lg p-4 transition-colors',
          stats.pendingReports > 0
            ? 'bg-red-50 border border-red-200'
            : 'bg-mist border border-transparent'
        )}>
          <div className={cn(
            'font-playfair text-3xl font-semibold',
            stats.pendingReports > 0 ? 'text-red-700' : 'text-onyx'
          )}>
            {stats.pendingReports}
          </div>
          <div className={cn(
            'font-inter text-xs mt-1',
            stats.pendingReports > 0 ? 'text-red-600 font-medium' : 'text-stone'
          )}>
            Bekleyen Şikayet
            {stats.pendingReports > 0 && ' ⚠️'}
          </div>
        </div>
        <div className="bg-mist rounded-lg p-4">
          <div className="font-playfair text-3xl font-semibold text-onyx">
            {stats.totalPosts}
          </div>
          <div className="font-inter text-xs text-stone mt-1">
            Toplam Post
          </div>
        </div>
        <div className="bg-mist rounded-lg p-4">
          <div className="font-playfair text-3xl font-semibold text-onyx">
            {stats.moderatedPosts}
          </div>
          <div className="font-inter text-xs text-stone mt-1">
            Kaldırılan Post
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-mist mb-6 gap-6">
        {([
          { key: 'reports', label: 'Şikayetler' },
          { key: 'posts', label: 'Postlar' },
          { key: 'comments', label: 'Yorumlar' },
        ] as { key: TabType; label: string }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'pb-3 font-inter text-sm font-semibold transition',
              activeTab === tab.key
                ? 'text-onyx border-b-2 border-onyx -mb-px'
                : 'text-stone hover:text-onyx'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'posts' && <PostsTab />}
        {activeTab === 'comments' && <CommentsTab />}
      </div>
    </div>
    </DashboardLayout>
  );
}
