"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
  Star
} from "lucide-react";

// --- Animation Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 70, damping: 20 } 
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function HeroWithImage() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background pt-24 pb-16 md:pt-32">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[150px] opacity-60" />
      <div className="absolute bottom-0 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[150px]" />

      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTAs */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start text-left"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                V2.0 is now available
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeUp}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:leading-[1.1] mb-6"
            >
              Build a winning resume with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                AI Intelligence
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeUp}
              className="mb-8 max-w-[600px] text-lg text-muted-foreground md:text-xl leading-relaxed"
            >
              Stop guessing what recruiters want. Our AI analyzes your experience, matches it against millions of job postings, and generates an ATS-friendly resume in seconds.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 mb-10">
              <Button size="lg" className="h-14 rounded-full px-8 text-base shadow-lg">
                Create Free Resume
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 rounded-full px-8 text-base border-border/60 bg-background/50 backdrop-blur">
                View Examples
              </Button>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeUp} className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-background overflow-hidden bg-muted">
                    <img 
                      src={`https://i.pravatar.cc/100?img=${i + 12}`} 
                      alt="User avatar" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Trusted by 10,000+ job seekers
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Image & Floating Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative lg:ml-auto w-full max-w-lg xl:max-w-xl aspect-square lg:aspect-auto lg:h-[600px]"
          >
            {/* Main Image */}
            <div className="relative h-full w-full overflow-hidden rounded-3xl border border-border/50 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1000"
                alt="Professional woman working on laptop"
                className="h-full w-full object-cover"
              />
              {/* Overlay gradient for text readability if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Floating Animation Card 1: ATS Score */}
            <motion.div
              variants={floatAnimation}
              initial="initial"
              animate="animate"
              className="absolute -left-6 lg:-left-12 top-1/4 rounded-2xl border border-border/50 bg-background/80 p-4 backdrop-blur-xl shadow-xl max-w-[200px]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase">ATS Score</div>
                  <div className="text-2xl font-bold text-foreground">98%</div>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted mt-3">
                <div className="h-full w-[98%] rounded-full bg-emerald-500" />
              </div>
            </motion.div>

            {/* Floating Animation Card 2: Resume Generated */}
            <motion.div
              variants={floatAnimation}
              initial="initial"
              animate="animate"
              transition={{ delay: 1, duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 bottom-1/4 lg:bottom-1/3 rounded-2xl border border-border/50 bg-background/80 p-4 backdrop-blur-xl shadow-xl flex items-center gap-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">Marketing_Resume.pdf</div>
                <div className="text-xs text-muted-foreground">Generated 2 mins ago</div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}