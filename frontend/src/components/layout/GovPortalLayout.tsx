"use client";

import { ReactNode } from "react";
import "@/styles/gov-theme.css";

interface GovPortalLayoutProps {
  children: ReactNode;
  userRole?: string;
  activeNav?: string;
  showSidebar?: boolean;
}


export default function GovPortalLayout({ children }: GovPortalLayoutProps) {
  return (
    <div className="w-full min-w-0 flex-grow">
      {children}
    </div>
  );
}
