// Permission Badge — Risk-level color-coded permission key display
"use client";

import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/accessControl";

interface PermissionBadgeProps {
  permKey: string;
  riskLevel?: RiskLevel;
  isDelegable?: boolean;
  description?: string;
  className?: string;
}

const riskColors: Record<RiskLevel, string> = {
  LOW: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200/60",
  HIGH: "bg-amber-50 text-amber-800 border-amber-200/60",
  CRITICAL: "bg-red-50 text-red-700 border-red-200/60",
};

export function PermissionBadge({
  permKey,
  riskLevel = "LOW",
  isDelegable,
  description,
  className,
}: PermissionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border",
        riskColors[riskLevel],
        className
      )}
      title={description ? `${permKey}: ${description}` : permKey}
      aria-label={`Permission ${permKey}, risk level ${riskLevel}${isDelegable === false ? ", non-delegable" : ""}`}
    >
      {permKey}
      {isDelegable === false && (
        <span className="text-[9px] text-slate-400" aria-hidden="true">🔒</span>
      )}
    </span>
  );
}

// Added / Removed permission for diff views
export function AddedPermissionBadge({ permKey }: { permKey: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
      <span aria-hidden="true">+</span>
      {permKey}
    </span>
  );
}

export function RemovedPermissionBadge({ permKey }: { permKey: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200/60 line-through">
      <span aria-hidden="true">−</span>
      {permKey}
    </span>
  );
}
