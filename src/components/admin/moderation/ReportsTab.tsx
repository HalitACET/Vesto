'use client';

import { useState, useEffect } from 'react';
import { getReports } from '@/lib/firebase/moderationService';
import { approveReportAdmin, approveReportAndPenalize, dismissReportAdmin } from '@/app/actions/adminActions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ReportsTab() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    const data = await getReports(filter);
    setReports(data);
    setLoading(false);
  };

  const handleRemovePost = async (postId: string, reportId: string) => {
    try {
      const res = await approveReportAdmin(reportId);
      if (res.ok) {
        toast.success('Post kaldırıldı');
        loadReports();
      } else {
        toast.error(res.error || 'İşlem başarısız');
      }
    } catch {
      toast.error('İşlem başarısız');
    }
  };

  const handleStrikeAndRemove = async (
    userId: string,
    postId: string,
    reportId: string
  ) => {
    try {
      const res = await approveReportAndPenalize(reportId);
      if (res.ok) {
          const strikes = res.data?.strikes || 1;
          toast.success(
            strikes >= 3
              ? `Post kaldırıldı. Kullanıcı ${strikes} strike ile askıya alındı!`
              : `Post kaldırıldı. Kullanıcıya ${strikes}. uyarı verildi.`
          );
          loadReports();
      } else {
          toast.error(res.error || 'İşlem başarısız');
      }
    } catch {
      toast.error('İşlem başarısız');
    }
  };

  const handleDismiss = async (reportId: string) => {
    try {
      const res = await dismissReportAdmin(reportId);
      if (res.ok) {
          toast.success('Şikayet reddedildi');
          loadReports();
      } else {
          toast.error(res.error || 'İşlem başarısız');
      }
    } catch {
      toast.error('İşlem başarısız');
    }
  };

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(['pending', 'resolved', 'dismissed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded font-inter text-xs font-medium transition',
              filter === f
                ? 'bg-onyx text-pearl'
                : 'bg-mist text-stone hover:bg-stone/20'
            )}
          >
            {f === 'pending' ? 'Bekleyen'
              : f === 'resolved' ? 'Çözümlendi'
              : 'Reddedildi'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i}
                 className="h-24 bg-mist rounded-lg animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-inter text-sm text-stone">
            {filter === 'pending'
              ? '✅ Bekleyen şikayet yok'
              : 'Kayıt bulunamadı'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report: any) => (
            <div
              key={report.id}
              className="bg-white border border-mist rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Şikayet bilgisi */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      'px-2 py-0.5 rounded font-inter text-xs font-semibold',
                      report.reason === 'spam'
                        ? 'bg-amber-50 text-amber-700'
                        : report.reason === 'harassment'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-mist text-stone'
                    )}>
                      {report.reason === 'spam' ? 'Spam'
                        : report.reason === 'inappropriate' ? 'Uygunsuz'
                        : report.reason === 'harassment' ? 'Taciz'
                        : 'Diğer'}
                    </span>
                    <span className="font-inter text-xs text-stone">
                      {report.targetType === 'post' ? 'Post' : 'Yorum'}
                    </span>
                  </div>

                  <p className="font-inter text-sm text-onyx">
                    <span className="font-semibold">
                      {report.reporterDisplayName}
                    </span>
                    {' şikayet etti: '}
                    <span className="text-stone font-mono text-xs">
                      {report.targetId.slice(0, 12)}...
                    </span>
                  </p>

                  {report.description && (
                    <p className="font-inter text-xs text-stone mt-1 italic border-l-2 border-mist pl-2">
                      "{report.description}"
                    </p>
                  )}
                </div>

                {/* Aksiyonlar */}
                {filter === 'pending' && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleRemovePost(
                        report.targetId, report.id
                      )}
                      className="px-3 py-1.5 bg-red-600 text-white rounded
                                 font-inter text-xs font-semibold
                                 hover:bg-red-700 transition whitespace-nowrap"
                    >
                      İçeriği Kaldır
                    </button>
                    <button
                      onClick={() => handleStrikeAndRemove(
                        report.reporterId, report.targetId, report.id
                      )}
                      className="px-3 py-1.5 bg-amber-600 text-white rounded
                                 font-inter text-xs font-semibold
                                 hover:bg-amber-700 transition whitespace-nowrap"
                    >
                      Kaldır + Uyar
                    </button>
                    <button
                      onClick={() => handleDismiss(report.id)}
                      className="px-3 py-1.5 border border-mist text-stone
                                 rounded font-inter text-xs font-medium
                                 hover:bg-mist/50 transition whitespace-nowrap"
                    >
                      Reddet
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
