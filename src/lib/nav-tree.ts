/**
 * Navigation Tree Utility
 * Generates breadcrumb navigation items based on current pathname
 */

export interface BreadcrumbItem {
  id: string;
  label: string;
  path: string;
  isCurrentPage: boolean;
  icon?: "home";
  isNavigable?: boolean;
  dropdown?: BreadcrumbDropdown;
  tabs?: BreadcrumbTabs;
}

export interface BreadcrumbDropdown {
  type: "teams";
  items: DropdownItem[];
}

export interface BreadcrumbTabs {
  items: TabItem[];
  activeTab: string;
}

export interface TabItem {
  label: string;
  path: string;
}

export interface DropdownItem {
  label: string;
  path: string;
  icon?: string;
}

/**
 * Generate breadcrumb items for the current pathname
 */
export function generateBreadcrumbs(
  pathname: string,
  teamId: string | null,
  teamName?: string,
  organizationName?: string,
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with Home icon
  breadcrumbs.push({
    id: "home",
    label: "Home",
    path: "/",
    isCurrentPage: false,
    icon: "home",
    isNavigable: true,
  });

  // For /board route - show only tabs (no board name)
  if (pathname === "/board") {
    // Tabs for switching between Roles and KPIs (both point to same page for demo)
    breadcrumbs.push({
      id: "view-tabs",
      label: "",
      path: "/board",
      isCurrentPage: true,
      isNavigable: false,
      tabs: {
        activeTab: "roles",
        items: [
          { label: "Roles", path: "/board?tab=roles" },
          { label: "KPIs", path: "/board?tab=kpis" },
        ],
      },
    });
    return breadcrumbs;
  }

  return breadcrumbs;
}

/**
 * Check if a pathname is an organization page (shows breadcrumb nav)
 */
export function isOrganizationPage(pathname: string): boolean {
  return pathname === "/board" || pathname.startsWith("/board");
}

