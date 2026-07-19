"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Star,
  Building2,
  Calendar,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  CheckCircle2,
  Globe,
  TrendingUp,
  Loader2,
  ChevronRight,
  Clock,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface CareerDetail {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  category: string;
  description: string;
  location: string;
  jobType: "Remote" | "Hybrid" | "Onsite";
  rating: number;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  experienceLevel: "Entry" | "Mid" | "Senior" | "Executive";
  requiredSkills: string[];
  responsibilities: string[];
  createdAt: string;
  updatedAt: string;
}

const formatSalary = (range: { min: number; max: number; currency: string }) => {
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
  transition: { duration: 0.5, ease: "easeOut" as const },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function CareerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [career, setCareer] = useState<CareerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCareer = async () => {
      try {
        setLoading(true);
        const data = await api.get<CareerDetail>(`/careers/${params.id}`);
        setCareer(data);
      } catch (error: any) {
        console.error("Failed to fetch career:", error);
        toast.error(error.message || "Failed to load career details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCareer();
    }
  }, [params.id]);

  const handleSaveCareer = async () => {
    if (!career) return;

    try {
      setSaving(true);
      if (isSaved) {
        await api.del(`/careers/${career._id}/unsave`);
        setIsSaved(false);
        toast.success("Career removed from saved list");
      } else {
        await api.post(`/careers/${career._id}/save`, {});
        setIsSaved(true);
        toast.success("Career saved successfully!");
      }
    } catch (error: any) {
      console.error("Failed to save career:", error);
      toast.error(error.message || "Failed to save career");
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: career?.title,
        text: `Check out this ${career?.title} position at ${career?.company}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return <CareerDetailsSkeleton />;
  }

  if (!career) {
    return (
      <div className="container mx-auto px-4 py-32 max-w-5xl min-h-[70vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
            Position Unavailable
          </h3>
          <p className="text-muted-foreground mt-3 mb-8 text-lg">
            This role may have been filled, removed, or the link is incorrect.
          </p>
          <Button
            size="lg"
            variant="default"
            className="rounded-full shadow-sm"
            onClick={() => router.push("/explore/careers")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Explore other careers
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-24">
      {/* Premium Background subtle gradient */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 via-primary/5 to-transparent -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 pt-12 max-w-6xl">
        {/* Navigation Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center text-sm text-muted-foreground mb-8"
        >
          <button
            onClick={() => router.push("/explore/careers")}
            className="hover:text-foreground transition-colors flex items-center"
          >
            Careers
          </button>
          <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
            {career.title}
          </span>
        </motion.nav>

        {/* Hero Section */}
        <motion.div {...fadeUp} className="mb-12">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl bg-background shadow-sm border border-border/50 flex items-center justify-center shrink-0 overflow-hidden relative group">
              {career.companyLogo ? (
                <img
                  src={career.companyLogo}
                  alt={career.company}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <Building2 className="h-12 w-12 text-muted-foreground/50" />
              )}
            </div>

            <div className="flex-1 pt-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-0">
                      {career.category}
                    </Badge>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-semibold">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {career.rating}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(career.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
                    {career.title}
                  </h1>
                  
                  <div className="flex items-center gap-2 text-lg text-muted-foreground font-medium mb-6">
                    <span className="text-foreground">{career.company}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{career.location}</span>
                  </div>
                </div>

                {/* Desktop Action Buttons */}
                <div className="hidden md:flex flex-col gap-3 min-w-[200px]">
                  <Button
                    size="lg"
                    className="w-full rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                    onClick={() => toast.info("Application feature coming soon!")}
                  >
                    Apply Now
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant={isSaved ? "secondary" : "outline"}
                      className={`flex-1 rounded-xl transition-all ${isSaved ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
                      disabled={saving}
                      onClick={handleSaveCareer}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isSaved ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Info Pills */}
              <div className="flex flex-wrap gap-3 mt-2">
                <InfoPill icon={<Briefcase />} label="Type" value={career.jobType} />
                <InfoPill icon={<DollarSign />} label="Salary" value={formatSalary(career.salaryRange)} />
                <InfoPill icon={<TrendingUp />} label="Level" value={career.experienceLevel} />
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="md:hidden flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              size="lg"
              className="w-full rounded-xl shadow-lg shadow-primary/20"
              onClick={() => toast.info("Application feature coming soon!")}
            >
              Apply Now
            </Button>
            <div className="flex gap-3">
              <Button
                variant={isSaved ? "secondary" : "outline"}
                size="lg"
                className={`flex-1 rounded-xl ${isSaved ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
                disabled={saving}
                onClick={handleSaveCareer}
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isSaved ? (
                  <BookmarkCheck className="h-5 w-5 mr-2" />
                ) : (
                  <Bookmark className="h-5 w-5 mr-2" />
                )}
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" size="lg" className="flex-1 rounded-xl" onClick={handleShare}>
                <Share2 className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column - Details */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="lg:col-span-8 space-y-12"
          >
            {/* Description */}
            <motion.section variants={fadeUp} className="prose prose-zinc dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                About the Role
              </h2>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-[15px] sm:text-base">
                {career.description}
              </div>
            </motion.section>

            {/* Responsibilities */}
            {career.responsibilities && career.responsibilities.length > 0 && (
              <motion.section variants={fadeUp}>
                <h2 className="text-2xl font-bold tracking-tight mb-6">Key Responsibilities</h2>
                <div className="grid gap-3">
                  {career.responsibilities.map((resp, index) => (
                    <div
                      key={index}
                      className="group flex items-start gap-4 p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/20 hover:bg-muted/50 transition-all duration-300"
                    >
                      <div className="mt-1 bg-primary/10 p-1 rounded-full shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-foreground/80 leading-relaxed text-[15px]">
                        {resp}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Required Skills */}
            <motion.section variants={fadeUp}>
              <h2 className="text-2xl font-bold tracking-tight mb-6">Required Skills</h2>
              <div className="flex flex-wrap gap-2.5">
                {career.requiredSkills.map((skill) => (
                  <div
                    key={skill}
                    className="px-4 py-2 rounded-xl bg-card border border-border/50 text-sm font-medium hover:border-primary/30 hover:shadow-sm transition-all duration-200 cursor-default"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </motion.section>
          </motion.div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-8 space-y-6">
              {/* Job Overview Card */}
              <motion.div variants={fadeUp} initial="initial" animate="animate">
                <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-6">Job Overview</h3>
                    <div className="space-y-5">
                      <SidebarItem icon={<Globe />} label="Location" value={career.location} />
                      <SidebarItem icon={<Briefcase />} label="Job Type" value={career.jobType} />
                      <SidebarItem icon={<DollarSign />} label="Salary Range" value={formatSalary(career.salaryRange)} />
                      <SidebarItem icon={<TrendingUp />} label="Experience" value={career.experienceLevel} />
                      <SidebarItem
                        icon={<Calendar />}
                        label="Posted Date"
                        value={new Date(career.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Company Info Card */}
              <motion.div
                variants={fadeUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.1 }}
              >
                <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-6">About {career.company}</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center overflow-hidden border shadow-sm">
                        {career.companyLogo ? (
                          <img
                            src={career.companyLogo}
                            alt={career.company}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{career.company}</p>
                        <a href="#" className="text-sm text-primary hover:underline font-medium">
                          View Company Profile
                        </a>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Join our team and work on exciting projects with cutting-edge technologies. We offer competitive benefits, a collaborative environment, and continuous growth opportunities.
                    </p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Subcomponents ---

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-sm">
      <div className="text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">{icon}</div>
      <span className="text-muted-foreground hidden sm:inline">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function SidebarItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 bg-primary/5 rounded-xl text-primary shrink-0 [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="font-medium text-sm text-foreground">{value}</p>
      </div>
    </div>
  );
}

// --- Premium Skeleton Loader ---
function CareerDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 pt-12 max-w-6xl animate-in fade-in duration-500">
      <Skeleton className="h-4 w-48 mb-8 rounded-full" />
      
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl shrink-0" />
          <div className="flex-1 w-full space-y-4 pt-2">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-10 sm:h-12 w-3/4 max-w-xl rounded-xl" />
            <Skeleton className="h-5 w-48 rounded-full" />
            <div className="flex gap-3 mt-6">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-3 min-w-[200px]">
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 flex-1 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 rounded-lg mb-6" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-5/6 rounded-full" />
            <Skeleton className="h-4 w-4/6 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64 rounded-lg mb-6" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <Skeleton className="h-[400px] w-full rounded-3xl" />
          <Skeleton className="h-[250px] w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}