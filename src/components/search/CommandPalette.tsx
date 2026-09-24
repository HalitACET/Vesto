"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Shirt, Palette, Users, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useWardrobe } from '@/hooks/useWardrobe';

interface SearchResult {
    id: string;
    type: 'wardrobe' | 'page' | 'action';
    title: string;
    subtitle?: string;
    href: string;
    icon: React.ElementType;
}

const STATIC_PAGES = [
    { id: 's1', key: 'wardrobe', href: '/dashboard/wardrobe', icon: Shirt },
    { id: 's2', key: 'canvas', href: '/dashboard/canvas', icon: Palette },
    { id: 's3', key: 'community', href: '/dashboard/community', icon: MessageSquare },
    { id: 's4', key: 'stylists', href: '/stylists', icon: Users },
    { id: 's5', key: 'recommendations', href: '/recommendations', icon: Sparkles },
] as const;

export function CommandPalette() {
    const t = useTranslations('commandPalette');
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { items } = useWardrobe();

    const STATIC_RESULTS: SearchResult[] = STATIC_PAGES.map(p => ({
        id: p.id,
        type: 'page',
        title: t(`pages.${p.key}.title`),
        subtitle: t(`pages.${p.key}.subtitle`),
        href: p.href,
        icon: p.icon,
    }));

    // Ctrl+K / Cmd+K shortcut
    useEffect(() => {
        function handler(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(prev => !prev);
            }
            if (e.key === 'Escape') setOpen(false);
        }
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const results: SearchResult[] = query.trim() === ''
        ? STATIC_RESULTS
        : [
            ...STATIC_RESULTS.filter(r =>
                r.title.toLowerCase().includes(query.toLowerCase()) ||
                (r.subtitle ?? '').toLowerCase().includes(query.toLowerCase())
            ),
            ...items
                .filter(item =>
                    (item.name ?? '').toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 4)
                .map(item => ({
                    id: item.id,
                    type: 'wardrobe' as const,
                    title: item.name || t('itemFallback'),
                    subtitle: item.category,
                    href: '/dashboard/wardrobe',
                    icon: Shirt,
                }))
        ];

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-sm hover:border-foreground/40 hover:text-foreground transition-all"
            >
                <Search size={14} />
                <span>{t('trigger')}</span>
                <kbd className="ml-2 text-[10px] border border-border rounded px-1 py-0.5 bg-muted">⌘K</kbd>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] px-4 bg-background/80 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: -10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Search input */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                                <Search size={18} className="text-muted-foreground flex-shrink-0" />
                                <input
                                    autoFocus
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder={t('placeholder')}
                                    className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
                                />
                                {query && (
                                    <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Results */}
                            <div className="max-h-80 overflow-y-auto py-2">
                                {results.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-8">{t('noResults')}</p>
                                ) : (
                                    results.map(result => {
                                        const Icon = result.icon;
                                        return (
                                            <Link
                                                key={result.id}
                                                href={result.href}
                                                onClick={() => setOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                                    <Icon size={15} className="text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                                                    {result.subtitle && (
                                                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                                                    )}
                                                </div>
                                                <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        );
                                    })
                                )}
                            </div>

                            <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
                                <span><kbd className="border border-border rounded px-1 bg-muted">↵</kbd> {t('select')}</span>
                                <span><kbd className="border border-border rounded px-1 bg-muted">Esc</kbd> {t('close')}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
