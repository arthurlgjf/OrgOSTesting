"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBoardStore } from "../store/board-store";
import { type FrameNodeData } from "./frame-node";

const frameColorSchema = z.object({
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

type FrameColorForm = z.infer<typeof frameColorSchema>;

const COLORS = [
  "#e5e7eb", // gray
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
];

interface FrameColorDialogProps {
  frameId: string;
  frameData: FrameNodeData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FrameColorDialog({
  frameId,
  frameData,
  open,
  onOpenChange,
}: FrameColorDialogProps) {
  const { nodes, setNodes, markDirty } = useBoardStore();

  const form = useForm<FrameColorForm>({
    resolver: zodResolver(frameColorSchema),
    defaultValues: {
      color: frameData.color ?? COLORS[0],
    },
  });

  const onSubmit = (data: FrameColorForm) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === frameId && node.type === "frame-node") {
        return {
          ...node,
          data: {
            ...node.data,
            color: data.color ?? COLORS[0],
          },
        };
      }
      return node;
    });
    setNodes(updatedNodes);
    markDirty();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Frame Color</DialogTitle>
          <DialogDescription>
            Choose a color for the frame border.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? COLORS[0]}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COLORS.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border"
                              style={{ backgroundColor: color }}
                            />
                            <span>{color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Color</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}



