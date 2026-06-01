"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ForumFeedTab } from "@/components/forum/ForumFeedTab";
import { DiscoverTab } from "@/components/discover/DiscoverTab";
import { cn } from "@/lib/utils";

type TabType = "forum" | "discover";

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<TabType>("forum");

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Tab Bar */}
                <div className="flex border-b border-mist mb-8">
                    {(["forum", "discover"] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 pb-3 font-inter text-xs font-semibold uppercase tracking-widest transition-colors",
                                activeTab === tab
                                    ? "text-onyx border-b-2 border-onyx -mb-px"
                                    : "text-stone hover:text-onyx"
                            )}
                        >
                            {tab === "forum" ? "Forum" : "Keşfet"}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === "forum" ? <ForumFeedTab /> : <DiscoverTab />}
            </div>
        </DashboardLayout>
    );
}
