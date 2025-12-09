"use client";

import { useEffect, useState } from "react";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { BarChart3, ChevronRight, DollarSign, Loader2, Mail, Plus, Trash2, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useShallow } from "zustand/react/shallow";
import { useConfirmation } from "@/providers/ConfirmationDialogProvider";

import { useBoardStore } from "../store/board-store";
import {
  useEmployeeProfilesStore,
  calculateSalaryMetrics,
  calculateEmploymentTypeMetrics,
} from "../store/employee-profiles-store";
import { EmployeeProfileDialog } from "./employee-profile-dialog";
import { RoleDialog } from "./role-dialog";
import { type RoleNodeData } from "./role-node";

/**
 * Custom sheet content without modal overlay
 */
function NonModalSheetContent({
  className,
  children,
  side = "left",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Content
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-40 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full border-r w-[40rem]",
          className,
        )}
        {...props}
      >
        <SheetPrimitive.Title className="sr-only">
          Board Sidebar
        </SheetPrimitive.Title>
        {children}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

interface CombinedSidebarProps {
  boardId: string;
  boardName: string;
  boardDescription?: string | null;
  roleCount: number;
}

interface MemberProps {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

// Salary Metrics Component
function SalaryMetricsSection() {
  const profiles = useEmployeeProfilesStore(
    useShallow((state) => Array.from(state.profiles.values()))
  );
  const salaryMetrics = calculateSalaryMetrics(profiles);

  if (salaryMetrics.count === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Salary Metrics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No salary data available. Add employee profiles with compensation information.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Salary Metrics</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-muted-foreground text-xs">Total Payroll</p>
            <p className="text-xl font-bold">
              ${salaryMetrics.total.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Average Salary</p>
            <p className="text-xl font-bold">
              ${Math.round(salaryMetrics.average).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Min Salary</p>
            <p className="text-lg font-semibold">
              ${salaryMetrics.min.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Max Salary</p>
            <p className="text-lg font-semibold">
              ${salaryMetrics.max.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="pt-2 border-t">
          <p className="text-muted-foreground text-xs">
            Based on {salaryMetrics.count} employee{salaryMetrics.count !== 1 ? "s" : ""} with salary data
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Employment Type Metrics Component
function EmploymentTypeMetricsSection() {
  const profiles = useEmployeeProfilesStore(
    useShallow((state) => Array.from(state.profiles.values()))
  );
  const employmentMetrics = calculateEmploymentTypeMetrics(profiles);
  const totalEmployees = profiles.length;

  if (totalEmployees === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">Employment Type</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No employee profiles available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const employmentTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Intern",
    "Consultant",
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">Employment Type Distribution</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {employmentTypes.map((type) => {
          const count = employmentMetrics[type] || 0;
          const percentage = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
          return (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm">{type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{count}</span>
                <Badge variant="secondary" className="text-xs">
                  {percentage}%
                </Badge>
              </div>
            </div>
          );
        })}
        {employmentMetrics["Unknown"] && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              <span className="text-sm text-muted-foreground">Unknown</span>
            </div>
            <span className="text-sm font-medium">{employmentMetrics["Unknown"]}</span>
          </div>
        )}
        <div className="pt-2 border-t">
          <p className="text-muted-foreground text-xs">
            Total: {totalEmployees} employee{totalEmployees !== 1 ? "s" : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MemberCard({
  member,
  roleCount,
  onOpenProfile,
}: {
  member: MemberProps;
  roleCount: number;
  onOpenProfile: (memberId: string) => void;
}) {
  const initials =
    member.firstName && member.lastName
      ? `${member.firstName[0]}${member.lastName[0]}`.toUpperCase()
      : (member.email?.[0]?.toUpperCase() ?? "U");

  const userName =
    member.firstName && member.lastName
      ? `${member.firstName} ${member.lastName}`
      : (member.email ?? "Member");

  return (
    <div
      className="bg-card hover:bg-accent/50 flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 shadow-sm transition-colors hover:shadow"
      onClick={() => onOpenProfile(member.id)}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm leading-tight font-medium">
            {userName}
          </p>
          <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>
        </div>
      </div>
      <Badge variant="secondary" className="flex-shrink-0">
        {roleCount} {roleCount === 1 ? "role" : "roles"}
      </Badge>
    </div>
  );
}

// Mock data
const mockMembers: MemberProps[] = [
  {
    id: "member-1",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
  },
  {
    id: "member-2",
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
  },
  {
    id: "member-3",
    email: "alice.johnson@example.com",
    firstName: "Alice",
    lastName: "Johnson",
  },
];

const mockMetrics = [
  {
    id: "metric-1",
    name: "User Growth",
    description: "Monthly active users",
    value: 1250,
    unit: "users",
    trend: "+12%",
  },
  {
    id: "metric-2",
    name: "Revenue",
    description: "Monthly recurring revenue",
    value: 45000,
    unit: "$",
    trend: "+8%",
  },
  {
    id: "metric-3",
    name: "Engagement",
    description: "Daily active users",
    value: 850,
    unit: "users",
    trend: "+5%",
  },
];

export function CombinedSidebar({
  boardId,
  boardName,
  boardDescription,
  roleCount,
}: CombinedSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  // Get active tab from URL search params
  const [activeTab, setActiveTab] = useState<"roles" | "kpis">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      return (tab === "kpis" ? "kpis" : "roles") as "roles" | "kpis";
    }
    return "roles";
  });

  // Listen for URL changes to update active tab
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        setActiveTab((tab === "kpis" ? "kpis" : "roles") as "roles" | "kpis");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const nodes = useBoardStore((state) => state.nodes);
  const confirm = useConfirmation();

  // Mock roles from nodes
  const roles = nodes
    .filter((node) => node.type === "role-node")
    .map((node) => ({
      id: node.data.roleId,
      title: node.data.title,
      purpose: node.data.purpose,
      color: node.data.color,
      assignedUserName: node.data.assignedUserName,
      effortPoints: node.data.effortPoints,
      nodeId: node.id,
    }));

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed top-1/2 z-[51] -translate-y-1/2",
          "flex items-center gap-2 px-3 py-2",
          "rounded-lg border",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-300 ease-in-out",
          isOpen
            ? "bg-background/60 hover:bg-background/80 backdrop-blur-md left-[39.5rem]"
            : "bg-primary text-primary-foreground border-primary hover:brightness-110 left-4",
        )}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? (
          <ChevronRight className="h-4 w-4 rotate-180" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span className="text-sm font-medium">Board</span>
      </button>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <NonModalSheetContent side="left" className="w-[40rem] z-[52]">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold">{boardName}</h2>
              {boardDescription && (
                <p className="text-muted-foreground mt-1 text-sm">
                  {boardDescription}
                </p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex flex-1 flex-col overflow-hidden">
              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  setActiveTab(value as "roles" | "kpis");
                  // Update URL without page reload
                  const url = new URL(window.location.href);
                  url.searchParams.set("tab", value);
                  window.history.pushState({}, "", url.toString());
                  // Dispatch custom event to update navbar
                  window.dispatchEvent(new CustomEvent("tabchange"));
                }}
                className="flex h-full flex-col"
              >
                <div className="border-b px-6 pt-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="roles" className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      Roles
                    </TabsTrigger>
                    <TabsTrigger value="kpis" className="flex-1">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      KPIs
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Roles Tab Content */}
                <TabsContent value="roles" className="mt-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="px-6 py-4 space-y-4">
                      {/* Roles List */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold">Roles</h3>
                          <RoleDialog
                            boardId={boardId}
                            trigger={
                              <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Role
                              </Button>
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          {roles.length === 0 ? (
                            <div className="text-muted-foreground text-center py-8 text-sm">
                              No roles yet. Add your first role to get started.
                            </div>
                          ) : (
                            roles.map((role) => {
                              const roleData: RoleNodeData & { nodeId: string } = {
                                ...role,
                                nodeId: role.nodeId,
                              };
                              return (
                                <RoleDialog
                                  key={role.id}
                                  boardId={boardId}
                                  roleData={roleData}
                                  trigger={
                                    <div className="bg-card hover:bg-accent/50 group relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-lg border p-3 shadow-sm transition-all hover:shadow">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="border-background h-3 w-3 flex-shrink-0 rounded-full border-2 shadow-sm"
                                            style={{
                                              backgroundColor: role.color,
                                              boxShadow: `0 0 0 1px ${role.color}40`,
                                            }}
                                          />
                                          <h4 className="truncate text-sm leading-tight font-semibold">
                                            {role.title}
                                          </h4>
                                        </div>
                                        <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs leading-relaxed">
                                          {role.purpose}
                                        </p>
                                        {role.assignedUserName && (
                                          <Badge
                                            variant="outline"
                                            className="border-primary/20 mt-2 max-w-full text-xs font-medium"
                                          >
                                            {role.assignedUserName}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  }
                                />
                              );
                            })
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Members Section */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold">Members</h3>
                        <div className="space-y-2">
                          {mockMembers.map((member) => {
                            const memberRoleCount = roles.filter(
                              (r) => r.assignedUserName === `${member.firstName} ${member.lastName}`
                            ).length;
                            return (
                              <MemberCard
                                key={member.id}
                                member={member}
                                roleCount={memberRoleCount}
                                onOpenProfile={(memberId) => {
                                  setSelectedMemberId(memberId);
                                  setIsProfileOpen(true);
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* KPIs Tab Content */}
                <TabsContent value="kpis" className="mt-0 flex-1 overflow-hidden min-h-0">
                  <ScrollArea className="h-full" style={{ height: "100%" }}>
                    <div className="px-6 py-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Metrics</h3>
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Metric
                        </Button>
                      </div>
                      <div className="space-y-4">
                        {/* Salary Metrics */}
                        <SalaryMetricsSection />
                        
                        {/* Employment Type Metrics */}
                        <EmploymentTypeMetricsSection />

                        {/* Other Metrics */}
                        {mockMetrics.map((metric) => (
                          <Card key={metric.id}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium">
                                  {metric.name}
                                </CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                  {metric.trend}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {metric.unit}
                                {metric.value.toLocaleString()}
                              </div>
                              {metric.description && (
                                <p className="text-muted-foreground mt-1 text-xs">
                                  {metric.description}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </NonModalSheetContent>
          </Sheet>

          {/* Employee Profile Dialog */}
          {selectedMemberId && (
            <EmployeeProfileDialog
              memberId={selectedMemberId}
              memberName={
                mockMembers.find((m) => m.id === selectedMemberId)
                  ? `${mockMembers.find((m) => m.id === selectedMemberId)?.firstName} ${mockMembers.find((m) => m.id === selectedMemberId)?.lastName}`
                  : undefined
              }
              open={isProfileOpen}
              onOpenChange={(open) => {
                setIsProfileOpen(open);
                if (!open) {
                  setSelectedMemberId(null);
                }
              }}
            />
          )}
        </>
      );
    }

