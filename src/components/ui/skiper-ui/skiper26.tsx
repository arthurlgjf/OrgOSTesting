"use client";

import { useEffect, useState, useCallback } from "react";

import { useTheme } from "next-themes";
import { motion } from "framer-motion";

// Simplified theme toggle hook
export const useThemeToggle = ({
  variant = "circle",
  start = "center",
}: {
  variant?: string;
  start?: string;
} = {}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark);
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  return { isDark, toggleTheme };
};



