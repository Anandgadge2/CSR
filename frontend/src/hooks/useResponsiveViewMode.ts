"use client";

import { useState, useEffect } from "react";
import { ViewMode } from "@/components/ui/ViewToggle";

/**
 * Custom hook to manage list/grid view mode based on screen width:
 * - Desktop mode (width >= 768px): default to "list"
 * - Mobile mode (width < 768px): default to "grid"
 *
 * User manual toggle takes precedence once clicked.
 */
export function useResponsiveViewMode(initialView?: ViewMode) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (initialView) return initialView;
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768 ? "list" : "grid";
    }
    return "list";
  });

  const [hasUserToggled, setHasUserToggled] = useState<boolean>(Boolean(initialView));

  useEffect(() => {
    if (hasUserToggled) return;

    const handleResize = () => {
      if (typeof window !== "undefined") {
        const isDesktop = window.innerWidth >= 768;
        setViewMode(isDesktop ? "list" : "grid");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hasUserToggled]);

  const changeViewMode = (mode: ViewMode) => {
    setHasUserToggled(true);
    setViewMode(mode);
  };

  return [viewMode, changeViewMode] as const;
}
