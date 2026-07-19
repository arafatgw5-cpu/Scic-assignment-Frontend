"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Building2,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface Career {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  category: string;
  location: string;
  jobType: "Remote" | "Hybrid" | "Onsite";
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  experienceLevel: "Entry" | "Mid" | "Senior" | "Executive";
  createdAt: string;
}

const formatSalary = (range: { min: number; max: number; currency: string }) => {
  if (!range) return "Salary Undisclosed";
  const min = range.min >= 1000 ? `${range.min / 1000}k` : range.min;
  const max = range.max >= 1000 ? `${range.max / 1000}k` : range.max;
  return `${range.currency === "USD" ? "$" : ""}${min} - ${max}${
    range.currency === "USD" ? "k" : ""
  }`;
};

// --- Animations ---
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const JOB_TYPES = ["All", "Remote", "Hybrid", "Onsite"];
const EXPERIENCE_LEVELS = ["All", "Entry", "Mid", "Senior", "Executive"];

export default function CareersExplorePage() {
  const router = useRouter();
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoading(true);
        const data = await api.get<Career[]>("/careers");
        setCareers(data);
      } catch (error: any) {
        console.error("Failed to fetch careers:", error);
        toast.error(error.message || "Failed to load careers");
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, []);

  // Filter Logic
  const filteredCareers = useMemo(() => {
    return careers.filter((career) => {
      const matchesSearch = 
        career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        career.company.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === "All" || career.jobType === selectedType;
      const matchesLevel = selectedLevel === "All" || career.experienceLevel === selectedLevel;

      return matchesSearch && matchesType && matchesLevel;
    });
  }, [careers, searchQuery, selectedType, selectedLevel]);

  return (
    <div className="relative min-h-screen pb-24">
      {/* Premium Background Gradient */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 pt-16 max-w-6xl">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Discover Your Next Big Move</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Explore Careers
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect role that matches your skills, passion, and career goals. Thousands of opportunities await.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 space-y-6"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search by job title, company, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border/60 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-base"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto px-2">
              <Filter className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
              
              <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50 shrink-0">
                {JOB_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      selectedType === type 
                        ? "bg-background shadow-sm text-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="hidden sm:block w-px h-6 bg-border mx-2" />

              <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50 shrink-0">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      selectedLevel === level 
                        ? "bg-background shadow-sm text-foreground" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CareerCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredCareers.length > 0 ? (
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-4 md:grid-cols-2"
          >
            <AnimatePresence>
              {filteredCareers.map((career) => (
                <motion.div key={career._id} variants={fadeUp} layout>
                  <Card 
                    className="group cursor-pointer p-5 sm:p-6 rounded-3xl border-border/50 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 bg-card/50 backdrop-blur-sm transition-all duration-300"
                    onClick={() => router.push(`/explore/careers/${career._id}`)}
                  >
                    <div className="flex items-start gap-4 sm:gap-6">
                      {/* Logo */}
                      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-muted border border-border/50 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                        {career.companyLogo ? (
                          <img src={career.companyLogo} alt={career.company} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-6 w-6 text-muted-foreground/50" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                            {career.title}
                          </h3>
                          <Badge variant="secondary" className="hidden sm:flex shrink-0 bg-primary/10 text-primary border-0">
                            {career.jobType}
                          </Badge>
                        </div>
                        
                        <div className="text-muted-foreground text-sm font-medium mb-4 flex items-center gap-1.5 truncate">
                          {career.company}
                          <span className="w-1 h-1 rounded-full bg-border" />
                          {career.location}
                        </div>

                        {/* Badges/Info Row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-lg">
                            <DollarSign className="h-3.5 w-3.5" />
                            {formatSalary(career.salaryRange)}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-lg">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {career.experienceLevel}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-lg">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(career.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      
                      {/* Chevron Arrow */}
                      <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground transition-colors self-center">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">No careers found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              We couldn't find any roles matching your current filters. Try adjusting your search criteria.
            </p>
            <Button 
              variant="outline" 
              className="mt-6 rounded-full"
              onClick={() => {
                setSearchQuery("");
                setSelectedType("All");
                setSelectedLevel("All");
              }}
            >
              Clear all filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// --- Skeleton Component ---
function CareerCardSkeleton() {
  return (
    <Card className="p-5 sm:p-6 rounded-3xl border-border/50 bg-card/50">
      <div className="flex items-start gap-4 sm:gap-6">
        <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-3/4 max-w-[200px] rounded-md" />
            <Skeleton className="h-5 w-16 rounded-full hidden sm:block" />
          </div>
          <Skeleton className="h-4 w-1/2 max-w-[150px] rounded-md" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    </Card>
  );
}