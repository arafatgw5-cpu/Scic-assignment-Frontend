"use client";

import type { ReactNode } from "react";
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
  Rocket,
  // LayoutTemplate,
  Download,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  LayoutGroup,
  type Transition,
} from "framer-motion";

const SPRING: Transition = { type: "spring", stiffness: 380, damping: 32 };

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
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
      <div className="flex items-center gap-3 px-5 py-6">
        <motion.div
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_4px_16px_-2px_hsl(var(--primary)/0.5)]"
          animate={{
            boxShadow: [
              "0 4px 14px -2px hsl(var(--primary)/0.3)",
              "0 4px 22px -1px hsl(var(--primary)/0.55)",
              "0 4px 14px -2px hsl(var(--primary)/0.3)",
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Rocket className="h-4.5 w-4.5 text-white" strokeWidth={2.25} />
        </motion.div>
        <h2 className="text-[15px] font-bold tracking-tight text-foreground">
          SkillPilot <span className="text-primary">AI</span>
        </h2>
      </div>

      {/* Nav */}
      <LayoutGroup>
        <nav className="flex-1 space-y-3 overflow-y-auto px-4 pb-4 pt-1 scrollbar-hide">
          {sidebarLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link key={link.href} href={link.href} className="block">
                <motion.div
                  whileHover="hover"
                  whileTap={{ scale: 0.98 }}
                  initial="rest"
                  animate="rest"
                  variants={{
                    rest: { y: 0 },
                    hover: { y: isActive ? 0 : -1.5 },
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="group relative"
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-bg"
                      transition={SPRING}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent shadow-[0_4px_18px_-3px_hsl(var(--primary)/0.55)]"
                    />
                  )}
                  {!isActive && (
                    <motion.div
                      variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 rounded-xl bg-muted/60"
                    />
                  )}
                  <Button
                    variant="ghost"
                    className={`relative z-10 h-11 w-full justify-start gap-3 rounded-xl bg-transparent px-3.5 transition-colors duration-200 hover:bg-transparent focus-visible:bg-transparent ${
                      isActive
                        ? "font-semibold text-white hover:text-white"
                        : "text-muted-foreground hover:text-foreground focus-visible:text-foreground"
                    }`}
                  >
                    <motion.span
                      variants={{
                        rest: { x: 0, scale: 1, rotate: 0 },
                        hover: { x: isActive ? 0 : 2, scale: isActive ? 1 : 1.1, rotate: isActive ? 0 : -4 },
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="flex shrink-0 items-center"
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : ""}`}
                      />
                    </motion.span>
                    <span className="truncate text-[13.5px]">{link.label}</span>
                  </Button>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </LayoutGroup>

      {/* Logout — pushed to the absolute bottom */}
      <div className="mt-auto shrink-0 px-4 pb-5 pt-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 rounded-xl text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-[0.98]"
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
        className="fixed left-4 top-[4.5rem] z-40 rounded-full border border-border/60 bg-background/80 shadow-lg backdrop-blur-md transition-transform duration-200 hover:scale-105 hover:bg-background active:scale-95 md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar menu"
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
            className="fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[280px] flex-col border-r border-border/50 bg-background/95 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10 rounded-full hover:bg-muted"
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar menu"
            >
              <X className="h-5 w-5" />
            </Button>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="sticky top-16 relative hidden h-[calc(100vh-4rem)] w-[272px] shrink-0 flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl md:flex">
        {/* gradient hairline on the edge for depth */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/25 to-transparent" />
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
function MainArea({ children }: { children: ReactNode }) {
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
    <main
      ref={containerRef}
      className="relative min-h-full flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Ambient gradient wash */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      {/* Faint grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)/0.35) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)/0.35) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 70% 0%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 70% 0%, black 40%, transparent 100%)",
        }}
      />

      {/* Noise texture */}
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.025] mix-blend-overlay">
        <filter id="dashNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves={2}
            stitchTiles="stitch"
          />
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