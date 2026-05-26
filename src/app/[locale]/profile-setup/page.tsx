"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { updateUser } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, ChevronRight, ChevronLeft, Check, Sparkles, Loader2 } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import type { OccasionTag } from "@/types";
import { useRef } from "react";

const STYLE_OPTIONS: OccasionTag[] = ["casual", "formal", "business", "sporty", "evening", "beach"];

export default function ProfileSetupPage() {
    const t = useTranslations("profileSetup");
    const { vestoUser, firebaseUser, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [displayName, setDisplayName] = useState("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [gender, setGender] = useState("");
    const [birthYear, setBirthYear] = useState("");
    const [stylePreferences, setStylePreferences] = useState<OccasionTag[]>([]);
    const [city, setCity] = useState("Bursa");

    useEffect(() => {
        if (!authLoading && !firebaseUser) {
            router.replace("/login");
        }
        if (vestoUser) {
            setDisplayName(vestoUser.displayName || "");
            if (vestoUser.profileSetupCompleted && step === 1) {
                router.replace("/dashboard");
            }
        }
        
        // Restore step from localStorage
        const savedStep = localStorage.getItem("profile_setup_step");
        if (savedStep) setStep(parseInt(savedStep));
    }, [authLoading, firebaseUser, vestoUser, router]);

    const saveStep = async (s: number) => {
        if (s > step) {
            // Moving forward
            if (step === 1 && photoFile && firebaseUser) {
                setIsSubmitting(true);
                try {
                    const storageRef = ref(storage, `users/${firebaseUser.uid}/avatar.jpg`);
                    await uploadBytes(storageRef, photoFile);
                    const photoUrl = await getDownloadURL(storageRef);
                    await updateUser(firebaseUser.uid, { photoUrl, photoURL: photoUrl });
                } catch (error) {
                    console.error("Upload error:", error);
                } finally {
                    setIsSubmitting(false);
                }
            }
        }
        setStep(s);
        localStorage.setItem("profile_setup_step", s.toString());
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            return;
        }
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
    };

    const toggleStyle = (style: OccasionTag) => {
        setStylePreferences(prev => 
            prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
        );
    };

    const handleFinish = async () => {
        if (!firebaseUser) return;
        setIsSubmitting(true);
        try {
            await updateUser(firebaseUser.uid, {
                displayName,
                gender,
                birthYear: birthYear ? parseInt(birthYear) : undefined,
                stylePreferences,
                location: city,
                profileSetupCompleted: true
            });
            localStorage.removeItem("profile_setup_step");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || !firebaseUser) return null;

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Avatar className="h-24 w-24 border-2 border-border group-hover:border-primary transition-colors">
                                    <AvatarImage src={photoPreview || firebaseUser.photoURL || undefined} />
                                    <AvatarFallback className="text-2xl bg-accent text-accent-foreground">
                                        {displayName[0] || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg">
                                    <Camera size={14} />
                                </div>
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                            <p className="text-xs text-muted-foreground">{t("step1.uploadAvatar")}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="displayName">{t("step1.title")}</Label>
                            <Input 
                                id="displayName" 
                                value={displayName} 
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder={t("step1.displayNamePlaceholder")}
                            />
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t("step2.genderLabel")}</Label>
                                <div className="flex gap-2">
                                    {["female", "male", "other"].map((g) => (
                                        <Button
                                            key={g}
                                            variant={gender === g ? "default" : "outline"}
                                            onClick={() => setGender(g)}
                                            className="flex-1 capitalize text-xs"
                                        >
                                            {g}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="birthYear">{t("step2.birthYearLabel")}</Label>
                                <Input 
                                    id="birthYear" 
                                    type="number" 
                                    value={birthYear} 
                                    onChange={(e) => setBirthYear(e.target.value)}
                                    placeholder="1995"
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                        <p className="text-xs text-muted-foreground">{t("step3.subtitle")}</p>
                        <div className="grid grid-cols-2 gap-2">
                            {STYLE_OPTIONS.map((style) => (
                                <button
                                    key={style}
                                    onClick={() => toggleStyle(style)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                                        stylePreferences.includes(style)
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-border text-muted-foreground hover:border-foreground/20"
                                    }`}
                                >
                                    <span className="capitalize">{style}</span>
                                    {stylePreferences.includes(style) && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="city">{t("step4.cityLabel")}</Label>
                            <Input 
                                id="city" 
                                value={city} 
                                onChange={(e) => setCity(e.target.value)}
                                placeholder={t("step4.cityPlaceholder")}
                            />
                        </div>
                        <div className="rounded-xl bg-accent/5 border border-accent/20 p-4 flex gap-3 items-start">
                            <Sparkles className="text-accent shrink-0" size={18} />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Konumun, sana en uygun günlük kombin önerilerini sunmamız için hava durumu verilerini çekmemizi sağlar.
                            </p>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="w-full max-w-[480px] space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-light tracking-tight text-foreground" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                        Vesto
                    </h2>
                    <div className="flex justify-center gap-1.5">
                        {[1, 2, 3, 4].map((s) => (
                            <div 
                                key={s} 
                                className={`h-1 rounded-full transition-all ${s <= step ? "w-8 bg-primary" : "w-2 bg-border"}`} 
                            />
                        ))}
                    </div>
                </div>

                <Card className="border-border/60 shadow-xl shadow-black/5 backdrop-blur-sm bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-xl font-medium tracking-tight">
                            {t(`step${step}.title` as any)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="min-h-[280px]">
                        <AnimatePresence mode="wait">
                            {renderStep()}
                        </AnimatePresence>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t border-border/40 pt-6">
                        <Button
                            variant="ghost"
                            onClick={() => saveStep(step - 1)}
                            disabled={step === 1 || isSubmitting}
                            className="gap-2"
                        >
                            <ChevronLeft size={16} />
                            {t("backButton")}
                        </Button>
                        
                        {step < 4 ? (
                            <Button
                                onClick={() => saveStep(step + 1)}
                                className="gap-2 px-8"
                                disabled={isSubmitting || (step === 1 && !displayName.trim())}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (
                                    <>
                                        {t("nextButton")}
                                        <ChevronRight size={16} />
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleFinish}
                                className="gap-2 px-8 bg-primary hover:bg-primary/90"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "..." : t("finishButton")}
                                <Check size={16} />
                            </Button>
                        )}
                    </CardFooter>
                </Card>
                
                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                    Step {step} of 4
                </p>
            </div>
        </div>
    );
}
