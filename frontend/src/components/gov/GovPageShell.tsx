"use client";

import { ReactNode } from "react";
import "../../styles/gov-theme.css";

interface GovPageShellProps {
  breadcrumb: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Common inner-page wrapper with breadcrumb, title, subtitle, and right-side actions.
 * Uses the existing gov-page-header CSS class.
 */
export default function GovPageShell({
  breadcrumb,
  title,
  description,
  actions,
  children,
}: GovPageShellProps) {
  return (
    <>
      <div className="gov-page-header">
        <div className="gov-breadcrumb">{breadcrumb}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 className="gov-page-title">{title}</h1>
            {description && <p className="gov-page-description">{description}</p>}
          </div>
          {actions && <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>{actions}</div>}
        </div>
      </div>
      {children}
    </>
  );
}
