"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutTemplate,
  Search,
  Eye,
  Check,
  Star,
  Sparkles,
  Users,
  Download,
  Flame,
  ShieldCheck,
  ArrowUpRight,
  X,
  ZoomIn,
  ZoomOut,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";

/* -------------------------------------------------------------------------- */
/*  Data — unchanged from the original implementation                         */
/* -------------------------------------------------------------------------- */

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
    reviews: 1842,
    downloads: "31k",
    atsScore: 96,
    colors: ["#3B82F6", "#1E40AF", "#EFF6FF"],
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
    reviews: 963,
    downloads: "17k",
    atsScore: 92,
    colors: ["#374151", "#111827", "#F3F4F6"],
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
    reviews: 1290,
    downloads: "22k",
    atsScore: 88,
    colors: ["#7C3AED", "#4C1D95", "#F5F3FF"],
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
    reviews: 704,
    downloads: "13k",
    atsScore: 94,
    colors: ["#059669", "#064E3B", "#ECFDF5"],
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
    reviews: 2530,
    downloads: "48k",
    atsScore: 99,
    colors: ["#111111", "#374151", "#FFFFFF"],
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
    reviews: 511,
    downloads: "9.8k",
    atsScore: 91,
    colors: ["#F97316", "#C2410C", "#FFF7ED"],
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
    reviews: 388,
    downloads: "6.4k",
    atsScore: 93,
    colors: ["#0F172A", "#334155", "#F8FAFC"],
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
    reviews: 297,
    downloads: "5.1k",
    atsScore: 95,
    colors: ["#0EA5E9", "#0369A1", "#F0F9FF"],
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
    reviews: 845,
    downloads: "15k",
    atsScore: 90,
    colors: ["#EC4899", "#9D174D", "#FDF2F8"],
    preview: {
      name: "Lisa Johnson",
      title: "Marketing Director",
      sections: ["Summary", "Campaigns", "Analytics", "Experience", "Skills"],
    },
  },
];

const categories = ["All", "Tech", "Management", "Design", "Data Science", "General", "Marketing"];

type Template = (typeof templates)[number];

/* -------------------------------------------------------------------------- */
/*  Small presentational primitives                                           */
/* -------------------------------------------------------------------------- */

