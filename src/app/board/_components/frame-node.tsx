"use client";

import { memo, useCallback, useState } from "react";

import {
  Handle,
  NodeResizer,
  Position,
  type NodeProps,
} from "@xyflow/react";
import { Loader2, Settings, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useConfirmation } from "@/providers/ConfirmationDialogProvider";
import { cn } from "@/lib/utils";

import { useBoardStore } from "../store/board-store";
import { FrameColorDialog } from "./frame-color-dialog";

export type FrameNodeData = {
  label?: string;
  color?: string;
};

export type FrameNode = NodeProps<FrameNodeData, "frame-node">;

function FrameNodeComponent({
  data,
  selected,
  id,
  width = 300,
  height = 200,
}: FrameNode) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false);
  const deleteNode = useBoardStore((state) => state.deleteNode);
  const { confirm } = useConfirmation();

  const color = data?.color ?? "#e5e7eb";
  const label = data?.label ?? "Frame";

  const handleDelete = useCallback(async () => {
    const confirmed = await confirm({
      title: "Delete frame",
      description: `Are you sure you want to delete this frame?`,
      confirmText: "Delete",
      variant: "destructive",
    });

    if (confirmed) {
      setIsDeleting(true);
      deleteNode(id);
      setTimeout(() => setIsDeleting(false), 500);
    }
  }, [id, confirm, deleteNode]);

  const handleEditColor = useCallback(() => {
    setIsColorDialogOpen(true);
  }, []);

  return (
    <div
      className={cn(
        "group relative",
        selected && "ring-2 ring-primary ring-offset-2",
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <NodeResizer
        color={color}
        isVisible={selected}
        minWidth={200}
        minHeight={150}
      />
      <div
        className={cn(
          "bg-background/50 border-2 rounded-lg p-4 h-full w-full flex items-center justify-center",
        )}
        style={{
          borderColor: color,
        }}
      >
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
      </div>

      {/* Action Buttons - Positioned in top-right corner */}
      <div className="nodrag absolute top-1 right-1 z-10 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleEditColor();
          }}
          className={cn("h-6 w-6", "hover:bg-primary/10 hover:text-primary")}
          title="Change color"
        >
          <Settings className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            void handleDelete();
          }}
          disabled={isDeleting}
          className={cn(
            "h-6 w-6",
            "hover:bg-destructive/10 hover:text-destructive",
          )}
          title="Delete frame"
        >
          {isDeleting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </Button>
      </div>

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Color Dialog */}
      <FrameColorDialog
        frameId={id}
        frameData={data}
        open={isColorDialogOpen}
        onOpenChange={setIsColorDialogOpen}
      />
    </div>
  );
}

export const FrameNodeMemo = memo(FrameNodeComponent);

