'use client';

import { useState, useEffect } from 'react';
import { getAiMonitorItems, getAiStats } from '@/lib/firebase/adminAiService';
import { AiMonitorItem } from '@/types/admin';
import { AiMonitorTable } from '@/components/admin/AiMonitorTable';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

type FilterType = 'all' | 'pending' | 'failed' | 'no_material';

export default function AiMonitorPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [items, setItems] = useState<AiMonitorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0, failed: 0, analyzing: 0, ready: 0
  });

  useEffect(() => {
    loadData();
    loadStats();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    const { items: newItems } = await getAiMonitorItems(filter);
    setItems(newItems);
    setLoading(false);
  };

  const loadStats = async () => {
    const s = await getAiStats();
    setStats(s);
  };

  return (
    <DashboardLayout>
      <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl text-foreground font-semibold">
            AI Analiz Monitörü
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Vision API analiz sonuçlarını izle ve düzelt
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatsCard label="Toplam Kıyafet" value={stats.total} color="onyx" />
        <StatsCard label="Analiz Tamam" value={stats.ready} color="green" />
        <StatsCard label="Analiz Bekleyen" value={stats.analyzing} color="amber" />
        <StatsCard label="Başarısız" value={stats.failed} color="red" />
      </div>

      {/* Filtreler */}
      <div className="flex gap-2 mb-6">
        {([
          { key: 'all', label: 'Tümü' },
          { key: 'pending', label: 'Bekleyen' },
          { key: 'failed', label: 'Başarısız' },
          { key: 'no_material', label: 'Materyal Eksik' },
        ] as { key: FilterType; label: string }[]).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-4 py-2 rounded font-inter text-sm font-medium transition',
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted-foreground/10'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tablo */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-sans text-sm text-muted-foreground">
            Bu filtreye uygun kıyafet yok
          </p>
        </div>
      ) : (
        <AiMonitorTable items={items} onUpdate={loadData} />
      )}
      </div>
    </DashboardLayout>
  );
}

function StatsCard({
  label, value, color
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    onyx: 'bg-primary text-primary-foreground border-transparent',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  };

  return (
    <div className={cn(
      'rounded-lg p-4 border',
      colorMap[color] ?? 'bg-muted text-foreground'
    )}>
      <div className="text-3xl font-semibold">{value}</div>
      <div className="font-sans text-xs mt-1 opacity-80">{label}</div>
    </div>
  );
}
