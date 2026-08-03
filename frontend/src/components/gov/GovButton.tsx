"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import { Loader2, LucideIcon } from "lucide-react";
import "@/styles/gov-theme.css";

interface GovButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "muted" | "danger" | "success" | "warning";
  loading?: boolean;
  loadingText?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
  className?: string;
}

export default function GovButton({
  children,
  variant = "primary",
  loading = false,
  loadingText,
  icon: Icon,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: GovButtonProps) {
  const variantClass = `gov-btn-${variant}`;
  const isDisabled = disabled || loading;

  return (
    <button
      className={`gov-btn ${variantClass} ${fullWidth ? "w-full" : ""} ${
        loading ? "opacity-85 cursor-wait select-none" : ""
      } ${className}`}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin text-current shrink-0" />
          <span>{loadingText || children}</span>
        </span>
      ) : (
        <span className="inline-flex items-center justify-center gap-2">
          {Icon && <Icon size={16} className="shrink-0" />}
          <span>{children}</span>
        </span>
      )}
    </button>
  );
}
