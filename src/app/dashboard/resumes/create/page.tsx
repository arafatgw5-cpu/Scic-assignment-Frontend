"use client";

import { useRouter } from "next/navigation";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  BrainCircuit, Loader2, Sparkles, FileText, ArrowLeft,
  CheckCircle2, Edit, Download, AlertCircle, Save,
  Briefcase, Target, MessageSquare, AlignLeft, Building2, KeyRound,
  Lightbulb, Copy, Check, Wand2, Eye, PenLine,
  User, Mail, Phone, Globe, Contact, Code2, MapPin,
  GraduationCap, Languages, Heart, Users,
  Star, Plus, Trash2,
  Zap, Shield, Type, Layout, Printer,
  RefreshCw, TrendingUp, AlertTriangle,
  ExternalLink, X,
  Settings, Layers, Database, ZoomIn, ZoomOut,
  BadgeCheck, Trophy,
  BookMarked, UserCheck,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

/* ====================================================================== */
/*  Optional AI text-action accessor                                       */
/* ====================================================================== */
type AiTextActionParams = {
  action: string;
  text?: string;
  context?: string;
  targetRole?: string;
};
type ApiWithTextAction = typeof api & {
  aiTextAction?: (params: AiTextActionParams) => Promise<{ result: string }>;
};
const apiExt = api as ApiWithTextAction;

/* ====================================================================== */
/*  TYPES                                                                  */
/* ====================================================================== */
type IconType = ComponentType<{ className?: string }>;

interface PersonalInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  portfolio: string;
  linkedin: string;
  github: string;
  personalWebsite: string;
}

interface WorkExperience {
  id: string;
  company: string;
  jobTitle: string;
  employmentType: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
  achievements: string;
  technologies: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  gpa: string;
  startYear: string;
  endYear: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  githubLink: string;
  liveDemoLink: string;
  role: string;
  duration: string;
  keyAchievements: string;
}

interface Certification {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  expirationDate: string;
  credentialId: string;
  credentialUrl: string;
}

interface Achievement {
  id: string;
  title: string;
  type: string;
  description: string;
  date: string;
}

interface LanguageEntry {
  id: string;
  language: string;
  proficiency: string;
}

interface VolunteerEntry {
  id: string;
  organization: string;
  position: string;
  duration: string;
  description: string;
}

interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
}

interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
}

interface SkillsData {
  technical: string[];
  soft: string[];
  tools: string[];
  frameworks: string[];
  databases: string[];
  cloud: string[];
  programmingLanguages: string[];
  other: string[];
}

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
}

interface CustomizationSettings {
  fontFamily: string;
  fontSize: string;
  accentColor: string;
  margins: string;
  lineHeight: string;
  sectionOrder: string[];
}

interface ATSAnalysis {
  score: number;
  compatibility: number;
  completeness: number;
  missingSections: string[];
  missingKeywords: string[];
  keywordDensity: { keyword: string; count: number }[];
  formattingIssues: string[];
  weakBullets: string[];
  grammarSuggestions: string[];
  recommendations: string[];
}

interface GeneratedResumeData {
  professionalSummary: string;
  optimizedSkills: string[];
  optimizedExperience: { company: string; role: string; description: string }[];
  optimizedProjects: { name: string; description: string }[];
}

/* ====================================================================== */
/*  CONSTANTS                                                              */
/* ====================================================================== */
const DRAFT_KEY = "resume-builder-draft-v2";

const RESUME_TEMPLATES: ResumeTemplate[] = [
  { id: "modern", name: "Modern", description: "Clean lines with accent colors" },
  { id: "professional", name: "Professional", description: "Traditional corporate layout" },
  { id: "minimal", name: "Minimal", description: "Whitespace-focused, elegant" },
  { id: "executive", name: "Executive", description: "Bold headers, leadership focus" },
  { id: "creative", name: "Creative", description: "Unique layout for creative roles" },
  { id: "developer", name: "Software Developer", description: "Tech-focused with code aesthetics" },
];

const SKILL_CATEGORIES: { key: keyof SkillsData; label: string; icon: IconType }[] = [
  { key: "technical", label: "Technical Skills", icon: Zap },
  { key: "soft", label: "Soft Skills", icon: Heart },
  { key: "tools", label: "Tools", icon: Settings },
  { key: "frameworks", label: "Frameworks", icon: Layers },
  { key: "databases", label: "Databases", icon: Database },
  { key: "cloud", label: "Cloud", icon: Globe },
  { key: "programmingLanguages", label: "Programming Languages", icon: Type },
  { key: "other", label: "Other Skills", icon: Star },
];

const PROFICIENCY_LEVELS = ["Native", "Fluent", "Professional", "Intermediate", "Basic"];
const ACHIEVEMENT_TYPES = ["Award", "Hackathon", "Competition", "Scholarship", "Recognition", "Other"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const WORK_TYPES = ["Remote", "Hybrid", "Onsite"];
const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education", "Marketing",
  "Engineering", "Design", "Consulting", "Government", "Non-profit", "Other",
];

const STEP_LABELS = [
  "Personal", "Target Role", "Summary", "Experience",
  "Education", "Skills", "Projects", "More", "AI Settings", "Result",
];

const SUMMARY_ACTIONS: { label: string; icon: IconType; action: string }[] = [
  { label: "Generate with AI", icon: Sparkles, action: "generate-summary" },
  { label: "Rewrite", icon: RefreshCw, action: "rewrite-summary" },
  { label: "Improve Grammar", icon: CheckCircle2, action: "grammar-summary" },
  { label: "Make Shorter", icon: AlignLeft, action: "shorter-summary" },
  { label: "Make Stronger", icon: Zap, action: "stronger-summary" },
  { label: "ATS Optimize", icon: Shield, action: "ats-summary" },
];

/* ====================================================================== */
/*  UTILITIES                                                              */
/* ====================================================================== */
const generateId = (): string => Math.random().toString(36).substring(2, 11);

const validateEmail = (email: string): boolean => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
const validatePhone = (phone: string): boolean => {
  if (!phone) return true;
  return /^[+]?[\d\s\-().]{7,20}$/.test(phone);
};
const validateUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};

/* ====================================================================== */
/*  Ambient background                                                     */
/* ====================================================================== */
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

