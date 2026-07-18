"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, CheckCircle2, AlertCircle, FileText, BarChart3, ChevronRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

interface AnalysisResult {
  atsScore: number;
  grammarIssues: string[];
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export default function AnalyzerPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    
    setAnalyzing(true);
    setError("");
    try {
      const data = await api.analyzeResume(resumeText);
      setResults(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed.";
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError("");
    setResumeText("");
  };

  const score = results?.atsScore ?? 0;
  const scoreColor = score >= 80 ? "text-green-500" : score >= 60 ? "text-amber-500" : "text-destructive";
  const scoreLabel = score >= 80 ? "Good" : score >= 60 ? "Needs Work" : "Poor";

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BrainCircuit className="h-8 w-8 text-primary" />
          Resume Analyzer
        </h1>
        <p className="text-muted-foreground mt-1">Paste your resume to get a detailed ATS compatibility score and actionable feedback.</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-6 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
          <Button variant="ghost" size="sm" className="ml-auto shrink-0 text-destructive hover:text-destructive" onClick={() => setError("")}>
            Dismiss
          </Button>
        </div>
      )}

      {!analyzing && !results ? (
        <Card className="border-dashed border-2 bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Paste your Resume Text</h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              Paste the content of your resume here. We will analyze it against industry standards.
            </p>
            <div className="w-full max-w-2xl px-4">
              <Textarea 
                className="min-h-[200px] mb-4" 
                placeholder="Paste your resume text here..." 
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <Button size="lg" className="rounded-full px-8 w-full" onClick={handleAnalyze} disabled={!resumeText.trim()}>
                Analyze Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : analyzing ? (
        <Card className="border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative h-32 w-32 mb-8">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <BrainCircuit className="absolute inset-0 m-auto h-12 w-12 text-primary animate-pulse" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Analyzing your Resume...</h3>
            <p className="text-muted-foreground max-w-md animate-pulse">
              Our AI is parsing your experience, extracting keywords, and checking ATS compatibility.
            </p>
          </CardContent>
        </Card>
      ) : results ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Score Ring */}
            <Card className="md:col-span-1 bg-gradient-to-br from-background to-muted border-primary/20">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-muted-foreground">Overall ATS Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center pt-4">
                <div className="relative h-48 w-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted" />
                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="552.9" strokeDashoffset={552.9 - (552.9 * score) / 100} className={`${scoreColor} transition-all duration-1000 ease-out`} />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-5xl font-bold">{score}</span>
                    <span className={`text-sm font-medium ${scoreColor}`}>{scoreLabel}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Breakdown */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {results.strengths.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-green-600 dark:text-green-500 flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4" /> Strengths
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                      {results.strengths.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {results.weaknesses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4" /> Weaknesses
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                      {results.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actionable Feedback */}
          <h3 className="text-xl font-bold mt-8 mb-4">Actionable Feedback</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" /> Missing Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {results.missingKeywords.map((kw) => (
                      <span key={kw} className="bg-background border text-xs px-2 py-1 rounded">{kw}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-foreground/80">No critical missing keywords detected.</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-600 dark:text-amber-500">
                  <AlertCircle className="h-4 w-4" /> Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.suggestions.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                    {results.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                ) : (
                  <p className="text-sm text-foreground/80">No additional suggestions.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-4 mt-10">
            <Button variant="outline" onClick={handleReset} className="rounded-full px-8">
              Analyze Another
            </Button>
            <Button size="lg" className="rounded-full px-8 gap-2 bg-gradient-to-r from-primary to-accent border-0">
              <BrainCircuit className="h-5 w-5" /> Let AI Fix My Resume <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
