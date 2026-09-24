"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shirt, Palette, Users, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const STEPS = [
    {
        icon: Shirt,
        key: 'wardrobe',
        href: '/dashboard/wardrobe',
        color: 'from-blue-500/20 to-indigo-500/10',
    },
    {
        icon: Palette,
        key: 'canvas',
        href: '/dashboard/canvas',
        color: 'from-purple-500/20 to-pink-500/10',
    },
    {
        icon: Users,
        key: 'community',
        href: '/dashboard/community',
        color: 'from-emerald-500/20 to-teal-500/10',
    },
] as const;

const STORAGE_KEY = 'vesto_onboarding_done';

export function WelcomeTour() {
    const t = useTranslations('welcomeTour');
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const done = localStorage.getItem(STORAGE_KEY);
        if (!done) {
            // Small delay for better UX
            const timer = setTimeout(() => setVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    function dismiss() {
        localStorage.setItem(STORAGE_KEY, '1');
        setVisible(false);
    }

    const currentStep = STEPS[step];
    const Icon = currentStep.icon;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        {/* Close */}
                        <button
                            onClick={dismiss}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={18} />
                        </button>

                        {/* Content */}
                        <div className={`bg-gradient-to-br ${currentStep.color} p-8 pb-6`}>
                            <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mb-5 shadow-sm">
                                <Icon size={26} className="text-foreground" />
                            </div>
                            <div className="flex gap-1 mb-4">
                                {STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                                            i <= step ? 'bg-primary' : 'bg-border'
                                        }`}
                                    />
                                ))}
                            </div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">{t(`steps.${currentStep.key}.title`)}</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">{t(`steps.${currentStep.key}.desc`)}</p>
                        </div>

                        <div className="p-4 flex items-center justify-between">
                            <button
                                onClick={dismiss}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                {t('skip')}
                            </button>
                            <div className="flex gap-2">
                                {step < STEPS.length - 1 ? (
                                    <Button size="sm" onClick={() => setStep(s => s + 1)} className="gap-1.5">
                                        {t('next')}
                                        <ArrowRight size={14} />
                                    </Button>
                                ) : (
                                    <Button size="sm" asChild className="gap-1.5" onClick={dismiss}>
                                        <Link href={currentStep.href}>
                                            <Sparkles size={14} />
                                            {t('start')}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
