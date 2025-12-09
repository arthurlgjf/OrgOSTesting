"use client";

import { useState } from "react";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { BarChart3, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DashboardSheetEdgeTriggerProps {
  isOpen: boolean;
  onToggle: () => void;
  side?: "left" | "right";
  className?: string;
}

function DashboardSheetEdgeTrigger({
  isOpen,
  onToggle,
  side = "left",
  className,
}: DashboardSheetEdgeTriggerProps) {
  const isLeft = side === "left";

  return (
    <button
      onClick={onToggle}
      className={cn(
        "fixed top-1/2 z-[51] -translate-y-1/2",
        "flex items-center gap-2 px-3 py-2",
        "rounded-lg border",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-300 ease-in-out",
        isOpen
          ? "bg-background/60 hover:bg-background/80 backdrop-blur-md"
          : "bg-primary text-primary-foreground border-primary hover:brightness-110",
        isLeft
          ? isOpen
            ? "left-[39.5rem]"
            : "left-4"
          : isOpen
            ? "right-[39.5rem]"
            : "right-4",
        className,
      )}
      aria-label={isOpen ? "Close KPIs sidebar" : "Open KPIs sidebar"}
    >
      {isLeft ? (
        <>
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">KPIs</span>
        </>
      ) : (
        <>
          <span className="text-sm font-medium">KPIs</span>
          {isOpen ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </>
      )}
    </button>
  );
}

interface DashboardSidebarProps {
  boardId: string;
  onMetricCreated?: () => void;
  side?: "left" | "right";
}

// Mock metrics data
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
    name: "Conversion Rate",
    description: "Sign-up to paid conversion",
    value: 3.2,
    unit: "%",
    trend: "+0.5%",
  },
];

export function DashboardSidebar({
  boardId: _boardId,
  onMetricCreated: _onMetricCreated,
  side = "left",
}: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[51] bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
      />

      <DashboardSheetEdgeTrigger
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        side={side}
      />

      <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <SheetContent
          side={side}
          className="z-[52] w-[40rem] overflow-hidden p-0 sm:max-w-none"
        >
          <SheetTitle className="sr-only">Dashboard Sidebar</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="flex-shrink-0 border-b px-6 py-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold tracking-tight">
                  Manage KPIs
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Connect platforms and create KPIs for your dashboard
                </p>
              </div>
            </div>

            <div className="[&::-webkit-scrollbar-thumb]:bg-border/40 hover:[&::-webkit-scrollbar-thumb]:bg-border/60 flex-1 space-y-6 overflow-y-auto px-6 py-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
              {/* Add Platform Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Platforms</h3>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Platform
                  </Button>
                </div>
                <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
                  <BarChart3 className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No platforms connected</p>
                  <p className="text-xs">Connect a platform to create metrics</p>
                </div>
              </div>

              <Separator />

              {/* Metrics Section */}
              <div className="space-y-4">
                <h3 className="font-semibold">Your Metrics</h3>
                <div className="space-y-3">
                  {mockMetrics.map((metric) => (
                    <Card key={metric.id} className="hover:bg-accent/50 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            {metric.name}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {metric.trend}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {metric.description}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">
                            {metric.value.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {metric.unit}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

