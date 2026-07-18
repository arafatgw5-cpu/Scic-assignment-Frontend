"use client";

import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LayoutDashboard, Loader2, FileText, Bookmark, MessageSquare,
  BrainCircuit, TrendingUp, Download, ArrowRight, Plus, 
  Sparkles, Target, Clock
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

// Sample chart data for the analytics visualizations
const weeklyActivity = [
  { day: "Mon", resumes: 2, chats: 3 },
  { day: "Tue", resumes: 1, chats: 5 },
  { day: "Wed", resumes: 3, chats: 2 },
  { day: "Thu", resumes: 0, chats: 4 },
  { day: "Fri", resumes: 4, chats: 6 },
  { day: "Sat", resumes: 1, chats: 1 },
  { day: "Sun", resumes: 0, chats: 2 },
];

const atsHistory = [
  { label: "Resume 1", score: 68 },
  { label: "Resume 2", score: 74 },
  { label: "Resume 3", score: 81 },
  { label: "Resume 4", score: 79 },
  { label: "Resume 5", score: 92 },
];

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState({ resumesCount: 0, savedCareersCount: 0, chatSessionsCount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentResumes, setRecentResumes] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user) {
      Promise.all([
        api.getAnalytics().catch(() => ({ resumesCount: 0, savedCareersCount: 0, chatSessionsCount: 0 })),
        api.getResumes().catch(() => []),
      ]).then(([analyticsData, resumesData]) => {
        setStats(analyticsData);
        setRecentResumes((resumesData || []).slice(0, 3));
      }).finally(() => setLoadingStats(false));
    }
  }, [session]);

  if (isPending || loadingStats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl animate-pulse"></div>
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const avgAts = recentResumes.length > 0
    ? Math.round(recentResumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / recentResumes.length)
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            Overview
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Welcome back, <span className="font-semibold text-foreground">{session?.user?.name || "User"}</span>. Here&apos;s your career snapshot.
          </p>
        </div>
        <Link href="/dashboard/resumes/create">
          <Button className="gap-2 h-11 px-6 rounded-xl shadow-premium-md hover:shadow-premium-lg transition-all active:scale-[0.98] bg-primary text-primary-foreground font-medium">
            <Plus className="h-4 w-4" /> Create Resume
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="relative overflow-hidden group hover:shadow-premium-md transition-all duration-300 border-border/50 bg-card/60 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-primary/10 transition-colors duration-500" />
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 font-medium">
              <FileText className="h-4 w-4 text-primary" /> Total Resumes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-foreground tracking-tight">{stats.resumesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">AI-generated resumes</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-premium-md transition-all duration-300 border-border/50 bg-card/60 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-green-500/10 transition-colors duration-500" />
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 font-medium">
              <Target className="h-4 w-4 text-green-500" /> Avg. ATS Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-foreground tracking-tight">{avgAts}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all resumes</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-premium-md transition-all duration-300 border-border/50 bg-card/60 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-accent/10 transition-colors duration-500" />
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 font-medium">
              <Bookmark className="h-4 w-4 text-accent" /> Saved Careers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-foreground tracking-tight">{stats.savedCareersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Career paths saved</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-premium-md transition-all duration-300 border-border/50 bg-card/60 backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-chart-4/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-chart-4/10 transition-colors duration-500" />
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 font-medium">
              <MessageSquare className="h-4 w-4 text-chart-4" /> AI Chats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-foreground tracking-tight">{stats.chatSessionsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Coaching sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-premium-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 font-semibold">
              <TrendingUp className="h-5 w-5 text-primary" /> Weekly Activity
            </CardTitle>
            <CardDescription>Your resume builds and chat sessions this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                    }}
                  />
                  <Area type="monotone" dataKey="resumes" stroke="hsl(var(--primary))" fill="url(#colorResumes)" strokeWidth={3} name="Resumes" />
                  <Area type="monotone" dataKey="chats" stroke="hsl(var(--accent))" fill="url(#colorChats)" strokeWidth={3} name="Chats" />
                  <defs>
                    <linearGradient id="colorResumes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorChats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-premium-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 font-semibold">
              <Target className="h-5 w-5 text-green-500" /> ATS Score History
            </CardTitle>
            <CardDescription>Your resume ATS scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={atsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
                    }}
                  />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="ATS Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-border/50 bg-card/60 backdrop-blur-xl shadow-premium-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 font-semibold">
              <Clock className="h-5 w-5 text-primary" /> Recent Activity
            </CardTitle>
            <CardDescription>Your latest resume builds</CardDescription>
          </CardHeader>
          <CardContent>
            {recentResumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-background/30 rounded-xl border border-dashed border-border/60">
                <FileText className="h-10 w-10 mb-3 opacity-30" />
                <p className="font-medium text-foreground">No resumes yet</p>
                <p className="text-sm mt-1">Create your first AI-powered resume to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentResumes.map((resume) => (
                  <div key={resume._id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">{resume.targetRole || resume.title || "Untitled Resume"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(resume.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${(resume.atsScore || 0) >= 80 ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}`}>
                        {resume.atsScore || 0}% ATS
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background shadow-sm border border-transparent hover:border-border/50 transition-all" onClick={() => api.downloadResumePdf(resume.content || resume, `${(resume.targetRole || "Resume").replace(/\s+/g, "_")}.pdf`)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-premium-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 font-semibold">
              <Sparkles className="h-5 w-5 text-accent" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/resumes/create" className="block">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl border-border/60 bg-background/50 hover:bg-muted/50 group transition-all">
                <Plus className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Build New Resume</span>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </Link>
            <Link href="/dashboard/analyzer" className="block">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl border-border/60 bg-background/50 hover:bg-muted/50 group transition-all">
                <BrainCircuit className="h-4 w-4 text-accent" />
                <span className="font-medium text-foreground">Analyze Resume</span>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </Link>
            <Link href="/dashboard/recommendations" className="block">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl border-border/60 bg-background/50 hover:bg-muted/50 group transition-all">
                <Target className="h-4 w-4 text-green-500" />
                <span className="font-medium text-foreground">Get Career Matches</span>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </Link>
            <Link href="/dashboard/chat" className="block">
              <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl border-border/60 bg-background/50 hover:bg-muted/50 group transition-all">
                <MessageSquare className="h-4 w-4 text-chart-4" />
                <span className="font-medium text-foreground">AI Career Coach</span>
                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
