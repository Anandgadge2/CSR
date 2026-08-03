"use client";

import {
  Building2, Landmark, Mail, Layers, Sparkles, Award, Coins, Compass,
  FileText, BarChart3, HelpCircle, ShieldCheck, ShieldAlert,
  Clock, Users, Globe2, LayoutDashboard, User, Settings, Bell,
  ListTodo, Store, AlertTriangle, Briefcase, UserCheck, Flag, Search,
  CheckCircle, Building, FileCheck, UserPlus, UserCog, Sliders, CheckSquare, Send
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NAVIGATION_MANIFEST, NavItemDef, isNavItemAllowed } from "./navigationManifest";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  section: string;
  featureKey?: string;
  requiredPermission?: string;
  requiredAnyPermissions?: string[];
  requiredAllPermissions?: string[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  User,
  Settings,
  Bell,
  FileText,
  Send,
  Heart: Sparkles,
  ClipboardCheck: FileText,
  ListTodo,
  Store,
  HelpCircle,
  AlertTriangle,
  Briefcase,
  UserCheck,
  Flag,
  Search,
  CheckCircle,
  Building2,
  Building,
  Users,
  FileCheck,
  UserPlus,
  DollarSign: Coins,
  BarChart3,
  ShieldAlert,
  UserCog,
  ShieldCheck,
  CheckSquare,
  Sliders,
  Landmark,
  Compass,
  Clock,
  Layers,
  Sparkles,
  Award,
  Coins,
  Mail,
  Globe2
};

export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Compass;
}

export function normalizeRole(role: string): string {
  if (!role) return "";
  const upper = role.toUpperCase().trim();
  if (upper === "SUPER ADMIN" || upper === "SUPER-ADMIN" || upper === "SUPER_ADMIN" || upper === "PORTAL ADMIN" || upper === "PORTAL_ADMIN") return "SUPER_ADMIN";
  if (upper === "PLANNING SECRETARY" || upper === "PLANNING-SECRETARY" || upper === "PLANNING_SECRETARY") return "PLANNING_SECRETARY";
  if (upper === "JOINT SECRETARY" || upper === "JOINT-SECRETARY" || upper === "JOINT_SECRETARY") return "JOINT_SECRETARY";
  if (upper === "DISTRICT NODAL OFFICER" || upper === "DISTRICT-NODAL-OFFICER" || upper === "DISTRICT_NODAL_OFFICER" || upper === "NODAL_OFFICER") return "DISTRICT_NODAL_OFFICER";
  if (upper === "DISTRICT NODAL CONSULTANT" || upper === "DISTRICT-NODAL-CONSULTANT" || upper === "DISTRICT_NODAL_CONSULTANT") return "DISTRICT_NODAL_CONSULTANT";
  if (upper === "CSR RELATIONSHIP MANAGER" || upper === "RELATIONSHIP MANAGER" || upper === "RELATIONSHIP-MANAGER" || upper === "RELATIONSHIP_MANAGER" || upper === "CSR_RELATIONSHIP_MANAGER") return "RELATIONSHIP_MANAGER";
  if (upper === "GOVERNMENT OFFICER" || upper === "GOVERNMENT-OFFICER" || upper === "GOVERNMENT_OFFICER" || upper === "BENEFICIARY AGENCY" || upper === "BENEFICIARY-AGENCY" || upper === "BENEFICIARY_AGENCY") return "GOVERNMENT_OFFICER";
  if (upper === "CORPORATE ADMIN" || upper === "COMPANY ADMIN" || upper === "COMPANY-ADMIN" || upper === "COMPANY_ADMIN" || upper === "CORPORATE USER" || upper === "CORPORATE_USER" || upper === "CORPORATE_PARTNER") return "COMPANY_ADMIN";
  if (upper === "NGO ADMIN" || upper === "NGO-ADMIN" || upper === "NGO_ADMIN" || upper === "IMPLEMENTING AGENCY USER" || upper === "IMPLEMENTING_AGENCY_USER") return "NGO_ADMIN";
  return upper.replace(/[-\s]/g, "_");
}

export function resolveNavItems(params: {
  role?: string | null;
  pathname?: string;
  hasPermission: (perm: string) => boolean;
  isSuperAdmin: boolean;
}): NavItem[] {
  const { hasPermission, isSuperAdmin } = params;

  const allowedManifestItems = NAVIGATION_MANIFEST.filter((item) =>
    isNavItemAllowed(item, hasPermission, isSuperAdmin)
  );

  return allowedManifestItems.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.route,
    icon: resolveIcon(item.iconName),
    section: item.section,
    featureKey: item.featureFlag,
    requiredAnyPermissions: item.requiredAnyPermissions,
    requiredAllPermissions: item.requiredAllPermissions
  }));
}

