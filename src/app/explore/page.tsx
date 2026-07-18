"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, MapPin, Briefcase, DollarSign, Filter, Star, ArrowRight, 
  Loader2, Building2, Calendar, ChevronLeft, ChevronRight, X 
} from "lucide-react";

// Helper function to format salary
const formatSalary = (range: { min: number; max: number; currency: string }) => {
  const min = range.min >= 1000 ? `${range.min / 1000}k` : range.min;
  const max = range.max >= 1000 ? `${range.max / 1000}k` : range.max;
  return `${range.currency === 'USD' ? '$' : ''}${min} - ${max}${range.currency === 'USD' ? 'k' : ''}`;
};

export default function ExploreCareersPage() {
  const router = useRouter();
  
  const [careers, setCareers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "All",
    location: "",
    experienceLevel: "All",
    jobType: "All",
  });
  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 6;
  const categories = ["All", "Engineering", "Data", "Product", "Design", "Marketing"];
  const experienceLevels = ["All", "Entry", "Mid", "Senior", "Executive"];
  const jobTypes = ["All", "Remote", "Hybrid", "Onsite"];

  // Fetch Data from Backend
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchCareers = async () => {
      try {
        const params = {
          search: searchTerm || undefined,
          category: filters.category !== "All" ? filters.category : undefined,
          experienceLevel: filters.experienceLevel !== "All" ? filters.experienceLevel : undefined,
          location: filters.location || undefined,
          jobType: filters.jobType !== "All" ? filters.jobType : undefined,
          sort: sortBy !== "latest" ? sortBy : undefined,
        };

        const data = await api.getCareers(params);
        
        if (isMounted) {
          setCareers(data || []);
        }
      } catch (err: any) {
        console.error("Failed to fetch careers:", err);
        if (isMounted) {
          setError("Failed to load careers. Please try again later.");
          setCareers([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(fetchCareers, 500);
    return () => { 
      clearTimeout(timer); 
      isMounted = false; 
    };
  }, [searchTerm, filters, sortBy]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(careers.length / itemsPerPage);
  const paginatedCareers = careers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilters({ category: "All", location: "", experienceLevel: "All", jobType: "All" });
    setSortBy("latest");
  };

  const selectClassName = "h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  if (loading && careers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-7xl flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading career opportunities...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Explore Careers</h1>
          <p className="text-muted-foreground">Discover high-growth opportunities and find your next dream role.</p>
        </div>
        {error && (
          <Badge variant="destructive" className="px-3 py-1">
            {error}
          </Badge>
        )}
      </div>

      {/* Search & Main Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10 h-12 rounded-lg bg-background"
            placeholder="Search roles, companies, skills, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <select 
            value={filters.category} 
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className={selectClassName}
          >
            {categories.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
          </select>

          <select 
            value={filters.jobType} 
            onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
            className={selectClassName}
          >
            {jobTypes.map(j => <option key={j} value={j}>{j === "All" ? "All Locations" : j}</option>)}
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className={`${selectClassName} min-w-[160px]`}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="salary-low">Salary: Low → High</option>
            <option value="salary-high">Salary: High → Low</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 p-4 rounded-xl bg-muted/30 border">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Experience Level</label>
          <select 
            value={filters.experienceLevel} 
            onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
            className={selectClassName}
          >
            {experienceLevels.map(e => <option key={e} value={e}>{e === "All" ? "Any Experience" : e + " Level"}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground ml-1">Specific Location</label>
          <Input 
            placeholder="e.g., New York, Remote"
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="h-10 bg-background"
          />
        </div>

        <div className="flex items-end">
          <Button 
            variant="outline" 
            className="w-full h-10 gap-2 border-dashed"
            onClick={clearAllFilters}
          >
            <Filter className="h-4 w-4" />
            Clear All Filters
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{paginatedCareers.length}</span> of{" "}
        <span className="font-semibold text-foreground">{careers.length}</span> careers
      </div>

      {/* Career Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedCareers.map((career) => (
          <Card key={career._id} className="flex flex-col h-full hover:border-primary/50 hover:shadow-md transition-all duration-200 group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-3">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 font-medium">
                  {career.category || "General"}
                </Badge>
                <div className="flex items-center text-sm font-semibold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                  <Star className="h-3.5 w-3.5 fill-current mr-1" />
                  {career.rating || "N/A"}
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border">
                  {career.companyLogo ? (
                    <img src={career.companyLogo} alt={career.company} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-muted-foreground truncate">{career.company}</p>
                  <CardTitle className="text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {career.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col gap-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {career.description}
              </p>
              
              <div className="space-y-2.5">
                <div className="flex items-center text-sm text-foreground/80">
                  <DollarSign className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
                  <span className="font-medium">{formatSalary(career.salaryRange)}</span>
                </div>
                <div className="flex items-center text-sm text-foreground/80">
                  <Briefcase className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
                  {career.experienceLevel} Level
                </div>
                <div className="flex items-center text-sm text-foreground/80">
                  <MapPin className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
                  {career.location}
                </div>
                <div className="flex items-center text-sm text-foreground/80">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
                  Posted {new Date(career.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                {career.requiredSkills?.slice(0, 4).map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-xs font-normal bg-muted/50">
                    {skill}
                  </Badge>
                ))}
                {career.requiredSkills?.length > 4 && (
                  <Badge variant="outline" className="text-xs font-normal bg-muted/50">
                    +{career.requiredSkills.length - 4} more
                  </Badge>
                )}
              </div>
            </CardContent>
            
           <CardFooter className="pt-4 border-t mt-auto">
  <Button 
    className="w-full gap-2 group-hover:bg-primary/90 transition-colors"
    onClick={() => router.push(`/explore/careers/${career._id}`)}
  >
    View Details
    <ArrowRight className="h-4 w-4" />
  </Button>
</CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {careers.length === 0 && !loading && (
        <div className="text-center py-20 border rounded-xl bg-muted/10 mt-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No careers found</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <Button variant="outline" className="mt-6 gap-2" onClick={clearAllFilters}>
            <X className="h-4 w-4" />
            Clear all filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="h-10 w-10"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="h-10 w-10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}