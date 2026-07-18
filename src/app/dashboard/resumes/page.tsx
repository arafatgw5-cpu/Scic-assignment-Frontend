"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, MoreVertical, Edit, Trash2, Download, Loader2, Copy } from "lucide-react";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await api.getResumes();
      setResumes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await api.deleteResume(id);
      setResumes(resumes.filter(r => r._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
          <p className="text-muted-foreground mt-1">Manage and optimize your AI-generated resumes.</p>
        </div>
        <Link href="/dashboard/resumes/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Resume
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Card */}
        <Link href="/dashboard/resumes/create">
          <Card className="h-full border-dashed flex flex-col items-center justify-center p-12 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer text-muted-foreground hover:text-primary">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">Build with AI</h3>
            <p className="text-sm text-center mt-2">Generate a targeted, ATS-optimized resume in seconds.</p>
          </Card>
        </Link>

        {/* Existing Resumes */}
        {resumes.map((resume) => (
          <Card key={resume._id} className="flex flex-col group relative overflow-hidden">
            {resume.isDefault && (
              <div className="absolute top-0 right-0">
                <div className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Default
                </div>
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(resume._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg line-clamp-1">{resume.targetRole || "Untitled Resume"}</CardTitle>
              <CardDescription>Target: {resume.targetRole}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium text-muted-foreground">ATS Match Score</span>
                <Badge variant={resume.atsScore >= 90 ? "default" : resume.atsScore >= 80 ? "secondary" : "outline"} className={resume.atsScore >= 90 ? "bg-green-500 hover:bg-green-600" : ""}>
                  {resume.atsScore || 0}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
            </CardContent>
            <CardFooter className="pt-0 flex gap-2 border-t px-6 py-4 bg-muted/20">
              <Button variant="outline" size="sm" className="flex-1 gap-2">
                <Edit className="h-4 w-4" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={async () => {
                try {
                  const data = {
                    title: `Copy of ${resume.title || resume.targetRole}`,
                    targetRole: resume.targetRole,
                    summary: resume.summary,
                    skills: resume.skills,
                    experience: resume.experience,
                    education: resume.education,
                    projects: resume.projects,
                    content: resume.content,
                  };
                  const newRes = await api.createResume(data);
                  setResumes([newRes, ...resumes]);
                } catch (e) {
                  console.error(e);
                }
              }}>
                <Copy className="h-4 w-4" /> Duplicate
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => api.downloadResumePdf(resume.content || resume, resume.targetRole ? `${resume.targetRole.replace(/\s+/g, '_')}_Resume.pdf` : 'Resume.pdf')}>
                <Download className="h-4 w-4" /> PDF
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
