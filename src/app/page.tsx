"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  FileText,
  MessageSquare,
  Briefcase,
  TrendingUp,
  CheckCircle,
  ChevronDown,
  Star,
  Loader2,
  Code,
  Database,
  MonitorPlay,
  PenTool,
  LineChart,
  Target,
  Stethoscope,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowUpRight,
  AlertCircle
} from "lucide-react";
import Hero from "@/components/Hero";

// --- Animation Variants ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 20 },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

// --- Local Data ---
const COMPANIES = [
  { icon: MonitorPlay, name: "TechFlow", cls: "font-serif" },
  { icon: Database, name: "DATACORE", cls: "font-mono" },
  { icon: ShieldCheck, name: "NEXUS", cls: "tracking-widest" },
  { icon: Code, name: "AcmeDev", cls: "italic" },
  { icon: Target, name: "Quantum", cls: "uppercase font-semibold" },
];

const FEATURES = [
  {
    icon: FileText,
    title: "AI Resume Builder",
    desc: "Generate ATS-friendly resumes tailored to specific job descriptions instantly. Precision formatting that beats the bots.",
    bg: "bg-blue-500/10",
    color: "text-blue-500",
    border: "group-hover:border-blue-500/30",
  },
  {
    icon: BrainCircuit,
    title: "Smart Recommendations",
    desc: "Discover career paths based on your skills, experience, and market trends. Uncover opportunities you never considered.",
    bg: "bg-purple-500/10",
    color: "text-purple-500",
    border: "group-hover:border-purple-500/30",
  },
  {
    icon: MessageSquare,
    title: "AI Career Coach",
    desc: "Chat with an intelligent assistant to prepare for interviews, negotiate salary, and map your 5-year trajectory.",
    bg: "bg-emerald-500/10",
    color: "text-emerald-500",
    border: "group-hover:border-emerald-500/30",
  },
];

const CAREERS = [
  { name: "Engineering", icon: Code },
  { name: "Data Science", icon: Database },
  { name: "Product", icon: Target },
  { name: "Design", icon: PenTool },
  { name: "Marketing", icon: LineChart },
  { name: "Sales", icon: Briefcase },
  { name: "Finance", icon: TrendingUp },
  { name: "Healthcare", icon: Stethoscope },
];

const FAQS = [
  "How does the AI Resume Builder work?",
  "Is my data secure and private?",
  "Can I cancel my subscription at any time?",
  "Does the Career Coach remember my history?",
];

