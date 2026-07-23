"use client";

/**
 * NAV_REGISTRY — single source of truth for authenticated sidebar navigation.
 *
 * Replaces the large per-role if/else in SaaSLayout.getSidebarItems(). Each
 * role (and a set of pathname-prefix fallbacks for deep links before the user
 * object loads) maps to an ordered list of NavItem entries. The SaaSLayout
 * consumer applies three orthogonal filters on top of this data:
 *   1. tenant feature flags   (item.featureKey)
 *   2. action permissions     (item.requiredPermission via hasPermission)
 *   3. page-visibility        (isNavItemVisible → page:<slug>:view)
 * SUPER_ADMIN short-circuits every permission check (isAdmin in hasPermission).
 *
 * Keep nav destinations in sync with the PAGE_REGISTRY in ./pageRegistry so
 * page-visibility filtering resolves correctly.
 */
import {
  Building2, Landmark, Mail, Layers, Sparkles, Award, Coins, Compass,
  FileText, BarChart2, HelpCircle, ShieldCheck, BookOpen, ShieldAlert,
  Clock, Users, Globe2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Hidden when the tenant has this feature flag explicitly disabled. */
  featureKey?: string;
  /** Hidden unless hasPermission(requiredPermission) is true. */
  requiredPermission?: string;
}

// ── Shared organization-scoped menus (reused across several roles) ──
const departmentItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "Organization Onboarding", href: "/organization/onboarding", icon: Landmark },
  { label: "Onboarding Status", href: "/organization/onboarding/status", icon: Clock },
  { label: "Create Pitch", href: "/pitches/create", icon: Sparkles },
  { label: "My Pitches", href: "/pitches", icon: Compass },
  { label: "Track Status", href: "/track", icon: Clock },
  { label: "Create Requirement", href: "/requirements/create", icon: Sparkles, featureKey: "enableRequirementCreation" },
  { label: "My Requirements", href: "/requirements", icon: Compass, featureKey: "enableRequirementCreation" },
  { label: "Company Interest", href: "/interests", icon: Compass, featureKey: "enableCompanyInterest" },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Handover", href: "/handover", icon: Layers },
  { label: "Reports", href: "/reports", icon: BarChart2, featureKey: "enableReportsExport" },
];

const companyItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "My Enquiries", href: "/enquiries", icon: Mail },
  { label: "Track Status", href: "/track", icon: Clock },
  { label: "Organization Onboarding", href: "/organization/onboarding", icon: Landmark },
  { label: "Onboarding Status", href: "/organization/onboarding/status", icon: Clock },
  { label: "Project Marketplace", href: "/marketplace", icon: Compass, featureKey: "enableCSRMarketplace" },
  { label: "My Interests", href: "/interests", icon: Sparkles, featureKey: "enableCompanyInterest" },
  { label: "Implementing Agencies", href: "/agencies", icon: Building2 },
  { label: "Funded Projects", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Fund Releases", href: "/fund-releases", icon: Coins, featureKey: "enableFundDisbursement" },
  { label: "Reports", href: "/reports", icon: BarChart2, featureKey: "enableReportsExport" },
];

const ngoOrganizationItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "Organization Onboarding", href: "/organization/onboarding", icon: Landmark },
  { label: "Onboarding Status", href: "/organization/onboarding/status", icon: Clock },
  { label: "Proposal Requests", href: "/ngo/proposal-requests", icon: Compass, featureKey: "enableCSRMarketplace" },
  { label: "Assigned Projects", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Milestones", href: "/ngo/milestones", icon: Award, featureKey: "enableMilestoneMonitoring" },
  { label: "Fund Releases", href: "/fund-releases", icon: Coins, featureKey: "enableFundDisbursement" },
  { label: "Reports", href: "/reports", icon: BarChart2, featureKey: "enableReportsExport" },
];

const rmItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "Corporate Enquiries", href: "/enquiries", icon: Mail },
  { label: "Government Pitches", href: "/pitches", icon: Compass },
  { label: "Corporate Interests", href: "/interests", icon: Sparkles },
  { label: "Feasibility Reports", href: "/assessments", icon: FileText },
  { label: "Company Directory", href: "/companies", icon: Building2 },
  { label: "Communication Log", href: "/communications", icon: Mail },
  { label: "Reports", href: "/reports", icon: BarChart2 },
];

const jsItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "Corporate Enquiries", href: "/enquiries", icon: Mail },
  { label: "Assessment Reports", href: "/assessments", icon: FileText },
  { label: "Government Pitch Approvals", href: "/pitches", icon: Compass },
  { label: "Nodal Appointments", href: "/nodal-appointments", icon: Users },
  { label: "RM Escalations", href: "/escalations", icon: ShieldAlert },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
];

const secretaryItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "Escalations", href: "/escalations", icon: ShieldAlert },
  { label: "Final Decisions", href: "/decisions", icon: ShieldCheck },
  { label: "Feasibility Assessments", href: "/assessments", icon: FileText },
  { label: "Final Grievance Review", href: "/grievances", icon: ShieldAlert },
];

const stateCellItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "Corporate Enquiries", href: "/enquiries", icon: Mail },
  { label: "Government Pitches", href: "/pitches", icon: Compass },
  { label: "Grievance Queue", href: "/grievances", icon: ShieldAlert },
  { label: "Helpdesk Queue", href: "/helpdesk", icon: HelpCircle },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
];

const nodalItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Field Inspections", href: "/inspections", icon: Landmark },
  { label: "Agency Approvals", href: "/agencies", icon: ShieldCheck },
  { label: "Project Handover", href: "/handover", icon: Layers },
  { label: "Grievance Queue", href: "/grievances", icon: ShieldAlert },
];

const partnerItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "Organization Onboarding", href: "/organization/onboarding", icon: Landmark },
  { label: "Public Development Needs (Live)", href: "/public-development-needs", icon: Compass },
  { label: "My Enquiries", href: "/enquiries", icon: Mail },
  { label: "My Interests", href: "/interests", icon: Sparkles },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Implementing Agencies", href: "/agencies", icon: Building2 },
  { label: "Grievances", href: "/grievances", icon: ShieldAlert },
  { label: "Track Status", href: "/track", icon: Clock },
];

const agencyItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Grievances", href: "/grievances", icon: ShieldAlert },
  { label: "Track Status", href: "/track", icon: Clock },
];

const districtItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "Requirements", href: "/requirements", icon: Compass },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Inspections", href: "/inspections", icon: Landmark, featureKey: "enableMilestoneMonitoring" },
  { label: "Reports", href: "/reports", icon: BarChart2, featureKey: "enableReportsExport" },
];

const portalAdminItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "User Management", href: "/admin/user-management", icon: Users },
  { label: "Roles & Permissions", href: "/admin/roles-permissions", icon: ShieldAlert },
  { label: "Onboarding Approvals", href: "/admin/onboarding-approvals", icon: Landmark },
  { label: "Project Approvals", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Compliance Audit", href: "/audit-logs", icon: ShieldAlert },
  { label: "Reports", href: "/reports", icon: BarChart2 },
];

const adminItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "User Management", href: "/admin/user-management", icon: Users },
  { label: "Roles & Permissions", href: "/admin/roles-permissions", icon: ShieldAlert },
  { label: "Onboarding Approvals", href: "/admin/onboarding-approvals", icon: ShieldCheck },
  { label: "Government Departments", href: "/admin/organizations", icon: Landmark },
  { label: "Implementing Agencies", href: "/agencies", icon: Landmark },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Requirements Pending", href: "/requirements", icon: Clock, featureKey: "enableRequirementCreation" },
  { label: "Company Interests", href: "/interests", icon: Sparkles, featureKey: "enableCompanyInterest" },
  { label: "Agency Selection", href: "/admin/ngo-selection", icon: Award, featureKey: "enableNGOSelection" },
  { label: "Fund Monitoring", href: "/fund-releases", icon: Coins, featureKey: "enableFundDisbursement" },
  { label: "Projects", href: "/convergence-projects", icon: Compass },
  { label: "Reports", href: "/reports", icon: BarChart2 },
  { label: "Audit Trail", href: "/audit-logs", icon: FileText },
];

const masterItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "Tenants", href: "/master/tenants", icon: Globe2 },
  { label: "Create Tenant", href: "/master/tenants/create", icon: Sparkles },
  { label: "Organizations", href: "/master/organizations", icon: Landmark },
  { label: "Users", href: "/master/users", icon: Users },
  { label: "Audit Logs", href: "/audit-logs", icon: FileText },
  { label: "Settings", href: "/settings", icon: ShieldCheck },
];

const genericDashboardItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Layers },
  { label: "Onboarding", href: "/onboarding", icon: Landmark },
  { label: "Documents", href: "/onboarding/documents", icon: BookOpen },
  { label: "Queries", href: "/queries", icon: Mail },
  { label: "Projects", href: "/convergence-projects", icon: Compass },
  { label: "Payments", href: "/payments", icon: Coins },
  { label: "Fund Releases", href: "/fund-releases", icon: ShieldCheck },
  { label: "Reports", href: "/reports", icon: BarChart2 },
  { label: "Audit Logs", href: "/audit-logs", icon: FileText },
  { label: "Profile", href: "/profile", icon: Users },
  { label: "Settings", href: "/settings", icon: ShieldAlert },
];

