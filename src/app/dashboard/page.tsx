"use client";

import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText, Bookmark, MessageSquare, BrainCircuit, Target,
  Download, ArrowRight, Plus, Sparkles, Clock, ChevronLeft,
  ChevronRight, CheckCircle2, Circle, Users2, CalendarDays,
  MoreHorizontal, TrendingUp
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  motion, AnimatePresence, useMotionValue, useSpring, useTransform,
  type Variants,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface Stats {
  resumesCount: number;
  savedCareersCount: number;
  chatSessionsCount: number;
}

interface PlanItem {
  key: string;
  label: string;
  sub: string;
  done: boolean;
  href: string;
}

/* ------------------------------------------------------------------ */
/*  Motion presets — subtle only                                      */
/* ------------------------------------------------------------------ */

const EASE = [0.16, 1, 0.3, 1] as const; // Linear/Vercel-like snappy ease

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

/* ------------------------------------------------------------------ */
/*  Calendar helper                                                   */
/* ------------------------------------------------------------------ */

function useCalendarMonth(date: Date) {
  return useMemo(() => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: { label: number; inMonth: boolean }[] = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      cells.push({ label: daysInPrevMonth - i, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ label: d, inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ label: cells.length - (startWeekday + daysInMonth) + 1, inMonth: false });
    }
    return {
      cells,
      monthLabel: date.toLocaleString("default", { month: "long", year: "numeric" }),
    };
  }, [date]);
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/* ------------------------------------------------------------------ */
/*  Reusable primitives                                               */
/* ------------------------------------------------------------------ */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card text-card-foreground shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  href,
  actionText = "View all",
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  href?: string;
  actionText?: string;
}) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-border/40">
      <h2 className="text-base font-semibold flex items-center gap-2 text-foreground tracking-tight">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                          */
/* ------------------------------------------------------------------ */

function Skel({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted/60 ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skel className="h-8 w-48" />
          <Skel className="h-4 w-72" />
        </div>
        <Skel className="h-10 w-36 rounded-lg" />
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skel className="h-4 w-20" />
              <Skel className="h-8 w-8 rounded-md" />
            </div>
            <Skel className="h-8 w-16" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div className="space-y-8 min-w-0">
          <Card className="p-6 space-y-6">
            <Skel className="h-6 w-40" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skel key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <Skel className="h-6 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skel key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Skel className="h-48 rounded-xl" />
          <Skel className="h-80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Count-up                                                          */
/* ------------------------------------------------------------------ */

function CountUpValue({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 100, damping: 30 });
  const rounded = useTransform(spring, (v) => Math.round(v).toString());
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    mv.set(value);
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => unsub();
  }, [value, mv, rounded]);

  return <>{display}</>;
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                         */
/* ------------------------------------------------------------------ */

interface StatCardData {
  label: string;
  value: number | string;
  icon: ComponentType<{ className?: string }>;
  trend?: string;
}

