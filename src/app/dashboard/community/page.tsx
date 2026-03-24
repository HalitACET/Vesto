"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Search, Plus, Pin } from "lucide-react";
import { motion } from "framer-motion";

// Mock posts for community scaffold
const MOCK_POSTS = [
    {
        id: "1",
        author: "Sophie Laurent",
        avatar: null,
        initials: "SL",
        role: "Certified Stylist",
        title: "How to master tonal dressing in 2026",
        content:
            "Tonal dressing — wearing shades of the same color from head to toe — has become the defining trend of the season. The key is to vary textures and fabrics to add depth without breaking the palette.",
        tags: ["tonal", "minimalism", "2026trends"],
        likes: 142,
        comments: 38,
        isPinned: true,
        time: "2h ago",
    },
    {
        id: "2",
        author: "Marcus Chen",
        avatar: null,
        initials: "MC",
        role: "User",
        title: "My capsule wardrobe journey — 6 months in",
        content:
            "I've documented every purchase and purge over 6 months of building my capsule wardrobe. Starting with 112 pieces, I now have 34 pieces that cover 95% of my daily needs.",
        tags: ["capsule", "wardrobe", "minimalist"],
        likes: 89,
        comments: 24,
        isPinned: false,
        time: "5h ago",
    },
    {
        id: "3",
        author: "Amara Osei",
        avatar: null,
        initials: "AO",
        role: "User",
        title: "Spring color trends: what Vesto AI detected in my wardrobe",
        content:
            "After uploading all 67 of my spring items, the AI flagged a strong bias toward sage green and dusty rose. I had no idea until I saw the color breakdown visualization!",
        tags: ["AI", "spring", "coloranalysis"],
        likes: 203,
        comments: 51,
        isPinned: false,
        time: "1d ago",
    },
    {
        id: "4",
        author: "Elena Volkov",
        avatar: null,
        initials: "EV",
        role: "Stylist",
        title: "The 3 outfit formulas that work for every body type",
        content:
            "After 8 years of styling clients, I've landed on three universal formulas. The trick is not in the specific pieces, but in the proportions and the role each piece plays.",
        tags: ["styling", "tips", "formula"],
        likes: 317,
        comments: 72,
        isPinned: false,
        time: "2d ago",
    },
];

const TRENDING_TAGS = ["minimalism", "capsule", "AI", "tonal", "spring", "styling", "2026trends"];

export default function CommunityPage() {
    const [search, setSearch] = useState("");
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

    const filtered = MOCK_POSTS.filter(
        (post) =>
            post.title.toLowerCase().includes(search.toLowerCase()) ||
            post.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );

    function toggleLike(id: string) {
        setLikedPosts((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-4xl font-light">Community</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Discover fashion insights, tips, and conversations.
                        </p>
                    </div>
                    <Button>
                        <Plus size={15} className="mr-2" />
                        New post
                    </Button>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
                    {/* Feed */}
                    <div className="space-y-5">
                        {/* Search */}
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search posts or tags..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {filtered.map((post, i) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <Card className="hover:border-accent/30 transition-all">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-9 w-9 flex-shrink-0">
                                                <AvatarImage src={post.avatar ?? undefined} />
                                                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                                    {post.initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium truncate">{post.author}</p>
                                                    {post.isPinned && (
                                                        <Pin size={12} className="text-accent flex-shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                                        {post.role}
                                                    </Badge>
                                                    <span className="text-[11px] text-muted-foreground">{post.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <h3
                                            className="font-medium text-lg leading-snug"
                                            style={{ fontFamily: "Cormorant Garamond, serif" }}
                                        >
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                            {post.content}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {post.tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="text-[10px] cursor-pointer hover:bg-accent/10"
                                                    onClick={() => setSearch(tag)}
                                                >
                                                    #{tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 pt-1 border-t border-border">
                                            <button
                                                onClick={() => toggleLike(post.id)}
                                                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                <Heart
                                                    size={14}
                                                    className={likedPosts.has(post.id) ? "fill-destructive text-destructive" : ""}
                                                />
                                                {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                                            </button>
                                            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                                <MessageCircle size={14} />
                                                {post.comments}
                                            </button>
                                            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
                                                <Share2 size={14} />
                                                Share
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sidebar — trending */}
                    <aside className="space-y-5">
                        <Card>
                            <CardHeader className="pb-3">
                                <h3 className="text-sm font-medium">Trending topics</h3>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {TRENDING_TAGS.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-xs"
                                        onClick={() => setSearch(tag)}
                                    >
                                        #{tag}
                                    </Badge>
                                ))}
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </div>
        </DashboardLayout>
    );
}