/** Circular, animated ATS ring — replaces the flat "ATS 96%" badge. */
function AtsRing({ score, accent, size = 46 }: { score: number; accent: string; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c - (score / 100) * c }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ filter: `drop-shadow(0 0 4px ${accent}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-[10px] font-semibold tracking-tight text-[#F1EFEA]">{score}</span>
      </div>
    </div>
  );
}

/** A tiny "stat pill" — the mini dashboard widget replacing plain text stats. */
function StatPill({
  icon: Icon,
  label,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  accent: string;
}) {
  return (
    <div
      className="group/pill flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 transition-colors duration-300 hover:border-white/[0.14] hover:bg-white/[0.06]"
    >
      <Icon className="h-3 w-3 shrink-0" style={{ color: accent }} strokeWidth={2.25} />
      <span className="whitespace-nowrap font-mono text-[10.5px] font-medium text-[#B9B6AD]">{label}</span>
    </div>
  );
}

/**
 * A real miniature resume, laid out differently per template so no two cards
 * look identical — this replaces the original gray-line placeholder.
 */
function ResumePreviewMini({ template }: { template: Template }) {
  const [accent, accentDark, tint] = template.colors;
  const layout = template.id % 3; // 0: sidebar · 1: split-header · 2: single column

  const Bar = ({ w, tone = "light" }: { w: string; tone?: "light" | "mid" | "dark" }) => (
    <div
      className="h-[3px] rounded-full"
      style={{
        width: w,
        background:
          tone === "dark" ? accent : tone === "mid" ? `${accentDark}66` : "rgba(17,17,17,0.12)",
      }}
    />
  );

  if (layout === 0) {
    // Sidebar layout
    return (
      <div className="flex h-full w-full overflow-hidden rounded-[10px] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="flex w-[34%] flex-col gap-2.5 px-3 py-4" style={{ background: accentDark }}>
          <div className="h-6 w-6 rounded-full" style={{ background: `${tint}` }} />
          <div className="mt-1 space-y-1">
            <div className="h-[5px] w-[70%] rounded-full bg-white/80" />
            <div className="h-[3px] w-[55%] rounded-full bg-white/40" />
          </div>
          {["Skills", "Contact"].map((s) => (
            <div key={s} className="mt-2 space-y-1">
              <div className="h-[3px] w-[40%] rounded-full bg-white/60" />
              <div className="h-[3px] w-[85%] rounded-full bg-white/25" />
              <div className="h-[3px] w-[65%] rounded-full bg-white/25" />
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-2.5 px-3 py-4">
          {template.preview.sections.slice(0, 3).map((s, i) => (
            <div key={s} className="space-y-1">
              <Bar w="34%" tone="dark" />
              <Bar w={`${88 - i * 6}%`} />
              <Bar w={`${62 + i * 5}%`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === 1) {
    // Split header layout
    return (
      <div className="h-full w-full overflow-hidden rounded-[10px] bg-white p-3.5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${accent}30` }}>
          <div className="space-y-1">
            <div className="h-[6px] w-16 rounded-full" style={{ background: accent }} />
            <div className="h-[3px] w-11 rounded-full bg-black/15" />
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-3.5 w-3.5 rounded-full" style={{ background: `${accent}${25 + i * 15}` }} />
            ))}
          </div>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {template.preview.sections.slice(0, 4).map((s, i) => (
            <div key={s} className="space-y-1">
              <Bar w="60%" tone="mid" />
              <Bar w="90%" />
              <Bar w="70%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Single column layout
  return (
    <div className="h-full w-full overflow-hidden rounded-[10px] bg-white p-3.5 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div className="text-center">
        <div className="mx-auto h-[7px] w-20 rounded-full" style={{ background: accent }} />
        <div className="mx-auto mt-1.5 h-[3px] w-14 rounded-full bg-black/15" />
      </div>
      <div className="mt-3 space-y-2">
        {template.preview.sections.map((s, i) => (
          <div key={s} className="space-y-1">
            <Bar w="30%" tone="dark" />
            <Bar w={`${85 - ((i * 9) % 30)}%`} />
            <Bar w={`${55 + ((i * 13) % 35)}%`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Template card — cursor-tracked glow + tilt, glass surface                 */
/* -------------------------------------------------------------------------- */

function TemplateCard({
  template,
  index,
  onPreview,
}: {
  template: Template;
  index: number;
  onPreview: (id: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rX = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 });
  const rY = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mx.set(px * 100);
    my.set(py * 100);
    rY.set((px - 0.5) * 10);
    rX.set((0.5 - py) * 8);
  }

  function handleMouseLeave() {
    rX.set(0);
    rY.set(0);
  }

  const glow = useMotionTemplate`radial-gradient(300px circle at ${mx}% ${my}%, ${template.colors[0]}22, transparent 70%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 9) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1000 }}
      className="group relative"
    >
      <motion.div
        style={{ rotateX: rX, rotateY: rY, transformStyle: "preserve-3d" }}
        whileHover={{ y: -6, scale: 1.012 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="relative flex h-full flex-col overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#12131A]/80 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_20px_40px_-24px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        {/* animated gradient border on hover */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            padding: 1,
            background: `linear-gradient(135deg, ${template.colors[0]}, transparent 40%, transparent 60%, ${template.colors[0]})`,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        {/* cursor spotlight */}
        <motion.div className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glow }} />

        {/* Popular badge */}
        {template.popular && (
          <div className="absolute right-3 top-3 z-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex items-center gap-1 overflow-hidden rounded-full border border-[#E8B04B]/40 bg-gradient-to-b from-[#F3C567] to-[#C9922B] px-2.5 py-1 shadow-[0_2px_10px_rgba(232,176,75,0.35)]"
            >
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover:animate-[shine_1.4s_ease]"
              />
              <Sparkles className="h-3 w-3 text-[#3A2703]" />
              <span className="text-[10px] font-bold tracking-wide text-[#3A2703]">POPULAR</span>
            </motion.div>
          </div>
        )}

        {/* Preview zone */}
        <div className="relative z-[2] h-52 w-full overflow-hidden border-b border-white/[0.06] p-4" style={{ background: `radial-gradient(120% 100% at 50% 0%, ${template.colors[0]}1c, #0D0E13 70%)` }}>
          {/* noise texture */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
          <motion.div
            className="relative z-[3] h-full w-full"
            whileHover={{ scale: 1.035 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <ResumePreviewMini template={template} />
          </motion.div>

          {/* Hover overlay actions */}
          <div className="absolute inset-0 z-[4] flex items-center justify-center gap-2.5 bg-[#0A0B0F]/0 opacity-0 backdrop-blur-0 transition-all duration-300 group-hover:bg-[#0A0B0F]/70 group-hover:opacity-100 group-hover:backdrop-blur-[2px]">
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onPreview(template.id)}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </motion.button>
            <Link href="/dashboard/resumes/create">
              <motion.span
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#0A0B0F] shadow-lg"
                style={{ background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[0]}CC)` }}
              >
                <Check className="h-3.5 w-3.5" /> Use template
              </motion.span>
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="relative z-[2] flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold leading-tight text-[#F1EFEA]">{template.name}</h3>
              <div className="mt-1 flex items-center gap-1 text-[11.5px] text-[#8C8A83]">
                <span className="inline-flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-2.5 w-2.5"
                      style={{
                        fill: i < Math.round(template.rating) ? "#E8B04B" : "transparent",
                        color: i < Math.round(template.rating) ? "#E8B04B" : "#4A4941",
                      }}
                    />
                  ))}
                </span>
                <span className="font-mono text-[10.5px] text-[#B9B6AD]">{template.rating}</span>
                <span className="text-[#5C5A52]">· {template.reviews.toLocaleString()} reviews</span>
              </div>
            </div>
            <AtsRing score={template.atsScore} accent={template.colors[0]} />
          </div>

          <p className="line-clamp-2 text-[12.5px] leading-relaxed text-[#9C9A92]">{template.description}</p>

          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
            <StatPill icon={Users} label={`${template.users} users`} accent={template.colors[0]} />
            <StatPill icon={Download} label={`${template.downloads} downloads`} accent={template.colors[0]} />
            {template.popular && <StatPill icon={Flame} label="Trending" accent="#E8B04B" />}
            <span className="ml-auto rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-[#8C8A83]">
              {template.category}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Preview modal                                                              */
/* -------------------------------------------------------------------------- */

function PreviewModal({ template, onClose }: { template: Template; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);
  const [accent, accentDark] = template.colors;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#05060A]/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#12131A]/95 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] p-5">
          <div>
            <h2 className="text-lg font-semibold text-[#F1EFEA]">{template.name}</h2>
            <p className="mt-0.5 flex items-center gap-2 text-xs text-[#8C8A83]">
              <span>{template.category}</span>
              <span className="text-[#4A4941]">·</span>
              <span className="inline-flex items-center gap-1 font-mono">
                <ShieldCheck className="h-3.5 w-3.5" style={{ color: accent }} /> ATS {template.atsScore}%
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="mr-1 flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
              <button
                onClick={() => setZoom((z) => Math.max(0.7, +(z - 0.1).toFixed(2)))}
                className="rounded-full p-1.5 text-[#B9B6AD] transition-colors hover:bg-white/10"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="w-9 text-center font-mono text-[10.5px] text-[#8C8A83]">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(1.3, +(z + 0.1).toFixed(2)))}
                className="rounded-full p-1.5 text-[#B9B6AD] transition-colors hover:bg-white/10"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
            <Link href="/dashboard/resumes/create">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-[#0A0B0F]"
                style={{ background: `linear-gradient(135deg, ${accent}, ${accent}CC)` }}
              >
                <Check className="h-3.5 w-3.5" /> Use this template
              </motion.span>
            </Link>
            <button onClick={onClose} className="rounded-full border border-white/[0.08] p-2 text-[#8C8A83] transition-colors hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Paper */}
        <div className="flex-1 overflow-auto bg-[#0A0B0F] p-8" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "22px 22px" }}>
          <motion.div
            animate={{ scale: zoom }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="mx-auto w-full max-w-lg origin-top rounded-[4px] bg-white p-9 text-gray-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
          >
            <div className="border-b-2 pb-4 text-center" style={{ borderColor: accent }}>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: accentDark }}>
                {template.preview.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <h1 className="text-xl font-bold" style={{ color: accent }}>
                {template.preview.name}
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">{template.preview.title}</p>
              <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-gray-400">
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> email@example.com</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> (555) 123-4567</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> San Francisco, CA</span>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              {template.preview.sections.map((section) => (
                <div key={section}>
                  <h3
                    className="mb-2 border-b pb-1 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: accent, borderColor: `${accent}30` }}
                  >
                    {section}
                  </h3>
                  <div className="space-y-1.5">
                    <div className="h-2 w-full rounded bg-gray-200" />
                    <div className="h-2 w-[88%] rounded bg-gray-100" />
                    <div className="h-2 w-[70%] rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-4 text-xs text-[#8C8A83]">
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {template.users} professionals use this</span>
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-[#E8B04B] text-[#E8B04B]" /> {template.rating} rating</span>
          </div>
          <div className="flex gap-1.5">
            {template.colors.map((c, i) => (
              <div key={i} className="h-4 w-4 rounded-full border border-white/20 shadow-sm" style={{ background: c }} title={c} />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);

  const filteredTemplates = useMemo(
    () =>
      templates.filter((t) => {
        const matchesSearch =
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === "All" || t.category === activeCategory;
        return matchesSearch && matchesCategory;
      }),
    [search, activeCategory]
  );

  const previewTemplate = previewId !== null ? templates.find((t) => t.id === previewId) ?? null : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0B0F] p-6 md:p-8">
      {/* Ambient mesh background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#8B7FFF]/[0.10] blur-[120px]" />
        <div className="absolute -right-32 top-40 h-[420px] w-[420px] rounded-full bg-[#E8B04B]/[0.08] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
        >
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-[10.5px] tracking-wide text-[#B9B6AD]">
              <LayoutTemplate className="h-3 w-3 text-[#E8B04B]" />
              {templates.length} TEMPLATES · ATS-VERIFIED
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#F1EFEA]">Resume templates</h1>
            <p className="mt-1 text-sm text-[#8C8A83]">
              Professionally designed layouts, tuned to pass applicant tracking systems.
            </p>
          </div>
          <Link href="/dashboard/resumes/create">
            <motion.span
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 rounded-full bg-[#F1EFEA] px-4 py-2.5 text-sm font-semibold text-[#0A0B0F] shadow-[0_8px_24px_-8px_rgba(241,239,234,0.35)]"
            >
              <Sparkles className="h-4 w-4" /> Build from scratch
            </motion.span>
          </Link>
        </motion.div>

        {/* Search & filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-between gap-4 rounded-[20px] border border-white/[0.08] bg-white/[0.02] p-3 backdrop-blur-xl sm:flex-row"
        >
          <div className="relative w-full sm:w-80">
            <div
              className="pointer-events-none absolute -inset-px rounded-full opacity-0 transition-opacity duration-300"
              style={{ opacity: focused ? 1 : 0, background: "linear-gradient(90deg, #E8B04B55, #8B7FFF55)" }}
            />
            <div className="relative flex items-center rounded-full border border-white/[0.08] bg-[#0D0E13] px-3.5 py-2">
              <Search className="h-4 w-4 shrink-0 text-[#6B6960]" />
              <input
                placeholder="Search templates…"
                className="w-full bg-transparent px-2.5 text-sm text-[#F1EFEA] placeholder:text-[#5C5A52] focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-[#6B6960] hover:text-[#B9B6AD]">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="scrollbar-hide flex w-full items-center gap-1.5 overflow-x-auto sm:w-auto">
            {categories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 ${
                    active ? "text-[#0A0B0F]" : "text-[#9C9A92] hover:text-[#F1EFEA]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="category-pill"
                      className="absolute inset-0 rounded-full bg-[#F1EFEA]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, i) => (
              <TemplateCard key={template.id} template={template} index={i} onPreview={setPreviewId} />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-white/[0.1] bg-white/[0.02] py-20 text-[#8C8A83]"
          >
            <LayoutTemplate className="mb-4 h-10 w-10 opacity-40" />
            <h3 className="text-base font-medium text-[#F1EFEA]">No templates found</h3>
            <p className="mt-1 text-sm">Try a different search term or category.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-full border-white/[0.1] bg-transparent text-[#F1EFEA] hover:bg-white/10"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
            >
              Clear filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Preview modal */}
      <AnimatePresence>
        {previewTemplate && <PreviewModal template={previewTemplate} onClose={() => setPreviewId(null)} />}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes shine {
          from {
            transform: translateX(-120%);
          }
          to {
            transform: translateX(220%);
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}