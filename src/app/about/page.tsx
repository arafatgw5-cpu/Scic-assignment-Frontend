"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target, Eye, Sparkles, FileText, Search, MessageSquare,
  TrendingUp, Users, Briefcase, CheckCircle2, ArrowRight
} from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const WHY_ITEMS = [
  { title: "Data-Driven Insights", desc: "Make informed career decisions backed by real-time market data and AI analysis.", icon: TrendingUp },
  { title: "Personalized Experience", desc: "Tailored recommendations and roadmaps that adapt to your unique skills and goals.", icon: Users },
  { title: "Industry Aligned", desc: "Curated content and templates designed to meet the standards of top-tier employers.", icon: Briefcase },
];

const FEATURES = [
  { title: "AI Powered Career Guidance", desc: "Get personalized career paths and learning roadmaps based on your profile.", icon: Sparkles },
  { title: "Smart Resume Builder", desc: "Create ATS-friendly resumes in minutes with AI-generated content suggestions.", icon: FileText },
  { title: "Resume Analyzer", desc: "Instantly scan your resume for ATS compatibility, missing keywords, and improvements.", icon: Search },
  { title: "Career Match", desc: "Discover high-growth opportunities that perfectly align with your skills and aspirations.", icon: Target },
  { title: "AI Career Chat", desc: "Ask questions, get interview prep, and receive real-time career advice from our AI assistant.", icon: MessageSquare },
];

const STATS = [
  { value: "10K+", label: "Active Users" },
  { value: "50K+", label: "Resumes Analyzed" },
  { value: "95%", label: "Success Rate" },
  { value: "24/7", label: "AI Support" },
];

const FAQS = [
  { q: "Is SkillPilot AI free to use?", a: "We offer a generous free tier that includes basic resume analysis and career matching. Premium features are available via our affordable subscription plans." },
  { q: "How accurate is the AI resume analyzer?", a: "Our AI is trained on thousands of successful resumes and ATS systems, providing highly accurate feedback on formatting, keywords, and impact." },
  { q: "Can I export my resume to PDF?", a: "Yes, you can easily export your optimized resume to a professional PDF format directly from the dashboard." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>About SkillPilot AI</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Empowering Your Career Journey with AI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              We are on a mission to democratize career growth by providing intelligent, personalized, and accessible tools for every professional.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/explore">
                <Button size="lg" className="rounded-xl gap-2">Explore Careers <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-xl">Contact Us</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid md:grid-cols-2 gap-8">
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    To bridge the gap between talent and opportunity by leveraging artificial intelligence to provide actionable career insights, resume optimization, and personalized learning roadmaps.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Card className="h-full border-accent/20 bg-gradient-to-br from-background to-accent/5">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                    <Eye className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    A world where every individual has access to the guidance and tools needed to build a fulfilling, future-proof career, regardless of their background.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why SkillPilot AI */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SkillPilot AI?</h2>
            <p className="text-muted-foreground text-lg">We combine cutting-edge AI technology with deep industry knowledge to deliver results that matter.</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
            {WHY_ITEMS.map((item) => (
              <motion.div key={item.title} variants={fadeInUp}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg">Everything you need to accelerate your career growth in one platform.</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card className="h-full border-border/50 hover:border-primary/50 transition-colors duration-300">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about SkillPilot AI.</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="space-y-4">
            {FAQS.map((faq) => (
              <motion.div key={faq.q} variants={fadeInUp}>
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2 flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      {faq.q}
                    </h4>
                    <p className="text-muted-foreground text-sm ml-7">{faq.a}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative rounded-3xl bg-gradient-to-br from-primary to-accent p-8 md:p-16 text-center text-primary-foreground overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Accelerate Your Career?</h2>
              <p className="text-primary-foreground/80 text-lg mb-8">Join thousands of professionals who are already using SkillPilot AI to land their dream jobs.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="rounded-xl gap-2">Get Started Free <ArrowRight className="h-4 w-4" /></Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="rounded-xl bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">Contact Sales</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}