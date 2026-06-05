import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import { approveReportAndPenalize } from "@/app/actions/adminActions";

export function ModerationTab() {
    const t = useTranslations("admin");
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadReports() {
        setLoading(true);
        try {
            const data = await import('@/lib/firebase/moderationService').then(m => m.getReports('pending'));
            setReports(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    useEffect(() => {
        loadReports();
    }, []);

    async function handleDismiss(id: string) {
        try {
            await import('@/lib/firebase/moderationService').then(m => m.resolveReport(id, 'dismissed'));
            loadReports();
        } catch (e) {}
    }

    async function handleRemove(id: string) {
        try {
            await approveReportAndPenalize(id);
            loadReports();
        } catch (e) {}
    }

    if (loading) return <div className="py-12 text-center text-sm text-muted-foreground">{t("aiQueue.loading")}</div>;
    if (reports.length === 0) return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <p className="text-sm text-muted-foreground">Şu anda bekleyen şikayet yok.</p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4">
            {reports.map((report) => (
                <Card key={report.id} className="border-amber-500/20">
                    <CardContent className="flex items-start justify-between gap-4 py-5">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Flag size={13} className="text-amber-500" />
                                <Badge variant="outline" className="border-amber-500/30 text-amber-600 text-[10px]">
                                    {report.reason}
                                </Badge>
                                <span className="text-xs font-semibold text-muted-foreground ml-2">Tip: {report.targetType}</span>
                            </div>
                            <p className="font-medium text-sm">{report.description || "Açıklama yok"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Bildiren: {report.reporterDisplayName}
                            </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => handleRemove(report.id)}>
                                Onayla
                            </Button>
                            <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleDismiss(report.id)}>
                                Reddet
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
