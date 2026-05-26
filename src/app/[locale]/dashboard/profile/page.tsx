"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useWardrobe } from "@/hooks/useWardrobe";
import { useOutfits } from "@/hooks/useOutfits";
import { signOut } from "@/lib/firebase/auth";
import { setWardrobePublic } from "@/lib/firebase/profileService";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { User, Link as LinkIcon, Settings, LogOut, Shirt, Palette, MessageSquare, Users } from "lucide-react";
import type { Locale } from "@/i18n/routing";

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                checked ? "bg-primary" : "bg-muted"
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                    checked ? "translate-x-5" : "translate-x-0"
                }`}
            />
        </button>
    );
};

export default function ProfilePage() {
    const t = useTranslations("settings");
    const tSidebar = useTranslations("sidebar");
    const locale = useLocale() as Locale;
    const router = useRouter();
    const { vestoUser, loading: authLoading } = useAuth();
    
    const { items: wardrobeItems, loading: wardrobeLoading } = useWardrobe();
    const { outfits, loading: outfitsLoading } = useOutfits();
    
    const [postsCount, setPostsCount] = useState<number | null>(null);
    const [wardrobePublicState, setWardrobePublicState] = useState(false);
    const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

    useEffect(() => {
        if (vestoUser) {
            setWardrobePublicState(vestoUser.wardrobePublic || false);
            
            // Fetch User Forum Posts Count
            const fetchPostsCount = async () => {
                try {
                    const q = query(
                        collection(db, "forumPosts"),
                        where("authorId", "==", vestoUser.uid),
                        where("isArchived", "==", false)
                    );
                    const snap = await getDocs(q);
                    setPostsCount(snap.size);
                } catch (e) {
                    console.error("Error fetching posts count:", e);
                    setPostsCount(0);
                }
            };
            fetchPostsCount();
        }
    }, [vestoUser]);

    async function handleToggleWardrobePublic(val: boolean) {
        if (!vestoUser || isUpdatingPrivacy) return;
        setIsUpdatingPrivacy(true);
        setWardrobePublicState(val);
        try {
            await setWardrobePublic(vestoUser.uid, val);
        } catch (error) {
            console.error("Error updating wardrobe visibility:", error);
            setWardrobePublicState(!val); // Revert on error
        } finally {
            setIsUpdatingPrivacy(false);
        }
    }

    async function handleLogout() {
        try {
            await signOut();
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    if (authLoading || !vestoUser) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-2xl px-4 py-8">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="relative overflow-hidden border-border bg-card/60 backdrop-blur-sm shadow-sm">
                        {/* Edit Settings Button on Top Right */}
                        <div className="absolute right-4 top-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push("/dashboard/settings")}
                                className="text-muted-foreground hover:text-foreground rounded-full"
                            >
                                <Settings size={18} />
                            </Button>
                        </div>

                        <CardContent className="flex flex-col items-center pt-10 pb-8 text-center">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center">
                                    {vestoUser.photoURL || vestoUser.photoUrl ? (
                                        <img
                                            src={vestoUser.photoURL || vestoUser.photoUrl}
                                            alt={vestoUser.displayName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-3xl font-light text-muted-foreground uppercase">
                                            {vestoUser.displayName?.charAt(0) || "V"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Name & Handle */}
                            <h2 className="mt-4 text-2xl font-light tracking-tight text-foreground" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                                {vestoUser.displayName || "Kullanıcı"}
                            </h2>
                            {vestoUser.username && (
                                <p className="text-sm text-muted-foreground font-light mt-0.5">
                                    @{vestoUser.username}
                                </p>
                            )}

                            {/* Bio */}
                            {vestoUser.bio ? (
                                <p className="mt-3 max-w-sm text-sm text-muted-foreground font-light leading-relaxed">
                                    {vestoUser.bio}
                                </p>
                            ) : (
                                <p className="mt-3 text-xs text-muted-foreground/50 italic font-light">
                                    {locale === "tr" ? "Henüz bir biyografi yazılmadı." : "No biography written yet."}
                                </p>
                            )}

                            {/* Divider */}
                            <div className="my-8 w-full border-t border-border/60" />

                            {/* Stats Grid */}
                            <div className="grid w-full grid-cols-5 gap-2 text-center">
                                <div className="flex flex-col items-center">
                                    <span className="text-lg font-medium text-foreground">
                                        {wardrobeLoading ? "..." : wardrobeItems.length}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-light">
                                        {locale === "tr" ? "Kıyafet" : "Clothes"}
                                    </span>
                                </div>

                                <div className="border-l border-border/60 h-8 self-center" />

                                <div className="flex flex-col items-center">
                                    <span className="text-lg font-medium text-foreground">
                                        {outfitsLoading ? "..." : outfits.length}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-light">
                                        {locale === "tr" ? "Kombin" : "Outfits"}
                                    </span>
                                </div>

                                <div className="border-l border-border/60 h-8 self-center" />

                                <div className="flex flex-col items-center">
                                    <span className="text-lg font-medium text-foreground">
                                        {postsCount === null ? "..." : postsCount}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-light">
                                        {locale === "tr" ? "Paylaşım" : "Posts"}
                                    </span>
                                </div>

                                <div className="border-l border-border/60 h-8 self-center" />

                                <Link href={`/u/${vestoUser.uid}/followers`} className="flex flex-col items-center hover:opacity-80 transition-opacity">
                                    <span className="text-lg font-medium text-foreground">
                                        {vestoUser.followerCount ?? 0}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-light">
                                        {locale === "tr" ? "Takipçi" : "Followers"}
                                    </span>
                                </Link>

                                <div className="border-l border-border/60 h-8 self-center" />

                                <Link href={`/u/${vestoUser.uid}/following`} className="flex flex-col items-center hover:opacity-80 transition-opacity">
                                    <span className="text-lg font-medium text-foreground">
                                        {vestoUser.followingCount ?? 0}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-light">
                                        {locale === "tr" ? "Takip" : "Following"}
                                    </span>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Privacy Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mt-6"
                >
                    <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                {locale === "tr" ? "GİZLİLİK" : "PRIVACY"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        {locale === "tr" ? "Gardırobumu Paylaş" : "Share My Wardrobe"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5 font-light">
                                        {locale === "tr" 
                                            ? "Açıksa tüm kıyafetlerin herkes tarafından görülebilir" 
                                            : "If enabled, all your wardrobe items will be visible to everyone"}
                                    </p>
                                </div>
                                <Toggle
                                    checked={wardrobePublicState}
                                    onChange={handleToggleWardrobePublic}
                                />
                            </div>

                            <div className="pt-2">
                                <Link
                                    href="/dashboard/wardrobe"
                                    className="text-xs text-muted-foreground hover:text-foreground underline decoration-dotted font-light"
                                >
                                    {locale === "tr" 
                                        ? "Her kıyafet için ayrı ayrı da ayarlayabilirsin →" 
                                        : "You can also configure this individually for each item →"}
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Links & Actions Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mt-6"
                >
                    <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
                        <CardContent className="p-0 divide-y divide-border/60">
                            {/* Public Profile Link */}
                            <Link
                                href={`/u/${vestoUser.uid}`}
                                className="flex items-center justify-between px-6 py-4 hover:bg-muted/40 transition-colors group"
                            >
                                <span className="text-sm font-medium text-foreground flex items-center gap-3">
                                    <LinkIcon size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                                    {locale === "tr" ? "Kamuya Açık Profilini Gör" : "View Public Profile"}
                                </span>
                                <span className="text-xs text-muted-foreground group-hover:translate-x-0.5 transition-transform">→</span>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Log Out */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="mt-8 flex justify-center"
                >
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full max-w-sm border-border bg-card hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-muted-foreground font-light py-6 rounded-xl transition-all"
                    >
                        <LogOut size={16} className="mr-2" />
                        {locale === "tr" ? "ÇIKIŞ YAP" : "LOG OUT"}
                    </Button>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
