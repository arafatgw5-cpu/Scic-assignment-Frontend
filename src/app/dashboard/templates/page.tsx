"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LayoutTemplate,
  Search,
  Filter,
  Eye,
  Check,
  Star,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

// ---------------------------------------------------------------------------
// Data — unchanged fields, plus a `layout` tag used only to pick which mini
// resume mockup shape to render (single column / sidebar / two column).
// ---------------------------------------------------------------------------

const templates = [
  {
    id: 1,
    name: "Modern Minimalist",
    category: "Tech",
    description:
      "Clean single-column layout with bold section headers and generous whitespace. Best for software engineers.",
    popular: true,
    users: "12.4k",
    rating: 4.9,
    atsScore: 96,
    colors: ["#3B82F6", "#1E40AF", "#EFF6FF"],
    layout: "single",
    preview: {
      name: "John Doe",
      title: "Full Stack Developer",
      sections: ["Summary", "Experience", "Projects", "Skills", "Education"],
    },
  },
  {
    id: 2,
    name: "Executive Pro",
    category: "Management",
    description:
      "Two-column professional format with sidebar for skills. Perfect for senior leadership and C-suite roles.",
    popular: false,
    users: "8.2k",
    rating: 4.7,
    atsScore: 92,
    colors: ["#374151", "#111827", "#F3F4F6"],
    layout: "sidebar-left",
    preview: {
      name: "Jane Smith",
      title: "VP of Engineering",
      sections: ["Summary", "Leadership", "Achievements", "Education", "Skills"],
    },
  },
  {
    id: 3,
    name: "Creative Bold",
    category: "Design",
    description:
      "Eye-catching layout with color accent sidebar and portfolio section. Ideal for designers and creatives.",
    popular: true,
    users: "9.8k",
    rating: 4.8,
    atsScore: 88,
    colors: ["#7C3AED", "#4C1D95", "#F5F3FF"],
    layout: "sidebar-right",
    preview: {
      name: "Alex Rivera",
      title: "Senior UX Designer",
      sections: ["About", "Portfolio", "Experience", "Skills", "Awards"],
    },
  },
  {
    id: 4,
    name: "Data Focused",
    category: "Data Science",
    description:
      "Metrics-driven layout with charts integration and publications section. Built for data professionals.",
    popular: false,
    users: "6.1k",
    rating: 4.6,
    atsScore: 94,
    colors: ["#059669", "#064E3B", "#ECFDF5"],
    layout: "two-col",
    preview: {
      name: "Priya Patel",
      title: "ML Engineer",
      sections: ["Summary", "Technical Skills", "Research", "Experience", "Education"],
    },
  },
  {
    id: 5,
    name: "Classic ATS",
    category: "General",
    description:
      "Traditional single-column format with maximum ATS compatibility. The safest choice for any industry.",
    popular: true,
    users: "18.7k",
    rating: 4.9,
    atsScore: 99,
    colors: ["#000000", "#374151", "#FFFFFF"],
    layout: "single",
    preview: {
      name: "Michael Brown",
      title: "Project Manager",
      sections: ["Objective", "Experience", "Education", "Skills", "Certifications"],
    },
  },
  {
    id: 6,
    name: "Startup Vibe",
    category: "Tech",
    description:
      "Modern, energetic layout with icon-based skills section. Great for startups and growth-stage companies.",
    popular: false,
    users: "5.3k",
    rating: 4.5,
    atsScore: 91,
    colors: ["#F97316", "#C2410C", "#FFF7ED"],
    layout: "two-col",
    preview: {
      name: "Sarah Lee",
      title: "Growth Engineer",
      sections: ["Summary", "Impact", "Tech Stack", "Experience", "Education"],
    },
  },
  {
    id: 7,
    name: "Academic Scholar",
    category: "General",
    description:
      "CV-style layout with publications, research, and teaching sections. Designed for academia and research roles.",
    popular: false,
    users: "4.1k",
    rating: 4.4,
    atsScore: 93,
    colors: ["#0F172A", "#334155", "#F8FAFC"],
    layout: "single",
    preview: {
      name: "Dr. Emily Chen",
      title: "Research Scientist",
      sections: ["Research", "Publications", "Teaching", "Grants", "Education"],
    },
  },
  {
    id: 8,
    name: "Healthcare Pro",
    category: "General",
    description:
      "Structured format with license/certification highlights. Tailored for doctors, nurses, and healthcare workers.",
    popular: false,
    users: "3.6k",
    rating: 4.6,
    atsScore: 95,
    colors: ["#0EA5E9", "#0369A1", "#F0F9FF"],
    layout: "single",
    preview: {
      name: "Dr. James Wilson",
      title: "Emergency Physician",
      sections: ["Summary", "Certifications", "Clinical Experience", "Education", "Skills"],
    },
  },
  {
    id: 9,
    name: "Marketing Maven",
    category: "Marketing",
    description:
      "Results-oriented layout with campaign metrics and brand portfolio section. Built for marketers and brand strategists.",
    popular: true,
    users: "7.9k",
    rating: 4.7,
    atsScore: 90,
    colors: ["#EC4899", "#9D174D", "#FDF2F8"],
    layout: "two-col",
    preview: {
      name: "Lisa Johnson",
      title: "Marketing Director",
      sections: ["Summary", "Campaigns", "Analytics", "Experience", "Skills"],
    },
  },
];

