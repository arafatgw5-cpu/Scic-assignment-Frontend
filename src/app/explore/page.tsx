"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Filter,
  Star,
  ArrowRight,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  Sparkles,
  SearchX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const selectWrapperClass = "relative flex-1 min-w-[160px] group";
  const selectClassName = "appearance-none h-11 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm hover:bg-muted/30 cursor-pointer text-foreground";
  const selectIconClass = "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-hover:text-foreground transition-colors";

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl min-h-screen flex flex-col selection:bg-primary/20">
      
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-background border border-border/50 shadow-sm p-8 md:p-14 mb-10 flex flex-col justify-center">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] opacity-70 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] opacity-50 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-md mb-6 py-1.5 px-3 border-primary/20 text-primary shadow-sm flex items-center w-fit gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-medium text-xs uppercase tracking-wider">Career Opportunities</span>
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 text-foreground text-balance leading-tight">
            Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">dream role.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-balance leading-relaxed">
            Discover high-growth opportunities at world-class companies. Filter by role, experience, and location to find the perfect fit.
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mt-6">
            <Badge variant="destructive" className="px-4 py-2 text-sm shadow-sm">
              {error}
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Raycast-style Search & Filters */}
      <div className="space-y-4 mb-10 relative z-20">
        {/* Main Search Bar */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/0 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative flex items-center bg-background/80 backdrop-blur-xl border border-border/80 shadow-sm focus-within:shadow-md focus-within:border-primary/50 rounded-2xl p-1.5 transition-all duration-300">
            <Search className="h-6 w-6 text-muted-foreground ml-4 shrink-0" />
            <Input
              className="flex-1 border-0 bg-transparent text-base md:text-lg shadow-none focus-visible:ring-0 px-4 h-12 md:h-14 placeholder:text-muted-foreground/60"
              placeholder="Search roles, companies, skills, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSearchTerm("")}
                className="mr-2 text-muted-foreground hover:text-foreground rounded-xl h-10 w-10 hover:bg-muted/50"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="flex flex-col md:flex-row flex-wrap gap-3 p-3 bg-muted/20 border border-border/50 rounded-2xl backdrop-blur-sm">
          
          <div className={selectWrapperClass}>
            <select 
              value={filters.category} 
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className={selectClassName}
            >
              {categories.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
            </select>
            <ChevronDown className={selectIconClass} />
          </div>

          <div className={selectWrapperClass}>
            <select 
              value={filters.jobType} 
              onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
              className={selectClassName}
            >
              {jobTypes.map(j => <option key={j} value={j}>{j === "All" ? "All Work Types" : j}</option>)}
            </select>
            <ChevronDown className={selectIconClass} />
          </div>

          <div className={selectWrapperClass}>
            <select 
              value={filters.experienceLevel} 
              onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
              className={selectClassName}
            >
              {experienceLevels.map(e => <option key={e} value={e}>{e === "All" ? "Any Experience" : e + " Level"}</option>)}
            </select>
            <ChevronDown className={selectIconClass} />
          </div>

          <div className={selectWrapperClass}>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className={selectClassName}
            >
              <option value="latest">Sort: Latest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="salary-low">Salary: Low → High</option>
              <option value="salary-high">Salary: High → Low</option>
              <option value="rating">Highest Rating</option>
            </select>
            <ChevronDown className={selectIconClass} />
          </div>

          <div className="relative flex-[1.5] min-w-[200px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Location (e.g., New York, Remote)"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="h-11 pl-10 rounded-xl bg-background/50 border-border/60 hover:bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
            />
          </div>

          {(searchTerm || filters.category !== "All" || filters.location || filters.experienceLevel !== "All" || filters.jobType !== "All" || sortBy !== "latest") && (
             <Button 
              variant="outline" 
              onClick={clearAllFilters}
              className="h-11 rounded-xl gap-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 px-6 shrink-0 transition-all"
            >
              <Filter className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results Header */}
      {!loading && careers.length > 0 && (
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-sm font-medium text-muted-foreground">
            Showing <span className="text-foreground">{paginatedCareers.length}</span> of <span className="text-foreground">{careers.length}</span> open roles
          </p>
        </div>
      )}

      {/* Main Content Area */}
      {loading && careers.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-[380px] rounded-2xl border-border/50 bg-card p-6 flex flex-col gap-5 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="h-6 w-24 bg-muted rounded-full" />
                <div className="h-6 w-12 bg-muted rounded-md" />
              </div>
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 bg-muted rounded-xl shrink-0" />
                <div className="space-y-3 flex-1">
                  <div className="h-4 w-1/3 bg-muted rounded" />
                  <div className="h-5 w-3/4 bg-muted rounded" />
                </div>
              </div>
              <div className="space-y-2.5 mt-2">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="h-5 w-24 bg-muted rounded" />
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-6 w-16 bg-muted rounded-md" />
                <div className="h-6 w-16 bg-muted rounded-md" />
              </div>
              <div className="h-11 w-full bg-muted rounded-xl mt-4" />
            </Card>
          ))}
        </div>
      ) : careers.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="flex flex-col items-center justify-center py-32 px-4 border border-dashed border-border/60 rounded-[2rem] bg-muted/10 text-center"
        >
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6 shadow-sm border border-border/50">
            <SearchX className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3">No roles found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 text-balance">
            We couldn't find any opportunities matching your current filters. Try adjusting your search criteria or clearing filters.
          </p>
          <Button size="lg" className="rounded-xl gap-2 shadow-sm" onClick={clearAllFilters}>
            <X className="h-4 w-4" />
            Clear all filters
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {paginatedCareers.map((career, index) => (
              <motion.div
                key={career._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
                className="h-full"
              >
                <Card className="flex flex-col h-full rounded-2xl bg-card border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <CardHeader className="pb-4 relative z-10 px-6 pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 font-medium px-2.5 py-0.5 border-none shadow-none">
                        {career.category || "General"}
                      </Badge>
                      <div className="flex items-center text-sm font-semibold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                        <Star className="h-3.5 w-3.5 fill-current mr-1.5" />
                        {career.rating || "N/A"}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/50 shadow-sm group-hover:shadow-md transition-shadow">
                        {career.companyLogo ? (
                          <img src={career.companyLogo} alt={career.company} className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-6 w-6 text-muted-foreground/60" />
                        )}
                      </div>
                      <div className="min-w-0 pt-1">
                        <p className="text-sm font-medium text-muted-foreground truncate mb-1">{career.company}</p>
                        <CardTitle className="text-lg md:text-xl font-bold leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
                          {career.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col px-6 relative z-10">
                    <p className="text-sm text-muted-foreground/90 line-clamp-2 mb-6 leading-relaxed">
                      {career.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-auto">
                      <div className="flex items-center text-sm text-foreground/80 font-medium">
                        <div className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center mr-2.5">
                          <DollarSign className="h-4 w-4 text-primary/70" />
                        </div>
                        <span className="truncate">{formatSalary(career.salaryRange)}</span>
                      </div>
                      <div className="flex items-center text-sm text-foreground/80 font-medium">
                        <div className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center mr-2.5">
                          <MapPin className="h-4 w-4 text-primary/70" />
                        </div>
                        <span className="truncate">{career.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-foreground/80 font-medium">
                        <div className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center mr-2.5">
                          <Briefcase className="h-4 w-4 text-primary/70" />
                        </div>
                        <span className="truncate">{career.experienceLevel}</span>
                      </div>
                      <div className="flex items-center text-sm text-foreground/80 font-medium">
                        <div className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center mr-2.5">
                          <Calendar className="h-4 w-4 text-primary/70" />
                        </div>
                        <span className="truncate">{new Date(career.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-border/40">
                      {career.requiredSkills?.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="bg-muted/50 hover:bg-muted text-xs font-medium border-border/30 text-foreground/70">
                          {skill}
                        </Badge>
                      ))}
                      {career.requiredSkills?.length > 3 && (
                        <Badge variant="secondary" className="bg-muted/50 text-xs font-medium border-border/30 text-foreground/70">
                          +{career.requiredSkills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-5 pb-6 px-6 relative z-10 mt-auto">
                    <Button 
                      className="w-full gap-2 rounded-xl group-hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow group-hover:translate-y-[1px]"
                      onClick={() => router.push(`/explore/careers/${career._id}`)}
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Premium Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground font-medium hidden sm:block">
            Page {currentPage} of {totalPages}
          </p>
          
          <div className="flex items-center gap-1.5 p-1 bg-muted/20 rounded-2xl border border-border/50 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-10 w-10 rounded-xl hover:bg-background shadow-sm disabled:opacity-30 disabled:shadow-none transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center px-2 space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to show pages around current page for massive lists
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-9 w-9 rounded-xl font-semibold transition-all ${currentPage === pageNum ? "shadow-sm shadow-primary/20" : "hover:bg-background shadow-sm"}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-10 w-10 rounded-xl hover:bg-background shadow-sm disabled:opacity-30 disabled:shadow-none transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}