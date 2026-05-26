"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile, setWardrobePublic } from "@/lib/firebase/profileService";
import { Globe, Palette, User, Bell, Sun, Moon, Loader2, Camera, ShieldAlert, Check } from "lucide-react";
import type { Locale } from "@/i18n/routing";

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                checked ? "bg-accent" : "bg-muted"
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

export default function SettingsPage() {
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const locale = useLocale() as Locale;
    const router = useRouter();
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const { vestoUser, loading: authLoading } = useAuth();

    // Profile States
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [wardrobePublic, setWardrobePublicState] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (vestoUser) {
            setDisplayName(vestoUser.displayName || "");
            setUsername(vestoUser.username || "");
            setBio(vestoUser.bio || "");
            setPhotoPreview(vestoUser.photoURL || vestoUser.photoUrl || null);
            setWardrobePublicState(vestoUser.wardrobePublic || false);
        }
    }, [vestoUser]);

    function switchLocale(newLocale: Locale) {
        router.replace(pathname, { locale: newLocale });
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    }

    async function handleSaveProfile(e: React.FormEvent) {
        e.preventDefault();
        if (!vestoUser) return;

        setIsSaving(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            await updateProfile({
                uid: vestoUser.uid,
                displayName: displayName.trim(),
                bio: bio.trim(),
                username: username.trim() || undefined,
                photoFile,
            });
            setSuccessMsg(t("profile.success"));
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (error: any) {
            console.error("Save profile error:", error);
            if (error.message === "USERNAME_TAKEN") {
                setErrorMsg(t("profile.errorTaken"));
            } else {
                setErrorMsg(t("profile.errorGeneric"));
            }
        } finally {
            setIsSaving(false);
        }
    }

    async function handleToggleWardrobePublic(val: boolean) {
        if (!vestoUser) return;
        setWardrobePublicState(val);
        try {
            await setWardrobePublic(vestoUser.uid, val);
            setSuccessMsg(locale === "tr" ? "Gardırop görünürlüğü güncellendi!" : "Wardrobe visibility updated!");
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (error) {
            console.error("Error setting wardrobe public:", error);
            setErrorMsg(locale === "tr" ? "Güncellenirken bir hata oluştu" : "An error occurred during update");
            setTimeout(() => setErrorMsg(null), 3000);
        }
    }

    if (authLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 max-w-2xl">
                    <Loader2 className="animate-spin text-muted-foreground" size={24} />
                </div>
            </DashboardLayout>
        );
    }

    if (!vestoUser) return null;

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-2xl">
                {/* Toast alerts */}
                {successMsg && (
                    <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400 px-4 py-3 text-sm shadow-lg flex items-center gap-2">
                        <Check size={16} />
                        {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive px-4 py-3 text-sm shadow-lg flex items-center gap-2">
                        <ShieldAlert size={16} />
                        {errorMsg}
                    </div>
                )}

                <div>
                    <h1 className="text-4xl font-light tracking-tight text-foreground" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                        {t("title")}
                    </h1>
                </div>

                {/* Language */}
                <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                            <Globe size={15} className="text-accent" />
                            {t("language.heading")}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{t("language.description")}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            {(["tr", "en"] as Locale[]).map((loc) => (
                                <button
                                    key={loc}
                                    onClick={() => switchLocale(loc)}
                                    className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all duration-200 active:scale-95 ${
                                        locale === loc
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                                    }`}
                                >
                                    <span className="text-base">{loc === "tr" ? "🇹🇷" : "🇬🇧"}</span>
                                    {loc === "tr" ? t("language.turkish") : t("language.english")}
                                </button>
                            ))}
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                            {t("language.current")} <span className="font-medium text-foreground">{locale === "tr" ? t("language.turkish") : t("language.english")}</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                            <Palette size={15} className="text-accent" />
                            {t("appearance.heading")}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{t("appearance.description")}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                            <div>
                                <p className="text-sm font-medium">{t("appearance.darkMode")}</p>
                                <p className="text-xs text-muted-foreground">{t("appearance.darkModeDesc")}</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-95"
                                aria-label={t("appearance.darkMode")}
                            >
                                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Edit */}
                <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                            <User size={15} className="text-accent" />
                            {t("profile.heading")}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{t("profile.description")}</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            {/* Avatar section */}
                            <div className="flex flex-col items-center gap-4 sm:flex-row">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative h-20 w-20 rounded-full border border-border bg-muted flex items-center justify-center cursor-pointer group overflow-hidden"
                                >
                                    <input 
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {photoPreview ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={photoPreview} alt="" className="h-full w-full object-cover group-hover:opacity-40 transition-opacity" />
                                    ) : (
                                        <span className="text-xl font-bold uppercase text-muted-foreground">
                                            {displayName ? displayName[0] : "?"}
                                        </span>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={18} className="text-white" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{locale === "tr" ? "Profil Fotoğrafı" : "Profile Photo"}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {locale === "tr" ? "Değiştirmek için fotoğrafa tıklayın" : "Click image to change"}
                                    </p>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="display-name">{t("profile.displayName")}</Label>
                                    <Input
                                        id="display-name"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="username">{t("profile.username")}</Label>
                                    <Input
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="username"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="bio">{t("profile.bio")}</Label>
                                        <span className={`text-[10px] ${bio.length > 150 ? "text-destructive" : "text-muted-foreground"}`}>
                                            {bio.length}/150
                                        </span>
                                    </div>
                                    <textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value.slice(0, 150))}
                                        placeholder={t("profile.bioPlaceholder")}
                                        rows={3}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={isSaving || bio.length > 150} className="w-full sm:w-auto min-w-[120px]">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : t("profile.save")}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Privacy settings */}
                <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                            <User size={15} className="text-accent" />
                            {t("profile.privacyHeading")}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{t("profile.privacyDesc")}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                            <div className="mr-4">
                                <p className="text-sm font-medium">{t("profile.shareWardrobe")}</p>
                                <p className="text-xs text-muted-foreground">{t("profile.shareWardrobeDesc")}</p>
                            </div>
                            <Toggle checked={wardrobePublic} onChange={handleToggleWardrobePublic} />
                        </div>
                        <div className="text-right">
                            <Link href="/dashboard/wardrobe" className="text-xs text-accent hover:underline inline-flex items-center font-medium">
                                {t("profile.perItemLink")} →
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="opacity-40 border-border bg-card">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                            <Bell size={15} className="text-muted-foreground" />
                            {t("notifications.heading")}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{t("notifications.description")}</p>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground border border-dashed border-border rounded-lg px-4 py-3 text-center">
                            {t("notifications.comingSoon")}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