function StatCard({ data }: { data: StatCardData }) {
  const { label, value, icon: Icon, trend } = data;
  return (
    <motion.div variants={fadeUp}>
      <Card className="p-5 flex flex-col justify-between h-full hover:border-border/80 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <div className="h-8 w-8 rounded-md bg-muted/40 flex items-center justify-center text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {typeof value === "number" ? <CountUpValue value={value} /> : value}
          </div>
          {trend && (
             <div className="flex items-center gap-1 mt-1 text-xs text-emerald-500 font-medium">
               <TrendingUp className="h-3 w-3" />
               {trend}
             </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Recommended card                                                  */
/* ------------------------------------------------------------------ */

interface RecoData {
  title: string;
  badge: string;
  icon: ComponentType<{ className?: string }>;
  desc: string;
  cta: string;
  href: string;
  progress?: number | null;
  progressLabel?: string;
}

function RecommendedCard({ data }: { data: RecoData }) {
  const { title, badge, icon: Icon, desc, cta, href } = data;
  const showProgress = data.progress !== null && data.progress !== undefined;

  return (
    <motion.div variants={fadeUp} className="group relative flex flex-col h-full rounded-xl border border-border/40 bg-muted/20 p-5 hover:bg-muted/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="h-8 w-8 rounded-md bg-background border border-border/50 flex items-center justify-center text-foreground shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-sm">
          {badge}
        </span>
      </div>

      <h3 className="font-semibold text-sm text-foreground mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">{desc}</p>

      {showProgress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-medium text-muted-foreground">Progress</span>
            <span className="text-[10px] font-medium text-foreground">{data.progressLabel}</span>
          </div>
          <div className="h-1 w-full rounded-full bg-border overflow-hidden">
            <motion.div
              className="h-full bg-foreground"
              initial={{ width: 0 }}
              animate={{ width: `${data.progress}%` }}
              transition={{ duration: 1, ease: EASE }}
            />
          </div>
        </div>
      )}

      <Link href={href} className="mt-auto inline-block">
        <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
          {cta} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Resume row                                                        */
/* ------------------------------------------------------------------ */

function ResumeRow({ resume }: { resume: any }) {
  const score = resume.atsScore || 0;
  const title = resume.targetRole || resume.title || "Untitled Resume";
  
  // Sleek score coloring
  const scoreColor = score >= 80 ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-amber-500 bg-amber-500/10 border-amber-500/20";

  return (
    <div className="group flex items-center justify-between gap-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/20 px-2 -mx-2 rounded-lg transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border/50 text-muted-foreground">
          <FileText className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <Link href={`/dashboard/resumes`} className="font-medium text-sm text-foreground hover:underline underline-offset-4 truncate block">
            {title}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(resume.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${scoreColor}`}>
          {score}% ATS
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => api.downloadResumePdf(resume.content || resume, `${(resume.targetRole || "Resume").replace(/\s+/g, "_")}.pdf`)}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function EmptyResumes() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-border/60 rounded-xl bg-muted/10">
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
        <FileText className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-sm text-foreground">No resumes created</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
        Get started by creating your first AI-tailored resume.
      </p>
      <Link href="/dashboard/resumes/create" className="mt-4">
        <Button size="sm" variant="secondary" className="h-8 text-xs rounded-lg">
          Create Resume
        </Button>
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Resume strength gauge                                             */
/* ------------------------------------------------------------------ */

function ResumeStrength({ avgAts, message }: { avgAts: number; message: string }) {
  const RADIUS = 40;
  const CIRC = 2 * Math.PI * RADIUS;
  const dash = (avgAts / 100) * CIRC;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-tight">Strength Overview</h2>
        <Target className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex flex-col items-center justify-center text-center mt-2">
        <div className="relative h-28 w-28 shrink-0 mb-4">
          <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r={RADIUS} fill="none"
              stroke="currentColor"
              className="text-foreground"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${CIRC}` }}
              animate={{ strokeDasharray: `${dash} ${CIRC - dash}` }}
              transition={{ duration: 1, ease: EASE }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              <CountUpValue value={avgAts} />
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-widest mt-0.5">Score</span>
          </div>
        </div>
        <p className="text-sm font-medium text-foreground">{avgAts >= 80 ? "Excellent Standing" : avgAts >= 50 ? "Good Progress" : "Needs Optimization"}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">{message}</p>
        
        <Link href="/dashboard/analyzer" className="w-full mt-6">
          <Button variant="outline" className="w-full h-9 rounded-lg text-xs font-medium">
            Run Analysis
          </Button>
        </Link>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Today's Plan + calendar                                           */
/* ------------------------------------------------------------------ */

function TodaysPlan({ plan, onToggle }: { plan: PlanItem[]; onToggle: (key: string) => void; }) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const { cells, monthLabel } = useCalendarMonth(calendarDate);
  const today = new Date();

  const goPrev = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  const goNext = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold tracking-tight">Today's Plan</h2>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="bg-muted/30 rounded-lg p-3 mb-5 border border-border/40">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-medium text-foreground">{monthLabel}</span>
          <div className="flex gap-1">
            <button onClick={goPrev} className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground">
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button onClick={goNext} className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground">
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAYS.map((d) => (
            <span key={d} className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
              {d.charAt(0)}
            </span>
          ))}
          {cells.map((c, i) => {
            const isToday = c.inMonth && c.label === today.getDate() && calendarDate.getMonth() === today.getMonth() && calendarDate.getFullYear() === today.getFullYear();
            return (
              <span
                key={i}
                className={`text-[11px] h-6 w-6 mx-auto flex items-center justify-center rounded-md transition-colors ${
                  isToday ? "bg-foreground text-background font-medium" : c.inMonth ? "text-foreground hover:bg-muted" : "text-muted-foreground/30"
                }`}
              >
                {c.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        {plan.map((item) => (
          <button
            key={item.key}
            onClick={() => onToggle(item.key)}
            className="w-full flex items-start gap-3 rounded-lg p-2 -mx-2 hover:bg-muted/40 transition-colors text-left group"
          >
            <div className={`mt-0.5 shrink-0 h-4 w-4 rounded-sm border flex items-center justify-center transition-colors ${
              item.done ? "bg-foreground border-foreground text-background" : "border-border/80 group-hover:border-foreground/50 text-transparent"
            }`}>
              <CheckCircle2 className="h-3 w-3" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate transition-colors ${item.done ? "text-muted-foreground line-through decoration-muted-foreground/30" : "text-foreground"}`}>
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  AI Career Coach                                                   */
/* ------------------------------------------------------------------ */

function CareerCoach({ sessions }: { sessions: number }) {
  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-md bg-foreground text-background flex items-center justify-center shrink-0">
          <BrainCircuit className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-semibold tracking-tight">AI Coach</h2>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-5">
        You've completed <strong className="text-foreground font-medium">{sessions}</strong> coaching sessions this month. Ready for your next mock interview?
      </p>
      <Link href="/dashboard/chat">
        <Button className="w-full h-9 rounded-lg text-xs font-medium gap-2">
           Start Session
        </Button>
      </Link>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState<Stats>({
    resumesCount: 0,
    savedCareersCount: 0,
    chatSessionsCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentResumes, setRecentResumes] = useState<any[]>([]);
  const [plan, setPlan] = useState<PlanItem[]>([
    { key: "resume", label: "Refine Resume", sub: "Analyze with ATS checker", done: true, href: "/dashboard/analyzer" },
    { key: "roadmap", label: "Review Roadmap", sub: "Explore matched paths", done: false, href: "/dashboard/recommendations" },
    { key: "interview", label: "Mock Interview", sub: "Behavioral practice", done: false, href: "/dashboard/chat" },
  ]);

  useEffect(() => {
    if (isPending) return;

    if (session?.user) {
      Promise.all([
        api.getAnalytics().catch(() => ({ resumesCount: 0, savedCareersCount: 0, chatSessionsCount: 0 })),
        api.getResumes().catch(() => []),
      ])
        .then(([analyticsData, resumesData]) => {
          setStats(analyticsData);
          setRecentResumes((resumesData || []).slice(0, 4));
        })
        .finally(() => setLoadingStats(false));
    } else {
      setLoadingStats(false);
    }
  }, [session, isPending]);

  const togglePlan = (key: string) =>
    setPlan((prev) => prev.map((p) => (p.key === key ? { ...p, done: !p.done } : p)));

  if (isPending || loadingStats) {
    return <DashboardSkeleton />;
  }

  const avgAts = recentResumes.length > 0
    ? Math.round(recentResumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / recentResumes.length)
    : 0;

  const atsMessage = avgAts >= 80
    ? "Your documents are performing well against ATS standards."
    : avgAts >= 50
    ? "Minor structural tweaks could improve parsing rates."
    : "Significant formatting issues detected. Review recommended.";

  const firstName = (session?.user?.name || "User").split(" ")[0];

  const statCards: StatCardData[] = [
    { label: "Total Documents", value: stats.resumesCount, icon: FileText, trend: "+2 this week" },
    { label: "Avg ATS Score", value: `${avgAts}%`, icon: Target },
    { label: "Saved Paths", value: stats.savedCareersCount, icon: Bookmark },
    { label: "AI Sessions", value: stats.chatSessionsCount, icon: MessageSquare },
  ];

  const recommended: RecoData[] = [
    {
      title: "ATS Optimization", badge: "Action", icon: Sparkles,
      desc: "Run your latest resume through our advanced ATS parser to identify missing keywords.",
      cta: "Optimize", href: "/dashboard/analyzer",
      progress: recentResumes.length ? Math.min(100, avgAts) : null,
      progressLabel: recentResumes.length ? `${avgAts}% Match` : undefined,
    },
    {
      title: "Career Matches", badge: "Explore", icon: Bookmark,
      desc: "Based on your latest skills update, we found 3 new potential career trajectories.",
      cta: "View Matches", href: "/dashboard/recommendations",
    },
    {
      title: "System Design Prep", badge: "Practice", icon: Users2,
      desc: "Jump into a technical mock interview tailored for Senior Engineering roles.",
      cta: "Start Prep", href: "/dashboard/chat",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {firstName}. Here is your career performance data.
          </p>
        </div>
        <Link href="/dashboard/resumes/create" className="shrink-0">
          <Button size="sm" className="w-full sm:w-auto h-9 rounded-lg font-medium shadow-sm gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New Document
          </Button>
        </Link>
      </motion.div>

      {/* Top Stats */}
      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <StatCard key={s.label} data={s} />
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-8 items-start">
        
        {/* Left Column */}
        <div className="space-y-8 min-w-0">
          
          {/* Recent Activity */}
          <motion.section variants={fadeUp}>
            <Card className="p-6">
              <SectionHeader icon={Clock} title="Recent Documents" href="/dashboard/resumes" />
              <div className="mt-4">
                {recentResumes.length === 0 ? (
                  <EmptyResumes />
                ) : (
                  <div className="flex flex-col">
                    {recentResumes.map((resume) => (
                      <ResumeRow key={resume._id} resume={resume} />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.section>

          {/* Recommended */}
          <motion.section variants={fadeUp}>
            <Card className="p-6">
              <SectionHeader icon={BrainCircuit} title="Recommended Actions" href="/dashboard/recommendations" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {recommended.map((r) => (
                  <RecommendedCard key={r.title} data={r} />
                ))}
              </div>
            </Card>
          </motion.section>

        </div>

        {/* Right Column (Sidebar) */}
        <motion.div variants={container} className="space-y-6">
          <motion.div variants={fadeUp}>
            <ResumeStrength avgAts={avgAts} message={atsMessage} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <TodaysPlan plan={plan} onToggle={togglePlan} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <CareerCoach sessions={stats.chatSessionsCount} />
          </motion.div>
        </motion.div>

      </div>
    </motion.div>
  );
}