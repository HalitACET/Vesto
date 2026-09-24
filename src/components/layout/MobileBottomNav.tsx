"use client";

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { LayoutDashboard, Shirt, Palette, MessageSquareWarning, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOBILE_NAV: { href: string; labelKey: 'dashboard' | 'wardrobe' | 'canvas' | 'community' | 'profile'; icon: React.ElementType; exact?: boolean }[] = [
    { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/wardrobe', labelKey: 'wardrobe', icon: Shirt },
    { href: '/dashboard/canvas', labelKey: 'canvas', icon: Palette },
    { href: '/dashboard/community', labelKey: 'community', icon: MessageSquareWarning },
    { href: '/dashboard/profile', labelKey: 'profile', icon: User },
];

export function MobileBottomNav() {
    const pathname = usePathname();
    const t = useTranslations('sidebar.mobile');

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="flex items-center justify-around h-16 px-2">
                {MOBILE_NAV.map(({ href, labelKey, icon: Icon, exact }) => {
                    const active = exact ? pathname === href : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[56px]',
                                active
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                            <span className={cn('text-[10px] font-medium', active ? 'text-primary' : '')}>
                                {t(labelKey)}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
