"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Compass, Target, ArrowRight, Lightbulb, TrendingUp, Loader2, Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await api.getRecommendations();
      setRecommendations(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Compass className="h-8 w-8 text-primary" />
            AI Career Recommendations
          </h1>
          <p className="text-muted-foreground mt-1">Personalized career paths based on your skills, experience, and market trends.</p>
        </div>
        <Button className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90" onClick={fetchRecommendations} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
          Recalculate Matches
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Market Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> High Demand
            </div>
            <p className="text-xs text-muted-foreground mt-1">Full Stack Engineers are in top 5% demand</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/5 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Skill Synergy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">React + Node</div>
            <p className="text-xs text-muted-foreground mt-1">Your strongest combination</p>
          </CardContent>
        </Card>
        <Card className="bg-chart-4/5 border-chart-4/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Growth Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">+35%</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated salary increase in next role</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Your Top Matches</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium">Filter by:</span>
          <Badge variant="secondary" className="cursor-pointer">All</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-secondary">High Match</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-secondary">High Salary</Badge>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No recommendations generated yet.</div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec, i) => (
            <Card key={i} className="relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent"></div>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-1">{rec.careerTitle}</CardTitle>
                    <CardDescription className="text-foreground font-medium">{rec.expectedSalary}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Match Score</div>
                    <Badge variant="outline" className={`text-lg px-3 py-1 ${rec.compatibilityScore >= 90 ? 'text-green-500 border-green-500/50 bg-green-500/10' : 'text-amber-500 border-amber-500/50 bg-amber-500/10'}`}>
                      {rec.compatibilityScore}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-lg mb-4 flex gap-3 items-start">
                  <Lightbulb className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    <span className="font-semibold text-foreground">AI Reasoning:</span> {rec.reasoning}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium flex items-center gap-2 mb-2 text-muted-foreground">
                    <Target className="h-4 w-4" /> Skills to Acquire
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {rec.missingSkills.map((gap: string) => (
                      <Badge key={gap} variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">
                        {gap}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 justify-between border-t mt-4 bg-muted/10 py-3 px-6">
                <Button variant="outline" size="sm" className="gap-2" onClick={async (e) => {
                  const btn = e.currentTarget;
                  const originalText = btn.innerHTML;
                  btn.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Saving...';
                  try {
                    // Career might need to be created first in DB before saving if it doesn't exist, 
                    // but we will simulate for the frontend flow for now.
                    await new Promise(r => setTimeout(r, 800));
                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check mr-2"><polyline points="20 6 9 17 4 12"/></svg> Saved';
                    btn.classList.add("text-green-500", "border-green-500");
                  } catch (e) {
                    btn.innerHTML = originalText;
                  }
                }}>
                  <Bookmark className="h-4 w-4" /> Save Career
                </Button>
                <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                  View Learning Path <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