// --- Main Component ---
export default function Home() {
  const [email, setEmail] = useState("");
  const [newsStatus, setNewsStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsMessage, setNewsMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setNewsStatus("loading");
    try {
      const res = await api.subscribeNewsletter(email);
      setNewsStatus("success");
      setNewsMessage(res.message);
      setEmail("");
    } catch (err: any) {
      setNewsStatus("error");
      setNewsMessage(err.message || "Failed to subscribe.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-background font-sans selection:bg-primary/20">
      <Hero />

      {/* 2. Trusted Companies */}
      <section className="relative overflow-hidden border-y border-border/40 bg-muted/20 py-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--background))_0%,transparent_10%,transparent_90%,hsl(var(--background))_100%)] z-10 pointer-events-none" />
        <div className="container mx-auto px-4 text-center">
          <p className="mb-8 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Powering Careers At Industry Leaders
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-wrap justify-center items-center gap-10 md:gap-20 text-muted-foreground/60"
          >
            {COMPANIES.map((b, i) => (
              <div
                key={b.name}
                className="flex items-center gap-2.5 transition-all duration-300 hover:text-foreground/80 grayscale hover:grayscale-0"
              >
                <b.icon className="h-6 w-6" />
                <span className={`text-xl ${b.cls}`}>{b.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. Features Section (Bento Grid Style) */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-20 max-w-2xl"
          >
            <motion.div variants={fadeUp} className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Platform Capabilities
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">succeed.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed">
              Powerful AI tools designed to optimize your job search, bypass ATS filters, and accelerate your career trajectory.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {FEATURES.map((f, i) => (
              <motion.div variants={fadeUp} key={f.title} className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-2xl pointer-events-none" />
                <Card className={`relative h-full overflow-hidden bg-background/40 backdrop-blur-sm border-border/50 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1 ${f.border}`}>
                  <CardHeader className="p-8">
                    <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                      <f.icon className={`h-6 w-6 ${f.color}`} />
                    </div>
                    <CardTitle className="text-xl font-semibold mb-3">{f.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground/80">
                      {f.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Career Categories */}
      <section className="py-24 border-y border-border/40 bg-muted/10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Explore Top Careers</h2>
              <p className="text-lg text-muted-foreground">Discover high-growth opportunities across industries.</p>
            </div>
            <Link href="/explore">
              <Button variant="outline" className="group rounded-full px-6 h-11 border-border/60 hover:bg-primary hover:text-primary-foreground transition-all">
                Explore All Careers 
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {CAREERS.map((cat, i) => (
              <motion.div
                variants={fadeUp}
                key={i}
                className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/50 bg-background/50 p-6 text-center transition-all hover:bg-background hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <cat.icon className="h-7 w-7 text-muted-foreground transition-colors duration-300 group-hover:text-primary relative z-10" />
                <h3 className="font-medium text-sm relative z-10">{cat.name}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. How It Works (Timeline) */}
      <section className="py-32 container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-24">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">How SkillPilot Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Three simple steps to supercharge your career and land your dream role.</p>
        </div>
        
        <div className="relative grid md:grid-cols-3 gap-12 md:gap-8">
          {/* Connecting Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-border via-primary/30 to-border origin-left -z-10"
          />
          
          {[
            { step: '01', title: 'Upload Profile', desc: 'Import your LinkedIn or upload your current resume to build your AI profile instantly.' },
            { step: '02', title: 'AI Analysis', desc: 'Our engine identifies skill gaps, optimizes keywords, and aligns you with market demands.' },
            { step: '03', title: 'Land the Job', desc: 'Apply with a perfect resume and use our AI coach to ace your technical & cultural interviews.' }
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.2, type: "spring", stiffness: 60 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-background border border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-transform duration-500 group-hover:-translate-y-2">
                <span className="text-2xl font-bold text-foreground/80 bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-b group-hover:from-primary group-hover:to-primary/60 transition-all">
                  {item.step}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed px-4">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. AI Features Detail */}
      <section className="py-32 border-y border-border/40 bg-zinc-50/50 dark:bg-zinc-950/50 overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-xl"
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
                Advanced Resume Analysis Engine
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Stop guessing what recruiters want. Our AI cross-references your resume against thousands of successful applications to provide a concrete ATS score and a step-by-step improvement roadmap.
              </p>
              
              <ul className="space-y-5 mb-10">
                {[
                  { label: 'ATS Keyword Optimization', icon: CheckCircle }, 
                  { label: 'Grammar & Tone Enhancement', icon: CheckCircle }, 
                  { label: 'Quantifiable Achievement Suggestions', icon: CheckCircle }, 
                  { label: 'Skill Gap Identification', icon: CheckCircle }
                ].map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex items-center text-foreground/80 font-medium"
                  >
                    <div className="mr-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    {feature.label}
                  </motion.li>
                ))}
              </ul>
              
              <Link href="/register">
                <Button size="lg" className="h-12 rounded-full px-8 shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5">
                  Try Analyzer Now
                </Button>
              </Link>
            </motion.div>

            {/* Premium Glassmorphic Visual */}
            <motion.div
              className="relative mx-auto w-full max-w-md lg:max-w-none"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Glow Effects */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-primary/20 via-accent/20 to-purple-500/20 blur-[100px] rounded-full pointer-events-none" />
              
              <motion.div
                whileHover={{ rotateX: 2, rotateY: -2 }}
                className="relative flex flex-col rounded-2xl border border-border/50 bg-background/60 backdrop-blur-xl p-8 shadow-2xl"
                style={{ transformPerspective: 1000 }}
              >
                {/* Simulated Scanning Line */}
                <motion.div 
                  animate={{ y: ["0%", "400%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent z-20 shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                />

                <div className="flex items-center justify-between border-b border-border/50 pb-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-lg">ATS Match Score</h3>
                    <p className="text-sm text-muted-foreground">Product Manager Role</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-4xl font-bold tracking-tighter text-primary">94%</span>
                    <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" /> Excellent
                    </span>
                  </div>
                </div>

                <div className="space-y-5 text-sm">
                  {[
                    { label: "Impact Formatting", status: "Optimized", color: "text-emerald-500", icon: CheckCircle },
                    { label: "Keyword Density", status: "Strong", color: "text-emerald-500", icon: CheckCircle },
                    { label: "Action Verbs", status: "Needs Work", color: "text-amber-500", icon: AlertCircle },
                    { label: "Quantifiable Metrics", status: "7/10 Detected", color: "text-blue-500", icon: CheckCircle },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${item.color}`}>{item.status}</span>
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-6 border-t border-border/50">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "94%" }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. Statistics */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-border/40"
          >
            {[
              { num: "50k+", label: "Active Users" },
              { num: "250k+", label: "Resumes Built" },
              { num: "68%", label: "Interview Rate" },
              { num: "4.9/5", label: "User Rating" }
            ].map((stat, i) => (
              <motion.div variants={fadeUp} key={i} className="flex flex-col items-center justify-center px-4">
                <div className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground mb-3">{stat.num}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 8. Testimonials */}
      <section className="py-32 bg-muted/20 border-y border-border/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Loved by career climbers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Don't just take our word for it. Join thousands of professionals advancing their careers.</p>
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6 lg:gap-8"
          >
            {[
              { name: "Sarah Jenkins", role: "Software Engineer @ TechFlow", text: "SkillPilot AI completely transformed my job search. The resume builder is intuitive, and the AI coach helped me nail my technical interviews.", avatar: "bg-gradient-to-br from-purple-500 to-indigo-500" },
              { name: "Michael Chen", role: "Product Manager @ DataCore", text: "The career recommendations were spot on. It identified my transferable skills and helped me pivot from sales to product management seamlessly.", avatar: "bg-gradient-to-br from-blue-500 to-cyan-500" },
              { name: "Elena Rodriguez", role: "UX Designer @ AcmeDev", text: "I was struggling with ATS filters for months. After using the resume analyzer to optimize my keywords, I saw a 3x increase in interview callbacks.", avatar: "bg-gradient-to-br from-emerald-500 to-teal-500" }
            ].map((t, i) => (
              <motion.div variants={fadeUp} key={i} className="h-full">
                <Card className="h-full flex flex-col bg-background/50 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="flex-1">
                    <div className="flex text-amber-500 mb-4 gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <CardDescription className="text-base text-foreground/90 leading-relaxed font-medium">
                      "{t.text}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center gap-4 pt-0 mt-4 border-t border-border/40 pt-6">
                    <div className={`h-10 w-10 rounded-full ${t.avatar} flex-shrink-0 shadow-inner`} />
                    <div className="overflow-hidden">
                      <div className="font-semibold text-sm truncate">{t.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{t.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="py-32">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Everything you need to know about the platform.</p>
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {FAQS.map((q, i) => (
              <motion.div
                variants={fadeUp}
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="group border border-border/50 rounded-2xl bg-background hover:bg-muted/30 transition-all cursor-pointer overflow-hidden shadow-sm hover:border-primary/30"
              >
                <div className="flex justify-between items-center font-medium text-foreground p-6">
                  <span className="text-base pr-8">{q}</span>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${openFaq === i ? "rotate-180 text-foreground" : ""}`} />
                </div>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border/50 pt-4 mt-2">
                        This is a placeholder answer for the question. In a real implementation, you would populate this with the specific details matching each FAQ to provide genuine value to the user while keeping the interface clean.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 11. Newsletter & CTA */}
      <section className="py-40 relative overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        {/* Soft Animated Gradients */}
        <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[120px] -z-10 animate-[spin_20s_linear_infinite] opacity-50" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-[120px] -z-10 animate-[spin_15s_linear_infinite_reverse] opacity-50" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="container relative mx-auto px-4 max-w-3xl text-center z-10"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Ready to pilot your career?</h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals who have accelerated their career growth with SkillPilot AI.
          </p>

          <div className="bg-background/80 backdrop-blur-xl border border-border/50 p-2 rounded-2xl shadow-xl max-w-md mx-auto mb-6">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 relative">
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 border-0 bg-transparent px-4 focus-visible:ring-0 shadow-none text-base placeholder:text-muted-foreground/70"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={newsStatus === "loading"}
                required
              />
              <Button
                type="submit"
                className="h-12 rounded-xl w-full sm:w-auto px-8 shrink-0 transition-all font-medium"
                disabled={newsStatus === "loading"}
              >
                {newsStatus === "loading" ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                {newsStatus === "loading" ? "Subscribing" : "Subscribe"}
              </Button>
            </form>
          </div>

          <div className="min-h-[24px]">
            <AnimatePresence mode="wait">
              {newsStatus === "success" && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-sm text-emerald-500 font-medium"
                >
                  {newsMessage}
                </motion.p>
              )}
              {newsStatus === "error" && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-sm text-destructive font-medium"
                >
                  {newsMessage}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <p className="text-sm text-muted-foreground mt-8">Start for free. No credit card required.</p>
        </motion.div>
      </section>
    </main>
  );
}