const ngoDashboardItems: NavItem[] = [
  { label: "Overview", href: "/ngo-dashboard/overview", icon: Layers },
  { label: "Organization Profile", href: "/ngo-dashboard/profile", icon: Landmark },
  { label: "Projects", href: "/ngo-dashboard/projects", icon: Compass },
  { label: "Applications", href: "/ngo-dashboard/submitted", icon: Clock },
  { label: "Milestones", href: "/ngo-dashboard/milestones", icon: Award },
  { label: "Documents", href: "/ngo-dashboard/documents", icon: BookOpen },
  { label: "Reports", href: "/ngo-dashboard/reports", icon: BarChart2 },
];

const companyDashboardItems: NavItem[] = [
  { label: "Overview", href: "/company-dashboard/overview", icon: Layers },
  { label: "CSR Budget", href: "/company-dashboard/budget", icon: Coins },
  { label: "Project Directory", href: "/company-dashboard/marketplace", icon: Compass },
  { label: "Recommendations", href: "/company-dashboard/recommendations", icon: Sparkles },
  { label: "Funded Projects", href: "/company-dashboard/funded", icon: ShieldCheck },
  { label: "Milestones", href: "/company-dashboard/milestones", icon: Award },
  { label: "Partner NGOs", href: "/company-dashboard/ngos", icon: Landmark },
  { label: "Reports", href: "/company-dashboard/reports", icon: BarChart2 },
];

const publicFallbackItems: NavItem[] = [
  { label: "Overview Console", href: "/ngo-dashboard", icon: Layers },
  { label: "Directory", href: "/directory", icon: Compass },
  { label: "Collaboration Hub", href: "/chat", icon: Mail },
  { label: "Knowledge Center", href: "/knowledge", icon: BookOpen },
  { label: "About Mandate", href: "/about", icon: HelpCircle },
];

/**
 * Role → nav menu for roles that resolve to a fixed menu regardless of the
 * current pathname. Keys are the stored role identifier (dynamic role slug or
 * one of the three enum roles). These correspond to the `if (storedRole) {…}`
 * branches in the original getSidebarItems(), which returned early before any
 * pathname fallback ran. Multiple role keys can share the same array.
 */
export const ROLE_NAV: Record<string, NavItem[]> = {
  SUPER_ADMIN: adminItems,
  PLANNING_SECRETARY: secretaryItems,
  JOINT_SECRETARY: jsItems,
  DISTRICT_NODAL_OFFICER: nodalItems,
  DISTRICT_NODAL_CONSULTANT: nodalItems,
  RELATIONSHIP_MANAGER: rmItems,
  GOVERNMENT_OFFICER: departmentItems,
  COMPANY_ADMIN: companyItems,
  NGO_ADMIN: ngoOrganizationItems,
  // Alias mappings for backward compatibility
  CSR_RELATIONSHIP_MANAGER: rmItems,
  CORPORATE_USER: companyItems,
  CORPORATE_PARTNER: companyItems,
  COMPANY_MEMBER: companyItems,
  IMPLEMENTING_AGENCY_USER: ngoOrganizationItems,
  BENEFICIARY_AGENCY: departmentItems,
};

const GENERIC_DASHBOARD_PREFIXES = [
  "/dashboard", "/onboarding", "/queries", "/csr-projects", "/payments",
  "/fund-releases", "/reports", "/audit-logs", "/profile", "/settings",
];

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

/**
 * Resolve the sidebar nav for the current role + pathname + org type. This is a
 * pure function of its inputs; the SaaSLayout consumer applies feature-flag,
 * permission, and page-visibility filtering on top of the returned list.
 *
 * The rule order below is a faithful port of the original getSidebarItems():
 * the fixed-role menus (ROLE_NAV) win first (they returned early), THEN the
 * pathname-prefix fallbacks for the workflow areas, THEN the role-or-path
 * hybrid checks for the org/admin areas, matching the original's interleaving
 * exactly so e.g. a SUPER_ADMIN browsing /rm still sees the RM nav.
 */
