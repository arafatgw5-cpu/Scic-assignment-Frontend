"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkX, MapPin, DollarSign, Briefcase, Star, Loader2, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";

const fallbackSavedCareers = [
  {
    _id: "saved-1",
    title: "Senior React Developer",
    category: "Engineering",
    salary: "$130k - $165k",
    experience: "5+ years",
    location: "Remote (US)",
    rating: 4.8,
    description: "Build and maintain large-scale React applications. Lead frontend architecture decisions and mentor junior developers.",
    skills: ["React", "TypeScript", "Redux", "Next.js", "GraphQL"],
    savedAt: "2026-07-15",
  },
  {
    _id: "saved-2",
    title: "Product Designer",
    category: "Design",
    salary: "$105k - $135k",
    experience: "3+ years",
    location: "New York, NY",
    rating: 4.7,
    description: "Own the end-to-end design process for our flagship SaaS product. Conduct user research and translate findings into polished UI.",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
    savedAt: "2026-07-14",
  },
  {
    _id: "saved-3",
    title: "Data Engineer",
    category: "Data",
    salary: "$125k - $155k",
    experience: "4+ years",
    location: "Seattle, WA (Hybrid)",
    rating: 4.6,
    description: "Build and optimize ETL pipelines, data warehouses, and real-time streaming systems at scale.",
    skills: ["Python", "Apache Spark", "SQL", "Airflow", "AWS"],
    savedAt: "2026-07-12",
  },
];

export default function SavedCareersPage() {
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSavedCareers()
      .then((data) => {
        if (data && data.length > 0) {
          setCareers(data);
        } else {
          setCareers(fallbackSavedCareers);
        }
      })
      .catch(() => {
        setCareers(fallbackSavedCareers);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = (id: string) => {
    setCareers((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-primary" />
            Saved Careers
          </h1>
          <p className="text-muted-foreground mt-1">
            {careers.length} career{careers.length !== 1 ? "s" : ""} bookmarked for later.
          </p>
        </div>
        <Link href="/explore">
          <Button variant="outline" className="gap-2">
            Explore More <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : careers.length === 0 ? (
        <Card className="bg-muted/10 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Bookmark className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <CardTitle className="mb-2">No saved careers yet</CardTitle>
            <p className="text-muted-foreground text-center mb-6">
              Explore careers and bookmark them to see them here.
            </p>
            <Link href="/explore">
              <Button>Explore Careers</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careers.map((career) => (
            <Card key={career._id} className="flex flex-col hover:border-primary/50 transition-all hover:shadow-md group">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {career.category || "General"}
                  </Badge>
                  <div className="flex items-center text-sm font-medium text-amber-500">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    {career.rating || 4.5}
                  </div>
                </div>
                <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                  {career.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground mb-5 line-clamp-2">
                  {career.description}
                </p>

                <div className="space-y-2.5 mb-5">
                  <div className="flex items-center text-sm text-foreground/80">
                    <DollarSign className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
                    {career.salary}
                  </div>
                  <div className="flex items-center text-sm text-foreground/80">
                    <Briefcase className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
                    {career.experience}
                  </div>
                  <div className="flex items-center text-sm text-foreground/80">
                    <MapPin className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
                    {career.location}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {career.skills?.slice(0, 4).map((skill: string) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {career.skills?.length > 4 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{career.skills.length - 4}
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t gap-2">
                <Button className="flex-1 gap-2">
                  View Details <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  title="Remove from saved"
                  onClick={() => handleUnsave(career._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
