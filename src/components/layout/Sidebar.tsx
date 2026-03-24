"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Shirt,
    Sparkles,
    Palette,
    Users,
    ShieldCheck,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/wardrobe", label: "Wardrobe", icon: Shirt },
    { href: "/dashboard/outfits", label: "Outfits", icon: Sparkles },
    { href: "/dashboard/canvas", label: "Stylist Canvas", icon: Palette },
    { href: "/dashboard/community", label: "Community", icon: Users },
];

const adminItems = [
    { href: "/admin", label: "Admin Panel", icon: ShieldCheck },
];

interface SidebarProps {
    isOpen?: boolean;
}

export function Sidebar({ isOpen = true }: SidebarProps) {
    const pathname = usePathname();
    const { isAdmin, vestoUser } = useAuth();

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
                {navItems.map((item) => {
                    const active =
                        item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
                            <span className="flex-1">{item.label}</span>
                            {active && <ChevronRight size={14} />}
                        </Link>
                    );
                })}

                {/* Admin section */}
                {isAdmin && (
                    <>
                        <div className="mt-6 mb-2 px-3">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Administration
                            </p>
                        </div>
                        {adminItems.map((item) => {
                            const active = pathname.startsWith(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                                        active
                                            ? "bg-primary text-primary-foreground"
                                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                                    )}
                                >
                                    <Icon size={17} className="flex-shrink-0 text-muted-foreground" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
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
