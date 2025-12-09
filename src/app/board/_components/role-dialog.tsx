"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Gauge, Plus } from "lucide-react";
import { nanoid } from "nanoid";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useBoardStore } from "../store/board-store";
import { type RoleNodeData } from "./role-node";

const roleSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  purpose: z.string().min(1, "Purpose is required"),
  accountabilities: z.string().optional(),
  effortPoints: z.number().int().nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  isKeyRole: z.boolean().optional(),
});

type RoleForm = z.infer<typeof roleSchema>;

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
];

const EFFORT_POINT_OPTIONS = [1, 2, 3, 5, 8, 13, 21];

/** Calculate the center position of the current viewport in flow coordinates */
function getViewportCenter(
  reactFlowInstance: {
    screenToFlowPosition: (position: { x: number; y: number }) => {
      x: number;
      y: number;
    };
  } | null,
): { x: number; y: number } {
  if (!reactFlowInstance) {
    return { x: 400, y: 300 };
  }

  const container = document.querySelector(".react-flow");
  if (!container) {
    return { x: 400, y: 300 };
  }

  const rect = container.getBoundingClientRect();
  const screenCenterX = rect.left + rect.width / 2;
  const screenCenterY = rect.top + rect.height / 2;

  return reactFlowInstance.screenToFlowPosition({
    x: screenCenterX,
    y: screenCenterY,
  });
}

// Mock members for assignment
const mockMembers = [
  { id: "user-1", email: "john@example.com", firstName: "John", lastName: "Doe" },
  { id: "user-2", email: "jane@example.com", firstName: "Jane", lastName: "Smith" },
  { id: "user-3", email: "alice@example.com", firstName: "Alice", lastName: "Johnson" },
];

interface RoleDialogProps {
  boardId: string;
  roleData?: RoleNodeData & { nodeId: string }; // For edit mode
  trigger?: React.ReactNode; // Custom trigger (for node double-click)
  open?: boolean; // Controlled open state
  onOpenChange?: (open: boolean) => void; // Controlled open state
}

export function RoleDialog({
  boardId: _boardId,
  roleData,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: RoleDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const isEditMode = !!roleData;
  const nodes = useBoardStore((state) => state.nodes);
  const setNodes = useBoardStore((state) => state.setNodes);
  const reactFlowInstance = useBoardStore((state) => state.reactFlowInstance);
  const markDirty = useBoardStore((state) => state.markDirty);

  const form = useForm<RoleForm>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      title: "",
      purpose: "",
      accountabilities: "",
      effortPoints: null,
      color: COLORS[0],
      isKeyRole: false,
    },
  });

  // Reset form when roleData changes or dialog opens
  useEffect(() => {
    if (open) {
      if (roleData) {
        form.reset({
          title: roleData.title,
          purpose: roleData.purpose,
          accountabilities: roleData.accountabilities ?? "",
          effortPoints: roleData.effortPoints ?? null,
          color: roleData.color ?? COLORS[0],
          isKeyRole: roleData.isKeyRole ?? false,
        });
      } else {
        form.reset({
          title: "",
          purpose: "",
          accountabilities: "",
          effortPoints: null,
          color: COLORS[0],
          isKeyRole: false,
        });
      }
    }
  }, [open, roleData, form]);

  const onSubmit = (data: RoleForm) => {
    if (isEditMode && roleData) {
      // Update existing role
      const updatedNodes = nodes.map((node) => {
        if (node.id === roleData.nodeId && node.type === "role-node") {
          return {
            ...node,
            data: {
              ...node.data,
              title: data.title,
              purpose: data.purpose,
              accountabilities: data.accountabilities,
              effortPoints: data.effortPoints,
              color: data.color ?? COLORS[0],
              isKeyRole: data.isKeyRole ?? false,
            },
          };
        }
        return node;
      });
      setNodes(updatedNodes);
      markDirty();
      toast.success("Role updated");
    } else {
      // Create new role
      const nodeId = nanoid();
      const position = getViewportCenter(reactFlowInstance);

      const newNode = {
        id: nodeId,
        type: "role-node" as const,
        position,
        data: {
          roleId: nanoid(),
          title: data.title,
          purpose: data.purpose,
          accountabilities: data.accountabilities,
          effortPoints: data.effortPoints,
          color: data.color ?? COLORS[0],
          isKeyRole: data.isKeyRole ?? false,
        },
      };

      setNodes([...nodes, newNode]);
      markDirty();
      toast.success("Role created");
    }

    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Role" : "Create Role"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the role details below."
              : "Fill in the details to create a new role."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Product Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Define product vision and roadmap"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountabilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Accountabilities</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Manage product backlog"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effortPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effort Points</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? null : parseInt(value))
                      }
                      value={
                        field.value === null || field.value === undefined
                          ? "none"
                          : field.value.toString()
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select points" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {EFFORT_POINT_OPTIONS.map((points) => (
                          <SelectItem key={points} value={points.toString()}>
                            {points} {points === 1 ? "point" : "points"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            <FormField
              control={form.control}
              name="isKeyRole"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Key Role</FormLabel>
                    <div className="text-muted-foreground text-sm">
                      Mark this role as critical to the organization. Key roles
                      will be highlighted in risk analysis.
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? "Update Role" : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

