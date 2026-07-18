"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
// import Navbar from "@/components/Navbar";
// import Hero from "@/components/Hero";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight, BrainCircuit, FileText,
  MessageSquare, Briefcase, TrendingUp, CheckCircle,
  ChevronDown, Star, Loader2, Code, Database, MonitorPlay,
  PenTool, LineChart, Target, Stethoscope, ShieldCheck
} from "lucide-react";
import Hero from "@/components/Hero";

export default function Home() {
  const [email, setEmail] = useState("");
  const [newsStatus, setNewsStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsMessage, setNewsMessage] = useState("");

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

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* <Navbar /> */}
      <Hero />

      {/* 2. Trusted Companies */}
      <section className="border-y bg-muted/30 py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-6">TRUSTED BY PROFESSIONALS AT TOP COMPANIES</p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-500 text-foreground"
          >
            {[
              { icon: MonitorPlay, name: "TechFlow", cls: "font-serif" },
              { icon: Database, name: "DATACORE", cls: "" },
              { icon: ShieldCheck, name: "NEXUS", cls: "tracking-widest" },
              { icon: Code, name: "AcmeDev", cls: "italic" },
              { icon: Target, name: "Quantum", cls: "uppercase" },
            ].map((b, i) => (
              <motion.div
                key={b.name}
                whileHover={{ scale: 1.08, y: -2 }}
                className="flex items-center gap-2"
              >
                <b.icon className="h-6 w-6" />
                <span className={`text-xl font-bold ${b.cls}`}>{b.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="py-24 container mx-auto px-4 max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-4">Everything you need to succeed</motion.h2>
          <motion.p variants={fadeIn} className="text-muted-foreground max-w-2xl mx-auto">Powerful AI tools designed to optimize your job search and accelerate your career trajectory.</motion.p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {[
            { icon: FileText, title: "AI Resume Builder", desc: "Generate ATS-friendly resumes tailored to specific job descriptions instantly.", bg: "bg-primary/10", color: "text-primary" },
            { icon: BrainCircuit, title: "Smart Recommendations", desc: "Discover career paths based on your skills, experience, and market trends.", bg: "bg-accent/10", color: "text-accent" },
            { icon: MessageSquare, title: "AI Career Coach", desc: "Chat with an intelligent assistant to prepare for interviews and negotiate salary.", bg: "bg-chart-4/10", color: "text-chart-4" },
          ].map((f) => (
            <motion.div variants={fadeIn} key={f.title} whileHover={{ y: -6 }}>
              <Card className="h-full bg-background/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <CardHeader>
                  <motion.div
                    whileHover={{ rotate: 8, scale: 1.1 }}
                    className={`h-12 w-12 rounded-lg ${f.bg} flex items-center justify-center mb-4`}
                  >
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </motion.div>
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 4. Career Categories */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Top Careers</h2>
              <p className="text-muted-foreground">Discover high-growth opportunities across various industries.</p>
            </div>
            <Link href="/explore">
              <Button variant="ghost" className="mt-4 md:mt-0">Explore All Careers <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { name: 'Engineering', icon: Code },
              { name: 'Data Science', icon: Database },
              { name: 'Product', icon: Target },
              { name: 'Design', icon: PenTool },
              { name: 'Marketing', icon: LineChart },
              { name: 'Sales', icon: Briefcase },
              { name: 'Finance', icon: TrendingUp },
              { name: 'Healthcare', icon: Stethoscope }
            ].map((cat, i) => (
              <motion.div
                variants={fadeIn}
                key={i}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.97 }}
                className="p-6 rounded-xl border bg-background hover:shadow-md hover:border-primary/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
              >
                <cat.icon className="h-8 w-8 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                <h3 className="font-medium text-sm">{cat.name}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="py-24 container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How SkillPilot AI Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Three simple steps to supercharge your career.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-12 relative">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-border -z-10 origin-left"
          />
          {[
            { step: '01', title: 'Upload Profile', desc: 'Import your LinkedIn or upload your current resume to build your AI profile.' },
            { step: '02', title: 'AI Analysis', desc: 'Our engine identifies skill gaps, optimizes keywords, and suggests career paths.' },
            { step: '03', title: 'Land the Job', desc: 'Apply with a perfect resume and use the AI coach to ace your interviews.' }
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, type: "spring" }}
              className="flex flex-col items-center text-center bg-background"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 6 }}
                className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-6 shadow-lg shadow-primary/25"
              >
                {item.step}
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. AI Features Detail */}
      <section className="py-24 bg-muted/40 dark:bg-zinc-950 text-foreground overflow-hidden relative transition-colors">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">Advanced Resume Analysis Engine</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Stop guessing what recruiters want. Our AI analyzes your resume against thousands of successful applications and job descriptions to provide a concrete ATS score and improvement roadmap.
              </p>
              <ul className="space-y-4 mb-8">
                {['ATS Keyword Optimization', 'Grammar & Tone Enhancement', 'Quantifiable Achievement Suggestions', 'Skill Gap Identification'].map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center text-foreground/80"
                  >
                    <CheckCircle className="h-5 w-5 text-accent mr-3 shrink-0" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
              <Link href="/register">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8">Try Analyzer Now</Button>
                </motion.div>
              </Link>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                animate={{ opacity: [0.15, 0.3, 0.15] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-gradient-to-tr from-primary to-accent blur-3xl rounded-full"
              />
              <motion.div
                whileHover={{ rotateX: 2, rotateY: -2 }}
                className="relative border border-border bg-background/70 backdrop-blur-md p-6 rounded-2xl shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div className="font-medium">ATS Match Score</div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="text-accent font-bold text-xl"
                  >
                    94%
                  </motion.div>
                </div>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <div className="flex justify-between items-center"><span className="text-foreground">Impact Formatting</span><CheckCircle className="h-4 w-4 text-accent" /></div>
                  <div className="flex justify-between items-center"><span className="text-foreground">Keyword Density</span><CheckCircle className="h-4 w-4 text-accent" /></div>
                  <div className="flex justify-between items-center"><span className="text-foreground">Action Verbs</span><span className="text-amber-600 dark:text-amber-400">Needs work</span></div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. Statistics */}
      <section className="py-20 border-b">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { num: "50k+", label: "Active Users" },
              { num: "250k+", label: "Resumes Built" },
              { num: "68%", label: "Interview Rate" },
              { num: "4.9/5", label: "User Rating" }
            ].map((stat, i) => (
              <motion.div variants={fadeIn} key={i} whileHover={{ scale: 1.06 }}>
                <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">{stat.num}</div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 8. Testimonials */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by career climbers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Don't just take our word for it. See what our users are saying.</p>
          </div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { name: "Sarah Jenkins", role: "Software Engineer at TechFlow", text: "SkillPilot AI completely transformed my job search. The resume builder is intuitive, and the AI coach helped me nail my technical interviews." },
              { name: "Michael Chen", role: "Product Manager at DataCore", text: "The career recommendations were spot on. It identified my transferable skills and helped me pivot from sales to product management seamlessly." },
              { name: "Elena Rodriguez", role: "UX Designer at AcmeDev", text: "I was struggling with ATS filters for months. After using the resume analyzer to optimize my keywords, I saw a 3x increase in interview callbacks." }
            ].map((t, i) => (
              <motion.div variants={fadeIn} key={i} whileHover={{ y: -6 }}>
                <Card className="h-full bg-background shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                  <CardHeader>
                    <div className="flex text-amber-400 mb-2">
                      {[1, 2, 3, 4, 5].map((s, si) => (
                        <motion.span
                          key={s}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: si * 0.08 }}
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </motion.span>
                      ))}
                    </div>
                    <CardDescription className="text-foreground italic leading-relaxed">
                      "{t.text}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 border border-border" />
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {[
              'How does the AI Resume Builder work?',
              'Is my data secure and private?',
              'Can I cancel my subscription at any time?',
              'Does the Career Coach remember my history?'
            ].map((q, i) => (
              <motion.div
                variants={fadeIn}
                key={i}
                whileHover={{ x: 4 }}
                className="border rounded-lg bg-muted/20 p-5 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between items-center font-medium text-foreground">
                  {q}
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 11. Newsletter & CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px] -z-10"
        />
        <motion.div
          animate={{ x: [0, -25, 20, 0], y: [0, 15, -10, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-0 right-1/4 h-[280px] w-[280px] rounded-full bg-accent/10 blur-[100px] -z-10"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="container relative mx-auto px-4 max-w-4xl text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to pilot your career?</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who have accelerated their career growth with SkillPilot AI.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-6">
            <Input
              type="email"
              placeholder="Enter your email for updates"
              className="h-12 rounded-full px-6 bg-background shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={newsStatus === "loading"}
              required
            />
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto shrink-0">
              <Button
                type="submit"
                size="lg"
                className="h-12 rounded-full w-full sm:w-auto px-8 shrink-0 transition-all"
                disabled={newsStatus === "loading"}
              >
                {newsStatus === "loading" ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                {newsStatus === "loading" ? "Subscribing..." : "Subscribe"}
              </Button>
            </motion.div>
          </form>

          {newsStatus === "success" && <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-6 font-medium animate-in fade-in slide-in-from-bottom-2">{newsMessage}</p>}
          {newsStatus === "error" && <p className="text-sm text-destructive mb-6 font-medium animate-in fade-in slide-in-from-bottom-2">{newsMessage}</p>}

          <p className="text-sm text-muted-foreground">Start for free. No credit card required.</p>
        </motion.div>
      </section>
    </div>
  );
}