const categories = ["All", "Tech", "Management", "Design", "Data Science", "General", "Marketing"];

// ---------------------------------------------------------------------------
// Motion variants
// ---------------------------------------------------------------------------

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
};

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

/** Animated circular ATS score ring — the page's signature element. */
function AtsRing({ score, color }: { score: number; color: string }) {
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={radius}
          strokeWidth="4"
          fill="none"
          className="stroke-muted-foreground/15"
        />
        <motion.circle
          cx="22"
          cy="22"
          r={radius}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          stroke={color}
          style={{ pathLength: 0, strokeDasharray: circumference }}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: score / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold tabular-nums text-foreground">{score}</span>
      </div>
    </div>
  );
}

/** Wraps a card with a subtle pointer-driven 3D tilt. */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-120, 120], [5, -5]), {
    stiffness: 260,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [-120, 120], [-5, 5]), {
    stiffness: 260,
    damping: 22,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -6 }}
      style={{ rotateX, rotateY, transformPerspective: 1200 }}
      className="h-full [transform-style:preserve-3d]"
    >
      {children}
    </motion.div>
  );
}

/** Renders a distinct mini resume mockup shape depending on template.layout. */
function MiniResume({ template }: { template: (typeof templates)[number] }) {
  const [c0, c1] = template.colors;
  const lineBlock = (w: number, opacity = 1) => (
    <div
      className="h-1 rounded-full bg-gray-200"
      style={{ width: `${w}%`, opacity }}
    />
  );

  const headerBlock = (
    <div className="mb-3 pb-2 border-b" style={{ borderColor: c0 + "30" }}>
      <div className="h-2.5 w-24 rounded-full mb-1.5" style={{ background: c0 }} />
      <div className="h-1.5 w-16 rounded-full" style={{ background: c1 + "60" }} />
    </div>
  );

  const sectionStack = (count: number) => (
    <div className="space-y-2 flex-1">
      {template.preview.sections.slice(0, count).map((section, i) => (
        <div key={section}>
          <div
            className="h-1.5 rounded-full mb-1"
            style={{ width: `${40 + (i * 7) % 30}%`, background: c0 + "40" }}
          />
          {lineBlock(75 + ((i * 11) % 25))}
          <div className="mt-0.5">{lineBlock(55 + ((i * 13) % 35), 0.6)}</div>
        </div>
      ))}
    </div>
  );

  if (template.layout === "sidebar-left" || template.layout === "sidebar-right") {
    const sidebar = (
      <div
        className="w-[34%] rounded-md p-2 flex flex-col gap-2"
        style={{ background: c0 + "15" }}
      >
        <div className="h-6 w-6 rounded-full" style={{ background: c0 }} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1.5 rounded-full" style={{ width: `${60 - i * 10}%`, background: c0 + "50" }} />
        ))}
      </div>
    );
    const main = (
      <div className="flex-1 flex flex-col">
        <div className="h-2 w-20 rounded-full mb-1" style={{ background: c0 }} />
        <div className="h-1.5 w-14 rounded-full mb-2" style={{ background: c1 + "50" }} />
        {sectionStack(3)}
      </div>
    );
    return (
      <div className="flex gap-2 h-full">
        {template.layout === "sidebar-left" ? (
          <>
            {sidebar}
            {main}
          </>
        ) : (
          <>
            {main}
            {sidebar}
          </>
        )}
      </div>
    );
  }

  if (template.layout === "two-col") {
    return (
      <div className="h-full flex flex-col">
        {headerBlock}
        <div className="grid grid-cols-2 gap-2 flex-1">
          <div className="space-y-1.5">{sectionStack(3)}</div>
          <div className="space-y-1.5 flex flex-col justify-start">
            {[70, 45, 85].map((v, i) => (
              <div key={i} className="h-2 rounded-full" style={{ width: `${v}%`, background: c0 + "35" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // single column (default)
  return (
    <div className="h-full flex flex-col">
      {headerBlock}
      {sectionStack(template.preview.sections.length)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [previewId, setPreviewId] = useState<number | null>(null);

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const previewTemplate = previewId !== null ? templates.find((t) => t.id === previewId) : null;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-primary/80 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            {templates.length} templates · ATS-optimized
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <LayoutTemplate className="h-5 w-5 text-primary" />
            </span>
            Resume Templates
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg">
            Pick a starting point that already looks like the job you want next.
          </p>
        </div>
        <Link href="/dashboard/resumes/create">
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
            <Sparkles className="h-4 w-4" /> Build from Scratch
          </Button>
        </Link>
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="flex flex-col lg:flex-row gap-3 lg:gap-4 justify-between lg:items-center rounded-2xl border bg-card/60 backdrop-blur-xl p-3 shadow-sm"
      >
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-10 h-10 bg-background/70 rounded-xl border-border/60 focus-visible:ring-2 focus-visible:ring-primary/40 transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto scrollbar-hide">
          <Filter className="h-4 w-4 text-muted-foreground mr-1 shrink-0" />
          <div className="relative flex items-center gap-1 rounded-full bg-muted/50 p-1">
            {categories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="category-pill"
                      className="absolute inset-0 rounded-full bg-primary -z-10"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Template Grid */}
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredTemplates.map((template) => (
          <motion.div key={template.id} variants={cardVariants} className="h-full">
            <TiltCard>
              <div
                className="relative h-full rounded-2xl p-px overflow-hidden group"
                style={{
                  backgroundImage: `linear-gradient(140deg, ${template.colors[0]}55, transparent 45%, ${template.colors[0]}25)`,
                }}
              >
                <div className="relative h-full flex flex-col rounded-[15px] bg-card overflow-hidden border border-border/50">
                  {/* Mini Resume Preview */}
                  <div
                    className="h-56 w-full relative overflow-hidden"
                    style={{ background: template.colors[2] }}
                  >
                    <motion.div
                      className="absolute inset-4 bg-white rounded-lg shadow-lg p-4"
                      style={{ transform: "translateZ(30px)" }}
                    >
                      <MiniResume template={template} />
                    </motion.div>

                    {template.popular && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-md gap-1">
                          <Star className="h-3 w-3 fill-current" /> Popular
                        </Badge>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-2 shadow-md"
                        onClick={() => setPreviewId(template.id)}
                      >
                        <Eye className="h-4 w-4" /> Preview
                      </Button>
                      <Button
                        size="sm"
                        className="gap-2 shadow-md"
                        onClick={() => setPreviewId(template.id)}
                      >
                        <Check className="h-4 w-4" /> Use Template
                      </Button>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-5 pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-lg font-semibold leading-tight">{template.name}</h3>
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {template.category}
                        </Badge>
                      </div>
                      <AtsRing score={template.atsScore} color={template.colors[0]} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Stats footer */}
                  <div className="mt-auto px-5 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> {template.users}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-medium">
                      <Star className="h-3.5 w-3.5 fill-current" /> {template.rating}
                    </span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/10"
          >
            <LayoutTemplate className="h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No templates found</h3>
            <p className="text-sm">Try adjusting your search or filters.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setPreviewId(null)}
          >
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="bg-background rounded-2xl shadow-2xl border border-border/60 max-w-3xl w-full max-h-[88vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview Header */}
              <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur z-10 rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold">{previewTemplate.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {previewTemplate.category} · ATS score {previewTemplate.atsScore}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/dashboard/resumes/create">
                    <Button className="gap-2 shadow-md shadow-primary/20">
                      <Check className="h-4 w-4" /> Use This Template
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setPreviewId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Simulated A4 Resume */}
              <div className="p-8 flex justify-center bg-muted/10">
                <div
                  className="bg-white border rounded-xl shadow-2xl p-8 space-y-6 text-gray-800 w-full max-w-md aspect-[210/297] overflow-y-auto"
                >
                  <div
                    className="text-center pb-4 border-b-2"
                    style={{ borderColor: previewTemplate.colors[0] }}
                  >
                    <h1 className="text-2xl font-bold" style={{ color: previewTemplate.colors[0] }}>
                      {previewTemplate.preview.name}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">{previewTemplate.preview.title}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      email@example.com · (555) 123-4567 · San Francisco, CA
                    </p>
                  </div>

                  {previewTemplate.preview.sections.map((section) => (
                    <div key={section}>
                      <h3
                        className="text-sm font-bold uppercase tracking-wider mb-2 pb-1 border-b"
                        style={{
                          color: previewTemplate.colors[0],
                          borderColor: previewTemplate.colors[0] + "30",
                        }}
                      >
                        {section}
                      </h3>
                      <div className="space-y-1.5">
                        <div className="h-2.5 bg-gray-200 rounded w-full" />
                        <div className="h-2.5 bg-gray-100 rounded w-[90%]" />
                        <div className="h-2.5 bg-gray-100 rounded w-[75%]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Footer */}
              <div className="p-6 border-t bg-muted/20 rounded-b-2xl">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {previewTemplate.users} professionals use this
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> {previewTemplate.rating} rating
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {previewTemplate.colors.map((c, i) => (
                      <div
                        key={i}
                        className="h-5 w-5 rounded-full border shadow-sm"
                        style={{ background: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}