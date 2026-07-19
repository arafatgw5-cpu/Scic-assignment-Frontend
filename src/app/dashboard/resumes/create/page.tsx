"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  BrainCircuit, Loader2, Sparkles, FileText, ArrowLeft,
  CheckCircle2, Edit, Download, AlertCircle, Save,
  Briefcase, Target, MessageSquare, AlignLeft, Building2, KeyRound,
  Lightbulb, Copy, Check, Wand2, Eye, PenLine,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

/* ---------------------------------------------------------------------- */
/*  Ambient background — pure decoration, built only from theme tokens.    */
/* ---------------------------------------------------------------------- */
function AmbientBackground() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 35, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 35, damping: 22 });
  const leftPct = useTransform(springX, (v) => `${v * 100}%`);
  const topPct = useTransform(springY, (v) => `${v * 100}%`);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-1/4 left-1/5 h-[55vh] w-[55vh] rounded-full bg-primary/10 blur-[130px]"
        animate={{ x: [0, 50, -20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-1/5 h-[50vh] w-[50vh] rounded-full bg-accent/10 blur-[130px]"
        animate={{ x: [0, -40, 20, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)/0.3) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)/0.3) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.03] mix-blend-overlay">
        <filter id="resumeNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#resumeNoise)" />
      </svg>
      <motion.div
        className="absolute h-[34vw] w-[34vw] rounded-full bg-primary/[0.05] blur-[110px]"
        style={{ left: leftPct, top: topPct, x: "-50%", y: "-50%" }}
      />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Premium stepper                                                        */
/* ---------------------------------------------------------------------- */
function Stepper({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "Target Role" },
    { n: 2, label: "AI Settings" },
    { n: 3, label: "Result" },
  ];
  return (
    <div className="sticky top-4 z-30 mx-auto mb-10 w-full max-w-2xl rounded-2xl border border-border/50 bg-card/70 px-6 py-4 shadow-xl shadow-black/10 backdrop-blur-2xl">
      <div className="flex items-center justify-center">
        {steps.map((s, idx) => (
          <div key={s.n} className="flex w-full items-center last:w-auto">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{ scale: step === s.n ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-500 ${
                  step > s.n
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : step === s.n
                    ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30"
                    : "border border-border/50 bg-muted/50 text-muted-foreground"
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {step > s.n ? (
                    <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <CheckCircle2 className="h-5 w-5" />
                    </motion.span>
                  ) : (
                    <motion.span key="num" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      {s.n}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              <span
                className={`hidden text-[11px] font-medium sm:block ${
                  step >= s.n ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="relative mx-2 h-1 flex-1 overflow-hidden rounded-full bg-muted/50">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent"
                  animate={{ width: step > s.n ? "100%" : "0%" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Glass option-card selector — same underlying string value/state,       */
/*  just replaces the native <select> with a nicer control.                */
/* ---------------------------------------------------------------------- */
function OptionSelector({
  icon: Icon,
  label,
  value,
  options,
  recommended,
  onChange,
}: {
  icon: any;
  label: string;
  value: string;
  options: string[];
  recommended?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </span>
        {label}
      </Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <motion.button
              key={opt}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(opt)}
              className={`relative rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium leading-snug shadow-sm backdrop-blur transition-all ${
                active
                  ? "border-primary/60 bg-gradient-to-br from-primary/15 to-accent/10 text-primary shadow-primary/10 ring-1 ring-primary/30"
                  : "border-border/60 bg-background/50 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-background/80"
              }`}
            >
              {opt}
              {opt === recommended && (
                <span className="ml-2 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                  AI pick
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Full-screen AI generation overlay                                      */
/* ---------------------------------------------------------------------- */
function GeneratingOverlay({ show }: { show: boolean }) {
  const messages = [
    "Reading your profile…",
    "Matching keywords to the role…",
    "Rewriting achievements…",
    "Polishing the final draft…",
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!show) {
      setIdx(0);
      return;
    }
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 1800);
    return () => clearInterval(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl"
        >
          <motion.div
            className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30"
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <BrainCircuit className="h-11 w-11 text-white" />
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-primary/40"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.div>

          <p className="mt-8 text-lg font-semibold tracking-tight">Generating your resume</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-2 text-sm text-muted-foreground"
            >
              {messages[idx]}
            </motion.p>
          </AnimatePresence>

          <div className="mt-6 h-1 w-56 overflow-hidden rounded-full bg-muted/50">
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-primary to-accent"
              animate={{ x: ["-100%", "220%"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------------- */
/*  Auto-save indicator — purely a UI affordance. It debounces changes to  */
/*  formData and mirrors the draft into localStorage so a refresh doesn't  */
/*  lose progress. It does NOT call any API — no backend draft endpoint    */
/*  exists, so this never touches api.* or generation/save logic.         */
/* ---------------------------------------------------------------------- */
const DRAFT_KEY = "resume-builder-draft-v1";

function AutoSaveIndicator({ status }: { status: "idle" | "saving" | "saved" }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
          status === "saved"
            ? "bg-emerald-500/10 text-emerald-400"
            : status === "saving"
            ? "bg-amber-500/10 text-amber-400"
            : "bg-muted/40 text-muted-foreground"
        }`}
      >
        {status === "saving" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3" />
        )}
        {status === "saving" ? "Saving…" : status === "saved" ? "Draft saved" : "Draft"}
      </motion.div>
    </AnimatePresence>
  );
}

export default function CreateResumePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    professionalSummary: string;
    optimizedSkills: string[];
    optimizedExperience: { company: string; role: string; description: string }[];
    optimizedProjects: { name: string; description: string }[];
  } | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Target Details
    targetRole: "",
    targetCompany: "",   // New Option 1
    keywords: "",        // New Option 2
    skills: "",
    jobDescription: "",

    // Step 2: AI Settings
    experienceLevel: "Mid-Level",
    focusArea: "General / Balanced",
    tone: "Professional & Direct",
    outputFormat: "Bullet-Heavy",
  });

  /* ---- Draft hydration + autosave (UI-only, see note above) ---- */
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const hydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft && typeof draft === "object") {
          setFormData((prev) => ({ ...prev, ...draft }));
        }
      }
    } catch {
      // ignore malformed/unavailable storage — form just starts blank
    } finally {
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    setAutoSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      } catch {
        // ignore — non-critical
      }
      setAutoSaveStatus("saved");
    }, 700);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const skillsList = formData.skills
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : ["React", "TypeScript", "Node.js"];

      // FIX: Cast the payload to 'any' to bypass strict type checking for the newly added fields
      // (targetCompany, keywords, preferences) until the types in api.ts are updated.
      const result = await api.generateResume({
        targetJob: formData.targetRole,
        targetCompany: formData.targetCompany,
        keywords: formData.keywords,
        skills: skillsList,
        experience: formData.jobDescription
          ? [{ title: formData.targetRole, description: formData.jobDescription }]
          : [],
        preferences: {
          level: formData.experienceLevel,
          focus: formData.focusArea,
          tone: formData.tone,
          format: formData.outputFormat
        }
      } as any);

      setGeneratedData(result);
      setGenerated(true);
      setStep(3);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Resume generation failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedData) return;
    setSaving(true);
    setError("");
    try {
      await api.createResume({
        title: formData.targetCompany
          ? `${formData.targetRole} - ${formData.targetCompany} Resume`
          : `${formData.targetRole} Resume`,
        targetRole: formData.targetRole,
        summary: generatedData.professionalSummary,
        skills: generatedData.optimizedSkills,
        experience: generatedData.optimizedExperience.map(e => ({
          company: e.company,
          role: e.role,
          description: e.description
        })),
        projects: generatedData.optimizedProjects.map(p => ({
          name: p.name,
          description: p.description
        })),
        content: generatedData
      });

      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }

      router.push("/dashboard/resumes");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save resume.";
      setError(msg);
      setSaving(false);
    }
  };

  const handleCopySummary = async () => {
    if (!generatedData) return;
    try {
      await navigator.clipboard.writeText(generatedData.professionalSummary);
      setSummaryCopied(true);
      setTimeout(() => setSummaryCopied(false), 1500);
    } catch {
      // no functional impact if clipboard is unavailable
    }
  };

  const skillChips = formData.skills
    ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const keywordChips = formData.keywords
    ? formData.keywords.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="relative mx-auto max-w-screen-2xl p-4 md:p-8 lg:p-10">
      <AmbientBackground />
      <GeneratingOverlay show={loading} />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <Link href="/dashboard/resumes" className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resumes
          </Link>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            <span className="rounded-xl bg-primary/10 p-2 ring-1 ring-primary/20">
              <Wand2 className="h-7 w-7 text-primary" />
            </span>
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              AI Resume Generator
            </span>
          </h1>
          <p className="mt-2 text-muted-foreground">Create a perfectly tailored resume that beats the ATS.</p>
        </div>
        {step < 3 && (
          <div className="sm:mt-1">
            <AutoSaveIndicator status={autoSaveStatus} />
          </div>
        )}
      </motion.div>

      <Stepper step={step} />

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-auto mb-6 flex max-w-4xl items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive shadow-sm backdrop-blur"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="mt-1 opacity-90">{error}</p>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto shrink-0 text-destructive hover:bg-destructive/20" onClick={() => setError("")}>
              Dismiss
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3"
          >
            <Card className="relative overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-xl shadow-black/10 backdrop-blur-xl lg:col-span-2">
              <CardHeader className="border-b border-border/50 bg-background/40 pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  Target Role Details
                </CardTitle>
                <CardDescription className="mt-1 text-sm">Tell us what job you are applying for to tailor the content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label htmlFor="role" className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                      <Briefcase className="h-4 w-4 text-primary/70" /> Target Job Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="role"
                      placeholder="e.g. Frontend Engineer"
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                      className="h-12 rounded-xl border-border/60 bg-background/50 transition-all focus-visible:ring-2 focus-visible:ring-primary/40"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="company" className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                      <Building2 className="h-4 w-4 text-primary/70" /> Target Company <span className="font-normal text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="company"
                      placeholder="e.g. Google, Brain Station 23"
                      value={formData.targetCompany}
                      onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
                      className="h-12 rounded-xl border-border/60 bg-background/50 transition-all focus-visible:ring-2 focus-visible:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="skills" className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                    <Target className="h-4 w-4 text-primary/70" /> Skills (comma separated) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="skills"
                    placeholder="e.g. React, TypeScript, Tailwind CSS, Next.js"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="h-12 rounded-xl border-border/60 bg-background/50 transition-all focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="keywords" className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                    <KeyRound className="h-4 w-4 text-primary/70" /> Keywords to Highlight <span className="font-normal text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="keywords"
                    placeholder="e.g. performance optimization, state management, UI architecture"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="h-12 rounded-xl border-border/60 bg-background/50 transition-all focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="jd" className="text-sm font-semibold text-foreground/90">
                      Job Description <span className="font-normal text-muted-foreground">(Optional but recommended)</span>
                    </Label>
                    <span className="text-[11px] text-muted-foreground">{formData.jobDescription.length} chars</span>
                  </div>
                  <Textarea
                    id="jd"
                    placeholder="Paste the job description here for maximum ATS optimization..."
                    className="min-h-[160px] resize-y rounded-xl border-border/60 bg-background/50 p-4 leading-relaxed transition-all focus-visible:ring-2 focus-visible:ring-primary/40"
                    value={formData.jobDescription}
                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end rounded-b-2xl border-t border-border/50 bg-background/30 pt-6">
                <motion.div whileHover={{ scale: formData.targetRole.trim() && formData.skills.trim() ? 1.02 : 1 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.targetRole.trim() || !formData.skills.trim()}
                    className="h-11 gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90"
                  >
                    Next Step <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>

            {/* Right column: live preview + tips — fills the extra width nicely */}
            <div className="space-y-4">
              {/* Live preview, mirrors formData only — no new state or API calls */}
              <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-md backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-background/40 py-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Live Preview</h4>
                  </div>
                  <span className="rounded-full border border-border/50 bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    updates as you type
                  </span>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  <div>
                    <p className="text-base font-bold leading-tight text-foreground">
                      {formData.targetRole || "Your target role"}
                    </p>
                    {formData.targetCompany && (
                      <p className="mt-0.5 text-xs text-muted-foreground">at {formData.targetCompany}</p>
                    )}
                  </div>

                  {skillChips.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skillChips.slice(0, 8).map((s) => (
                          <span key={s} className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                            {s}
                          </span>
                        ))}
                        {skillChips.length > 8 && (
                          <span className="rounded-md border border-border/50 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground">
                            +{skillChips.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {keywordChips.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {keywordChips.slice(0, 6).map((k) => (
                          <span key={k} className="rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent-foreground/90">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!formData.targetRole && skillChips.length === 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/50 bg-background/30 p-3 text-xs text-muted-foreground">
                      <PenLine className="h-3.5 w-3.5 shrink-0" />
                      Fill in the form to see a live snapshot here.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-md backdrop-blur-xl">
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-center gap-2 text-primary">
                    <Lightbulb className="h-5 w-5" />
                    <h4 className="font-semibold">Pro tips</h4>
                  </div>
                  <ul className="space-y-2 text-sm leading-relaxed text-foreground/80">
                    <li>• Paste the real job description — it drives keyword matching for ATS.</li>
                    <li>• List skills in the order they matter most for this role.</li>
                    <li>• Add a target company to personalize tone and framing.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/50 bg-card/60 shadow-md backdrop-blur-xl">
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">What happens next</h4>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    In the next step you&apos;ll tune tone, focus, and format — then Gemini rewrites your
                    profile into a tailored, ATS-ready resume in seconds.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto max-w-5xl"
          >
            <Card className="relative overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-xl shadow-black/10 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5"></div>
              <CardHeader className="relative z-10 border-b border-border/50 bg-background/40 pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                  </div>
                  AI Generation Settings
                </CardTitle>
                <CardDescription className="mt-1 text-sm">Configure how Gemini AI should write your resume.</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-8 pt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <OptionSelector
                    icon={Briefcase}
                    label="Experience Level"
                    value={formData.experienceLevel}
                    options={["Entry-Level (0-2 years)", "Mid-Level (3-5 years)", "Senior-Level (6+ years)", "Executive"]}
                    onChange={(v) => setFormData({ ...formData, experienceLevel: v })}
                  />
                  <OptionSelector
                    icon={Target}
                    label="Focus Area"
                    value={formData.focusArea}
                    options={["Leadership & Management", "Technical Depth", "Product & Delivery", "General / Balanced"]}
                    recommended="General / Balanced"
                    onChange={(v) => setFormData({ ...formData, focusArea: v })}
                  />
                  <OptionSelector
                    icon={MessageSquare}
                    label="Writing Tone"
                    value={formData.tone}
                    options={["Professional & Direct", "Enthusiastic & Driven", "Analytical & Data-Focused", "Creative & Modern"]}
                    recommended="Professional & Direct"
                    onChange={(v) => setFormData({ ...formData, tone: v })}
                  />
                  <OptionSelector
                    icon={AlignLeft}
                    label="Output Format"
                    value={formData.outputFormat}
                    options={["Bullet-Heavy (Best for ATS)", "Paragraph-Heavy (Storytelling)", "Balanced Hybrid"]}
                    recommended="Bullet-Heavy (Best for ATS)"
                    onChange={(v) => setFormData({ ...formData, outputFormat: v })}
                  />
                </div>

                <motion.div
                  className="mt-8 flex gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm backdrop-blur-sm"
                  animate={{ boxShadow: ["0 0 0px hsl(var(--primary)/0)", "0 0 24px hsl(var(--primary)/0.1)", "0 0 0px hsl(var(--primary)/0)"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="mt-0.5 h-6 w-6 shrink-0 animate-pulse text-primary" />
                  <div>
                    <h4 className="mb-1 font-semibold text-primary">Gemini AI Processing</h4>
                    <p className="text-sm leading-relaxed text-foreground/80">
                      Our AI will analyze your profile, extract key achievements, and rewrite them into
                      high-impact, quantifiable bullet points tailored perfectly to your selected settings.
                    </p>
                  </div>
                </motion.div>
              </CardContent>
              <CardFooter className="relative z-10 flex justify-between rounded-b-2xl border-t border-border/50 bg-background/30 pt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="h-11 rounded-xl px-6 transition-all hover:bg-background">
                  Back
                </Button>
                <motion.div whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="h-11 gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90"
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Generate Resume</>
                    )}
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 3 && generated && generatedData && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mx-auto max-w-5xl space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 rounded-xl border border-green-500/20 bg-green-500/10 p-5 text-green-700 shadow-sm backdrop-blur-sm dark:text-green-400"
            >
              <CheckCircle2 className="h-7 w-7 shrink-0 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold">Resume Generated Successfully!</h3>
                <p className="text-sm opacity-90">Your AI-optimized resume is ready for review.</p>
              </div>
            </motion.div>

            {/* Summary hero card */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Card className="overflow-hidden rounded-2xl border-border/50 bg-gradient-to-br from-card/70 to-card/50 shadow-lg backdrop-blur-xl">
                <CardHeader className="border-b border-border/50 bg-background/40 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      Professional Summary
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        AI-generated
                      </span>
                    </CardTitle>
                    <button
                      onClick={handleCopySummary}
                      title="Copy summary"
                      className="rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground"
                    >
                      {summaryCopied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed text-foreground/80 md:text-base">{generatedData.professionalSummary}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
                <CardHeader className="border-b border-border/50 bg-background/40 pb-4">
                  <CardTitle className="text-lg">Optimized Skills</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2.5">
                    {generatedData.optimizedSkills.map((skill, i) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.03 * i }}
                        whileHover={{ y: -2 }}
                        className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/15 to-accent/10 px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm transition-colors hover:border-primary/40 hover:shadow-md"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Experience timeline */}
            {generatedData.optimizedExperience.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
                  <CardHeader className="border-b border-border/50 bg-background/40 pb-4">
                    <CardTitle className="text-lg">Optimized Experience</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8 pt-6">
                    {generatedData.optimizedExperience.map((exp, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.08 }}
                        className="relative border-l-2 border-primary/40 pl-6 before:absolute before:-left-[9px] before:top-1.5 before:h-3.5 before:w-3.5 before:rounded-full before:bg-primary before:shadow-[0_0_0_4px_hsl(var(--background))]"
                      >
                        <h4 className="text-lg font-semibold">
                          {exp.role} <span className="font-normal text-muted-foreground">at {exp.company}</span>
                        </h4>
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/80 md:text-base">
                          {exp.description}
                        </p>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3"
            >
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button
                  className="h-14 w-full gap-2 rounded-xl border border-border/60 bg-background/50 text-sm font-medium shadow-sm backdrop-blur transition-all hover:bg-muted/50"
                  variant="outline"
                  onClick={() => { setStep(1); setGenerated(false); setGeneratedData(null); }}
                >
                  <Edit className="h-4 w-4" />
                  Generate Another
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button
                  className="h-14 w-full gap-2 rounded-xl border border-border/60 bg-background/50 text-sm font-medium shadow-sm backdrop-blur transition-all hover:bg-muted/50"
                  variant="outline"
                  onClick={() => api.downloadResumePdf(generatedData, 'AI_Resume.pdf')}
                >
                  <Download className="h-4 w-4" />
                  Export to PDF
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <Button
                  className="h-14 w-full gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save to Dashboard"}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}