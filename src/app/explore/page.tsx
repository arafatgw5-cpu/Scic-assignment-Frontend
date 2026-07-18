"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Briefcase, DollarSign, Filter, Star, ArrowRight, Loader2 } from "lucide-react";

export default function ExploreCareersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Engineering", "Data", "Product", "Design", "Marketing"];

  useEffect(() => {
    api.getCareers()
      .then((data) => {
        if (data && data.length > 0) {
          setCareers(data);
        } else {
          // Fallback dummy data so page isn't empty
          setCareers([
            {
              _id: "1",
              title: "Senior Full Stack Engineer",
              category: "Engineering",
              salary: "$120k - $160k",
              experience: "5+ years",
              location: "Remote (US)",
              rating: 4.8,
              description: "Lead the development of our core SaaS platform using Next.js, Node.js, and MongoDB. Mentor junior engineers and drive architecture decisions.",
              skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS"]
            },
            {
              _id: "2",
              title: "Product Manager, AI Tools",
              category: "Product",
              salary: "$110k - $140k",
              experience: "3+ years",
              location: "San Francisco, CA",
              rating: 4.5,
              description: "Drive the roadmap for our new suite of AI-powered developer tools. Work closely with engineering and design to deliver high-impact features.",
              skills: ["Product Strategy", "Agile", "User Research", "Data Analysis"]
            },
            {
              _id: "3",
              title: "Lead UX/UI Designer",
              category: "Design",
              salary: "$100k - $130k",
              experience: "4+ years",
              location: "New York, NY (Hybrid)",
              rating: 4.9,
              description: "Craft beautiful and intuitive user experiences for our enterprise dashboard. Build and maintain our design system.",
              skills: ["Figma", "Prototyping", "Design Systems", "User Testing"]
            },
            {
              _id: "4",
              title: "Data Scientist",
              category: "Data",
              salary: "$130k - $170k",
              experience: "3+ years",
              location: "Remote",
              rating: 4.7,
              description: "Build predictive models and leverage machine learning to extract actionable insights from our massive datasets.",
              skills: ["Python", "TensorFlow", "SQL", "Machine Learning"]
            },
            {
              _id: "5",
              title: "Growth Marketing Manager",
              category: "Marketing",
              salary: "$90k - $120k",
              experience: "2+ years",
              location: "Austin, TX",
              rating: 4.4,
              description: "Lead user acquisition strategies, manage ad spend, and optimize conversion funnels for our B2C products.",
              skills: ["SEO", "Performance Marketing", "Google Analytics", "A/B Testing"]
            },
            {
              _id: "6",
              title: "Backend Engineer",
              category: "Engineering",
              salary: "$115k - $150k",
              experience: "3+ years",
              location: "Remote",
              rating: 4.6,
              description: "Scale our microservices architecture and optimize database queries to handle millions of daily requests.",
              skills: ["Go", "PostgreSQL", "Docker", "Kubernetes", "Redis"]
            }
          ]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCareers = careers.filter(
    (c) =>
      (activeCategory === "All" || c.category === activeCategory) &&
      (c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Explore Careers</h1>
          <p className="text-muted-foreground">Discover high-growth opportunities and find your next dream role.</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10 h-12 rounded-lg bg-background"
            placeholder="Search roles, skills, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 px-6 gap-2 shrink-0">
          <Filter className="h-4 w-4" />
          Advanced Filters
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide">
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            className="rounded-full shrink-0"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Career Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCareers.map((career) => (
          <Card key={career._id} className="flex flex-col hover:border-primary/50 transition-colors group">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  {career.category || "General"}
                </Badge>
                <div className="flex items-center text-sm font-medium text-amber-500">
                  <Star className="h-4 w-4 fill-current mr-1" />
                  {career.rating || 0}
                </div>
              </div>
              <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                {career.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                {career.description}
              </p>
              
              <div className="space-y-3 mb-6">
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
                {career.skills?.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <Button className="w-full gap-2 group-hover:bg-primary/90">
                View Details
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredCareers.length === 0 && (
        <div className="text-center py-20 border rounded-xl bg-muted/10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No careers found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filters to find what you're looking for.</p>
          <Button variant="outline" className="mt-6" onClick={() => {setSearchTerm(""); setActiveCategory("All");}}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
