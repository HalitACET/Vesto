'use client';

import { useState, useEffect } from 'react';
import { generateUserReport } from '@/lib/firebase/reportService';
import { useAuth } from '@/hooks/useAuth';
import { ReportContent } from '@/components/admin/report/ReportContent';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function MyReportPage() {
  const { vestoUser } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!vestoUser?.uid) return;
    generateUserReport(vestoUser.uid).then(r => {
      setReport(r);
      setLoading(false);
    });
  }, [vestoUser?.uid]);

  const handleExport = async () => {
    setExporting(true);
    const { exportReportToPdf } = await import('@/lib/pdf/pdfService');
    await exportReportToPdf('my-report-content', 'vesto-stil-raporum.pdf');
    setExporting(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-playfair text-3xl text-foreground">
            Stil Raporun
          </h1>
          <button
            onClick={handleExport}
            disabled={exporting || loading || !report}
            className="flex items-center gap-2 px-4 py-2 bg-primary
                       text-primary-foreground rounded font-sans text-sm
                       font-semibold disabled:opacity-50"
          >
            {exporting ? 'Oluşturuluyor...' : '⬇ PDF İndir'}
          </button>
        </div>

        <div id="my-report-content" className="bg-background rounded-lg p-6 shadow-sm">
          {loading ? (
             <ReportSkeleton />
          ) : report ? (
             <ReportContent report={report} />
          ) : (
            <div>Rapor yüklenemedi.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function ReportSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-[600px] bg-muted rounded-lg" />
    </div>
  );
}
