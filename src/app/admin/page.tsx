"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CheckCircle,
    XCircle,
    Search,
    Users,
    Shirt,
    Sparkles,
    ShieldCheck,
    Flag,
} from "lucide-react";
import { motion } from "framer-motion";

// Mock data
const MOCK_USERS = [
    { uid: "u1", name: "Sophie Laurent", email: "sophie@example.com", role: "stylist", wardrobeCount: 94, outfitCount: 47 },
    { uid: "u2", name: "Marcus Chen", email: "marcus@example.com", role: "user", wardrobeCount: 34, outfitCount: 12 },
    { uid: "u3", name: "Amara Osei", email: "amara@example.com", role: "user", wardrobeCount: 67, outfitCount: 28 },
    { uid: "u4", name: "Elena Volkov", email: "elena@example.com", role: "stylist", wardrobeCount: 112, outfitCount: 83 },
    { uid: "u5", name: "James Park", email: "james@example.com", role: "user", wardrobeCount: 21, outfitCount: 5 },
];

const MOCK_AI_QUEUE = [
    { id: "ai1", user: "Marcus Chen", imageUrl: "", tags: ["tops", "white", "linen", "casual"], confidence: 94 },
    { id: "ai2", user: "Amara Osei", imageUrl: "", tags: ["outerwear", "beige", "trench", "formal"], confidence: 87 },
    { id: "ai3", user: "James Park", imageUrl: "", tags: ["shoes", "black", "oxford", "leather"], confidence: 91 },
];

const MOCK_FLAGGED_POSTS = [
    { id: "p1", author: "Anonymous", title: "Selling branded items — best prices!", reason: "Spam / commercial", time: "3h ago" },
    { id: "p2", author: "User123", title: "Is this design stolen from Zara?", reason: "IP concern", time: "1d ago" },
];

export default function AdminPage() {
    const [userSearch, setUserSearch] = useState("");
    const [approvedItems, setApprovedItems] = useState<Set<string>>(new Set());
    const [rejectedItems, setRejectedItems] = useState<Set<string>>(new Set());

    const filteredUsers = MOCK_USERS.filter(
        (u) =>
            u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    const stats = [
        { label: "Total Users", value: MOCK_USERS.length, icon: Users },
        { label: "AI Tag Queue", value: MOCK_AI_QUEUE.length, icon: Sparkles },
        { label: "Flagged Posts", value: MOCK_FLAGGED_POSTS.length, icon: Flag },
        { label: "Total Items", value: MOCK_USERS.reduce((s, u) => s + u.wardrobeCount, 0), icon: Shirt },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <ShieldCheck size={24} className="text-accent" />
                    <div>
                        <h1 className="text-4xl font-light">Admin Panel</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Platform management &amp; AI validation
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                            >
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-xs text-muted-foreground font-normal uppercase tracking-wide">
                                            {stat.label}
                                        </CardTitle>
                                        <Icon size={15} className="text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <span className="text-3xl font-light">{stat.value}</span>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="users">
                    <TabsList>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="ai-tags">AI Tag Validation</TabsTrigger>
                        <TabsTrigger value="moderation">Forum Moderation</TabsTrigger>
                    </TabsList>

                    {/* ── Users tab ── */}
                    <TabsContent value="users" className="mt-6">
                        <div className="space-y-4">
                            <div className="relative max-w-sm">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="pl-9 text-sm"
                                />
                            </div>
                            <div className="rounded-xl border border-border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wide">
                                        <tr>
                                            <th className="text-left px-5 py-3">User</th>
                                            <th className="text-left px-5 py-3">Role</th>
                                            <th className="text-right px-5 py-3">Items</th>
                                            <th className="text-right px-5 py-3">Outfits</th>
                                            <th className="px-5 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.uid} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                                                {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{user.name}</p>
                                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <Badge
                                                        variant={user.role === "stylist" ? "default" : "secondary"}
                                                        className="capitalize text-xs"
                                                    >
                                                        {user.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-5 py-3 text-right">{user.wardrobeCount}</td>
                                                <td className="px-5 py-3 text-right">{user.outfitCount}</td>
                                                <td className="px-5 py-3 text-right">
                                                    <Button variant="ghost" size="sm" className="text-xs">
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ── AI Tag Validation tab ── */}
                    <TabsContent value="ai-tags" className="mt-6">
                        <div className="space-y-4">
                            {MOCK_AI_QUEUE.map((qi) => {
                                const approved = approvedItems.has(qi.id);
                                const rejected = rejectedItems.has(qi.id);
                                return (
                                    <Card
                                        key={qi.id}
                                        className={`transition-all ${approved ? "border-green-500/30 bg-green-50/5" : rejected ? "border-destructive/30 bg-destructive/5" : ""}`}
                                    >
                                        <CardContent className="flex items-center gap-5 py-5">
                                            <div className="h-16 w-16 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                                                <Shirt size={24} className="text-muted-foreground/40" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium">{qi.user}</p>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {qi.tags.map((tag) => (
                                                        <Badge key={tag} variant="secondary" className="text-[10px] capitalize">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1.5">
                                                    AI confidence: <span className="font-medium text-accent">{qi.confidence}%</span>
                                                </p>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                {!approved && !rejected ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-green-500/40 text-green-600 hover:bg-green-50/10 gap-1"
                                                            onClick={() => setApprovedItems((p) => new Set([...p, qi.id]))}
                                                        >
                                                            <CheckCircle size={13} />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-destructive/40 text-destructive hover:bg-destructive/5 gap-1"
                                                            onClick={() => setRejectedItems((p) => new Set([...p, qi.id]))}
                                                        >
                                                            <XCircle size={13} />
                                                            Reject
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Badge className={approved ? "bg-green-500/20 text-green-600 border-0" : "bg-destructive/20 text-destructive border-0"}>
                                                        {approved ? "Approved" : "Rejected"}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* ── Moderation tab ── */}
                    <TabsContent value="moderation" className="mt-6">
                        <div className="space-y-4">
                            {MOCK_FLAGGED_POSTS.map((post) => (
                                <Card key={post.id} className="border-amber-500/20">
                                    <CardContent className="flex items-start justify-between gap-4 py-5">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Flag size={13} className="text-amber-500" />
                                                <Badge variant="outline" className="border-amber-500/30 text-amber-600 text-[10px]">
                                                    {post.reason}
                                                </Badge>
                                            </div>
                                            <p className="font-medium text-sm">{post.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {post.author} · {post.time}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Button size="sm" variant="outline" className="text-xs">
                                                Remove
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-xs">
                                                Dismiss
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
