"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Menu, Sun, Moon } from "lucide-react";
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
    const t = useTranslations("sidebar");
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

    const NAV_LINKS = [
        { href: "/dashboard", label: t("dashboard") },
        { href: "/dashboard/wardrobe", label: t("wardrobe") },
        { href: "/dashboard/canvas", label: t("canvas") },
        { href: "/dashboard/community", label: t("community") },
    ];

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-6">
                {/* Left: menu + logo */}
                <div className="flex items-center gap-4">
                    {onMenuToggle && (
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
                <nav className="hidden items-center gap-8 md:flex">
                    {NAV_LINKS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {item.label}
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
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle dark mode"
                        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                    </button>

                    {loading ? (
                        <Skeleton className="h-8 w-8 rounded-full" />
                    ) : firebaseUser ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="rounded-full ring-2 ring-border hover:ring-accent transition-all outline-none">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={firebaseUser.photoURL ?? undefined} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <div className="px-3 py-2">
                                    <p className="text-sm font-medium">{vestoUser?.displayName}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{vestoUser?.role}</p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                                    {t("dashboard")}
                                </DropdownMenuItem>
                                {vestoUser?.role === "admin" && (
                                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                                        {t("admin")}
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
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">{tAuth("login")}</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/register">{tAuth("register")}</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
