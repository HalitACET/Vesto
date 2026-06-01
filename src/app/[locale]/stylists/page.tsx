"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getActiveStylists } from "@/lib/firebase/stylistService";
import { VestoUser } from "@/types";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import { Sparkles, Users, Loader2 } from "lucide-react";

export default function StylistsPage() {
    const { vestoUser } = useAuth();
    const router = useRouter();
    const [stylists, setStylists] = useState<VestoUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!vestoUser) return;
        getActiveStylists(vestoUser.uid).then(result => {
            setStylists(result as unknown as VestoUser[]);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load stylists:", err);
            setLoading(false);
        });
    }, [vestoUser]);

    if (!vestoUser) return null;

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-playfair font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="text-accent" />
                        Stilistler
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Topluluğumuzdaki aktif stilistleri keşfedin ve onlardan gardırobunuz için kombin önerileri alın.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="animate-spin text-muted-foreground" size={32} />
                    </div>
                ) : stylists.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Users size={48} className="text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-foreground">Henüz Aktif Stilist Yok</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                Topluluğumuzda şu an için aktif stilist bulunmuyor. Kendi stilist modunuzu ayarlardan açarak diğerlerine yardımcı olmaya başlayabilirsiniz!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {stylists.map(stylist => (
                            <Card key={stylist.uid} className="hover:border-accent transition-colors cursor-pointer" onClick={() => router.push(`/u/${stylist.uid}`)}>
                                <CardContent className="p-6 flex flex-col items-center text-center">
                                    <Avatar className="h-20 w-20 mb-4 border border-border">
                                        <AvatarImage src={stylist.photoURL ?? stylist.photoUrl ?? undefined} />
                                        <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                                            {stylist.displayName?.charAt(0).toUpperCase() || 'S'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-semibold text-foreground truncate w-full">
                                        {stylist.displayName}
                                    </h3>
                                    {stylist.username && (
                                        <p className="text-xs text-muted-foreground truncate w-full">@{stylist.username}</p>
                                    )}
                                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                        <span className="inline-flex items-center px-2 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                                            ✨ Stilist
                                        </span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-6"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/u/${stylist.uid}`);
                                        }}
                                    >
                                        Profili Gör
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
