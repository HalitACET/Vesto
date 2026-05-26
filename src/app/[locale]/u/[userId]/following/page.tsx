"use client";

import { useEffect, useState, use } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, UserX } from "lucide-react";
import { getFollowing } from "@/lib/firebase/followService";
import type { VestoUser } from "@/types";
import Link from "next/link";

export default function FollowingPage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = use(params);
    const locale = useLocale();
    const router = useRouter();

    const [users, setUsers] = useState<VestoUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFollowing(userId)
            .then(setUsers)
            .finally(() => setLoading(false));
    }, [userId]);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group mb-6"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    {locale === "tr" ? "Geri" : "Back"}
                </button>

                <h1 className="text-xl font-semibold text-foreground mb-6">
                    {locale === "tr" ? "Takip Edilenler" : "Following"}
                </h1>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="animate-spin text-muted-foreground" size={24} />
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                        <UserX size={36} className="text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            {locale === "tr" ? "Henüz kimse takip edilmiyor." : "Not following anyone yet."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {users.map((user) => {
                            const initials = user.displayName
                                ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                                : "K";
                            return (
                                <Link
                                    key={user.uid}
                                    href={`/u/${user.uid}`}
                                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-accent/5 transition-colors"
                                >
                                    <Avatar className="h-11 w-11 border border-border flex-shrink-0">
                                        <AvatarImage src={user.photoURL ?? user.photoUrl ?? undefined} />
                                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-foreground truncate">
                                            {user.displayName}
                                        </p>
                                        {user.username && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                @{user.username}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
