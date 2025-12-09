"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/** Default debounce delay for auto-save in milliseconds */
export const DEFAULT_AUTO_SAVE_DELAY = 2000;

/**
 * Mock auto-save hook for demo purposes.
 * It pretends to save and updates lastSaved.
 */
export function useAutoSave() {
  // In a real app, this would use the store and mutation
  // For now, we just mock the return values
  return {
    isSaving: false,
    lastSaved: new Date(),
  };
}



