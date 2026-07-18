"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Users,
  TrendingUp,
  Loader2,
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
    return (
      <div className="container mx-auto px-4 py-20 max-w-5xl flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading career details...</p>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="text-center py-20 border rounded-xl bg-muted/10">
          <h3 className="text-xl font-semibold">Career not found</h3>
          <p className="text-muted-foreground mt-2">
            This position may have been filled or removed.
          </p>
          <Button className="mt-6" onClick={() => router.push("/explore/careers")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Careers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6 -ml-4"
        onClick={() => router.push("/explore/careers")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Careers
      </Button>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden border-2">
          {career.companyLogo ? (
            <img
              src={career.companyLogo}
              alt={career.company}
              className="h-full w-full object-cover"
            />
          ) : (
            <Building2 className="h-10 w-10 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
            <div>
              <Badge className="mb-2">{career.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{career.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{career.company}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg">
              <Star className="h-5 w-5 fill-current" />
              <span className="font-bold text-lg">{career.rating}</span>
              <span className="text-sm text-muted-foreground">/ 5.0</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {career.location}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              {career.jobType}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              {formatSalary(career.salaryRange)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Button
          size="lg"
          className="flex-1 md:flex-none md:px-8"
          onClick={() => toast.info("Application feature coming soon!")}
        >
          Apply Now
        </Button>
        <Button
          variant={isSaved ? "default" : "outline"}
          size="lg"
          disabled={saving}
          onClick={handleSaveCareer}
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSaved ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {isSaved ? "Saved" : "Save Job"}
        </Button>
        <Button variant="outline" size="lg" onClick={handleShare} className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">About the Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {career.description}
              </p>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          {career.responsibilities && career.responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Key Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {career.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{resp}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Required Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {career.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-4 py-2 text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Job Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Experience Level</p>
                  <p className="text-sm text-muted-foreground">{career.experienceLevel}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{career.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Job Type</p>
                  <p className="text-sm text-muted-foreground">{career.jobType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Salary Range</p>
                  <p className="text-sm text-muted-foreground">
                    {formatSalary(career.salaryRange)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Posted Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(career.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{career.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">About Company</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
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
                  <p className="font-semibold">{career.company}</p>
                  <div className="flex items-center gap-1 text-sm text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{career.rating}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Join our team and work on exciting projects with cutting-edge technologies.
                We offer competitive benefits and growth opportunities.
              </p>
            </CardContent>
          </Card>

          {/* Apply Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <Users className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg mb-1">Ready to Apply?</h3>
                <p className="text-sm text-muted-foreground">
                  Take the next step in your career journey
                </p>
              </div>
              <Button className="w-full" size="lg">
                Apply for this Position
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}