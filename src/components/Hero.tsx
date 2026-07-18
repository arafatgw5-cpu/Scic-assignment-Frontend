"use client";

import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  motion,
  Variants,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  MotionValue,
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
} from "lucide-react";

// ---------------------------------------------------------------------------
// Shared parallax context — a single mouse position drives every depth layer.
// Each layer subscribes with its own `depth` factor for true 3D parallax.
// ---------------------------------------------------------------------------
function useParallax(
  depth: number,
  mouseX: MotionValue<number>,
  mouseY: MotionValue<number>
) {
  const x = useTransform(mouseX, [0, 1], [depth, -depth]);
  const y = useTransform(mouseY, [0, 1], [depth, -depth]);
  const springX = useSpring(x, { stiffness: 60, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 60, damping: 20, mass: 0.4 });
  return { x: springX, y: springY };
}

// ---------------------------------------------------------------------------
// Cinematic animated background: aurora mesh, animated grid, mouse spotlight,
// drifting blobs, shooting stars, sparkles, and glowing orbs — all pure CSS/SVG
// so there are no image assets to break in dark/light mode or on slow networks.
// ---------------------------------------------------------------------------
function HeroBackground({
  mouseX,
  mouseY,
  reduced,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  reduced: boolean;
}) {
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const glowX = useTransform(springX, [0, 1], ["15%", "85%"]);
  const glowY = useTransform(springY, [0, 1], ["5%", "70%"]);

  const blobA = useParallax(24, mouseX, mouseY);
  const blobB = useParallax(-30, mouseX, mouseY);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* deep radial base — the "cinematic lighting" backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(var(--primary)/0.18),transparent_60%)]" />

      {/* aurora mesh layers */}
      <div
        aria-hidden
        className="absolute -top-1/3 left-1/2 h-[900px] w-[1200px] -translate-x-1/2 rounded-full bg-[conic-gradient(from_120deg_at_50%_50%,hsl(var(--primary)/0.35),hsl(var(--accent)/0.25),transparent,hsl(var(--chart-4)/0.3),hsl(var(--primary)/0.35))] blur-[120px] opacity-60"
        style={reduced ? undefined : { animation: "aurora 24s ease-in-out infinite" }}
      />

      {/* animated grid with radial fade mask */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)] opacity-[0.06] dark:opacity-[0.10]" />

      {/* animated light rays */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 bg-[conic-gradient(from_90deg_at_50%_0%,transparent,hsl(var(--primary)/0.12),transparent,hsl(var(--accent)/0.12),transparent)] [mask-image:linear-gradient(to_bottom,#000,transparent)] opacity-70"
        style={reduced ? undefined : { animation: "aurora 30s ease-in-out infinite reverse" }}
      />

      {/* mouse-reactive spotlight glow */}
      <motion.div
        style={{ left: glowX, top: glowY }}
        className="pointer-events-none absolute h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-[110px]"
      />

      {/* parallax drifting blobs */}
      <motion.div
        style={reduced ? undefined : { x: blobA.x, y: blobA.y }}
        animate={reduced ? undefined : { scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-16 left-[4%] h-[420px] w-[420px] rounded-full bg-gradient-to-br from-primary/40 via-primary/10 to-transparent blur-[80px]"
      />
      <motion.div
        style={reduced ? undefined : { x: blobB.x, y: blobB.y }}
        animate={reduced ? undefined : { scale: [1, 0.94, 1.06, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-6 right-[2%] h-[380px] w-[380px] rounded-full bg-gradient-to-bl from-accent/40 via-accent/10 to-transparent blur-[80px]"
      />
      <motion.div
        animate={reduced ? undefined : { x: [0, 20, -30, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-[-140px] left-1/3 h-[320px] w-[320px] rounded-full bg-gradient-to-tr from-chart-4/30 to-transparent blur-[90px]"
      />

      {/* soft fog at the bottom for depth-of-field feel */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background via-background/70 to-transparent" />

      {/* shooting stars */}
      {!reduced &&
        [
          { top: "12%", left: "70%", delay: 2 },
          { top: "8%", left: "40%", delay: 7 },
          { top: "22%", left: "88%", delay: 11 },
        ].map((s, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute h-0.5 w-24 rounded-full bg-gradient-to-r from-primary/80 to-transparent"
            style={{
              top: s.top,
              left: s.left,
              animation: `shooting-star 6s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}

      {/* floating sparkles / particles */}
      {!reduced &&
        [...Array(12)].map((_, i) => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute h-1.5 w-1.5 rounded-full bg-primary/40"
            style={{ left: `${6 + i * 8}%`, top: `${12 + (i % 5) * 16}%` }}
            animate={{ y: [0, -18, 0], opacity: [0.15, 0.85, 0.15] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          />
        ))}

      {/* fine noise texture for that premium, non-flat finish */}
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay dark:opacity-[0.08]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Floating glassmorphism UI mockup cards with independent parallax depth.
// ---------------------------------------------------------------------------
function FloatingCards({
  mouseX,
  mouseY,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}) {
  const near = useParallax(40, mouseX, mouseY);
  const mid = useParallax(26, mouseX, mouseY);
  const far = useParallax(14, mouseX, mouseY);

  const cardBase =
    "hidden lg:flex absolute rounded-2xl border border-border/60 bg-background/60 backdrop-blur-xl shadow-xl";

  return (
    <>
      {/* ATS Match Score */}
      <motion.div
        style={{ x: near.x, y: near.y }}
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className={`${cardBase} top-[14%] left-[6%] w-52 flex-col gap-2 p-4 shadow-primary/10`}
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">ATS Match Score</span>
            <CheckCircle className="h-4 w-4 text-accent" />
          </div>
          <div className="text-2xl font-bold text-primary">94%</div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "94%" }}
              transition={{ duration: 1.2, delay: 1 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* AI chat bubble */}
      <motion.div
        style={{ x: mid.x, y: mid.y }}
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className={`${cardBase} top-[10%] right-[8%] w-56 items-start gap-2 p-3.5 shadow-accent/10`}
      >
        <motion.div
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
          className="flex items-start gap-2"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="pt-1 text-xs leading-snug text-foreground/80">
            &quot;Great! Let&apos;s tighten your bullet points to show more impact.&quot;
          </div>
        </motion.div>
      </motion.div>

      {/* Interview rate bar chart */}
      <motion.div
        style={{ x: mid.x, y: mid.y }}
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className={`${cardBase} bottom-[12%] left-[10%] w-44 flex-col gap-2 p-3.5 shadow-chart-4/10`}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-chart-4" /> Interview Rate
          </div>
          <div className="flex h-10 items-end gap-1">
            {[40, 65, 50, 80, 95].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.6, delay: 1.4 + i * 0.08 }}
                className="flex-1 rounded-sm bg-gradient-to-t from-chart-4/70 to-chart-4/20"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Analytics widget */}
      <motion.div
        style={{ x: far.x, y: far.y }}
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className={`${cardBase} top-[42%] left-[2%] w-40 flex-col gap-2 p-3.5 shadow-primary/10`}
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="flex flex-col gap-1.5"
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <BarChart3 className="h-3.5 w-3.5 text-primary" /> Profile Views
          </div>
          <div className="text-xl font-bold text-foreground">1,248</div>
          <div className="text-[10px] font-medium text-accent">▲ 32% this week</div>
        </motion.div>
      </motion.div>

      {/* Career insight pill */}
      <motion.div
        style={{ x: far.x, y: far.y }}
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 1.7 }}
        className={`${cardBase} top-[46%] right-[3%] w-48 items-center gap-2 p-3 shadow-accent/10`}
      >
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1.7 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <div className="text-[11px] leading-tight text-foreground/80">
            <span className="font-semibold text-foreground">3 new roles</span> match your skills
          </div>
        </motion.div>
      </motion.div>

      {/* Resume file badge */}
      <motion.div
        style={{ x: near.x, y: near.y }}
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className={`${cardBase} bottom-[16%] right-[10%] h-14 w-14 items-center justify-center shadow-primary/10`}
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
        >
          <FileText className="h-6 w-6 text-primary" />
        </motion.div>
      </motion.div>
    </>
  );
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeInBlur: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 60, damping: 18 },
  },
};

// ---------------------------------------------------------------------------
// Magnetic CTA wrapper — button drifts toward the cursor, then springs back.
// ---------------------------------------------------------------------------
function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(((e.clientX - rect.left) / rect.width - 0.5) * 18);
    y.set(((e.clientY - rect.top) / rect.height - 0.5) * 18);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  const reduced = useReducedMotion() ?? false;

  // Single source of truth for mouse position (0..1), shared by every layer.
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
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background pt-16 md:pt-20 pb-32"
    >
      <HeroBackground mouseX={mouseX} mouseY={mouseY} reduced={reduced} />
      {!reduced && <FloatingCards mouseX={mouseX} mouseY={mouseY} />}

      <motion.div
        initial="hidden"
        animate="show"
        variants={staggerContainer}
        className="container relative z-10 mx-auto max-w-5xl px-4 text-center"
      >
        {/* Announcement pill with rotating gradient border */}
        <motion.div variants={fadeInBlur} className="mb-8 inline-flex">
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="relative overflow-hidden rounded-full p-[1px]"
          >
            {/* rotating gradient border */}
            {!reduced && (
              <span
                aria-hidden
                className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0%,hsl(var(--primary))_25%,transparent_50%)]"
                style={{ animation: "border-spin 4s linear infinite" }}
              />
            )}
            <span className="relative flex items-center rounded-full bg-background/80 px-4 py-1.5 text-sm backdrop-blur-md">
              <motion.span
                animate={reduced ? undefined : { rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
              </motion.span>
              <span className="font-medium text-foreground/80">SkillPilot AI 2.0 is now live</span>
            </span>
          </motion.div>
        </motion.div>

        <motion.h1
          variants={fadeInBlur}
          className="mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-[length:200%_auto] bg-clip-text pb-2 text-5xl font-extrabold leading-[1.05] tracking-tight text-transparent animate-[gradient-move_6s_ease_infinite] md:text-7xl"
        >
          Your AI Career Coach & <br className="hidden md:block" />
          Resume Intelligence Platform
        </motion.h1>

        <motion.p
          variants={fadeInBlur}
          className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-foreground"
        >
          Land your dream job with AI-generated resumes, personalized career
          recommendations, and an intelligent coaching assistant that guides your
          professional growth.
        </motion.p>

        <motion.div
          variants={fadeInBlur}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Magnetic>
              <Button
                size="lg"
                className="group relative h-12 w-full overflow-hidden rounded-xl px-8 text-base shadow-md transition-all hover:shadow-lg hover:shadow-primary/25 sm:w-auto"
              >
                {/* liquid gradient sheen */}
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                <span className="relative flex items-center">
                  Start Building Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </Magnetic>
          </Link>

          <Link href="/login" className="w-full sm:w-auto">
            <Magnetic>
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-xl bg-background/50 px-8 text-base backdrop-blur transition-all hover:bg-muted sm:w-auto"
              >
                Sign In
              </Button>
            </Magnetic>
          </Link>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          animate={reduced ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="mt-16 flex justify-center text-muted-foreground/60"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}