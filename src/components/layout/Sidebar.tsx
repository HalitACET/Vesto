"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
    LayoutDashboard,
    Shirt,
    Palette,
    Heart,
    MessageSquareWarning,
    Settings,
    ChevronRight,
    Sparkles,
    Users,
    ShieldCheck,
    User,
    BarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
    isOpen?: boolean;
}

function NavItem({ href, label, icon: Icon, pathname }: { href: string; label: string; icon: React.ElementType; pathname: string }) {
    const active = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
    return (
        <Link
            href={href}
            className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
        >
            <Icon
                size={17}
                className={cn(
                    "flex-shrink-0 transition-all",
                    active
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                )}
            />
            <span className="flex-1">{label}</span>
            {active && <ChevronRight size={14} />}
        </Link>
    );
}

export function Sidebar({ isOpen = true }: SidebarProps) {
    const pathname = usePathname();
    const { isAdmin, isStylist, vestoUser } = useAuth();
    const t = useTranslations("sidebar");

    const BASE_NAV = [
        { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
        { href: "/dashboard/wardrobe", label: t("wardrobe"), icon: Shirt },
        { href: "/dashboard/canvas", label: t("canvas"), icon: Palette },
        { href: "/dashboard/outfits", label: t("outfits"), icon: Heart },
        { href: "/dashboard/community", label: t("community"), icon: MessageSquareWarning },
        { href: "/recommendations", label: "Öneriler", icon: Sparkles },
        { href: "/dashboard/my-report", label: "Stil Raporun", icon: BarChart },
        { href: "/dashboard/profile", label: t("profile"), icon: User },
        { href: "/dashboard/settings", label: t("settings"), icon: Settings },
    ];

    const STYLIST_NAV = [
        { href: "/dashboard/clients", label: t("clients"), icon: Users },
    ];

    const ADMIN_NAV = [
        { href: "/admin", label: t("admin"), icon: ShieldCheck },
        { href: "/admin/users", label: t("adminUsers"), icon: Users },
        { href: "/admin/ai-monitor", label: "AI Monitör", icon: Sparkles },
        { href: "/admin/moderation", label: "Moderasyon", icon: ShieldCheck },
        { href: "/admin/analytics", label: "İstatistikler", icon: BarChart },
    ];

    const extraNav = isAdmin ? ADMIN_NAV : isStylist ? STYLIST_NAV : [];

    return (
        <aside
            className={cn(
                "flex h-full w-64 flex-col border-r border-border bg-sidebar transition-transform duration-300",
                !isOpen && "-translate-x-full"
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                    <Sparkles size={13} className="text-primary-foreground" />
                </div>
                <span
                    className="text-lg font-medium tracking-widest uppercase text-sidebar-foreground"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                >
                    Vesto
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {BASE_NAV.map((item) => (
                    <NavItem key={item.href} {...item} pathname={pathname} />
                ))}

                {extraNav.length > 0 && (
                    <>
                        <div className="my-2 border-t border-border" />
                        {extraNav.map((item) => (
                            <NavItem key={item.href} {...item} pathname={pathname} />
                        ))}
                    </>
                )}
            </nav>

            {/* User info at bottom */}
            {vestoUser && (
                <div className="border-t border-border px-4 py-3">
                    <p className="text-xs font-medium text-sidebar-foreground truncate">
                        {vestoUser.displayName}
                    </p>
                    <p className="text-[11px] text-muted-foreground capitalize">
                        {vestoUser.role}
                    </p>
                </div>
            )}
        </aside>
    );
}
