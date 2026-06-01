"use client";

import { useState, useEffect } from "react";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/firebase/auth";
import { subscribeIncomingRecommendations } from "@/lib/firebase/stylistService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Menu, Sun, Moon, Inbox, Bell } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface NavbarProps {
    onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
    const { firebaseUser, vestoUser, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale() as Locale;
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [incomingCount, setIncomingCount] = useState(0);
    const t = useTranslations("sidebar");

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!vestoUser) return;
        const unsubscribe = subscribeIncomingRecommendations((recs) => {
            setIncomingCount(recs.length);
        });
        return () => unsubscribe();
    }, [vestoUser]);

    const tAuth = useTranslations("auth");

    function switchLocale(newLocale: Locale) {
        router.replace(pathname, { locale: newLocale });
    }

    const initials = vestoUser?.displayName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "V";

    const role = vestoUser?.role ?? 'guest';

    const NAV_LINKS = (() => {
        if (role === 'guest') {
            return [
                { href: "/dashboard/community", label: t("community") },
            ];
        }

        const base = [
            { href: "/dashboard", label: t("dashboard") },
            { href: "/dashboard/wardrobe", label: t("wardrobe") },
            { href: "/dashboard/canvas", label: t("canvas") },
            { href: "/dashboard/community", label: t("community") },
        ];

        if (role === "stylist") {
            base.push({ href: "/dashboard/clients", label: t("clients") });
        }

        if (vestoUser?.isStylistModeActive) {
            base.push({ href: "/stylists", label: "Stilistler" });
        }

        base.push({ href: "/recommendations", label: "Öneriler" });

        return base;
    })();

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-6">
                {/* Left: menu + logo */}
                <div className="flex items-center gap-4">
                    {onMenuToggle && firebaseUser && (
                        <button
                            onClick={onMenuToggle}
                            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors lg:hidden"
                        >
                            <Menu size={20} />
                        </button>
                    )}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                            <Sparkles size={16} className="text-primary-foreground" />
                        </div>
                        <span
                            className="text-xl font-medium tracking-widest uppercase"
                            style={{ fontFamily: "Cormorant Garamond, serif" }}
                        >
                            Vesto
                        </span>
                    </Link>
                </div>

                {/* Center: nav links (desktop) */}
                <nav className="hidden items-center gap-6 md:flex">
                    {NAV_LINKS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative text-sm transition-colors flex items-center ${
                                pathname === item.href
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {item.label}
                            {item.href === "/recommendations" && incomingCount > 0 && (
                                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                                    {incomingCount}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Right: user menu */}
                <div className="flex items-center gap-3">
                    {/* Locale switcher */}
                    <div className="flex items-center rounded-lg border border-border overflow-hidden">
                        {(["tr", "en"] as Locale[]).map((loc) => (
                            <button
                                key={loc}
                                onClick={() => switchLocale(loc)}
                                className={`px-2.5 py-1.5 text-xs transition-colors ${
                                    locale === loc
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                            >
                                {loc.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Dark mode toggle */}
                    {mounted && (
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle dark mode"
                            className="hidden sm:flex rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                        </button>
                    )}

                    {loading ? (
                        <Skeleton className="h-8 w-8 rounded-full" />
                    ) : firebaseUser ? (
                        <div className="flex items-center gap-3">
                            {vestoUser?.role === "admin" && (
                                <Link href="/admin/dashboard" className="hidden lg:block">
                                    <Badge className="bg-orange-500 hover:bg-orange-600 border-0 cursor-pointer py-1 px-3">
                                        {t("admin")}
                                    </Badge>
                                </Link>
                            )}
                            {vestoUser && (
                                <>
                                    <Link
                                        href="/notifications"
                                        className="relative p-1 text-muted-foreground hover:text-foreground transition-colors"
                                        title="Bildirimler"
                                    >
                                        <Bell className="w-5 h-5" />
                                    </Link>
                                    <Link
                                        href="/recommendations"
                                        className="relative p-1 text-muted-foreground hover:text-foreground transition-colors"
                                        title="Kombin Önerileri"
                                    >
                                    <Inbox className="w-5 h-5" />
                                    {incomingCount > 0 && (
                                        <span
                                            className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                                        >
                                            {incomingCount}
                                        </span>
                                    )}
                                    </Link>
                                </>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger data-testid="user-menu" className="rounded-full ring-2 ring-border hover:ring-accent transition-all outline-none">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={firebaseUser.photoURL ?? vestoUser?.photoUrl ?? undefined} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-medium truncate">{vestoUser?.displayName || firebaseUser.email}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{vestoUser?.role}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                                        {t("dashboard")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                                        Settings
                                    </DropdownMenuItem>
                                    {vestoUser?.role === "stylist" && (
                                        <DropdownMenuItem disabled className="text-xs italic">
                                            Stylist Profile (Coming Soon)
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={async () => {
                                            await signOut();
                                            await fetch("/api/auth/session", { method: "DELETE" });
                                            router.push("/login");
                                        }}
                                    >
                                        {tAuth("logout")}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild className="text-xs">
                                <Link href="/login">{tAuth("login")}</Link>
                            </Button>
                            <Button size="sm" asChild className="text-xs h-8">
                                <Link href="/register">{tAuth("register")}</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
