'use client';

import { useState, useEffect } from 'react';
import { generateUserReport } from '@/lib/firebase/reportService';
import { UserStyleReport } from '@/types/report';
import { ReportContent } from '@/components/admin/report/ReportContent';

export default function UserReportPage({
  params
}: { params: { id: string } }) {
  const [report, setReport] = useState<UserStyleReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    generateUserReport(params.id).then(r => {
      setReport(r);
      setLoading(false);
    });
  }, [params.id]);

  const handleExport = async () => {
    setExporting(true);
    const { exportReportToPdf } = await import('@/lib/pdf/pdfService');
    await exportReportToPdf(
      'report-content',
      `vesto-${report?.user.displayName}-raporu.pdf`
    );
    setExporting(false);
  };

  if (loading) return <ReportSkeleton />;
  if (!report) return <div>Rapor oluşturulamadı</div>;

  return (
    <div className="p-6">

      {/* Header — PDF'e dahil değil */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-playfair text-2xl text-onyx">
            Stil Raporu
          </h1>
          <p className="font-inter text-sm text-stone mt-1">
            {report.user.displayName} için oluşturuldu
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-onyx
                       text-primary-foreground rounded font-inter text-sm
                       font-semibold disabled:opacity-50"
          >
            {exporting ? 'PDF Oluşturuluyor...' : '⬇ PDF İndir'}
          </button>
        </div>
      </div>

      {/* PDF İçeriği */}
      <div id="report-content" className="bg-background p-8 rounded-lg shadow-sm">
        <ReportContent report={report} />
      </div>

    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="p-6 animate-pulse space-y-6">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-[600px] bg-muted rounded-lg" />
    </div>
  );
}
