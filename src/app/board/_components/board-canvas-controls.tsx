"use client";

import { useCallback } from "react";

import { Panel, useReactFlow } from "@xyflow/react";
import { Frame, Pencil, Route, Type } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { useBoardLayout } from "../hooks/use-board-layout";
import { useBoardStore } from "../store/board-store";

type BoardCanvasControlsProps = {
  isDrawing: boolean;
  setIsDrawing: (isDrawing: boolean) => void;
  isFrameMode: boolean;
  setIsFrameMode: (isFrameMode: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  takeSnapshot: () => void;
  onLayout?: () => void;
};

export function BoardCanvasControls({
  isDrawing,
  setIsDrawing,
  isFrameMode,
  setIsFrameMode,
  undo,
  redo,
  canUndo,
  canRedo,
  takeSnapshot,
  onLayout,
}: BoardCanvasControlsProps) {
  const reactFlowInstance = useReactFlow();
  const runLayout = useBoardLayout();
  const addTextNode = useBoardStore((state) => state.addTextNode);
  const addFrameNode = useBoardStore((state) => state.addFrameNode);
  const setEditingTextNodeId = useBoardStore(
    (state) => state.setEditingTextNodeId,
  );

  const handleLayout = useCallback(() => {
    takeSnapshot();
    if (onLayout) {
      onLayout();
    } else {
      runLayout();
    }
  }, [takeSnapshot, onLayout, runLayout]);

  const handleAddText = useCallback(() => {
    takeSnapshot();
    const { x, y, zoom } = reactFlowInstance.getViewport();
    const centerX = -x / zoom + window.innerWidth / 2 / zoom;
    const centerY = -y / zoom + window.innerHeight / 2 / zoom;

    const nodeId = addTextNode({ x: centerX, y: centerY });
    setEditingTextNodeId(nodeId);
  }, [reactFlowInstance, addTextNode, setEditingTextNodeId, takeSnapshot]);

  const handleToggleFrameMode = useCallback(() => {
    const newFrameMode = !isFrameMode;
    setIsFrameMode(newFrameMode);
    if (newFrameMode) {
      setIsDrawing(false); // Disable drawing mode when enabling frame mode
    }
  }, [isFrameMode, setIsFrameMode, setIsDrawing]);

  return (
    <Panel
      position="bottom-center"
      className="left-1/2 -translate-x-1/2 mb-4"
    >
      <TooltipProvider>
        <div className="flex gap-2">
          {/* Force layout button - First */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleLayout}
                variant="default"
                size="icon"
                className="h-10 w-10 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <Route className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Force layout</p>
            </TooltipContent>
          </Tooltip>

          {/* Add text button - Second */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleAddText}
                variant="outline"
                size="icon"
                className="h-10 w-10 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <Type className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Add text</p>
            </TooltipContent>
          </Tooltip>

          {/* Add frame button - Third */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleToggleFrameMode}
                variant={isFrameMode ? "default" : "outline"}
                size="icon"
                className={cn(
                  "h-10 w-10 shadow-lg transition-all duration-200 hover:shadow-xl",
                  isFrameMode && "ring-primary ring-2 ring-offset-2",
                )}
              >
                <Frame className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{isFrameMode ? "Exit frame mode" : "Frame mode"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Draw mode toggle - Fourth */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  const newDrawingState = !isDrawing;
                  setIsDrawing(newDrawingState);
                  if (newDrawingState) {
                    toast.info("Drawings are temporary and won't be saved", {
                      description:
                        "Your sketches will be cleared when you refresh the page.",
                      duration: 4000,
                    });
                  }
                }}
                variant={isDrawing ? "default" : "outline"}
                size="icon"
                className={cn(
                  "h-10 w-10 shadow-lg transition-all duration-200 hover:shadow-xl",
                  isDrawing && "ring-primary ring-2 ring-offset-2",
                )}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{isDrawing ? "Exit draw mode" : "Draw mode"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </Panel>
  );
}

