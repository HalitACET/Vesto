"use client";

import { Component, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Class components can't use hooks, so the translated fallback lives here
function DefaultErrorFallback({ onReset }: { onReset: () => void }) {
    const t = useTranslations('errorBoundary');
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8">
            <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle size={28} className="text-destructive" />
            </div>
            <div className="text-center">
                <h3 className="text-base font-medium text-foreground">{t('title')}</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    {t('description')}
                </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={onReset}>
                <RefreshCw size={14} />
                {t('reload')}
            </Button>
        </div>
    );
}

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[Vesto Error Boundary]', error, info);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <DefaultErrorFallback
                    onReset={() => {
                        this.setState({ hasError: false, error: null });
                        window.location.reload();
                    }}
                />
            );
        }
        return this.props.children;
    }
}
