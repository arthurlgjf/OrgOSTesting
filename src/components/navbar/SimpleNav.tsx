"use client";

import { useState } from "react";

import { Home, Menu, X } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SimpleNav() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
      {/* Main pill/expanded container */}
      <div
        className={cn(
          "border-border relative origin-top rounded-md border shadow-lg transition-all duration-300",
          isExpanded
            ? "bg-background overflow-hidden shadow-2xl"
            : "bg-background/40 overflow-visible shadow-lg backdrop-blur-md hover:shadow-xl",
        )}
        style={{
          width: isExpanded ? "min(800px, 90vw)" : "auto",
        }}
      >
        {/* Collapsed pill content */}
        <div className="flex items-center gap-3 px-4 py-2">
          {/* Logo */}
          <Link
            href="/"
            className="text-primary flex items-center gap-2 font-bold whitespace-nowrap transition-transform hover:scale-105"
            onClick={(e) => {
              if (isExpanded) {
                e.preventDefault();
                setIsExpanded(false);
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

          <span className="text-muted-foreground text-sm">Demo Board</span>

          <div className="bg-border h-5 w-px" />

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 transition-transform hover:scale-110"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? "Close menu" : "Open menu"}
            >
              {isExpanded ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="gap-6 p-6 border-t">
            {/* Header with logo and close */}
            <div className="border-border flex items-center justify-between border-b pb-4 mb-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
                  <span className="text-primary-foreground font-bold">R</span>
                </div>
                <span className="text-lg font-bold">Ryo</span>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                aria-label="Close menu"
              >
                <X className="size-5" />
              </Button>
            </div>

            {/* Menu sections */}
            <div className="grid gap-6 grid-cols-3">
              {/* Home */}
              <Link
                href="/"
                className={cn(
                  "bg-muted/50 hover:bg-muted flex items-center gap-3 rounded-lg p-3 transition-colors",
                )}
                onClick={() => setIsExpanded(false)}
              >
                <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                  <Home className="size-4" />
                </div>
                <div>
                  <div className="font-medium">Home</div>
                  <div className="text-muted-foreground text-xs">
                    Welcome page
                  </div>
                </div>
              </Link>

              {/* Board */}
              <Link
                href="/board"
                className={cn(
                  "bg-muted/50 hover:bg-muted flex items-center gap-3 rounded-lg p-3 transition-colors",
                  "bg-primary/10 border-primary border",
                )}
                onClick={() => setIsExpanded(false)}
              >
                <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                  <Menu className="size-4" />
                </div>
                <div>
                  <div className="font-medium">Board</div>
                  <div className="text-muted-foreground text-xs">
                    Demo board
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



