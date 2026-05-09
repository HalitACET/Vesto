"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { Globe, Palette, User, Bell, Sun, Moon } from "lucide-react";
import type { Locale } from "@/i18n/routing";

export default function SettingsPage() {
    const t = useTranslations("settings");
    const locale = useLocale() as Locale;
    const router = useRouter();
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    function switchLocale(newLocale: Locale) {
        router.replace(pathname, { locale: newLocale });
    }

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-2xl">
                <div>
                    <h1 className="text-4xl font-light">{t("title")}</h1>
                </div>

                {/* Language */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
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
                                    className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm transition-all ${
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
                            {t("language.current")} <span className="font-medium">{locale === "tr" ? t("language.turkish") : t("language.english")}</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Palette size={15} className="text-accent" />
                            {t("appearance.heading")}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{t("appearance.description")}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                            <div>
                                <p className="text-sm font-medium">{t("appearance.darkMode")}</p>
                                <p className="text-xs text-muted-foreground">{t("appearance.darkModeDesc")}</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                aria-label={t("appearance.darkMode")}
                            >
                                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile */}
                <Card className="opacity-60">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <User size={15} className="text-muted-foreground" />
                            {t("profile.heading")}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{t("profile.description")}</p>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground border border-dashed border-border rounded-lg px-4 py-3 text-center">
                            {t("profile.comingSoon")}
                        </p>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="opacity-60">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
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
