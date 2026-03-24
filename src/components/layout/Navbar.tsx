"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
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
import { Sparkles, Menu } from "lucide-react";

interface NavbarProps {
    onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
    const { firebaseUser, vestoUser, loading } = useAuth();
    const router = useRouter();

    const initials = vestoUser?.displayName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "V";

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
                    {[
                        { href: "/dashboard", label: "Dashboard" },
                        { href: "/dashboard/wardrobe", label: "Wardrobe" },
                        { href: "/dashboard/outfits", label: "Outfits" },
                        { href: "/dashboard/canvas", label: "Stylist Canvas" },
                        { href: "/dashboard/community", label: "Community" },
                    ].map((item) => (
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
                                    Dashboard
                                </DropdownMenuItem>
                                {vestoUser?.role === "admin" && (
                                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                                        Admin Panel
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => signOut()}
                                >
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/login">Sign in</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/register">Get started</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
