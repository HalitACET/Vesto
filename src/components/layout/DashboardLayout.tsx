"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MobileBottomNav } from "./MobileBottomNav";
import { CommandPalette } from "@/components/search/CommandPalette";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen] = useState(true);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <div
                className={cn(
                    "hidden lg:flex flex-shrink-0 transition-all duration-300",
                    sidebarOpen ? "w-64" : "w-0"
                )}
            >
                <Sidebar isOpen={sidebarOpen} />
            </div>

            {/* Mobile overlay sidebar */}
            <div className="lg:hidden">
                <Sidebar isOpen={sidebarOpen} />
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
                {/* Desktop top bar with search */}
                <div className="hidden lg:flex items-center justify-end px-6 py-3 border-b border-border bg-background/50">
                    <CommandPalette />
                </div>
                <div className="mx-auto max-w-screen-xl px-6 py-8">
                    <ErrorBoundary>{children}</ErrorBoundary>
                </div>
            </main>

            <MobileBottomNav />
        </div>
    );
}
