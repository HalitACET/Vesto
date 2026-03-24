"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, CloudSun, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Sparkles,
    title: "AI Wardrobe Analysis",
    description:
      "Computer Vision automatically detects colors, patterns, and categories from your clothing photos.",
  },
  {
    icon: CloudSun,
    title: "Weather-Smart Outfits",
    description:
      "Get daily outfit suggestions tailored to your local weather and your personal style preferences.",
  },
  {
    icon: Users,
    title: "Stylist Community",
    description:
      "Connect with certified stylists who craft personalized looks directly from your wardrobe inventory.",
  },
  {
    icon: Zap,
    title: "Stylist Canvas",
    description:
      "Drag-and-drop outfit builder that lets you — or your stylist — mix and match pieces visually.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.08 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.08 0 0) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl"
        >
          <motion.div custom={0} variants={fadeUp}>
            <Badge
              variant="outline"
              className="mb-8 gap-1.5 border-accent/40 text-accent px-4 py-1.5 text-xs tracking-widest uppercase"
            >
              <Sparkles size={10} />
              AI-Powered Fashion Platform
            </Badge>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="mb-6 text-6xl font-light leading-[1.05] tracking-tight md:text-8xl"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Your wardrobe,{" "}
            <span className="text-gradient-gold italic">reimagined</span>
            <br />
            by artificial intelligence.
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="mb-10 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Digitize every piece in your closet. Let AI analyze your style,
            suggest weather-perfect outfits, and connect you with professional
            stylists — all in one elegant platform.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/register">
                Start for free
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="h-12 px-8 text-base"
            >
              <Link href="/dashboard">View demo</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Gradient bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-screen-xl px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <h2 className="mb-4 text-4xl font-light md:text-5xl">
            Fashion intelligence,
            <br />
            <span className="text-gradient-gold italic">built for you.</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            From your closet to curated looks — Vesto handles every step with
            precision and elegance.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group rounded-2xl border border-border bg-card p-8 hover:border-accent/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Icon size={20} />
                </div>
                <h3
                  className="mb-3 text-xl font-medium"
                  style={{ fontFamily: "Cormorant Garamond, serif" }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-screen-xl px-6 py-28 text-center">
          <h2
            className="mb-6 text-5xl font-light md:text-6xl"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Begin your{" "}
            <span className="italic opacity-70">digital wardrobe</span> today.
          </h2>
          <p className="mb-10 text-primary-foreground/60 text-lg max-w-xl mx-auto">
            Join thousands of fashion-forward individuals who let Vesto manage
            their style.
          </p>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="h-12 px-10 text-base border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          >
            <Link href="/register">
              Create your account
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between text-sm text-muted-foreground">
          <p>© 2026 Vesto AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
