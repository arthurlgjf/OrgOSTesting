"use client";

import { Panel } from "@xyflow/react";
import { Undo2, Redo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type UndoRedoControlsProps = {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export function UndoRedoControls({
  undo,
  redo,
  canUndo,
  canRedo,
}: UndoRedoControlsProps) {
  return (
    <Panel position="bottom-left" className="ml-[340px] mb-4">
      <TooltipProvider>
        <div className="flex gap-1">
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
    </Panel>
  );
}

