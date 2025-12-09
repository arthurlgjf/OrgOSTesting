"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { usePathname } from "next/navigation";

import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
import gsap from "gsap";
import {
  Code2,
  Github,
  Home,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemUI,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useThemeToggle } from "@/components/ui/skiper-ui/skiper26";
import type { BreadcrumbItem } from "@/lib/nav-tree";
import { cn } from "@/lib/utils";

// Register GSAP plugins
gsap.registerPlugin();

// Sun/moon theme toggle based on ThemeToggleButton2 from skiper4
function ThemeToggle({ className = "" }: { className?: string }) {
  const { isDark, toggleTheme } = useThemeToggle({
    variant: "circle",
    start: "top-right",
  });

  return (
    <button
      type="button"
      className={cn(
        "rounded-full p-2 transition-all duration-300 active:scale-95",
        isDark ? "bg-black text-white" : "bg-white text-black",
        className,
      )}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
      >
        <clipPath id="theme-toggle-clip">
          <motion.path
            animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
            transition={{ ease: "easeInOut", duration: 0.15 }}
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
          />
        </clipPath>
        <g clipPath="url(#theme-toggle-clip)">
          <motion.circle
            animate={{ r: isDark ? 10 : 8 }}
            transition={{ ease: "easeInOut", duration: 0.15 }}
            cx="16"
            cy="16"
          />
          <motion.g
            animate={{
              rotate: isDark ? -100 : 0,
              scale: isDark ? 0.5 : 1,
              opacity: isDark ? 0 : 1,
            }}
            transition={{ ease: "easeInOut", duration: 0.15 }}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </motion.g>
        </g>
      </svg>
    </button>
  );
}

interface FancyNavProps {
  user: {
    firstName?: string | null;
  } | null;
  signUpUrl: string;
  signOutAction: () => Promise<void>;
  isOrgPage?: boolean;
  breadcrumbs?: BreadcrumbItem[];
}

