"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Compass,
  Bookmark,
  MessageSquare,
  Settings,
  User,
  LogOut,
  BrainCircuit,
  Loader2,
  // LayoutTemplate,
  Download,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, LayoutGroup } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isPending) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sidebarLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/profile", label: "My Profile", icon: User },
    { href: "/dashboard/resumes", label: "Resume Builder", icon: FileText },
    { href: "/dashboard/analyzer", label: "Resume Analyzer", icon: BrainCircuit },
    { href: "/dashboard/recommendations", label: "Career Matches", icon: Compass },
    { href: "/dashboard/chat", label: "AI Career Chat", icon: MessageSquare },
    // { href: "/dashboard/templates", label: "Resume Templates", icon: LayoutTemplate },
    { href: "/dashboard/saved", label: "Saved Careers", icon: Bookmark },
    { href: "/dashboard/downloads", label: "Downloads", icon: Download },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 p-6">
        <motion.div
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-sm"
          animate={{
            boxShadow: [
              "0 0 0px hsl(var(--primary)/0)",
              "0 0 16px hsl(var(--primary)/0.35)",
              "0 0 0px hsl(var(--primary)/0)",
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm font-bold text-white">S</span>
        </motion.div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">Dashboard</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Manage your career</p>
        </div>
      </div>

      {/* Nav */}
      <LayoutGroup>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
          {sidebarLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ x: isActive ? 0 : 3 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-bg"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-xl border border-primary/20 bg-primary/10 shadow-[0_0_18px_hsl(var(--primary)/0.15)]"
                    />
                  )}
                  {isActive && (
                    <motion.span
                      layoutId="active-nav-bar"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary"
                    />
                  )}
                  <Button
                    variant="ghost"
                    className={`relative z-10 mb-1 h-10 w-full justify-start gap-3 rounded-xl bg-transparent transition-colors duration-200 hover:bg-transparent ${
                      isActive
                        ? "font-semibold text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                    <span className="truncate">{link.label}</span>
                  </Button>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </LayoutGroup>

      {/* Account card */}
      <div className="mt-auto shrink-0 border-t border-border/50 bg-muted/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-border/50 bg-background/60 px-3 py-2.5 shadow-sm backdrop-blur">
          <div className="relative h-9 w-9 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white shadow-sm">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/70" />
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium">{session?.user?.name || "User"}</p>
            <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 rounded-xl text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
          onClick={async () => {
            await signOut();
            window.location.href = "/login";
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-[4.5rem] z-40 rounded-xl border bg-background/80 shadow-sm backdrop-blur md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r bg-background/95 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 rounded-xl hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="sticky top-16 relative hidden h-[calc(100vh-4rem)] w-[280px] shrink-0 flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl md:flex">
        {/* gradient hairline on the edge for depth */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <MainArea>{children}</MainArea>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Main content ambience: subtle grid + noise + cursor spotlight.         */
/*  Presentational only — no functional impact.                            */
/* ---------------------------------------------------------------------- */
function MainArea({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 22 });
  const leftPct = useTransform(springX, (v) => `${v * 100}%`);
  const topPct = useTransform(springY, (v) => `${v * 100}%`);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  return (
    <main ref={containerRef} className="relative min-h-full flex-1 overflow-x-hidden">
      {/* Ambient gradient wash */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      {/* Faint grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)/0.35) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)/0.35) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(ellipse 70% 60% at 70% 0%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 70% 0%, black 40%, transparent 100%)",
        }}
      />

      {/* Noise texture */}
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.025] mix-blend-overlay">
        <filter id="dashNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#dashNoise)" />
      </svg>

      {/* Cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute -z-10 h-[36vw] w-[36vw] rounded-full bg-primary/[0.06] blur-[100px]"
        style={{
          left: leftPct,
          top: topPct,
          x: "-50%",
          y: "-50%",
        }}
      />

      {children}
    </main>
  );
}