export function resolveNavItems(params: {
  role?: string | null;
  pathname: string;
  organizationType?: string | null;
}): NavItem[] {
  const { role, pathname, organizationType } = params;
  const normalizedRole = role ? normalizeRole(role) : null;
  const roleIs = (...roles: string[]) => {
    const normalizedTargetRoles = roles.map(r => normalizeRole(r));
    return normalizedRole && normalizedTargetRoles.includes(normalizedRole);
  };

  if (roleIs("SUPER_ADMIN", "super-admin")) {
    const allMenus = [
      ...adminItems,
      ...departmentItems,
      ...companyItems,
      ...ngoOrganizationItems,
      ...rmItems,
      ...jsItems,
      ...secretaryItems,
      ...stateCellItems,
      ...nodalItems,
      ...partnerItems,
      ...agencyItems,
      ...districtItems,
      ...portalAdminItems,
      ...masterItems,
      ...genericDashboardItems
    ];
    const seen = new Set<string>();
    const uniqueItems: NavItem[] = [];
    for (const item of allMenus) {
      if (!seen.has(item.href)) {
        seen.add(item.href);
        uniqueItems.push(item);
      }
    }
    return uniqueItems;
  }

  // 1. Fixed-role menus (original `if (storedRole)` early returns).
  if (normalizedRole && ROLE_NAV[normalizedRole]) {
    return ROLE_NAV[normalizedRole];
  }

  // 2. Workflow-area pathname fallbacks (deep links / roles without a fixed menu).
  if (pathname.startsWith("/ngo-dashboard")) return ngoDashboardItems;
  if (pathname.startsWith("/company-dashboard")) return companyDashboardItems;
  if (pathname.startsWith("/rm")) return rmItems;
  if (pathname.startsWith("/js")) return jsItems;
  if (pathname.startsWith("/secretary")) return secretaryItems;
  if (pathname.startsWith("/state-cell")) return stateCellItems;
  if (pathname.startsWith("/nodal")) return nodalItems;
  if (pathname === "/partner" || pathname.startsWith("/partner/")) return partnerItems;
  if (pathname.startsWith("/agency")) return agencyItems;
  if (pathname.startsWith("/master")) return masterItems;

  // 3. Org/admin areas — role OR pathname (original order preserved).
  if (roleIs("BENEFICIARY_AGENCY", "GOVERNMENT_OFFICER") || pathname.startsWith("/beneficiary") || pathname.startsWith("/department")) {
    return departmentItems;
  }
  if (roleIs("COMPANY_ADMIN", "COMPANY_MEMBER") || pathname === "/company" || pathname.startsWith("/company/")) {
    return companyItems;
  }
  if (roleIs("NGO_ADMIN", "NGO_MEMBER") || pathname === "/ngo" || pathname.startsWith("/ngo/")) {
    return ngoOrganizationItems;
  }
  if (roleIs("DISTRICT_ADMIN") || pathname.startsWith("/district")) {
    return districtItems;
  }
  if (roleIs("PORTAL_ADMIN") || pathname.startsWith("/government-portal")) {
    return portalAdminItems;
  }
  if (roleIs("SUPER_ADMIN", "CSR_ADMIN") || pathname.startsWith("/admin")) {
    return adminItems;
  }

  // 4. Organization onboarding area: disambiguate by org type / role.
  if (pathname.startsWith("/organization")) {
    if (
      pathname.startsWith("/organization/onboarding/department") ||
      roleIs("BENEFICIARY_AGENCY", "GOVERNMENT_OFFICER") ||
      organizationType === "GOVERNMENT_DEPARTMENT"
    ) {
      return departmentItems;
    }
    if (
      pathname.startsWith("/organization/onboarding/company") ||
      roleIs("COMPANY_ADMIN", "COMPANY_MEMBER") ||
      organizationType === "CSR_COMPANY"
    ) {
      return companyItems;
    }
    if (roleIs("NGO_ADMIN", "NGO_MEMBER") || organizationType === "NGO") {
      return ngoOrganizationItems;
    }
    return [
      { label: "Onboarding", href: "/organization/onboarding", icon: Landmark },
      { label: "Status", href: "/organization/onboarding/status", icon: Clock },
      { label: "Users", href: "/organization/users", icon: Users },
      { label: "Roles", href: "/organization/roles", icon: ShieldAlert },
      { label: "Settings", href: "/organization/settings", icon: ShieldCheck },
    ];
  }

  // 5. Generic authenticated dashboard shell.
  if (GENERIC_DASHBOARD_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return genericDashboardItems;
  }

  // 6. Legacy standalone dashboard shells.
  if (pathname.startsWith("/ngo-dashboard")) return ngoDashboardItems;
  if (pathname.startsWith("/company-dashboard")) return companyDashboardItems;

  // 7. Final public fallback.
  return publicFallbackItems;
}
