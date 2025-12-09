"use client";

import { create } from "zustand";

export type EmployeeProfile = {
  memberId: string;
  name: string;
  departmentRole: string;
  employmentType: string;
  isKeyRole: boolean;
  reportsTo?: string;
  managesOthers: boolean;
  totalComps?: string; // e.g., "$120,000"
  startDate?: string;
};

type EmployeeProfilesState = {
  profiles: Map<string, EmployeeProfile>;
  setProfile: (memberId: string, profile: EmployeeProfile) => void;
  getProfile: (memberId: string) => EmployeeProfile | undefined;
  getAllProfiles: () => EmployeeProfile[];
};

export const useEmployeeProfilesStore = create<EmployeeProfilesState>(
  (set, get) => ({
    profiles: new Map(),

    setProfile: (memberId, profile) => {
      set((state) => {
        const newProfiles = new Map(state.profiles);
        newProfiles.set(memberId, profile);
        return { profiles: newProfiles };
      });
    },

    getProfile: (memberId) => {
      return get().profiles.get(memberId);
    },

    getAllProfiles: () => {
      return Array.from(get().profiles.values());
    },
  }),
);

/**
 * Calculate salary metrics from employee profiles
 */
export function calculateSalaryMetrics(profiles: EmployeeProfile[]) {
  const salaries = profiles
    .map((p) => {
      if (!p.totalComps) return null;
      // Extract number from string like "$120,000" or "120000"
      const cleaned = p.totalComps.replace(/[^0-9]/g, "");
      return cleaned ? parseFloat(cleaned) : null;
    })
    .filter((s): s is number => s !== null);

  if (salaries.length === 0) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  const total = salaries.reduce((sum, s) => sum + s, 0);
  const average = total / salaries.length;
  const min = Math.min(...salaries);
  const max = Math.max(...salaries);

  return {
    total,
    average,
    min,
    max,
    count: salaries.length,
  };
}

/**
 * Calculate employment type distribution
 */
export function calculateEmploymentTypeMetrics(profiles: EmployeeProfile[]) {
  const distribution: Record<string, number> = {};

  profiles.forEach((profile) => {
    const type = profile.employmentType || "Unknown";
    distribution[type] = (distribution[type] || 0) + 1;
  });

  return distribution;
}



