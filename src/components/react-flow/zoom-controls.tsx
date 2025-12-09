"use client";

import React from "react";

import {
  Panel,
  type PanelProps,
  useReactFlow,
  useStore,
  useViewport,
} from "@xyflow/react";
import { Minus, Plus, Redo2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type ZoomControlsProps = Omit<PanelProps, "children"> & {
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

export function ZoomControls({
  className,
  undo,
  redo,
  canUndo,
  canRedo,
  ...props
}: ZoomControlsProps) {
  const { zoom } = useViewport();
  const { zoomTo, zoomIn, zoomOut } = useReactFlow();
  const minZoom = useStore((state) => state.minZoom);
  const maxZoom = useStore((state) => state.maxZoom);

  return (
    <Panel
      position="bottom-left"
      className={cn("ml-4 mb-4", className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        {/* Combined Zoom Control Button (like screenshot: "- 100% +") */}
        <div className="relative">
          <Button
            variant="outline"
            className="h-10 px-6 tabular-nums shadow-lg transition-all duration-200 hover:shadow-xl flex items-center gap-3"
            onClick={() => zoomTo(1, { duration: 300 })}
            aria-label="Reset zoom to 100%"
          >
            <span
              className="cursor-pointer hover:opacity-70"
              onClick={(e) => {
                e.stopPropagation();
                zoomOut({ duration: 300 });
              }}
            >
              <Minus className="h-4 w-4" />
            </span>
            <span className="min-w-[60px] text-center font-medium">
              {(100 * zoom).toFixed(0)}%
            </span>
            <span
              className="cursor-pointer hover:opacity-70"
              onClick={(e) => {
                e.stopPropagation();
                zoomIn({ duration: 300 });
              }}
            >
              <Plus className="h-4 w-4" />
            </span>
          </Button>
        </div>

        {/* Undo/Redo buttons - next to zoom menu */}
        {undo && redo && (
          <TooltipProvider>
            <div className="flex gap-1 ml-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={undo}
                    disabled={!canUndo}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
                  >
                    <Undo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Undo (Ctrl+Z)</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={redo}
                    disabled={!canRedo}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
                  >
                    <Redo2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Redo (Ctrl+Shift+Z)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        )}
      </div>
    </Panel>
  );
}

