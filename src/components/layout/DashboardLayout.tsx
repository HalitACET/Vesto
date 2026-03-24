"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-screen-xl px-6 py-8">{children}</div>
            </main>
        </div>
    );
}
