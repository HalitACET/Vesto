"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signIn, signOut } from "@/lib/firebase/auth";
import { fetchUser } from "@/services/userService";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const user = await signIn(email, password);
            const userProfile = await fetchUser(user.uid);

            if (!userProfile) {
                await signOut();
                throw new Error("Kullanıcı profili bulunamadı.");
            }

            if (userProfile.role !== "stylist" && userProfile.role !== "admin") {
                await signOut();
                throw new Error("Yetkisiz Giriş: Sadece onaylı stilistler ve yöneticiler bu panele erişebilir.");
            }

            // Middleware için basit bir cookie bırakıyoruz (1 günlük)
            document.cookie = `vesto_auth=true; path=/; max-age=86400;`;
            document.cookie = `vesto_role=${userProfile.role}; path=/; max-age=86400;`;

            router.push("/dashboard");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Giriş başarısız oldu.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen">
            {/* Left — editorial image panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-obsidian relative overflow-hidden items-end p-14">
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background:
                            "radial-gradient(ellipse at 30% 50%, oklch(0.78 0.12 80 / 30%), transparent 60%), radial-gradient(ellipse at 80% 20%, oklch(0.65 0.14 70 / 20%), transparent 60%)",
                    }}
                />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-10">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                            <Sparkles size={15} className="text-obsidian" />
                        </div>
                        <span
                            className="text-white text-xl tracking-widest uppercase font-medium"
                            style={{ fontFamily: "Cormorant Garamond, serif" }}
                        >
                            Vesto
                        </span>
                    </div>
                    <blockquote
                        className="text-white/80 text-3xl font-light leading-snug max-w-sm"
                        style={{ fontFamily: "Cormorant Garamond, serif" }}
                    >
                        "Style is a way to say who you are without having to speak."
                    </blockquote>
                    <p className="mt-4 text-white/40 text-sm">— Rachel Zoe</p>
                </div>
            </div>

            {/* Right — form */}
            <div className="flex flex-1 items-center justify-center px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="mb-8 flex items-center gap-2 lg:hidden">
                        <Sparkles size={18} />
                        <span
                            className="text-xl tracking-widest uppercase font-medium"
                            style={{ fontFamily: "Cormorant Garamond, serif" }}
                        >
                            Vesto
                        </span>
                    </div>

                    <h1 className="mb-2 text-3xl font-light">Welcome back.</h1>
                    <p className="mb-8 text-muted-foreground text-sm">
                        Sign in to your Vesto account.
                    </p>

                    {error && (
                        <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <div className="relative mt-1.5">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-11" disabled={loading}>
                            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="text-foreground underline underline-offset-4 hover:text-accent transition-colors"
                        >
                            Create one
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