export function FancyNav({
  user,
  signUpUrl,
  signOutAction,
  isOrgPage = false,
  breadcrumbs = [],
}: FancyNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProdMode, setIsProdMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  // Get current tab from URL (client-side only)
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("tab") || "roles";
    }
    return "roles";
  });

  // Listen for URL changes to update current tab
  useEffect(() => {
    const updateTab = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        setCurrentTab(params.get("tab") || "roles");
      }
    };
    
    // Update on mount
    updateTab();
    
    // Listen for popstate (back/forward navigation)
    window.addEventListener("popstate", updateTab);
    
    // Listen for custom events from sidebar tab changes
    window.addEventListener("tabchange", updateTab);
    
    return () => {
      window.removeEventListener("popstate", updateTab);
      window.removeEventListener("tabchange", updateTab);
    };
  }, []);

  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Check if running in development
  const isDev = process.env.NODE_ENV === "development";

  // Determine if we should show dev-only items
  // In production: always hide dev items
  // In development: show dev items unless "Prod Mode" is toggled on
  const showDevItems = isDev && !isProdMode;

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper to check if a path is active
  const isActivePath = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(path + "/");
  };

  // Mock teams data (no API) - always show teams in expanded nav
  const teams = [
    { id: "team-1", name: "Engineering Team" },
    { id: "team-2", name: "Product Team" },
    { id: "team-3", name: "Design Team" },
    { id: "team-4", name: "Marketing Team" },
    { id: "team-5", name: "Sales Team" },
    { id: "team-6", name: "Support Team" },
  ];

  // GSAP Animation setup - Simplified timeline
  useGSAP(
    () => {
      if (!containerRef.current || !mounted) return;

      // Kill any existing timeline
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      const pillElement = pillRef.current;
      if (!pillElement) return;

      // Create the main timeline with revertOnUpdate support
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
      });

      // Get the initial collapsed height (dynamic based on pill vs breadcrumb mode)
      const collapsedHeight = pillElement.offsetHeight;

      // Step 1: Hide pill content
      tl.to(
        ".pill-content",
        {
          opacity: 0,
          scale: 0.8,
          duration: 0.09,
          ease: "power2.in",
        },
        0,
      );

      // Remove pill content from flow
      tl.set(
        ".pill-content",
        {
          position: "absolute",
          pointerEvents: "none",
        },
        0.09,
      );

      // Step 2: Expand width
      tl.to(
        pillRef.current,
        {
          width: "min(800px, 90vw)",
          duration: 0.12,
          ease: "power3.out",
        },
        0.03,
      );

      // Step 3: Show expanded content early
      tl.set(
        expandedRef.current,
        {
          display: "grid",
          opacity: 0,
        },
        0.09,
      );

      // Step 4: Expand height
      tl.fromTo(
        pillRef.current,
        {
          height: collapsedHeight,
        },
        {
          height: "auto",
          duration: 0.4,
          ease: "expo.out",
        },
        0.12,
      );

      // Step 5: Fade in expanded content
      tl.to(
        expandedRef.current,
        {
          opacity: 1,
          duration: 0.09,
        },
        0.26,
      );

      tl.from(
        expandedRef.current,
        {
          scale: 0.95,
          y: 10,
          duration: 0.14,
          ease: "back.out(1.5)",
        },
        0.26,
      );

      // Step 6: Stagger menu items
      tl.from(
        ".menu-item",
        {
          opacity: 0,
          x: -15,
          y: 8,
          duration: 0.14,
          stagger: 0.02,
          ease: "back.out(1.5)",
        },
        0.29,
      );

      // Step 7: Show actions
      tl.from(
        actionsRef.current,
        {
          opacity: 0,
          y: 15,
          duration: 0.14,
          ease: "back.out(2)",
        },
        0.4,
      );

      // Store timeline reference
      timelineRef.current = tl;
    },
    {
      scope: containerRef,
      dependencies: [mounted, isProdMode, breadcrumbs.length],
      revertOnUpdate: true,
    },
  );

  // Handle expand/collapse - simply reverse the timeline
  const handleToggle = useCallback(() => {
    if (!timelineRef.current) return;

    if (isExpanded) {
      // Closing - reverse the timeline (plays animation backwards)
      timelineRef.current.reverse();
    } else {
      // Opening - play the timeline forward
      timelineRef.current.play();
    }
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  // Close nav on route change
  useEffect(() => {
    if (isExpanded && timelineRef.current) {
      timelineRef.current.reverse();
      setIsExpanded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close nav on click outside
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (timelineRef.current) {
          timelineRef.current.reverse();
        }
        setIsExpanded(false);
      }
    };

    // Small delay to avoid the opening click from immediately closing
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isExpanded]);

  if (!mounted) {
    return (
      <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
        <div className="bg-background/80 border-border h-10 w-32 animate-pulse rounded-md border backdrop-blur-md" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2"
    >
      {/* Main pill/expanded container */}
      <div
        ref={pillRef}
        className={cn(
          "border-border relative origin-top rounded-md border shadow-lg transition-all duration-300",
          isExpanded
            ? "bg-background overflow-hidden shadow-2xl"
            : "bg-background/40 overflow-visible shadow-lg backdrop-blur-md hover:shadow-xl",
        )}
      >
        {/* Collapsed pill content */}
        <div className="pill-content flex items-center gap-3 px-4 py-2">
          {isOrgPage ? (
            <>
              {/* Home button */}
              <Link
                href="/"
                className="text-primary flex items-center justify-center transition-transform hover:scale-105"
              >
                <Home className="size-4" />
              </Link>

              {/* Separator */}
              <div className="bg-border h-5 w-px" />

              {/* Centered Tabs for Roles/KPIs switching */}
              <div className="flex-1 flex justify-center">
                {breadcrumbs.find((item) => item.tabs) && (
                  <div className="bg-muted/50 flex items-center rounded-md p-0.5">
                    {breadcrumbs
                      .find((item) => item.tabs)
                      ?.tabs?.items.map((tabItem, tabIndex) => {
                        const isActive = tabItem.label.toLowerCase() === currentTab;
                        return (
                          <Link
                            key={`${tabItem.path}-${tabItem.label}-${tabIndex}`}
                            href={tabItem.path}
                            className={cn(
                              "relative rounded px-3 py-1 text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {tabItem.label}
                          </Link>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="bg-border h-5 w-px" />

              {/* Quick actions - Only burger menu */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 transition-transform hover:scale-110"
                  onClick={handleToggle}
                  aria-label={isExpanded ? "Close menu" : "Open menu"}
                >
                  {isExpanded ? (
                    <X className="size-4" />
                  ) : (
                    <Menu className="size-4" />
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Logo */}
              <Link
                href="/"
                className="text-primary flex items-center gap-2 font-bold whitespace-nowrap transition-transform hover:scale-105"
                onClick={(e) => {
                  if (isExpanded) {
                    e.preventDefault();
                    handleToggle();
                  }
                }}
              >
                <div className="bg-primary shadow-primary/20 flex size-7 shrink-0 items-center justify-center rounded-full shadow-lg">
                  <span className="text-primary-foreground text-xs font-bold">
                    R
                  </span>
                </div>
                <span className="text-sm whitespace-nowrap">Ryo</span>
              </Link>

              {/* Separator */}
              <div className="bg-border h-5 w-px" />

              {user ? (
                <span className="text-muted-foreground text-sm">
                  Hi, {user.firstName ?? "there"}
                </span>
              ) : (
                <Button size="sm" asChild className="h-7 px-3">
                  <Link href="/login" prefetch={false}>
                    Sign in
                  </Link>
                </Button>
              )}

              <div className="bg-border h-5 w-px" />

              <div className="flex items-center gap-1.5">
                <ThemeToggle className="size-8 transition-transform hover:scale-110" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 transition-transform hover:scale-110"
                  onClick={handleToggle}
                  aria-label={isExpanded ? "Close menu" : "Open menu"}
                >
                  {isExpanded ? (
                    <X className="size-4" />
                  ) : (
                    <Menu className="size-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Expanded content */}
        <div
          ref={expandedRef}
          className="hidden gap-6 p-6"
          style={{ display: "none" }}
        >
          {/* Header with logo and close */}
          <div className="border-border col-span-full flex items-center justify-between border-b pb-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
                <span className="text-primary-foreground font-bold">R</span>
              </div>
              <span className="text-lg font-bold">Ryo</span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Dev mode toggle - only in development */}
              {isDev && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsProdMode(!isProdMode)}
                  className={cn(
                    "text-xs",
                    isProdMode
                      ? "border-orange-500 text-orange-500"
                      : "border-green-500 text-green-500",
                  )}
                >
                  {isProdMode ? "Prod Mode" : "Dev Mode"}
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggle}
                aria-label="Close menu"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          {/* Teams Grid */}
          <div ref={menuItemsRef} className="col-span-full">
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className={cn(
                    "bg-muted/50 hover:bg-muted border border-transparent hover:border-border rounded-lg p-4 transition-all duration-200 hover:shadow-sm",
                    isActivePath(`/teams/${team.id}`) &&
                      "bg-primary/10 border-primary",
                  )}
                  onClick={handleToggle}
                >
                  <div className="text-sm font-medium text-center">
                    {team.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Actions section */}
          <div
            ref={actionsRef}
            className="border-border col-span-full flex items-center justify-between border-t pt-4"
          >
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <ThemeToggle className="size-10" />

              {/* GitHub */}
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://github.com/drifter089/orgOS"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="size-5" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {!user ? (
                <>
                  <Button variant="ghost" asChild size="sm">
                    <Link href="/login" prefetch={false}>
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={signUpUrl} prefetch={false}>
                      Sign up
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground text-sm">
                    {user.firstName ? `Hi, ${user.firstName}` : "Welcome"}
                  </span>
                  <form action={signOutAction}>
                    <Button type="submit" variant="outline" size="sm">
                      Sign out
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
