"use client";

import React from "react";
import { Grid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ view, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-slate-200/90 bg-slate-50/80 p-1 shadow-2xs",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        title="Grid View"
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-150",
          view === "grid"
            ? "bg-blue-900 text-white shadow-xs"
            : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
        )}
      >
        <Grid size={14} />
        <span className="hidden sm:inline">Grid</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("list")}
        title="List View"
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-150",
          view === "list"
            ? "bg-blue-900 text-white shadow-xs"
            : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
        )}
      >
        <List size={14} />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
}
