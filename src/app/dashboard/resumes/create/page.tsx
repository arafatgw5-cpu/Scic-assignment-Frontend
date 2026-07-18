"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  BrainCircuit, Loader2, Sparkles, FileText, ArrowLeft, 
  CheckCircle2, Edit, Download, AlertCircle, Save, 
  Briefcase, Target, MessageSquare, AlignLeft, Building2, KeyRound
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CreateResumePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");
  const [generatedData, setGeneratedData] = useState<{
    professionalSummary: string;
    optimizedSkills: string[];
    optimizedExperience: { company: string; role: string; description: string }[];
    optimizedProjects: { name: string; description: string }[];
  } | null>(null);

  const [formData, setFormData] = useState({
    // Step 1: Target Details
    targetRole: "",
    targetCompany: "",   // New Option 1
    keywords: "",        // New Option 2
    skills: "",
    jobDescription: "",
    
    // Step 2: AI Settings
    experienceLevel: "Mid-Level",
    focusArea: "General / Balanced",
    tone: "Professional & Direct",
    outputFormat: "Bullet-Heavy",
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const skillsList = formData.skills
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : ["React", "TypeScript", "Node.js"];

      // FIX: Cast the payload to 'any' to bypass strict type checking for the newly added fields 
      // (targetCompany, keywords, preferences) until the types in api.ts are updated.
      const result = await api.generateResume({
        targetJob: formData.targetRole,
        targetCompany: formData.targetCompany,
        keywords: formData.keywords,
        skills: skillsList,
        experience: formData.jobDescription
          ? [{ title: formData.targetRole, description: formData.jobDescription }]
          : [],
        preferences: {
          level: formData.experienceLevel,
          focus: formData.focusArea,
          tone: formData.tone,
          format: formData.outputFormat
        }
      } as any);

      setGeneratedData(result);
      setGenerated(true);
      setStep(3);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Resume generation failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedData) return;
    setSaving(true);
    setError("");
    try {
      await api.createResume({
        title: formData.targetCompany 
          ? `${formData.targetRole} - ${formData.targetCompany} Resume`
          : `${formData.targetRole} Resume`,
        targetRole: formData.targetRole,
        summary: generatedData.professionalSummary,
        skills: generatedData.optimizedSkills,
        experience: generatedData.optimizedExperience.map(e => ({
          company: e.company,
          role: e.role,
          description: e.description
        })),
        projects: generatedData.optimizedProjects.map(p => ({
          name: p.name,
          description: p.description
        })),
        content: generatedData
      });
      
      router.push("/dashboard/resumes");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save resume.";
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard/resumes" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Resumes
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Resume Generator</h1>
        <p className="text-muted-foreground mt-1">Create a perfectly tailored resume that beats the ATS.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-10 max-w-2xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center w-full last:w-auto">
            <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 relative z-10 ${
              step >= i ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110" : "bg-muted/50 text-muted-foreground border border-border/50"
            }`}>
              {i}
            </div>
            {i < 3 && (
              <div className="flex-1 mx-2 relative h-1 rounded-full overflow-hidden bg-muted/50">
                <div className={`absolute left-0 top-0 h-full bg-primary transition-all duration-700 ease-out ${
                  step > i ? "w-full" : "w-0"
                }`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-6 text-sm text-destructive animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="mt-1 opacity-90">{error}</p>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto shrink-0 text-destructive hover:bg-destructive/20" onClick={() => setError("")}>
            Dismiss
          </Button>
        </div>
      )}

      {step === 1 && (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-premium-lg hover:shadow-premium-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden rounded-2xl">
          <CardHeader className="pb-6 border-b border-border/50 bg-background/40">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              Target Role Details
            </CardTitle>
            <CardDescription className="text-sm mt-1">Tell us what job you are applying for to tailor the content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="role" className="text-sm font-semibold flex items-center gap-2 text-foreground/90">
                  <Briefcase className="h-4 w-4 text-primary/70" /> Target Job Title <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="role" 
                  placeholder="e.g. Frontend Engineer" 
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="focus-visible:ring-primary/50 transition-all bg-background/50 h-12 rounded-xl border-border/60"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="company" className="text-sm font-semibold flex items-center gap-2 text-foreground/90">
                  <Building2 className="h-4 w-4 text-primary/70" /> Target Company <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input 
                  id="company" 
                  placeholder="e.g. Google, Brain Station 23" 
                  value={formData.targetCompany}
                  onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
                  className="focus-visible:ring-primary/50 transition-all bg-background/50 h-12 rounded-xl border-border/60"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="skills" className="text-sm font-semibold flex items-center gap-2 text-foreground/90">
                <Target className="h-4 w-4 text-primary/70" /> Skills (comma separated) <span className="text-destructive">*</span>
              </Label>
              <Input 
                id="skills" 
                placeholder="e.g. React, TypeScript, Tailwind CSS, Next.js" 
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="focus-visible:ring-primary/50 transition-all bg-background/50 h-12 rounded-xl border-border/60"
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="keywords" className="text-sm font-semibold flex items-center gap-2 text-foreground/90">
                <KeyRound className="h-4 w-4 text-primary/70" /> Keywords to Highlight <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input 
                id="keywords" 
                placeholder="e.g. performance optimization, state management, UI architecture" 
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className="focus-visible:ring-primary/50 transition-all bg-background/50 h-12 rounded-xl border-border/60"
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="jd" className="text-sm font-semibold text-foreground/90">Job Description <span className="text-muted-foreground font-normal">(Optional but recommended)</span></Label>
              <Textarea 
                id="jd" 
                placeholder="Paste the job description here for maximum ATS optimization..." 
                className="min-h-[120px] resize-y focus-visible:ring-primary/50 transition-all bg-background/50 rounded-xl border-border/60 p-4 leading-relaxed"
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border/50 pt-6 bg-background/30 rounded-b-2xl">
            <Button 
              onClick={() => setStep(2)} 
              disabled={!formData.targetRole.trim() || !formData.skills.trim()}
              className="gap-2 h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all active:scale-[0.98] shadow-md"
            >
              Next Step <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-premium-lg hover:shadow-premium-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none z-0"></div>
          <CardHeader className="pb-6 border-b border-border/50 bg-background/40 relative z-10">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BrainCircuit className="h-5 w-5 text-primary" />
              </div>
              AI Generation Settings
            </CardTitle>
            <CardDescription className="text-sm mt-1">Configure how Gemini AI should write your resume.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5">
                <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                  <Briefcase className="h-4 w-4 text-primary/70" /> Experience Level
                </Label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-sm shadow-sm transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer backdrop-blur"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                >
                  <option>Entry-Level (0-2 years)</option>
                  <option>Mid-Level (3-5 years)</option>
                  <option>Senior-Level (6+ years)</option>
                  <option>Executive</option>
                </select>
              </div>

              <div className="space-y-2.5">
                <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                  <Target className="h-4 w-4 text-primary/70" /> Focus Area
                </Label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-sm shadow-sm transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer backdrop-blur"
                  value={formData.focusArea}
                  onChange={(e) => setFormData({ ...formData, focusArea: e.target.value })}
                >
                  <option>Leadership & Management</option>
                  <option>Technical Depth</option>
                  <option>Product & Delivery</option>
                  <option>General / Balanced</option>
                </select>
              </div>

              <div className="space-y-2.5">
                <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                  <MessageSquare className="h-4 w-4 text-primary/70" /> Writing Tone
                </Label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-sm shadow-sm transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer backdrop-blur"
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                >
                  <option>Professional & Direct</option>
                  <option>Enthusiastic & Driven</option>
                  <option>Analytical & Data-Focused</option>
                  <option>Creative & Modern</option>
                </select>
              </div>

              <div className="space-y-2.5">
                <Label className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                  <AlignLeft className="h-4 w-4 text-primary/70" /> Output Format
                </Label>
                <select 
                  className="flex h-12 w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2 text-sm shadow-sm transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer backdrop-blur"
                  value={formData.outputFormat}
                  onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
                >
                  <option>Bullet-Heavy (Best for ATS)</option>
                  <option>Paragraph-Heavy (Storytelling)</option>
                  <option>Balanced Hybrid</option>
                </select>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-xl p-5 border border-primary/20 flex gap-4 mt-8 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-primary shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="font-semibold text-primary mb-1">Gemini AI Processing</h4>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Our AI will analyze your profile, extract key achievements, and rewrite them into high-impact, quantifiable bullet points tailored perfectly to your selected settings.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border/50 pt-6 bg-background/30 rounded-b-2xl relative z-10">
            <Button variant="outline" onClick={() => setStep(1)} className="h-11 px-6 rounded-xl hover:bg-background transition-all">Back</Button>
            <Button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="gap-2 h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all active:scale-[0.98] shadow-md"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate Resume</>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && generated && generatedData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 p-5 rounded-xl flex items-center gap-4 shadow-sm backdrop-blur-sm">
            <CheckCircle2 className="h-7 w-7 text-green-500 shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">Resume Generated Successfully!</h3>
              <p className="text-sm opacity-90">Your AI-optimized resume is ready for review.</p>
            </div>
          </div>

          <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-premium-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-background/40 pb-4 border-b border-border/50">
              <CardTitle className="text-lg">Professional Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-foreground/80 leading-relaxed text-sm md:text-base">{generatedData.professionalSummary}</p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-premium-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-background/40 pb-4 border-b border-border/50">
              <CardTitle className="text-lg">Optimized Skills</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2.5">
                {generatedData.optimizedSkills.map((skill) => (
                  <span key={skill} className="px-3.5 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold border border-primary/20 shadow-sm transition-colors hover:bg-primary/20">
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {generatedData.optimizedExperience.length > 0 && (
            <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-premium-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-background/40 pb-4 border-b border-border/50">
                <CardTitle className="text-lg">Optimized Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                {generatedData.optimizedExperience.map((exp, i) => (
                  <div key={i} className="border-l-2 border-primary/40 pl-6 relative before:absolute before:w-3.5 before:h-3.5 before:bg-primary before:rounded-full before:-left-[9px] before:top-1.5 before:ring-4 before:ring-background">
                    <h4 className="font-semibold text-lg">
                      {exp.role} <span className="text-muted-foreground font-normal">at {exp.company}</span>
                    </h4>
                    <p className="text-sm md:text-base text-foreground/80 mt-3 whitespace-pre-line leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <Button 
              className="h-14 text-sm font-medium gap-2 rounded-xl bg-background/50 border border-border/60 hover:bg-muted/50 transition-all backdrop-blur" 
              variant="outline" 
              onClick={() => { setStep(1); setGenerated(false); setGeneratedData(null); }}
            >
              <Edit className="h-4 w-4" />
              Generate Another
            </Button>
            <Button 
              className="h-14 text-sm font-medium gap-2 rounded-xl bg-background/50 border border-border/60 hover:bg-muted/50 transition-all backdrop-blur" 
              variant="outline" 
              onClick={() => api.downloadResumePdf(generatedData, 'AI_Resume.pdf')}
            >
              <Download className="h-4 w-4" />
              Export to PDF
            </Button>
            <Button 
              className="h-14 text-sm font-medium gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-[0.98] shadow-md" 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save to Dashboard"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}