/* ====================================================================== */
/*  Stepper                                                                */
/* ====================================================================== */
function Stepper({ step, totalSteps }: { step: number; totalSteps: number }) {
  const visibleSteps = STEP_LABELS.slice(0, totalSteps);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector(`[data-step="${step}"]`);
      activeEl?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [step]);

  return (
    <div className="sticky top-2 z-30 mx-auto mb-6 w-full max-w-4xl rounded-2xl border border-border/50 bg-card/70 px-3 py-3 shadow-xl shadow-black/10 backdrop-blur-2xl sm:top-4 sm:mb-8 sm:px-4">
      <div ref={scrollRef} className="flex items-center gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleSteps.map((label, idx) => {
          const s = idx + 1;
          const isActive = step === s;
          const isComplete = step > s;
          return (
            <div key={s} className="flex shrink-0 items-center" data-step={s}>
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-500 ${
                    isComplete
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : isActive
                        ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30"
                        : "border border-border/50 bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isComplete ? (
                      <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <CheckCircle2 className="h-4 w-4" />
                      </motion.span>
                    ) : (
                      <motion.span key="num" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        {s}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className={`hidden text-[9px] font-medium sm:block ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </div>
              {idx < visibleSteps.length - 1 && (
                <div className="relative mx-1 h-0.5 w-3 flex-shrink-0 overflow-hidden rounded-full bg-muted/50 sm:w-6">
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent"
                    animate={{ width: isComplete ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted/40">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ====================================================================== */
/*  Option selector                                                        */
/* ====================================================================== */
function OptionSelector({ icon: Icon, label, value, options, recommended, onChange }: {
  icon: IconType;
  label: string;
  value: string;
  options: string[];
  recommended?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <Label className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground/90">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
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

/* ====================================================================== */
/*  Generating overlay                                                     */
/* ====================================================================== */
function GeneratingOverlay({ show }: { show: boolean }) {
  const messages = [
    "Reading your profile…",
    "Matching keywords to the role…",
    "Rewriting achievements…",
    "Optimizing for ATS…",
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
  }, [show, messages.length]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 px-6 backdrop-blur-xl"
        >
          <motion.div
            className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30 sm:h-24 sm:w-24"
            animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <BrainCircuit className="h-9 w-9 text-white sm:h-11 sm:w-11" />
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-primary/40"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.div>
          <p className="mt-6 text-center text-base font-semibold tracking-tight sm:mt-8 sm:text-lg">Generating your resume</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-2 text-center text-sm text-muted-foreground"
            >
              {messages[idx]}
            </motion.p>
          </AnimatePresence>
          <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-muted/50 sm:w-56">
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

/* ====================================================================== */
/*  Auto-save indicator                                                    */
/* ====================================================================== */
function AutoSaveIndicator({ status, lastSaved }: { status: "idle" | "saving" | "saved"; lastSaved?: Date | null }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
          status === "saved"
            ? "bg-emerald-500/10 text-emerald-400"
            : status === "saving"
              ? "bg-amber-500/10 text-amber-400"
              : "bg-muted/40 text-muted-foreground"
        }`}
      >
        {status === "saving" ? <Loader2 className="h-3 w-3 shrink-0 animate-spin" /> : <Check className="h-3 w-3 shrink-0" />}
        <span className="truncate">
          {status === "saving" ? "Saving…" : status === "saved" ? "Draft saved" : "Draft"}
        </span>
        {lastSaved && status === "saved" && (
          <span className="hidden opacity-70 sm:inline">
            {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/* ====================================================================== */
/*  Form field                                                             */
/* ====================================================================== */
function FormField({ label, icon: Icon, required, optional, children, error }: {
  label: string;
  icon?: IconType;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground/90">
        {Icon && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10">
            <Icon className="h-3 w-3 text-primary" />
          </span>
        )}
        <span className="min-w-0">{label}</span>
        {required && <span className="text-destructive">*</span>}
        {optional && <span className="font-normal text-muted-foreground text-xs">(Optional)</span>}
      </Label>
      {children}
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" /> <span className="min-w-0 break-words">{error}</span>
        </motion.p>
      )}
    </div>
  );
}

/* ====================================================================== */
/*  Dynamic list card (generic)                                            */
/* ====================================================================== */
function DynamicListCard<T extends { id: string }>({ title, icon: Icon, items, onAdd, onRemove, renderItem, emptyText }: {
  title: string;
  icon: IconType;
  items: T[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  renderItem: (item: T, index: number) => ReactNode;
  emptyText: string;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-background/40 py-4">
        <CardTitle className="flex min-w-0 items-center gap-2 text-base sm:text-lg">
          <span className="rounded-lg bg-primary/10 p-1.5">
            <Icon className="h-4 w-4 text-primary" />
          </span>
          <span className="truncate">{title}</span>
          <span className="shrink-0 rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">{items.length}</span>
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onAdd} className="gap-1.5 rounded-lg border-primary/30 text-primary hover:bg-primary/10">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/50 bg-background/30 p-6 text-center sm:p-8">
            <Icon className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{emptyText}</p>
            <Button variant="outline" size="sm" onClick={onAdd} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add {title}
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative rounded-xl border border-border/40 bg-background/40 p-4 sm:p-5"
              >
                <button
                  onClick={() => onRemove(item.id)}
                  aria-label="Remove"
                  className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive sm:right-3 sm:top-3"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {renderItem(item, idx)}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}

/* ====================================================================== */
/*  ATS panel                                                              */
/* ====================================================================== */
function ATSAnalysisPanel({ analysis }: { analysis: ATSAnalysis }) {
  const getScoreColor = (score: number) =>
    score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-destructive";
  const getScoreBg = (score: number) =>
    score >= 80 ? "from-emerald-500/20 to-emerald-500/5" : score >= 60 ? "from-amber-500/20 to-amber-500/5" : "from-destructive/20 to-destructive/5";

  return (
    <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
      <CardHeader className="border-b border-border/50 bg-background/40 py-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Shield className="h-5 w-5 text-primary" /> ATS Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: "Resume Score", value: analysis.score },
            { label: "ATS Compat", value: analysis.compatibility },
            { label: "Completeness", value: analysis.completeness },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2">
              <div className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br sm:h-16 sm:w-16 ${getScoreBg(item.value)}`}>
                <span className={`text-base font-bold sm:text-lg ${getScoreColor(item.value)}`}>{item.value}%</span>
              </div>
              <span className="text-center text-[9px] font-medium text-muted-foreground sm:text-[10px]">{item.label}</span>
            </div>
          ))}
        </div>

        {analysis.missingSections.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-amber-500">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Missing Sections
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {analysis.missingSections.map((s) => (
                <span key={s} className="rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-600 dark:text-amber-400">{s}</span>
              ))}
            </div>
          </div>
        )}

        {analysis.missingKeywords.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-destructive">
              <KeyRound className="h-4 w-4 shrink-0" /> Missing Keywords
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {analysis.missingKeywords.map((k) => (
                <span key={k} className="rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">{k}</span>
              ))}
            </div>
          </div>
        )}

        {analysis.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              <Lightbulb className="h-4 w-4 shrink-0" /> Recommendations
            </h4>
            <ul className="space-y-1.5">
              {analysis.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-primary/60" /> <span className="min-w-0 break-words">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.formattingIssues.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-amber-500">
              <Layout className="h-4 w-4 shrink-0" /> Formatting Issues
            </h4>
            <ul className="space-y-1">
              {analysis.formattingIssues.map((f, i) => (
                <li key={i} className="text-xs text-muted-foreground">• {f}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ====================================================================== */
/*  Live preview                                                           */
/* ====================================================================== */
function LiveResumePreview({ personalInfo, skills, experience, education, projects, zoom }: {
  personalInfo: PersonalInfo;
  skills: SkillsData;
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  zoom: number;
}) {
  const allSkills = [
    ...skills.technical, ...skills.soft, ...skills.tools, ...skills.frameworks,
    ...skills.databases, ...skills.cloud, ...skills.programmingLanguages, ...skills.other,
  ];
  return (
    <div className="overflow-auto rounded-xl border border-border/50 bg-white p-1 shadow-inner dark:bg-gray-50">
      <motion.div
        animate={{ scale: zoom }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="origin-top-left mx-auto w-[210mm] min-h-[297mm] bg-white p-8 text-gray-900 shadow-lg sm:p-10"
        style={{ fontFamily: "Georgia, serif" }}
      >
        <div className="border-b-2 border-gray-800 pb-4">
          <h1 className="break-words text-2xl font-bold tracking-tight">{personalInfo.fullName || "Your Name"}</h1>
          {personalInfo.headline && <p className="mt-1 break-words text-sm text-gray-600">{personalInfo.headline}</p>}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            {personalInfo.email && <span className="break-all">{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.city && <span>{personalInfo.city}, {personalInfo.country}</span>}
            {personalInfo.linkedin && <span>LinkedIn</span>}
            {personalInfo.github && <span>GitHub</span>}
          </div>
        </div>
        {allSkills.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-800">Skills</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {allSkills.slice(0, 20).map((s) => (
                <span key={s} className="rounded bg-gray-100 px-2 py-0.5 text-xs">{s}</span>
              ))}
            </div>
          </div>
        )}
        {experience.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-800">Experience</h2>
            {experience.map((exp) => (
              <div key={exp.id} className="mt-3">
                <div className="flex flex-wrap justify-between gap-x-2">
                  <h3 className="text-sm font-semibold">{exp.jobTitle || "Role"}</h3>
                  <span className="text-xs text-gray-500">{exp.startDate} - {exp.currentlyWorking ? "Present" : exp.endDate}</span>
                </div>
                <p className="text-xs text-gray-600">{exp.company} {exp.location && `• ${exp.location}`}</p>
                {exp.responsibilities && <p className="mt-1 break-words text-xs leading-relaxed text-gray-700">{exp.responsibilities}</p>}
              </div>
            ))}
          </div>
        )}
        {education.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-800">Education</h2>
            {education.map((edu) => (
              <div key={edu.id} className="mt-2">
                <div className="flex flex-wrap justify-between gap-x-2">
                  <h3 className="text-sm font-semibold">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</h3>
                  <span className="text-xs text-gray-500">{edu.startYear} - {edu.endYear}</span>
                </div>
                <p className="text-xs text-gray-600">{edu.institution}</p>
              </div>
            ))}
          </div>
        )}
        {projects.length > 0 && (
          <div className="mt-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-800">Projects</h2>
            {projects.map((proj) => (
              <div key={proj.id} className="mt-2">
                <h3 className="break-words text-sm font-semibold">{proj.name}</h3>
                <p className="break-words text-xs leading-relaxed text-gray-700">{proj.description}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ====================================================================== */
/*  MAIN PAGE                                                              */
/* ====================================================================== */
export default function CreateResumePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(0.5);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [aiActionLoading, setAiActionLoading] = useState<string | null>(null);

  const [generatedData, setGeneratedData] = useState<GeneratedResumeData | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "", headline: "", email: "", phone: "", country: "", city: "",
    portfolio: "", linkedin: "", github: "", personalWebsite: "",
  });
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    targetRole: "", targetCompany: "", keywords: "", skills: "", jobDescription: "",
    industry: "", employmentType: "Full-time", workType: "Remote",
    experienceLevel: "Mid-Level (3-5 years)", focusArea: "General / Balanced",
    tone: "Professional & Direct", outputFormat: "Bullet-Heavy (Best for ATS)",
  });

  const [summary, setSummary] = useState("");
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<SkillsData>({
    technical: [], soft: [], tools: [], frameworks: [], databases: [], cloud: [], programmingLanguages: [], other: [],
  });
  const [skillInput, setSkillInput] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [languages, setLanguages] = useState<LanguageEntry[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [volunteer, setVolunteer] = useState<VolunteerEntry[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [referencesAvailable, setReferencesAvailable] = useState(true);
  const [references, setReferences] = useState<Reference[]>([]);

  const [customization, setCustomization] = useState<CustomizationSettings>({
    fontFamily: "Georgia", fontSize: "11", accentColor: "#2563eb", margins: "normal", lineHeight: "1.5", sectionOrder: [],
  });

  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis>({
    score: 0, compatibility: 0, completeness: 0, missingSections: [], missingKeywords: [],
    keywordDensity: [], formattingIssues: [], weakBullets: [], grammarSuggestions: [], recommendations: [],
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const hydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TOTAL_STEPS = 10;

  /* ---- Draft hydration ---- */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft) {
          if (draft.personalInfo) setPersonalInfo((p) => ({ ...p, ...draft.personalInfo }));
          if (draft.formData) setFormData((f) => ({ ...f, ...draft.formData }));
          if (draft.summary) setSummary(draft.summary);
          if (draft.experiences) setExperiences(draft.experiences);
          if (draft.educations) setEducations(draft.educations);
          if (draft.skills) setSkills((s) => ({ ...s, ...draft.skills }));
          if (draft.projects) setProjects(draft.projects);
          if (draft.certifications) setCertifications(draft.certifications);
          if (draft.achievements) setAchievements(draft.achievements);
          if (draft.languages) setLanguages(draft.languages);
          if (draft.interests) setInterests(draft.interests);
          if (draft.volunteer) setVolunteer(draft.volunteer);
          if (draft.publications) setPublications(draft.publications);
          if (draft.references) setReferences(draft.references);
          if (draft.referencesAvailable !== undefined) setReferencesAvailable(draft.referencesAvailable);
          if (draft.selectedTemplate) setSelectedTemplate(draft.selectedTemplate);
          if (draft.customization) setCustomization((c) => ({ ...c, ...draft.customization }));
        }
      }
    } catch {
      /* ignore malformed storage */
    } finally {
      hydrated.current = true;
    }
  }, []);

  /* ---- Autosave ---- */
  useEffect(() => {
    if (!hydrated.current) return;
    setAutoSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            personalInfo, formData, summary, experiences, educations, skills, projects,
            certifications, achievements, languages, interests, volunteer, publications,
            references, referencesAvailable, selectedTemplate, customization,
          })
        );
        setLastSaved(new Date());
      } catch {
        /* ignore */
      }
      setAutoSaveStatus("saved");
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personalInfo, formData, summary, experiences, educations, skills, projects, certifications,
    achievements, languages, interests, volunteer, publications, references, referencesAvailable,
    selectedTemplate, customization]);

  /* ---- ATS analysis ---- */
  useEffect(() => {
    const missing: string[] = [];
    const recs: string[] = [];
    const totalSections = 10;
    let filled = 0;

    if (personalInfo.fullName) filled++; else { missing.push("Personal Info"); recs.push("Add your full name and contact details."); }
    if (formData.targetRole) filled++; else { missing.push("Target Role"); recs.push("Specify your target job title for better ATS matching."); }
    if (summary) filled++; else { missing.push("Professional Summary"); recs.push("Add a compelling professional summary."); }
    if (experiences.length > 0) filled++; else { missing.push("Work Experience"); recs.push("Add at least one work experience entry."); }
    if (educations.length > 0) filled++; else { missing.push("Education"); recs.push("Add your education background."); }

    const coreSkills = [...skills.technical, ...skills.soft, ...skills.tools, ...skills.frameworks];
    if (coreSkills.length > 0) filled++; else { missing.push("Skills"); recs.push("Add relevant skills for the target role."); }
    if (projects.length > 0) filled++;
    if (certifications.length > 0) filled++;
    if (languages.length > 0) filled++;

    const completeness = Math.round((filled / totalSections) * 100);

    const missingKeywords: string[] = [];
    if (formData.keywords) {
      const kw = formData.keywords.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
      const allText = `${summary} ${experiences.map((e) => e.responsibilities + e.achievements).join(" ")} ${coreSkills.join(" ")}`.toLowerCase();
      kw.forEach((k) => { if (!allText.includes(k)) missingKeywords.push(k); });
    }

    const score = Math.min(100, Math.round(
      completeness * 0.4 +
      (coreSkills.length >= 5 ? 20 : coreSkills.length * 4) +
      (experiences.length > 0 ? 15 : 0) +
      (summary.length > 50 ? 15 : summary.length > 0 ? 8 : 0) +
      (missingKeywords.length === 0 && formData.keywords ? 10 : 5)
    ));
    const compatibility = Math.min(100, Math.round(
      (formData.jobDescription ? 20 : 0) + (formData.keywords ? 15 : 0) +
      (coreSkills.length >= 8 ? 25 : coreSkills.length * 3) + (experiences.length > 0 ? 20 : 0) +
      (summary ? 10 : 0) + (formData.targetRole ? 10 : 0)
    ));

    setAtsAnalysis({
      score, compatibility, completeness, missingSections: missing, missingKeywords,
      keywordDensity: [], formattingIssues: [], weakBullets: [], grammarSuggestions: [], recommendations: recs,
    });
  }, [personalInfo, formData, summary, experiences, educations, skills, projects, certifications, languages]);

  /* ---- Validation ---- */
  const validatePersonalInfo = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!personalInfo.fullName.trim()) errors.fullName = "Full name is required";
    if (personalInfo.email && !validateEmail(personalInfo.email)) errors.email = "Invalid email format";
    if (personalInfo.phone && !validatePhone(personalInfo.phone)) errors.phone = "Invalid phone format";
    if (personalInfo.portfolio && !validateUrl(personalInfo.portfolio)) errors.portfolio = "Invalid URL";
    if (personalInfo.linkedin && !validateUrl(personalInfo.linkedin)) errors.linkedin = "Invalid URL";
    if (personalInfo.github && !validateUrl(personalInfo.github)) errors.github = "Invalid URL";
    if (personalInfo.personalWebsite && !validateUrl(personalInfo.personalWebsite)) errors.personalWebsite = "Invalid URL";
    setPersonalErrors(errors);
    return Object.keys(errors).length === 0;
  }, [personalInfo]);

  /* ---- Navigation ---- */
  const handleNext = () => {
    if (step === 1 && !validatePersonalInfo()) return;
    if (step === 2 && (!formData.targetRole.trim() || !formData.skills.trim())) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  /* ---- Generate ---- */
  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const skillsList = formData.skills
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : ["React", "TypeScript", "Node.js"];

      const result = await api.generateResume({
        targetJob: formData.targetRole,
        targetCompany: formData.targetCompany,
        keywords: formData.keywords,
        skills: skillsList,
        experience: formData.jobDescription
          ? [{ title: formData.targetRole, description: formData.jobDescription }]
          : experiences.map((e) => ({ title: e.jobTitle, description: e.responsibilities })),
        preferences: {
          level: formData.experienceLevel, focus: formData.focusArea,
          tone: formData.tone, format: formData.outputFormat,
        },
      } as Parameters<typeof api.generateResume>[0]);

      setGeneratedData(result);
      if (result.professionalSummary) setSummary(result.professionalSummary);
      setGenerated(true);
      setStep(TOTAL_STEPS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume generation failed.");
    } finally {
      setLoading(false);
    }
  };

  /* ---- Save ---- */
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
        summary: generatedData.professionalSummary || summary,
        skills: generatedData.optimizedSkills || [...skills.technical, ...skills.soft],
        experience: (generatedData.optimizedExperience.length > 0
          ? generatedData.optimizedExperience
          : experiences.map((e) => ({ company: e.company, role: e.jobTitle, description: e.responsibilities }))
        ).map((e) => ({ company: e.company, role: e.role, description: e.description })),
        projects: (generatedData.optimizedProjects.length > 0
          ? generatedData.optimizedProjects
          : projects.map((p) => ({ name: p.name, description: p.description }))
        ).map((p) => ({ name: p.name, description: p.description })),
        content: generatedData,
      });
      try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      router.push("/dashboard/resumes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save resume.");
      setSaving(false);
    }
  };

  /* ---- Copy summary ---- */
  const handleCopySummary = async () => {
    const text = generatedData?.professionalSummary || summary;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setSummaryCopied(true);
      setTimeout(() => setSummaryCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  /* ---- Build the FULL resume payload for PDF (all sections) ---- */
  const buildFullResumePayload = (): Record<string, unknown> => {
    const hasCategorized = Object.values(skills).some((arr) => arr.length > 0);
    const fallbackSkills = formData.skills
      ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    return {
      fullName: personalInfo.fullName,
      headline: personalInfo.headline,
      email: personalInfo.email,
      phone: personalInfo.phone,
      country: personalInfo.country,
      city: personalInfo.city,
      portfolio: personalInfo.portfolio,
      linkedin: personalInfo.linkedin,
      github: personalInfo.github,
      personalWebsite: personalInfo.personalWebsite,
      professionalSummary: generatedData?.professionalSummary || summary,
      skills: hasCategorized ? skills : undefined,
      optimizedSkills:
        generatedData && generatedData.optimizedSkills.length > 0
          ? generatedData.optimizedSkills
          : hasCategorized
            ? undefined
            : fallbackSkills,
      experience: experiences.map((e) => ({
        role: e.jobTitle, company: e.company, location: e.location,
        employmentType: e.employmentType, startDate: e.startDate, endDate: e.endDate,
        currentlyWorking: e.currentlyWorking, responsibilities: e.responsibilities,
        achievements: e.achievements, technologies: e.technologies,
      })),
      optimizedExperience: generatedData?.optimizedExperience,
      education: educations.map((e) => ({
        degree: e.degree, institution: e.institution, fieldOfStudy: e.fieldOfStudy,
        gpa: e.gpa, startYear: e.startYear, endYear: e.endYear,
      })),
      projects: projects.map((p) => ({
        name: p.name, role: p.role, description: p.description, technologies: p.technologies,
        duration: p.duration, githubLink: p.githubLink, liveDemoLink: p.liveDemoLink,
        keyAchievements: p.keyAchievements,
      })),
      optimizedProjects: generatedData?.optimizedProjects,
      certifications: certifications.map((c) => ({
        name: c.name, organization: c.organization, issueDate: c.issueDate,
        expirationDate: c.expirationDate, credentialId: c.credentialId, credentialUrl: c.credentialUrl,
      })),
      achievements: achievements.map((a) => ({
        title: a.title, type: a.type, description: a.description, date: a.date,
      })),
      languages: languages.map((l) => ({ language: l.language, proficiency: l.proficiency })),
      volunteer: volunteer.map((v) => ({
        organization: v.organization, position: v.position, duration: v.duration, description: v.description,
      })),
      publications: publications.map((p) => ({
        title: p.title, publisher: p.publisher, date: p.date, url: p.url,
      })),
      interests,
      referencesAvailable,
      references: references.map((r) => ({
        name: r.name, position: r.position, company: r.company, email: r.email, phone: r.phone,
      })),
    };
  };

  /* ---- REAL AI text action ---- */
  const handleAiAction = async (action: string, target: string) => {
    const loadingKey = `${action}-${target}`;
    setAiActionLoading(loadingKey);
    setError("");

    try {
      if (typeof apiExt.aiTextAction !== "function") {
        setError("AI text-actions not wired in lib/api.ts yet (add the aiTextAction method).");
        setAiActionLoading(null);
        return;
      }

      let currentText = "";
      if (target === "summary") {
        currentText = summary;
      } else {
        const exp = experiences.find((e) => e.id === target);
        const proj = projects.find((p) => p.id === target);
        if (exp) currentText = [exp.responsibilities, exp.achievements].filter(Boolean).join("\n\n");
        else if (proj) currentText = proj.description;
      }

      const isGenerate = action === "generate-summary";
      if (!isGenerate && !currentText.trim()) {
        setError("AI ব্যবহারের আগে কিছু লিখুন।");
        setAiActionLoading(null);
        return;
      }

      const { result } = await apiExt.aiTextAction({
        action, text: currentText, context: formData.jobDescription, targetRole: formData.targetRole,
      });

      if (!result) {
        setError("AI কোনো ফলাফল দেয়নি। আবার চেষ্টা করুন।");
        setAiActionLoading(null);
        return;
      }

      if (target === "summary") {
        setSummary(result);
      } else {
        const exp = experiences.find((e) => e.id === target);
        const proj = projects.find((p) => p.id === target);
        if (exp) updateExperience(target, "responsibilities", result);
        else if (proj) updateProject(target, "description", result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI action failed. Try again.");
    } finally {
      setAiActionLoading(null);
    }
  };

  /* ---- Skill helpers ---- */
  const addSkill = (category: keyof SkillsData) => {
    const val = (skillInput[category] || "").trim();
    if (!val || skills[category].includes(val)) return;
    setSkills((prev) => ({ ...prev, [category]: [...prev[category], val] }));
    setSkillInput((prev) => ({ ...prev, [category]: "" }));
  };
  const removeSkill = (category: keyof SkillsData, skill: string) =>
    setSkills((prev) => ({ ...prev, [category]: prev[category].filter((s) => s !== skill) }));

  /* ---- List helpers ---- */
  const addExperience = () => setExperiences((p) => [...p, {
    id: generateId(), company: "", jobTitle: "", employmentType: "Full-time", location: "",
    startDate: "", endDate: "", currentlyWorking: false, responsibilities: "", achievements: "", technologies: "",
  }]);
  const removeExperience = (id: string) => setExperiences((p) => p.filter((e) => e.id !== id));
  const updateExperience = (id: string, field: keyof WorkExperience, value: string | boolean) =>
    setExperiences((p) => p.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const addEducation = () => setEducations((p) => [...p, {
    id: generateId(), degree: "", institution: "", fieldOfStudy: "", gpa: "", startYear: "", endYear: "",
  }]);
  const removeEducation = (id: string) => setEducations((p) => p.filter((e) => e.id !== id));
  const updateEducation = (id: string, field: keyof Education, value: string) =>
    setEducations((p) => p.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const addProject = () => setProjects((p) => [...p, {
    id: generateId(), name: "", description: "", technologies: "", githubLink: "", liveDemoLink: "", role: "", duration: "", keyAchievements: "",
  }]);
  const removeProject = (id: string) => setProjects((p) => p.filter((x) => x.id !== id));
  const updateProject = (id: string, field: keyof Project, value: string) =>
    setProjects((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const addCertification = () => setCertifications((p) => [...p, {
    id: generateId(), name: "", organization: "", issueDate: "", expirationDate: "", credentialId: "", credentialUrl: "",
  }]);
  const removeCertification = (id: string) => setCertifications((p) => p.filter((c) => c.id !== id));
  const updateCertification = (id: string, field: keyof Certification, value: string) =>
    setCertifications((p) => p.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  const addAchievement = () => setAchievements((p) => [...p, { id: generateId(), title: "", type: "Award", description: "", date: "" }]);
  const removeAchievement = (id: string) => setAchievements((p) => p.filter((a) => a.id !== id));
  const updateAchievement = (id: string, field: keyof Achievement, value: string) =>
    setAchievements((p) => p.map((a) => (a.id === id ? { ...a, [field]: value } : a)));

  const addLanguage = () => setLanguages((p) => [...p, { id: generateId(), language: "", proficiency: "Professional" }]);
  const removeLanguage = (id: string) => setLanguages((p) => p.filter((l) => l.id !== id));
  const updateLanguage = (id: string, field: keyof LanguageEntry, value: string) =>
    setLanguages((p) => p.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  const addVolunteer = () => setVolunteer((p) => [...p, { id: generateId(), organization: "", position: "", duration: "", description: "" }]);
  const removeVolunteer = (id: string) => setVolunteer((p) => p.filter((v) => v.id !== id));
  const updateVolunteer = (id: string, field: keyof VolunteerEntry, value: string) =>
    setVolunteer((p) => p.map((v) => (v.id === id ? { ...v, [field]: value } : v)));

  const addPublication = () => setPublications((p) => [...p, { id: generateId(), title: "", publisher: "", date: "", url: "" }]);
  const removePublication = (id: string) => setPublications((p) => p.filter((x) => x.id !== id));
  const updatePublication = (id: string, field: keyof Publication, value: string) =>
    setPublications((p) => p.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const addReference = () => setReferences((p) => [...p, { id: generateId(), name: "", position: "", company: "", email: "", phone: "" }]);
  const removeReference = (id: string) => setReferences((p) => p.filter((r) => r.id !== id));
  const updateReference = (id: string, field: keyof Reference, value: string) =>
    setReferences((p) => p.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const addInterest = () => {
    const val = interestInput.trim();
    if (!val || interests.includes(val)) return;
    setInterests((p) => [...p, val]);
    setInterestInput("");
  };

  const skillChips = formData.skills ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean) : [];
  const keywordChips = formData.keywords ? formData.keywords.split(",").map((s) => s.trim()).filter(Boolean) : [];

  /* ================================================================== */
  return (
    <div className="relative mx-auto w-full max-w-screen-2xl overflow-x-clip p-4 sm:p-6 md:p-8 lg:p-10">
      <AmbientBackground />
      <GeneratingOverlay show={loading} />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="min-w-0">
          <Link href="/dashboard/resumes" className="mb-3 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-primary sm:mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Resumes
          </Link>
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-foreground sm:gap-3 sm:text-3xl md:text-4xl">
            <span className="shrink-0 rounded-xl bg-primary/10 p-1.5 ring-1 ring-primary/20 sm:p-2">
              <Wand2 className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
            </span>
            <span className="min-w-0 break-words bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              AI Resume Builder
            </span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">Create a perfectly tailored, ATS-optimized resume.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {step < TOTAL_STEPS && <AutoSaveIndicator status={autoSaveStatus} lastSaved={lastSaved} />}
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="gap-1.5 rounded-lg">
            <Eye className="h-4 w-4" /> {showPreview ? "Hide" : "Preview"}
          </Button>
        </div>
      </motion.div>

      <Stepper step={step} totalSteps={TOTAL_STEPS} />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive shadow-sm backdrop-blur"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">Error</p>
              <p className="mt-1 break-words opacity-90">{error}</p>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto shrink-0 text-destructive hover:bg-destructive/20" onClick={() => setError("")}>
              Dismiss
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-[minmax(0,1fr)_420px]" : "grid-cols-1"}`}>
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto w-full max-w-4xl">
                <Card className="relative overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-xl shadow-black/10 backdrop-blur-xl">
                  <CardHeader className="border-b border-border/50 bg-background/40 pb-6">
                    <CardTitle className="flex items-center gap-3 text-lg font-bold sm:text-xl">
                      <div className="rounded-lg bg-primary/10 p-2"><User className="h-5 w-5 text-primary" /></div>
                      Personal Information
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">Your contact details and professional identity.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <FormField label="Full Name" icon={User} required error={personalErrors.fullName}>
                        <Input placeholder="e.g. John Smith" value={personalInfo.fullName} onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                      </FormField>
                      <FormField label="Professional Headline" icon={PenLine} optional>
                        <Input placeholder="e.g. Senior Frontend Engineer | React Specialist" value={personalInfo.headline} onChange={(e) => setPersonalInfo({ ...personalInfo, headline: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                      </FormField>
                      <FormField label="Email Address" icon={Mail} error={personalErrors.email}>
                        <Input type="email" placeholder="john@example.com" value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                      </FormField>
                      <FormField label="Phone Number" icon={Phone} error={personalErrors.phone}>
                        <Input placeholder="+1 (555) 123-4567" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                      </FormField>
                      <FormField label="Country" icon={Globe} optional>
                        <Input placeholder="e.g. United States" value={personalInfo.country} onChange={(e) => setPersonalInfo({ ...personalInfo, country: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                      </FormField>
                      <FormField label="City" icon={MapPin} optional>
                        <Input placeholder="e.g. San Francisco" value={personalInfo.city} onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                      </FormField>
                      <FormField label="Portfolio Website" icon={Globe} optional error={personalErrors.portfolio}>
                        <Input placeholder="https://yourportfolio.com" value={personalInfo.portfolio} onChange={(e) => setPersonalInfo({ ...personalInfo, portfolio: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                      </FormField>
                      <FormField label="LinkedIn URL" icon={Contact} optional error={personalErrors.linkedin}>
                        <Input placeholder="https://linkedin.com/in/yourprofile" value={personalInfo.linkedin} onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                      </FormField>
                      <FormField label="GitHub URL" icon={Code2} optional error={personalErrors.github}>
                        <Input placeholder="https://github.com/yourusername" value={personalInfo.github} onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                      </FormField>
                      <FormField label="Personal Website" icon={ExternalLink} optional error={personalErrors.personalWebsite}>
                        <Input placeholder="https://yourwebsite.com" value={personalInfo.personalWebsite} onChange={(e) => setPersonalInfo({ ...personalInfo, personalWebsite: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                      </FormField>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end rounded-b-2xl border-t border-border/50 bg-background/30 pt-6">
                    <Button onClick={handleNext} className="h-11 w-full gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md sm:w-auto">
                      Next: Target Role <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="relative min-w-0 overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-xl shadow-black/10 backdrop-blur-xl lg:col-span-2">
                  <CardHeader className="border-b border-border/50 bg-background/40 pb-6">
                    <CardTitle className="flex items-center gap-3 text-lg font-bold sm:text-xl">
                      <div className="rounded-lg bg-primary/10 p-2"><FileText className="h-5 w-5 text-primary" /></div>
                      Target Role Details
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">Tell us what job you are applying for to tailor the content.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <FormField label="Target Job Title" icon={Briefcase} required>
                        <Input placeholder="e.g. Frontend Engineer" value={formData.targetRole} onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                      </FormField>
                      <FormField label="Target Company" icon={Building2} optional>
                        <Input placeholder="e.g. Google, Brain Station 23" value={formData.targetCompany} onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                      </FormField>
                    </div>
                    <FormField label="Skills (comma separated)" icon={Target} required>
                      <Input placeholder="e.g. React, TypeScript, Tailwind CSS, Next.js" value={formData.skills} onChange={(e) => setFormData({ ...formData, skills: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                    </FormField>
                    <FormField label="ATS Keywords to Highlight" icon={KeyRound} optional>
                      <Input placeholder="e.g. performance optimization, state management, UI architecture" value={formData.keywords} onChange={(e) => setFormData({ ...formData, keywords: e.target.value })} className="h-12 rounded-xl border-border/60 bg-background/50" />
                    </FormField>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                      <FormField label="Industry" icon={Building2} optional>
                        <select value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} className="h-12 w-full rounded-xl border border-border/60 bg-background/50 px-3 text-sm">
                          <option value="">Select...</option>
                          {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Employment Type" icon={Briefcase} optional>
                        <select value={formData.employmentType} onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })} className="h-12 w-full rounded-xl border border-border/60 bg-background/50 px-3 text-sm">
                          {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </FormField>
                      <FormField label="Work Type" icon={MapPin} optional>
                        <select value={formData.workType} onChange={(e) => setFormData({ ...formData, workType: e.target.value })} className="h-12 w-full rounded-xl border border-border/60 bg-background/50 px-3 text-sm">
                          {WORK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </FormField>
                    </div>
                    <FormField label="Job Description" icon={AlignLeft} optional>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{formData.jobDescription.length} chars</span>
                      </div>
                      <Textarea placeholder="Paste the job description here for maximum ATS optimization..." className="min-h-[160px] resize-y rounded-xl border-border/60 bg-background/50 p-4 leading-relaxed" value={formData.jobDescription} onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })} />
                    </FormField>
                  </CardContent>
                  <CardFooter className="flex flex-col-reverse gap-3 rounded-b-2xl border-t border-border/50 bg-background/30 pt-6 sm:flex-row sm:justify-between">
                    <Button variant="outline" onClick={handleBack} className="h-11 w-full rounded-xl px-6 sm:w-auto">Back</Button>
                    <Button onClick={handleNext} disabled={!formData.targetRole.trim() || !formData.skills.trim()} className="h-11 w-full gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md sm:w-auto">
                      Next: Summary <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </CardFooter>
                </Card>

                <div className="min-w-0 space-y-4">
                  <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-md backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-background/40 py-4">
                      <div className="flex items-center gap-2"><Eye className="h-4 w-4 text-primary" /><h4 className="text-sm font-semibold">Live Preview</h4></div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-5">
                      <div>
                        <p className="break-words text-base font-bold leading-tight text-foreground">{formData.targetRole || "Your target role"}</p>
                        {formData.targetCompany && <p className="mt-0.5 break-words text-xs text-muted-foreground">at {formData.targetCompany}</p>}
                      </div>
                      {skillChips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {skillChips.slice(0, 8).map((s) => (
                            <span key={s} className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{s}</span>
                          ))}
                        </div>
                      )}
                      {keywordChips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {keywordChips.slice(0, 6).map((k) => (
                            <span key={k} className="rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent-foreground/90">{k}</span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border-primary/20 bg-primary/5 shadow-md backdrop-blur-xl">
                    <CardContent className="space-y-3 pt-6">
                      <div className="flex items-center gap-2 text-primary"><Lightbulb className="h-5 w-5 shrink-0" /><h4 className="font-semibold">Pro tips</h4></div>
                      <ul className="space-y-2 text-sm leading-relaxed text-foreground/80">
                        <li>• Paste the real job description — it drives keyword matching for ATS.</li>
                        <li>• List skills in the order they matter most for this role.</li>
                        <li>• Add a target company to personalize tone and framing.</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto w-full max-w-4xl">
                <Card className="relative overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-xl shadow-black/10 backdrop-blur-xl">
                  <CardHeader className="border-b border-border/50 bg-background/40 pb-6">
                    <CardTitle className="flex items-center gap-3 text-lg font-bold sm:text-xl">
                      <div className="rounded-lg bg-primary/10 p-2"><MessageSquare className="h-5 w-5 text-primary" /></div>
                      Professional Summary
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">Write or generate a compelling summary that hooks recruiters.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <Textarea placeholder="Write your professional summary or use AI to generate one..." className="min-h-[180px] resize-y rounded-xl border-border/60 bg-background/50 p-4 text-sm leading-relaxed" value={summary} onChange={(e) => setSummary(e.target.value)} />
                    <div className="flex flex-wrap gap-2">
                      {SUMMARY_ACTIONS.map((btn) => {
                        const busy = aiActionLoading === `${btn.action}-summary`;
                        const BtnIcon = btn.icon;
                        return (
                          <Button key={btn.action} variant="outline" size="sm" onClick={() => handleAiAction(btn.action, "summary")} disabled={busy} className="gap-1.5 rounded-lg text-xs">
                            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BtnIcon className="h-3.5 w-3.5" />}
                            {btn.label}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col-reverse gap-3 rounded-b-2xl border-t border-border/50 bg-background/30 pt-6 sm:flex-row sm:justify-between">
                    <Button variant="outline" onClick={handleBack} className="h-11 w-full rounded-xl px-6 sm:w-auto">Back</Button>
                    <Button onClick={handleNext} className="h-11 w-full gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md sm:w-auto">
                      Next: Experience <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto w-full max-w-4xl space-y-6">
                <DynamicListCard<WorkExperience>
                  title="Work Experience"
                  icon={Briefcase}
                  items={experiences}
                  onAdd={addExperience}
                  onRemove={removeExperience}
                  emptyText="No work experience added yet. Add your professional history."
                  renderItem={(exp) => (
                    <div className="space-y-4 pr-8">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Job Title *</Label>
                          <Input placeholder="e.g. Senior Frontend Engineer" value={exp.jobTitle} onChange={(e) => updateExperience(exp.id, "jobTitle", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Company *</Label>
                          <Input placeholder="e.g. Google" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Employment Type</Label>
                          <select value={exp.employmentType} onChange={(e) => updateExperience(exp.id, "employmentType", e.target.value)} className="h-10 w-full rounded-lg border border-border/60 bg-background/50 px-3 text-sm">
                            {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Location</Label>
                          <Input placeholder="e.g. San Francisco, CA" value={exp.location} onChange={(e) => updateExperience(exp.id, "location", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Start Date</Label>
                          <Input type="month" value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">End Date</Label>
                          <Input type="month" value={exp.endDate} disabled={exp.currentlyWorking} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm disabled:opacity-50" />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" checked={exp.currentlyWorking} onChange={(e) => updateExperience(exp.id, "currentlyWorking", e.target.checked)} className="h-4 w-4 rounded border-border" />
                        Currently working here
                      </label>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Responsibilities</Label>
                        <Textarea placeholder="Describe your key responsibilities..." value={exp.responsibilities} onChange={(e) => updateExperience(exp.id, "responsibilities", e.target.value)} className="min-h-[80px] rounded-lg border-border/60 bg-background/50 p-3 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Key Achievements</Label>
                        <Textarea placeholder="Quantifiable achievements (e.g. Increased performance by 40%)" value={exp.achievements} onChange={(e) => updateExperience(exp.id, "achievements", e.target.value)} className="min-h-[60px] rounded-lg border-border/60 bg-background/50 p-3 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Technologies Used</Label>
                        <Input placeholder="e.g. React, TypeScript, AWS" value={exp.technologies} onChange={(e) => updateExperience(exp.id, "technologies", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => handleAiAction("rewrite-exp", exp.id)} disabled={aiActionLoading === `rewrite-exp-${exp.id}`}>
                          {aiActionLoading === `rewrite-exp-${exp.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />} AI Rewrite
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => handleAiAction("quantify-exp", exp.id)} disabled={aiActionLoading === `quantify-exp-${exp.id}`}>
                          {aiActionLoading === `quantify-exp-${exp.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />} Quantify
                        </Button>
                      </div>
                    </div>
                  )}
                />
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button variant="outline" onClick={handleBack} className="h-11 w-full rounded-xl px-6 sm:w-auto">Back</Button>
                  <Button onClick={handleNext} className="h-11 w-full gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md sm:w-auto">
                    Next: Education <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto w-full max-w-4xl space-y-6">
                <DynamicListCard<Education>
                  title="Education"
                  icon={GraduationCap}
                  items={educations}
                  onAdd={addEducation}
                  onRemove={removeEducation}
                  emptyText="No education added yet. Add your academic background."
                  renderItem={(edu) => (
                    <div className="grid grid-cols-1 gap-4 pr-8 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Degree *</Label>
                        <Input placeholder="e.g. Bachelor of Science" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Institution *</Label>
                        <Input placeholder="e.g. MIT" value={edu.institution} onChange={(e) => updateEducation(edu.id, "institution", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Field of Study</Label>
                        <Input placeholder="e.g. Computer Science" value={edu.fieldOfStudy} onChange={(e) => updateEducation(edu.id, "fieldOfStudy", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">GPA (Optional)</Label>
                        <Input placeholder="e.g. 3.8/4.0" value={edu.gpa} onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Start Year</Label>
                        <Input placeholder="e.g. 2018" value={edu.startYear} onChange={(e) => updateEducation(edu.id, "startYear", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">End Year</Label>
                        <Input placeholder="e.g. 2022" value={edu.endYear} onChange={(e) => updateEducation(edu.id, "endYear", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                      </div>
                    </div>
                  )}
                />
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button variant="outline" onClick={handleBack} className="h-11 w-full rounded-xl px-6 sm:w-auto">Back</Button>
                  <Button onClick={handleNext} className="h-11 w-full gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md sm:w-auto">
                    Next: Skills <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 6 */}
            {step === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto w-full max-w-4xl space-y-6">
                <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-xl shadow-black/10 backdrop-blur-xl">
                  <CardHeader className="border-b border-border/50 bg-background/40 pb-6">
                    <CardTitle className="flex items-center gap-3 text-lg font-bold sm:text-xl">
                      <div className="rounded-lg bg-primary/10 p-2"><Zap className="h-5 w-5 text-primary" /></div> Skills
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">Categorize your skills for better ATS parsing.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {SKILL_CATEGORIES.map(({ key, label, icon: Icon }) => (
                      <div key={key} className="space-y-2.5">
                        <Label className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground/90">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10"><Icon className="h-3 w-3 text-primary" /></span>
                          {label}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder={`Add ${label.toLowerCase()}...`}
                            value={skillInput[key] || ""}
                            onChange={(e) => setSkillInput((prev) => ({ ...prev, [key]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(key); } }}
                            className="h-10 min-w-0 flex-1 rounded-lg border-border/60 bg-background/50 text-sm"
                          />
                          <Button variant="outline" size="sm" onClick={() => addSkill(key)} className="shrink-0 rounded-lg"><Plus className="h-4 w-4" /></Button>
                        </div>
                        {skills[key].length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {skills[key].map((skill) => (
                              <motion.span key={skill} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="group flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                {skill}
                                <button onClick={() => removeSkill(key, skill)} className="ml-0.5 opacity-0 transition-opacity group-hover:opacity-100"><X className="h-3 w-3" /></button>
                              </motion.span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="flex flex-col-reverse gap-3 rounded-b-2xl border-t border-border/50 bg-background/30 pt-6 sm:flex-row sm:justify-between">
                    <Button variant="outline" onClick={handleBack} className="h-11 w-full rounded-xl px-6 sm:w-auto">Back</Button>
                    <Button onClick={handleNext} className="h-11 w-full gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md sm:w-auto">
                      Next: Projects <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* STEP 7 */}
            {step === 7 && (
              <motion.div key="step7" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto w-full max-w-4xl space-y-6">
                <DynamicListCard<Project>
                  title="Projects"
                  icon={Layers}
                  items={projects}
                  onAdd={addProject}
                  onRemove={removeProject}
                  emptyText="No projects added yet. Showcase your best work."
                  renderItem={(proj) => (
                    <div className="space-y-4 pr-8">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Project Name *</Label>
                          <Input placeholder="e.g. E-Commerce Platform" value={proj.name} onChange={(e) => updateProject(proj.id, "name", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Your Role</Label>
                          <Input placeholder="e.g. Lead Developer" value={proj.role} onChange={(e) => updateProject(proj.id, "role", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Description</Label>
                        <Textarea placeholder="Describe the project, its impact, and your contributions..." value={proj.description} onChange={(e) => updateProject(proj.id, "description", e.target.value)} className="min-h-[80px] rounded-lg border-border/60 bg-background/50 p-3 text-sm" />
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Technologies</Label>
                          <Input placeholder="e.g. Next.js, PostgreSQL, AWS" value={proj.technologies} onChange={(e) => updateProject(proj.id, "technologies", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Duration</Label>
                          <Input placeholder="e.g. Jan 2023 - Jun 2023" value={proj.duration} onChange={(e) => updateProject(proj.id, "duration", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">GitHub Link</Label>
                          <Input placeholder="https://github.com/..." value={proj.githubLink} onChange={(e) => updateProject(proj.id, "githubLink", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Live Demo Link</Label>
                          <Input placeholder="https://..." value={proj.liveDemoLink} onChange={(e) => updateProject(proj.id, "liveDemoLink", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Key Achievements</Label>
                        <Textarea placeholder="e.g. Served 10K+ users, Reduced load time by 60%" value={proj.keyAchievements} onChange={(e) => updateProject(proj.id, "keyAchievements", e.target.value)} className="min-h-[60px] rounded-lg border-border/60 bg-background/50 p-3 text-sm" />
                      </div>
                      <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => handleAiAction("improve-project", proj.id)} disabled={aiActionLoading === `improve-project-${proj.id}`}>
                        {aiActionLoading === `improve-project-${proj.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />} AI Improve Description
                      </Button>
                    </div>
                  )}
                />
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button variant="outline" onClick={handleBack} className="h-11 w-full rounded-xl px-6 sm:w-auto">Back</Button>
                  <Button onClick={handleNext} className="h-11 w-full gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md sm:w-auto">
                    Next: More Sections <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 8 */}
            {step === 8 && (
              <motion.div key="step8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto w-full max-w-4xl space-y-6">
                <DynamicListCard<Certification>
                  title="Certifications"
                  icon={BadgeCheck}
                  items={certifications}
                  onAdd={addCertification}
                  onRemove={removeCertification}
                  emptyText="No certifications added. Add relevant professional certifications."
                  renderItem={(cert) => (
                    <div className="grid grid-cols-1 gap-4 pr-8 md:grid-cols-2">
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Certificate Name *</Label><Input value={cert.name} onChange={(e) => updateCertification(cert.id, "name", e.target.value)} placeholder="e.g. AWS Solutions Architect" className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Issuing Organization</Label><Input value={cert.organization} onChange={(e) => updateCertification(cert.id, "organization", e.target.value)} placeholder="e.g. Amazon Web Services" className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Issue Date</Label><Input type="month" value={cert.issueDate} onChange={(e) => updateCertification(cert.id, "issueDate", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Expiration Date</Label><Input type="month" value={cert.expirationDate} onChange={(e) => updateCertification(cert.id, "expirationDate", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Credential ID</Label><Input value={cert.credentialId} onChange={(e) => updateCertification(cert.id, "credentialId", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Credential URL</Label><Input value={cert.credentialUrl} onChange={(e) => updateCertification(cert.id, "credentialUrl", e.target.value)} placeholder="https://..." className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                    </div>
                  )}
                />

                <DynamicListCard<Achievement>
                  title="Achievements & Awards"
                  icon={Trophy}
                  items={achievements}
                  onAdd={addAchievement}
                  onRemove={removeAchievement}
                  emptyText="No achievements added. Highlight awards, hackathons, competitions."
                  renderItem={(ach) => (
                    <div className="grid grid-cols-1 gap-4 pr-8 md:grid-cols-2">
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Title *</Label><Input value={ach.title} onChange={(e) => updateAchievement(ach.id, "title", e.target.value)} placeholder="e.g. 1st Place - HackMIT 2023" className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Type</Label>
                        <select value={ach.type} onChange={(e) => updateAchievement(ach.id, "type", e.target.value)} className="h-10 w-full rounded-lg border border-border/60 bg-background/50 px-3 text-sm">
                          {ACHIEVEMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5 md:col-span-2"><Label className="text-xs font-medium">Description</Label><Textarea value={ach.description} onChange={(e) => updateAchievement(ach.id, "description", e.target.value)} className="min-h-[60px] rounded-lg border-border/60 bg-background/50 p-3 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Date</Label><Input type="month" value={ach.date} onChange={(e) => updateAchievement(ach.id, "date", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                    </div>
                  )}
                />

                <DynamicListCard<LanguageEntry>
                  title="Languages"
                  icon={Languages}
                  items={languages}
                  onAdd={addLanguage}
                  onRemove={removeLanguage}
                  emptyText="No languages added. List languages you speak."
                  renderItem={(lang) => (
                    <div className="flex flex-col gap-4 pr-8 sm:flex-row">
                      <div className="flex-1 space-y-1.5"><Label className="text-xs font-medium">Language</Label><Input value={lang.language} onChange={(e) => updateLanguage(lang.id, "language", e.target.value)} placeholder="e.g. English" className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                      <div className="flex-1 space-y-1.5"><Label className="text-xs font-medium">Proficiency</Label>
                        <select value={lang.proficiency} onChange={(e) => updateLanguage(lang.id, "proficiency", e.target.value)} className="h-10 w-full rounded-lg border border-border/60 bg-background/50 px-3 text-sm">
                          {PROFICIENCY_LEVELS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                />

                <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
                  <CardHeader className="border-b border-border/50 bg-background/40 py-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><Heart className="h-4 w-4 text-primary" /> Interests</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="flex gap-2">
                      <Input placeholder="Add an interest..." value={interestInput} onChange={(e) => setInterestInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }} className="h-10 min-w-0 flex-1 rounded-lg border-border/60 bg-background/50 text-sm" />
                      <Button variant="outline" size="sm" onClick={addInterest} className="shrink-0 rounded-lg"><Plus className="h-4 w-4" /></Button>
                    </div>
                    {interests.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {interests.map((interest) => (
                          <span key={interest} className="group flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1 text-xs">
                            {interest}
                            <button onClick={() => setInterests((prev) => prev.filter((i) => i !== interest))} className="opacity-0 transition-opacity group-hover:opacity-100"><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <DynamicListCard<VolunteerEntry>
                  title="Volunteer Experience"
                  icon={Users}
                  items={volunteer}
                  onAdd={addVolunteer}
                  onRemove={removeVolunteer}
                  emptyText="No volunteer experience added."
                  renderItem={(vol) => (
                    <div className="grid grid-cols-1 gap-4 pr-8 md:grid-cols-2">
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Organization</Label><Input value={vol.organization} onChange={(e) => updateVolunteer(vol.id, "organization", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Position</Label><Input value={vol.position} onChange={(e) => updateVolunteer(vol.id, "position", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Duration</Label><Input value={vol.duration} onChange={(e) => updateVolunteer(vol.id, "duration", e.target.value)} placeholder="e.g. 2022 - 2023" className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                      <div className="space-y-1.5 md:col-span-2"><Label className="text-xs font-medium">Description</Label><Textarea value={vol.description} onChange={(e) => updateVolunteer(vol.id, "description", e.target.value)} className="min-h-[60px] rounded-lg border-border/60 bg-background/50 p-3 text-sm" /></div>
                    </div>
                  )}
                />

                <DynamicListCard<Publication>
                  title="Publications"
                  icon={BookMarked}
                  items={publications}
                  onAdd={addPublication}
                  onRemove={removePublication}
                  emptyText="No publications added."
                  renderItem={(pub) => (
                    <div className="grid grid-cols-1 gap-4 pr-8 md:grid-cols-2">
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Title</Label><Input value={pub.title} onChange={(e) => updatePublication(pub.id, "title", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Publisher</Label><Input value={pub.publisher} onChange={(e) => updatePublication(pub.id, "publisher", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">Date</Label><Input type="month" value={pub.date} onChange={(e) => updatePublication(pub.id, "date", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                      <div className="space-y-1.5"><Label className="text-xs font-medium">URL</Label><Input value={pub.url} onChange={(e) => updatePublication(pub.id, "url", e.target.value)} className="h-10 rounded-lg border-border/60 bg-background/50 text-sm" /></div>
                    </div>
                  )}
                />

                <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
                  <CardHeader className="border-b border-border/50 bg-background/40 py-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg"><UserCheck className="h-4 w-4 text-primary" /> References</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-5">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={referencesAvailable} onChange={(e) => setReferencesAvailable(e.target.checked)} className="h-4 w-4 rounded border-border" />
                      References available upon request
                    </label>
                    {!referencesAvailable && (
                      <div className="space-y-4">
                        {references.map((ref) => (
                          <div key={ref.id} className="relative grid grid-cols-1 gap-3 rounded-lg border border-border/40 bg-background/40 p-4 pr-10 md:grid-cols-2">
                            <button onClick={() => removeReference(ref.id)} aria-label="Remove reference" className="absolute right-2 top-2 rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                            <Input placeholder="Name" value={ref.name} onChange={(e) => updateReference(ref.id, "name", e.target.value)} className="h-10 rounded-lg text-sm" />
                            <Input placeholder="Position" value={ref.position} onChange={(e) => updateReference(ref.id, "position", e.target.value)} className="h-10 rounded-lg text-sm" />
                            <Input placeholder="Company" value={ref.company} onChange={(e) => updateReference(ref.id, "company", e.target.value)} className="h-10 rounded-lg text-sm" />
                            <Input placeholder="Email" value={ref.email} onChange={(e) => updateReference(ref.id, "email", e.target.value)} className="h-10 rounded-lg text-sm" />
                            <Input placeholder="Phone" value={ref.phone} onChange={(e) => updateReference(ref.id, "phone", e.target.value)} className="h-10 rounded-lg text-sm" />
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addReference} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Reference</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                  <Button variant="outline" onClick={handleBack} className="h-11 w-full rounded-xl px-6 sm:w-auto">Back</Button>
                  <Button onClick={handleNext} className="h-11 w-full gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md sm:w-auto">
                    Next: AI Settings <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 9 */}
            {step === 9 && (
              <motion.div key="step9" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: "easeOut" }} className="mx-auto w-full max-w-5xl space-y-6">
                <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-xl shadow-black/10 backdrop-blur-xl">
                  <CardHeader className="border-b border-border/50 bg-background/40 pb-6">
                    <CardTitle className="flex items-center gap-3 text-lg font-bold sm:text-xl">
                      <div className="rounded-lg bg-primary/10 p-2"><Layout className="h-5 w-5 text-primary" /></div> Resume Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {RESUME_TEMPLATES.map((tmpl) => (
                        <motion.button
                          key={tmpl.id}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedTemplate(tmpl.id)}
                          className={`rounded-xl border p-3 text-left transition-all sm:p-4 ${selectedTemplate === tmpl.id ? "border-primary/60 bg-primary/10 ring-1 ring-primary/30" : "border-border/50 bg-background/40 hover:border-primary/30"}`}
                        >
                          <div className={`mb-2 h-14 rounded-lg sm:h-16 ${selectedTemplate === tmpl.id ? "bg-primary/20" : "bg-muted/40"}`} />
                          <p className="truncate text-sm font-semibold">{tmpl.name}</p>
                          <p className="line-clamp-2 text-[10px] text-muted-foreground">{tmpl.description}</p>
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-xl shadow-black/10 backdrop-blur-xl">
                  <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
                  <CardHeader className="relative z-10 border-b border-border/50 bg-background/40 pb-6">
                    <CardTitle className="flex items-center gap-3 text-lg font-bold sm:text-xl">
                      <div className="rounded-lg bg-primary/10 p-2"><BrainCircuit className="h-5 w-5 text-primary" /></div> AI Generation Settings
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">Configure how the AI should write your resume.</CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-8 pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <OptionSelector icon={Briefcase} label="Experience Level" value={formData.experienceLevel} options={["Entry-Level (0-2 years)", "Mid-Level (3-5 years)", "Senior-Level (6+ years)", "Executive"]} onChange={(v) => setFormData({ ...formData, experienceLevel: v })} />
                      <OptionSelector icon={Target} label="Focus Area" value={formData.focusArea} options={["Leadership & Management", "Technical Depth", "Product & Delivery", "General / Balanced"]} recommended="General / Balanced" onChange={(v) => setFormData({ ...formData, focusArea: v })} />
                      <OptionSelector icon={MessageSquare} label="Writing Tone" value={formData.tone} options={["Professional & Direct", "Enthusiastic & Driven", "Analytical & Data-Focused", "Creative & Modern"]} recommended="Professional & Direct" onChange={(v) => setFormData({ ...formData, tone: v })} />
                      <OptionSelector icon={AlignLeft} label="Output Format" value={formData.outputFormat} options={["Bullet-Heavy (Best for ATS)", "Paragraph-Heavy (Storytelling)", "Balanced Hybrid"]} recommended="Bullet-Heavy (Best for ATS)" onChange={(v) => setFormData({ ...formData, outputFormat: v })} />
                    </div>
                    <motion.div
                      className="mt-4 flex gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm backdrop-blur-sm sm:p-5"
                      animate={{ boxShadow: ["0 0 0px hsl(var(--primary)/0)", "0 0 24px hsl(var(--primary)/0.1)", "0 0 0px hsl(var(--primary)/0)"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="mt-0.5 h-6 w-6 shrink-0 animate-pulse text-primary" />
                      <div className="min-w-0">
                        <h4 className="mb-1 font-semibold text-primary">AI Processing</h4>
                        <p className="text-sm leading-relaxed text-foreground/80">
                          Our AI will analyze your profile, extract key achievements, and rewrite them into high-impact, quantifiable bullet points tailored perfectly to your selected settings.
                        </p>
                      </div>
                    </motion.div>
                  </CardContent>
                  <CardFooter className="relative z-10 flex flex-col-reverse gap-3 rounded-b-2xl border-t border-border/50 bg-background/30 pt-6 sm:flex-row sm:justify-between">
                    <Button variant="outline" onClick={handleBack} className="h-11 w-full rounded-xl px-6 sm:w-auto">Back</Button>
                    <motion.div whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                      <Button onClick={handleGenerate} disabled={loading} className="h-11 w-full gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md sm:w-auto">
                        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Resume</>}
                      </Button>
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* STEP 10 */}
            {step === 10 && generated && generatedData && (
              <motion.div key="step10" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="mx-auto w-full max-w-5xl space-y-6">
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-700 shadow-sm backdrop-blur-sm sm:items-center sm:gap-4 sm:p-5 dark:text-green-400">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500 sm:h-7 sm:w-7" />
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold sm:text-lg">Resume Generated Successfully!</h3>
                    <p className="text-sm opacity-90">Your AI-optimized resume is ready for review.</p>
                  </div>
                </motion.div>

                <ATSAnalysisPanel analysis={atsAnalysis} />

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <Card className="overflow-hidden rounded-2xl border-border/50 bg-gradient-to-br from-card/70 to-card/50 shadow-lg backdrop-blur-xl">
                    <CardHeader className="border-b border-border/50 bg-background/40 pb-4">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="flex min-w-0 items-center gap-2 text-base sm:text-lg">
                          <span className="truncate">Professional Summary</span>
                          <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">AI-generated</span>
                        </CardTitle>
                        <button onClick={handleCopySummary} aria-label="Copy summary" className="shrink-0 rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground">
                          {summaryCopied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="break-words text-sm leading-relaxed text-foreground/80 md:text-base">{generatedData.professionalSummary}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
                    <CardHeader className="border-b border-border/50 bg-background/40 pb-4"><CardTitle className="text-base sm:text-lg">Optimized Skills</CardTitle></CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex flex-wrap gap-2.5">
                        {generatedData.optimizedSkills.map((skill, i) => (
                          <motion.span key={skill} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.03 * i }} whileHover={{ y: -2 }} className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/15 to-accent/10 px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm">
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {generatedData.optimizedExperience.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/60 shadow-lg backdrop-blur-xl">
                      <CardHeader className="border-b border-border/50 bg-background/40 pb-4"><CardTitle className="text-base sm:text-lg">Optimized Experience</CardTitle></CardHeader>
                      <CardContent className="space-y-8 pt-6">
                        {generatedData.optimizedExperience.map((exp, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }} className="relative border-l-2 border-primary/40 pl-5 before:absolute before:-left-[9px] before:top-1.5 before:h-3.5 before:w-3.5 before:rounded-full before:bg-primary before:shadow-[0_0_0_4px_hsl(var(--background))] sm:pl-6">
                            <h4 className="break-words text-base font-semibold sm:text-lg">{exp.role} <span className="font-normal text-muted-foreground">at {exp.company}</span></h4>
                            <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-foreground/80 md:text-base">{exp.description}</p>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4 md:gap-4">
                  <Button variant="outline" className="h-12 w-full gap-2 rounded-xl text-xs sm:h-14 sm:text-sm" onClick={() => { setStep(1); setGenerated(false); setGeneratedData(null); }}>
                    <Edit className="h-4 w-4 shrink-0" /> <span className="hidden xs:inline sm:inline">Edit</span>
                  </Button>
                  <Button variant="outline" className="h-12 w-full gap-2 rounded-xl text-xs sm:h-14 sm:text-sm" onClick={() => api.downloadResumePdf(buildFullResumePayload(), "AI_Resume.pdf")}>
                    <Download className="h-4 w-4 shrink-0" /> <span className="hidden xs:inline sm:inline">PDF</span>
                  </Button>
                  <Button variant="outline" className="h-12 w-full gap-2 rounded-xl text-xs sm:h-14 sm:text-sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 shrink-0" /> <span className="hidden xs:inline sm:inline">Print</span>
                  </Button>
                  <Button className="col-span-2 h-12 w-full gap-2 rounded-xl bg-primary text-xs text-primary-foreground shadow-md sm:col-span-1 sm:h-14 sm:text-sm" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 shrink-0" />}
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview sidebar */}
        {showPreview && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="hidden min-w-0 lg:block">
            <div className="sticky top-20 space-y-3 lg:top-24">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Live Preview</h3>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" aria-label="Zoom out" onClick={() => setPreviewZoom((z) => Math.max(0.3, z - 0.1))}><ZoomOut className="h-4 w-4" /></Button>
                  <span className="w-10 text-center text-xs text-muted-foreground">{Math.round(previewZoom * 100)}%</span>
                  <Button variant="ghost" size="sm" aria-label="Zoom in" onClick={() => setPreviewZoom((z) => Math.min(1, z + 0.1))}><ZoomIn className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="max-h-[70vh] overflow-auto rounded-xl">
                <LiveResumePreview personalInfo={personalInfo} skills={skills} experience={experiences} education={educations} projects={projects} zoom={previewZoom} />
              </div>
              <div className="rounded-xl border border-border/50 bg-card/60 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">ATS Score</span>
                  <span className={`text-sm font-bold ${atsAnalysis.score >= 80 ? "text-emerald-500" : atsAnalysis.score >= 60 ? "text-amber-500" : "text-destructive"}`}>{atsAnalysis.score}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                  <motion.div className={`h-full rounded-full ${atsAnalysis.score >= 80 ? "bg-emerald-500" : atsAnalysis.score >= 60 ? "bg-amber-500" : "bg-destructive"}`} animate={{ width: `${atsAnalysis.score}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}