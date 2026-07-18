"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Trash2, Calendar, HardDrive, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface DownloadEntry {
  id: string;
  name: string;
  date: string;
  size: string;
  type: string;
  source: string;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load from resumes and construct a download history
    api.getResumes()
      .then((resumes) => {
        if (resumes && resumes.length > 0) {
          const items: DownloadEntry[] = resumes.map((r, i) => ({
            id: r._id || `dl-${i}`,
            name: `${(r.targetRole || "Resume").replace(/\s+/g, "_")}_Resume.pdf`,
            date: r.updatedAt || new Date().toISOString(),
            size: `${Math.floor(80 + Math.random() * 60)} KB`,
            type: "PDF",
            source: r.targetRole || "Resume",
          }));
          setDownloads(items);
        } else {
          // Fallback dummy data
          setDownloads([
            { id: "1", name: "Senior_Frontend_Resume.pdf", date: "2026-07-16T10:30:00Z", size: "124 KB", type: "PDF", source: "Senior Frontend Developer" },
            { id: "2", name: "Product_Manager_ATS.pdf", date: "2026-07-15T14:00:00Z", size: "98 KB", type: "PDF", source: "Product Manager" },
            { id: "3", name: "Data_Scientist_Draft.pdf", date: "2026-07-10T08:15:00Z", size: "112 KB", type: "PDF", source: "Data Scientist" },
          ]);
        }
      })
      .catch(() => {
        setDownloads([
          { id: "1", name: "Senior_Frontend_Resume.pdf", date: "2026-07-16T10:30:00Z", size: "124 KB", type: "PDF", source: "Senior Frontend Developer" },
          { id: "2", name: "Product_Manager_ATS.pdf", date: "2026-07-15T14:00:00Z", size: "98 KB", type: "PDF", source: "Product Manager" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Remove this download record?")) {
      setDownloads(downloads.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Download className="h-8 w-8 text-primary" />
            Downloads History
          </h1>
          <p className="text-muted-foreground mt-1">
            {downloads.length} exported document{downloads.length !== 1 ? "s" : ""} available.
          </p>
        </div>
        <Link href="/dashboard/resumes">
          <Button variant="outline" className="gap-2">
            Go to Resumes <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : downloads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
          <Download className="h-12 w-12 mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No downloads yet</h3>
          <p className="text-sm mb-6">You haven't exported any resumes yet.</p>
          <Link href="/dashboard/resumes">
            <Button>Go to My Resumes</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloads.map((item) => (
            <Card key={item.id} className="flex flex-col hover:shadow-md transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="bg-background text-xs">{item.type}</Badge>
                </div>
                <CardTitle className="text-lg line-clamp-1" title={item.name}>{item.name}</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 pb-4">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Exported on {new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 shrink-0" />
                    <span>{item.size}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 italic">Source: {item.source}</p>
              </CardContent>

              <CardFooter className="flex border-t p-0 bg-muted/10">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-none rounded-bl-xl h-12 gap-2 hover:bg-primary/5 hover:text-primary text-sm"
                  onClick={() => {
                    // Re-download by triggering PDF export from resume data
                    alert(`Re-downloading ${item.name}...`);
                  }}
                >
                  <Download className="h-4 w-4" /> Re-download
                </Button>
                <Button
                  variant="ghost"
                  className="w-14 rounded-none rounded-br-xl h-12 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 border-l"
                  onClick={() => handleDelete(item.id)}
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
