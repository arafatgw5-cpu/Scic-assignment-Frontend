"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  motion,
  Variants,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  ChevronDown,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  FileText,
  BarChart3,
  Briefcase,
  Bot,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Shared Parallax Context: Optimized for 60FPS with will-change
// ---------------------------------------------------------------------------
function useParallax(depth: number, mouseX: any, mouseY: any) {
  const x = useTransform(mouseX, [0, 1], [depth, -depth]);
  const y = useTransform(mouseY, [0, 1], [depth, -depth]);
  const springX = useSpring(x, { stiffness: 50, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 50, damping: 20, mass: 0.5 });
  return { x: springX, y: springY };
}

// ---------------------------------------------------------------------------
// Magnetic CTA Wrapper with 3D Tilt Effect
// ---------------------------------------------------------------------------
function Magnetic({ children, strength = 20 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const sx = useSpring(x, springConfig);
  const sy = useSpring(y, springConfig);
  const sRotateX = useSpring(rotateX, springConfig);
  const sRotateY = useSpring(rotateY, springConfig);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(((e.clientX - centerX) / rect.width) * strength);
    y.set(((e.clientY - centerY) / rect.height) * strength);
    rotateX.set(((e.clientY - centerY) / rect.height) * -10);
    rotateY.set(((e.clientX - centerX) / rect.width) * 10);
  };
  
  const reset = () => {
    x.set(0); y.set(0); rotateX.set(0); rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy, rotateX: sRotateX, rotateY: sRotateY, willChange: "transform" }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Background Layer: Cinematic Aurora, Grid, and Premium Noise
// ---------------------------------------------------------------------------
function HeroBackground({ mouseX, mouseY, reduced }: { mouseX: any; mouseY: any; reduced: boolean }) {
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const glowX = useTransform(springX, [0, 1], ["20%", "80%"]);
  const glowY = useTransform(springY, [0, 1], ["10%", "60%"]);

  const blobA = useParallax(30, mouseX, mouseY);
  const blobB = useParallax(-40, mouseX, mouseY);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#030712] dark:bg-background">
      {/* Deep Radial Base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(var(--primary)/0.15),transparent_60%)]" />

      {/* Aurora Mesh Layers */}
      <div
        className="absolute -top-1/3 left-1/2 h-[900px] w-[1200px] -translate-x-1/2 rounded-full bg-[conic-gradient(from_120deg_at_50%_50%,hsl(var(--primary)/0.3),hsl(var(--accent)/0.2),transparent,hsl(var(--chart-4)/0.2),hsl(var(--primary)/0.3))] blur-[120px] opacity-70 mix-blend-screen"
        style={reduced ? undefined : { animation: "spin 25s linear infinite" }}
      />

      {/* Animated Grid with Soft Radial Mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_10%,#000_40%,transparent_100%)] opacity-[0.04] dark:opacity-[0.08]" />

      {/* Mouse-reactive Spotlight Glow */}
      <motion.div
        style={{ left: glowX, top: glowY, willChange: "transform" }}
        className="pointer-events-none absolute h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[130px] mix-blend-screen"
      />

      {/* Parallax Drifting Blobs */}
      <motion.div
        style={reduced ? undefined : { x: blobA.x, y: blobA.y, willChange: "transform" }}
        animate={reduced ? undefined : { scale: [1, 1.1, 0.9, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 left-[5%] h-[450px] w-[450px] rounded-full bg-gradient-to-br from-primary/30 via-primary/5 to-transparent blur-[90px]"
      />
      <motion.div
        style={reduced ? undefined : { x: blobB.x, y: blobB.y, willChange: "transform" }}
        animate={reduced ? undefined : { scale: [1, 0.9, 1.1, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-10 right-[2%] h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-accent/30 via-accent/5 to-transparent blur-[90px]"
      />

      {/* Depth-of-field Fog */}
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-background via-background/80 to-transparent" />

      {/* Cinematic Noise Texture Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-overlay dark:opacity-[0.15]" 
        style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Floating Glassmorphism Cards: Ultra-Premium Look
// ---------------------------------------------------------------------------
function FloatingCards({ mouseX, mouseY }: { mouseX: any; mouseY: any }) {
  const near = useParallax(50, mouseX, mouseY);
  const mid = useParallax(30, mouseX, mouseY);
  const far = useParallax(15, mouseX, mouseY);

  const cardBase = "hidden lg:flex absolute rounded-2xl border border-white/10 bg-white/5 dark:bg-black/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] ring-1 ring-white/5 hover:bg-white/10 transition-colors duration-500 overflow-hidden";

  return (
    <>
      {/* ATS Match Score */}
      <motion.div
        style={{ x: near.x, y: near.y, willChange: "transform" }}
        initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 1, delay: 0.5, type: "spring" }}
        className={`${cardBase} top-[12%] left-[5%] w-56 flex-col gap-3 p-5`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ATS Score</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20">
              <CheckCircle className="h-3 w-3 text-accent" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <div className="text-3xl font-extrabold text-foreground">94</div>
            <div className="text-sm font-medium text-muted-foreground">%</div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "94%" }}
              transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
              className="relative h-full rounded-full bg-gradient-to-r from-primary to-accent"
            >
              <div className="absolute inset-0 w-full animate-[shimmer_2s_infinite] bg-white/20" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* AI Coach Suggestion */}
      <motion.div
        style={{ x: mid.x, y: mid.y, willChange: "transform" }}
        initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, delay: 0.8, type: "spring" }}
        className={`${cardBase} top-[18%] right-[6%] w-64 items-start gap-3 p-4`}
      >
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="flex items-start gap-3 relative">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
            <Bot className="h-4 w-4 text-primary" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-background" />
          </div>
          <div className="pt-0.5 text-xs leading-relaxed text-foreground/80">
            "I rewrote your summary to highlight your <strong className="text-foreground">35% growth</strong> metric."
          </div>
        </motion.div>
      </motion.div>

      {/* Analytics Graph */}
      <motion.div
        style={{ x: far.x, y: far.y, willChange: "transform" }}
        initial={{ opacity: 0, x: -30, filter: "blur(10px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, delay: 1.1, type: "spring" }}
        className={`${cardBase} bottom-[15%] left-[8%] w-48 flex-col gap-3 p-4`}
      >
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="flex flex-col gap-3 relative">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-chart-4" /> Interviews</span>
          </div>
          <div className="flex h-12 items-end justify-between gap-1.5">
            {[40, 65, 50, 80, 95].map((h, i) => (
              <div key={i} className="group relative w-full flex items-end h-full">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.8, delay: 1.4 + i * 0.1, type: "spring" }}
                  className="w-full rounded-sm bg-gradient-to-t from-chart-4/80 to-chart-4/30 group-hover:to-chart-4/50 transition-colors"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(12px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 50, damping: 15 },
  },
};

// ---------------------------------------------------------------------------
// Main Hero Component
// ---------------------------------------------------------------------------
export default function Hero() {
  const reduced = useReducedMotion() ?? false;
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <section
      onMouseMove={reduced ? undefined : handleMouseMove}
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background pt-24 pb-32 perspective-1000"
    >
      <HeroBackground mouseX={mouseX} mouseY={mouseY} reduced={reduced} />
      {!reduced && <FloatingCards mouseX={mouseX} mouseY={mouseY} />}

      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerContainer}
        className="container relative z-10 mx-auto max-w-5xl px-4 text-center"
      >
        {/* Linear-Style Announcement Pill */}
        <motion.div variants={fadeInUp} className="mb-8 flex justify-center">
          <Link href="#updates">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex cursor-pointer items-center overflow-hidden rounded-full p-[1px]"
            >
              {/* Spinning Gradient Mask Border */}
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-50 transition-opacity group-hover:opacity-100 dark:bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,hsl(var(--primary))_50%,transparent_100%)]" />
              
              <span className="relative flex items-center gap-2 rounded-full bg-background/90 px-4 py-1.5 text-sm font-medium text-foreground backdrop-blur-xl transition-colors group-hover:bg-background/70">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>SkillPilot AI 2.0 is now live</span>
                <span className="h-4 w-px bg-border/50" />
                <span className="flex items-center text-primary group-hover:underline decoration-primary/50 underline-offset-4">
                  Read launch <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Cinematic Typography */}
        <motion.h1
          variants={fadeInUp}
          className="mx-auto mb-6 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tighter md:text-7xl lg:text-8xl"
        >
          Your AI Career Coach <br className="hidden md:block" />
          <span className="relative inline-block pb-2">
            <span className="absolute -inset-2 block rounded-full bg-primary/20 blur-2xl filter" />
            <span className="relative bg-gradient-to-r from-foreground via-primary/90 to-muted-foreground bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient-move_5s_ease_infinite]">
              & Resume Intelligence
            </span>
          </span>
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mx-auto mb-10 max-w-2xl text-lg font-light leading-relaxed text-muted-foreground md:text-xl"
        >
          Land your dream job with AI-generated resumes, personalized career recommendations, and an intelligent coaching assistant that guides your professional growth.
        </motion.p>

        {/* CTA Group with Premium Effects */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Magnetic strength={30}>
              <div className="relative group">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary to-accent opacity-40 blur transition duration-500 group-hover:opacity-75" />
                <Button
                  size="lg"
                  className="relative h-14 w-full overflow-hidden rounded-xl bg-foreground px-8 text-base font-semibold text-background transition-all hover:scale-[1.02] active:scale-95 sm:w-auto border-none shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] dark:bg-primary dark:text-primary-foreground"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                  <span className="relative z-10 flex items-center gap-2">
                    Start Building Free
                    <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </span>
                </Button>
              </div>
            </Magnetic>
          </Link>

          <Link href="/login" className="w-full sm:w-auto">
            <Magnetic strength={20}>
              <Button
                size="lg"
                variant="outline"
                className="h-14 w-full rounded-xl border-border/50 bg-background/30 px-8 text-base font-medium backdrop-blur-md transition-all hover:bg-muted/50 hover:border-border sm:w-auto"
              >
                Sign In
              </Button>
            </Magnetic>
          </Link>
        </motion.div>

        {/* Subtle scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="mt-20 flex justify-center text-muted-foreground/40"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}