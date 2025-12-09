"use client";

import { useMemo } from "react";

import { usePathname } from "next/navigation";

import { generateBreadcrumbs, isOrganizationPage } from "@/lib/nav-tree";

import { FancyNav } from "./FancyNav.client";

interface NavWrapperProps {
  user: {
    firstName?: string | null;
  } | null;
  signUpUrl: string;
  signOutAction: () => Promise<void>;
}

export function NavWrapper({
  user,
  signUpUrl,
  signOutAction,
}: NavWrapperProps) {
  const pathname = usePathname();

  const isOrgPage = isOrganizationPage(pathname);

  // Extract board ID from pathname for /board
  const boardId = useMemo(() => {
    if (pathname === "/board") {
      return "demo-board";
    }
    return null;
  }, [pathname]);

  // Generate breadcrumbs based on current pathname
  const breadcrumbs = useMemo(() => {
    if (!isOrgPage) return undefined;
    return generateBreadcrumbs(
      pathname,
      boardId,
      "Demo Board",
      "Demo Organization",
    );
  }, [isOrgPage, pathname, boardId]);

  // Hide navbar on landing page
  if (pathname === "/" || pathname === "/mission") {
    return null;
  }

  return (
    <FancyNav
      user={user}
      signUpUrl={signUpUrl}
      signOutAction={signOutAction}
      isOrgPage={isOrgPage}
      breadcrumbs={breadcrumbs ?? []}
    />
  );
}



