"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────
   Constants
   ─────────────────────────────────────────────────────────────────── */
const DEMO_EMAIL = "demo@gmail.com";
const DEMO_PASSWORD = "demo123456";

/* ──────────────────────────────────────────────────────────────────
   Animation variants
   ─────────────────────────────────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const errorVariants = {
  hidden: { opacity: 0, height: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    height: "auto",
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    height: 0,
    scale: 0.97,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

/* ──────────────────────────────────────────────────────────────────
   Sub-components
   ─────────────────────────────────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function BrandMark() {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-primary via-primary to-accent shadow-lg shadow-primary/25 ring-1 ring-inset ring-white/20">
      <span className="text-lg font-bold tracking-tight text-white select-none">
        S
      </span>
      <div className="absolute inset-0 rounded-[14px] bg-gradient-to-t from-black/10 to-transparent" />
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="relative flex items-center py-1" role="separator">
      <div className="flex-1 border-t border-border/60" />
      <span className="mx-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
        {label}
      </span>
      <div className="flex-1 border-t border-border/60" />
    </div>
  );
}

function TrustBadges() {
  return (
    <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground/60">
      <span className="flex items-center gap-1">
        <ShieldCheck className="h-3 w-3" />
        SSL Secured
      </span>
      <span className="h-3 w-px bg-border/40" />
      <span className="flex items-center gap-1">
        <Zap className="h-3 w-3" />
        Instant Access
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────
   Main Page Component
   ─────────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const busy = loading || googleLoading || demoLoading;

  /* ── Handlers (logic unchanged) ─────────────────────────────── */
  const handleEmailLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const result = await signIn.email({ email, password });

        if (result.error) {
          setError(result.error.message || "Invalid email or password");
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [email, password, router]
  );

  const handleGoogleLogin = useCallback(async () => {
    setError("");
    setGoogleLoading(true);

    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Google sign-in failed. Please try again.";
      setError(message);
      setGoogleLoading(false);
    }
  }, []);

  const handleDemoLogin = useCallback(async () => {
    setError("");
    setDemoLoading(true);

    try {
      const result = await signIn.email({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Demo account is not available right now. Please try again later."
        );
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Demo login failed. Please try again.";
      setError(message);
    } finally {
      setDemoLoading(false);
    }
  }, [router]);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* ── Ambient background ─────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle,hsl(var(--foreground))_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-[40%] left-1/2 h-[80%] w-[120%] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-[100px]" />
        <div className="absolute -bottom-[30%] -right-[20%] h-[60%] w-[60%] rounded-full bg-accent/[0.03] blur-[100px]" />
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Brand */}
        <motion.div variants={itemVariants} className="mb-10 flex flex-col items-center">
          <Link
            href="/"
            className="group flex flex-col items-center gap-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-2xl"
            aria-label="SkillPilot AI — Go to homepage"
          >
            <BrandMark />
            <div className="text-center">
              <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
                SkillPilot{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AI
                </span>
              </h1>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                Your AI-powered career copilot
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card/80 p-8 shadow-xl shadow-black/[0.03] backdrop-blur-sm dark:border-border/40 dark:bg-card/90 dark:shadow-black/20"
        >
          {/* Header */}
          <div className="mb-7">
            <h2 className="text-lg font-semibold tracking-tight text-foreground dark:text-white">
              Welcome back
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground dark:text-muted-foreground/90">
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-5 overflow-hidden"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/[0.06] px-3.5 py-3 dark:border-destructive/30 dark:bg-destructive/10">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive/80 dark:text-destructive" />
                  <p className="text-[13px] leading-relaxed text-destructive dark:text-red-400">
                    {error}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── FIX: Google OAuth Button ─────────────────────────── */}
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleLogin}
            disabled={busy}
            className="h-11 w-full rounded-xl border-border/60 bg-background/60 text-[13px] font-medium text-foreground transition-all duration-200 hover:border-border hover:bg-accent/50 hover:text-foreground active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 dark:border-border/50 dark:bg-background/40 dark:text-white dark:hover:border-border/70 dark:hover:bg-accent/20 dark:hover:text-white"
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-foreground dark:text-white" />
            ) : (
              <GoogleIcon />
            )}
            <span className="ml-2 text-foreground dark:text-white">
              Continue with Google
            </span>
          </Button>

          {/* Divider */}
          <div className="my-6">
            <Divider label="or" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailLogin} className="space-y-4" noValidate={false}>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[13px] font-medium text-foreground/90 dark:text-foreground/95"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="h-11 rounded-xl border-border/60 bg-background/50 px-3.5 text-[13px] text-foreground transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/10 disabled:opacity-50 dark:border-border/50 dark:bg-background/30 dark:text-white dark:placeholder:text-muted-foreground/40 dark:focus-visible:border-primary/50 dark:focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-[13px] font-medium text-foreground/90 dark:text-foreground/95"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-[12px] font-medium text-primary/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:underline dark:text-primary/90 dark:hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={busy}
                  className="h-11 rounded-xl border-border/60 bg-background/50 px-3.5 pr-11 text-[13px] text-foreground transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/10 disabled:opacity-50 dark:border-border/50 dark:bg-background/30 dark:text-white dark:placeholder:text-muted-foreground/40 dark:focus-visible:border-primary/50 dark:focus-visible:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={busy}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground/60 transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-40 dark:text-muted-foreground/70 dark:hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* ─── FIX: Sign In Button ──────────────────────────────── */}
            <Button
              type="submit"
              disabled={busy}
              className="group h-11 w-full rounded-xl bg-primary text-[13px] font-medium text-primary-foreground shadow-sm shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 dark:text-white dark:shadow-primary/10"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>

          {/* Demo divider */}
          <div className="my-6">
            <Divider label="demo" />
          </div>

          {/* ─── FIX: Demo Account Button ───────────────────────────── */}
          <Button
            variant="secondary"
            type="button"
            onClick={handleDemoLogin}
            disabled={busy}
            className="h-11 w-full rounded-xl bg-secondary/60 text-[13px] font-medium text-secondary-foreground transition-all duration-200 hover:bg-secondary active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 dark:bg-secondary/30 dark:text-white dark:hover:bg-secondary/50"
          >
            {demoLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4 text-primary/70 dark:text-primary" />
                Explore with demo account
              </>
            )}
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <p className="text-[13px] text-muted-foreground dark:text-muted-foreground/90">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:underline dark:text-primary dark:hover:text-primary/80"
            >
              Create one free
            </Link>
          </p>
          <TrustBadges />
        </motion.div>
      </motion.div>
    </div>
  );
}