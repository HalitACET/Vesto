'use client';

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { subscribeFeed } from "@/lib/firebase/forumService";
import type { ForumPost } from "@/types";
import { ForumPostCard } from "@/components/forum/ForumPostCard";
import { ForumEmptyState } from "@/components/forum/ForumEmptyState";
import { ForumSkeleton } from "@/components/forum/ForumSkeleton";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { CreatePostDialog } from "@/components/forum/CreatePostDialog";

export function ForumFeedTab() {
    const t = useTranslations("forum");
    const { firebaseUser } = useAuth();
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [createOpen, setCreateOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribeFeed((newPosts) => {
            setPosts(newPosts);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const filtered = posts.filter(
        (post) =>
            post.caption.toLowerCase().includes(search.toLowerCase()) ||
            post.authorDisplayName.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <ForumSkeleton />;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-light font-playfair">{t("title")}</h1>
                {firebaseUser && (
                    <Button
                        onClick={() => setCreateOpen(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 duration-200 rounded-md h-10 px-5"
                    >
                        <Plus className="mr-2" size={16} />
                        {t("newPost")}
                    </Button>
                )}
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                    placeholder="Gönderilerde veya yazar isimlerinde ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Feed */}
            {filtered.length === 0 ? (
                <ForumEmptyState />
            ) : (
                <div className="space-y-6">
                    {filtered.map((post) => (
                        <ForumPostCard 
                            key={post.id} 
                            post={post} 
                            onDelete={() => {
                                // The real-time onSnapshot subscription will automatically update the feed
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Dialogs */}
            <CreatePostDialog 
                open={createOpen} 
                onOpenChange={setCreateOpen} 
            />
        </div>
    );
}
