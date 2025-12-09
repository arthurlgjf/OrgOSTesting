"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, DollarSign, User, Users } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import {
  useEmployeeProfilesStore,
  type EmployeeProfile,
} from "../store/employee-profiles-store";
import { useEffect } from "react";

const employeeProfileSchema = z.object({
  // Key Info
  name: z.string().min(1, "Name is required"),
  departmentRole: z.string().min(1, "Department - Role is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  isKeyRole: z.boolean().optional(),

  // Additional Info
  reportsTo: z.string().optional(),
  managesOthers: z.boolean().optional(),
  totalComps: z.string().optional(),
  startDate: z.string().optional(),
});

type EmployeeProfileForm = z.infer<typeof employeeProfileSchema>;

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Intern",
  "Consultant",
];

interface EmployeeProfileDialogProps {
  memberId?: string;
  memberName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeProfileDialog({
  memberId,
  memberName,
  open,
  onOpenChange,
}: EmployeeProfileDialogProps) {
  const getProfile = useEmployeeProfilesStore((state) => state.getProfile);
  const setProfile = useEmployeeProfilesStore((state) => state.setProfile);
  
  const existingProfile = memberId ? getProfile(memberId) : undefined;

  const form = useForm<EmployeeProfileForm>({
    resolver: zodResolver(employeeProfileSchema),
    defaultValues: {
      name: memberName || "",
      departmentRole: "",
      employmentType: "",
      isKeyRole: false,
      reportsTo: "",
      managesOthers: false,
      totalComps: "",
      startDate: "",
    },
  });

  // Load existing profile data when dialog opens
  useEffect(() => {
    if (open && existingProfile) {
      form.reset({
        name: existingProfile.name,
        departmentRole: existingProfile.departmentRole,
        employmentType: existingProfile.employmentType,
        isKeyRole: existingProfile.isKeyRole,
        reportsTo: existingProfile.reportsTo || "",
        managesOthers: existingProfile.managesOthers,
        totalComps: existingProfile.totalComps || "",
        startDate: existingProfile.startDate || "",
      });
    } else if (open) {
      form.reset({
        name: memberName || "",
        departmentRole: "",
        employmentType: "",
        isKeyRole: false,
        reportsTo: "",
        managesOthers: false,
        totalComps: "",
        startDate: "",
      });
    }
  }, [open, existingProfile, memberName, form]);

  const onSubmit = (data: EmployeeProfileForm) => {
    if (!memberId) return;

    const profile: EmployeeProfile = {
      memberId,
      name: data.name,
      departmentRole: data.departmentRole,
      employmentType: data.employmentType,
      isKeyRole: data.isKeyRole ?? false,
      reportsTo: data.reportsTo,
      managesOthers: data.managesOthers ?? false,
      totalComps: data.totalComps,
      startDate: data.startDate,
    };

    setProfile(memberId, profile);
    toast.success("Employee profile saved");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ROLE / EMPLOYEE PROFILE</DialogTitle>
          <DialogDescription>
            Manage employee profile information
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Key Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">KEY INFO</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NAME</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Key Role */}
                <FormField
                  control={form.control}
                  name="isKeyRole"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">KEY ROLE</FormLabel>
                        <div className="text-muted-foreground text-xs">
                          Critical to organization
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
              </div>

              {/* Department - Role */}
              <FormField
                control={form.control}
                name="departmentRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DEPARTMENT - ROLE</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Engineering - Senior Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Employment Type */}
              <FormField
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EMPLOYMENT TYPE</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Additional Info Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">ADDITIONAL INFO</h3>
              </div>

              {/* Reports To */}
              <FormField
                control={form.control}
                name="reportsTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>REPORTS TO</FormLabel>
                    <FormControl>
                      <Input placeholder="Manager name or role" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Does he manage somebody? */}
              <FormField
                control={form.control}
                name="managesOthers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        DOES HE MANAGE SOMEBODY?
                      </FormLabel>
                      <div className="text-muted-foreground text-xs">
                        Yes/No question
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

              <div className="grid grid-cols-2 gap-4">
                {/* Total Comps */}
                <FormField
                  control={form.control}
                  name="totalComps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        TOTAL COMPS
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="e.g., $120,000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        START DATE
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Profile</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

