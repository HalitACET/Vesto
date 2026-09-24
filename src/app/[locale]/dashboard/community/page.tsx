"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ForumFeedTab } from "@/components/forum/ForumFeedTab";
import { DiscoverTab } from "@/components/discover/DiscoverTab";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

type TabType = "forum" | "discover";

export default function CommunityPage() {
    const t = useTranslations("community");
    const [activeTab, setActiveTab] = useState<TabType>("forum");

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Tab Bar */}
                <div className="flex border-b border-border mb-6">
                    {(["forum", "discover"] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "flex-1 pb-3 font-inter text-xs font-semibold uppercase tracking-widest transition-colors",
                                activeTab === tab
                                    ? "text-foreground border-b-2 border-primary -mb-px"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab === "forum" ? "Forum" : "Keşfet"}
                        </button>
                    ))}
                </div>

                {/* Challenges Quick Link */}
                <div className="flex justify-end mb-4">
                    <Link href="/dashboard/community/challenges" className="flex items-center gap-1.5 text-xs text-accent hover:underline font-medium">
                        <Trophy size={12} />
                        {t("challengesLink")}
                    </Link>
                </div>

                {/* Tab Content */}
                {activeTab === "forum" ? <ForumFeedTab /> : <DiscoverTab />}
            </div>
        </DashboardLayout>
    );
}
