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
  { label: "Dashboard", href: "/department/dashboard", icon: Layers },
  { label: "Organization Onboarding", href: "/organization/onboarding", icon: Landmark },
  { label: "Onboarding Status", href: "/organization/onboarding/status", icon: Clock },
  { label: "Create Pitch", href: "/department/pitches/create", icon: Sparkles },
  { label: "My Pitches", href: "/department/pitches", icon: Compass },
  { label: "Track Status", href: "/track", icon: Clock },
  { label: "Create Requirement", href: "/department/requirements/create", icon: Sparkles, featureKey: "enableRequirementCreation" },
  { label: "My Requirements", href: "/department/requirements", icon: Compass, featureKey: "enableRequirementCreation" },
  { label: "Company Interest", href: "/department/interests", icon: Compass, featureKey: "enableCompanyInterest" },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Handover", href: "/department/handover", icon: Layers },
  { label: "Reports", href: "/department/reports", icon: BarChart2, featureKey: "enableReportsExport" },
  { label: "Users", href: "/organization/users", icon: Users, requiredPermission: "user:update" },
  { label: "Roles", href: "/organization/roles", icon: ShieldAlert, requiredPermission: "role:view" },
  { label: "Settings", href: "/organization/settings", icon: ShieldCheck },
];

const companyItems: NavItem[] = [
  { label: "Dashboard", href: "/company/dashboard", icon: Layers },
  { label: "My Enquiries", href: "/partner/enquiries", icon: Mail },
  { label: "Track Status", href: "/track", icon: Clock },
  { label: "Organization Onboarding", href: "/organization/onboarding", icon: Landmark },
  { label: "Onboarding Status", href: "/organization/onboarding/status", icon: Clock },
  { label: "Project Marketplace", href: "/company/marketplace", icon: Compass, featureKey: "enableCSRMarketplace" },
  { label: "My Interests", href: "/company/interests", icon: Sparkles, featureKey: "enableCompanyInterest" },
  { label: "Implementing Agencies", href: "/partner/agencies", icon: Building2 },
  { label: "Funded Projects", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Fund Releases", href: "/company/funds", icon: Coins, featureKey: "enableFundDisbursement" },
  { label: "Reports", href: "/company/reports", icon: BarChart2, featureKey: "enableReportsExport" },
  { label: "Users", href: "/organization/users", icon: Users, requiredPermission: "user:update" },
  { label: "Roles", href: "/organization/roles", icon: ShieldAlert, requiredPermission: "role:view" },
  { label: "Settings", href: "/organization/settings", icon: ShieldCheck },
];

const ngoOrganizationItems: NavItem[] = [
  { label: "Dashboard", href: "/ngo/dashboard", icon: Layers },
  { label: "Organization Onboarding", href: "/organization/onboarding", icon: Landmark },
  { label: "Onboarding Status", href: "/organization/onboarding/status", icon: Clock },
  { label: "Proposal Requests", href: "/ngo/proposal-requests", icon: Compass, featureKey: "enableCSRMarketplace" },
  { label: "Assigned Projects", href: "/ngo/assigned-projects", icon: ShieldCheck },
  { label: "Milestones", href: "/ngo/milestones", icon: Award, featureKey: "enableMilestoneMonitoring" },
  { label: "Fund Releases", href: "/ngo/funds", icon: Coins, featureKey: "enableFundDisbursement" },
  { label: "Reports", href: "/ngo/reports", icon: BarChart2, featureKey: "enableReportsExport" },
  { label: "Users", href: "/organization/users", icon: Users, requiredPermission: "user:update" },
  { label: "Roles", href: "/organization/roles", icon: ShieldAlert, requiredPermission: "role:view" },
  { label: "Settings", href: "/organization/settings", icon: ShieldCheck },
];

const rmItems: NavItem[] = [
  { label: "Dashboard", href: "/rm/dashboard", icon: Layers },
  { label: "Corporate Enquiries", href: "/rm/enquiries", icon: Mail },
  { label: "Government Pitches", href: "/rm/government-pitches", icon: Compass },
  { label: "Corporate Interests", href: "/rm/interests", icon: Sparkles },
  { label: "Feasibility Reports", href: "/rm/assessments", icon: FileText },
  { label: "Company Directory", href: "/rm/companies", icon: Building2 },
  { label: "Communication Log", href: "/rm/communications", icon: Mail },
  { label: "Reports", href: "/rm/reports", icon: BarChart2 },
];

const jsItems: NavItem[] = [
  { label: "JS Dashboard", href: "/js/dashboard", icon: Layers },
  { label: "Corporate Enquiries", href: "/rm/enquiries", icon: Mail },
  { label: "Assessment Reports", href: "/js/assessments", icon: FileText },
  { label: "Government Pitch Approvals", href: "/js/government-pitches", icon: Compass },
  { label: "Nodal Appointments", href: "/js/nodal-appointments", icon: Users },
  { label: "RM Escalations", href: "/js/escalations", icon: ShieldAlert },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
];

const secretaryItems: NavItem[] = [
  { label: "Escalations", href: "/secretary/escalations", icon: ShieldAlert },
  { label: "Dashboard", href: "/secretary/dashboard", icon: Layers },
  { label: "Final Decisions", href: "/secretary/decisions", icon: ShieldCheck },
  { label: "JS Dashboard", href: "/js/dashboard", icon: Layers },
  { label: "Feasibility Assessments", href: "/js/assessments", icon: FileText },
  { label: "Final Grievance Review", href: "/state-cell/grievances", icon: ShieldAlert },
];

const stateCellItems: NavItem[] = [
  { label: "Dashboard", href: "/state-cell/dashboard", icon: Layers },
  { label: "Corporate Enquiries", href: "/rm/enquiries", icon: Mail },
  { label: "Government Pitches", href: "/rm/government-pitches", icon: Compass },
  { label: "Grievance Queue", href: "/state-cell/grievances", icon: ShieldAlert },
  { label: "Helpdesk Queue", href: "/state-cell/helpdesk", icon: HelpCircle },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
];

const nodalItems: NavItem[] = [
  { label: "Dashboard", href: "/nodal/dashboard", icon: Layers },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Field Inspections", href: "/nodal/inspections", icon: Landmark },
  { label: "Agency Approvals", href: "/nodal/agency-approvals", icon: ShieldCheck },
  { label: "Project Handover", href: "/nodal/handover", icon: Layers },
  { label: "Grievance Queue", href: "/nodal/grievances", icon: ShieldAlert },
];

const partnerItems: NavItem[] = [
  { label: "Dashboard", href: "/partner/dashboard", icon: Layers },
  { label: "Organization Onboarding", href: "/organization/onboarding", icon: Landmark },
  { label: "Public Development Needs (Live)", href: "/public-development-needs", icon: Compass },
  { label: "My Enquiries", href: "/partner/enquiries", icon: Mail },
  { label: "My Interests", href: "/company/interests", icon: Sparkles },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Implementing Agencies", href: "/partner/agencies", icon: Building2 },
  { label: "Grievances", href: "/grievances", icon: ShieldAlert },
  { label: "Track Status", href: "/track", icon: Clock },
];

const agencyItems: NavItem[] = [
  { label: "Dashboard", href: "/agency/dashboard", icon: Layers },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Grievances", href: "/grievances", icon: ShieldAlert },
  { label: "Track Status", href: "/track", icon: Clock },
];

const districtItems: NavItem[] = [
  { label: "Dashboard", href: "/district/dashboard", icon: Layers },
  { label: "Requirements", href: "/district/requirements", icon: Compass },
  { label: "Projects", href: "/convergence-projects", icon: ShieldCheck },
  { label: "Inspections", href: "/district/inspections", icon: Landmark, featureKey: "enableMilestoneMonitoring" },
  { label: "Reports", href: "/district/reports", icon: BarChart2, featureKey: "enableReportsExport" },
];

const portalAdminItems: NavItem[] = [
  { label: "Statewide Monitor", href: "/government-portal/statewide", icon: Layers },
  { label: "District Register", href: "/government-portal/district", icon: Compass },
  { label: "User Management", href: "/admin/user-management", icon: Users },
  { label: "Roles & Permissions", href: "/admin/roles-permissions", icon: ShieldAlert },
  { label: "Verification Queues", href: "/government-portal/ngo-verify", icon: Landmark },
  { label: "Project Approvals", href: "/government-portal/project-verify", icon: ShieldCheck },
  { label: "Compliance Audit", href: "/government-portal/compliance", icon: ShieldAlert },
  { label: "GIS Heatmap", href: "/government-portal/heatmaps", icon: Compass },
  { label: "Circulars", href: "/government-portal/circulars", icon: FileText },
  { label: "Reports", href: "/government-portal/reports", icon: BarChart2 },
];

const adminItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Layers },
  { label: "User Management", href: "/admin/user-management", icon: Users },
  { label: "Roles & Permissions", href: "/admin/roles-permissions", icon: ShieldAlert },
  { label: "Onboarding Approvals", href: "/admin/onboarding-approvals", icon: ShieldCheck },
  { label: "Government Departments", href: "/admin/organizations", icon: Landmark },
  { label: "Implementing Agencies", href: "/admin/ngo-registry", icon: Landmark },
  { label: "Companies", href: "/admin/companies", icon: Building2 },
  { label: "Requirements Pending", href: "/admin/requirements/pending", icon: Clock, featureKey: "enableRequirementCreation" },
  { label: "Company Interests", href: "/admin/company-interests", icon: Sparkles, featureKey: "enableCompanyInterest" },
  { label: "Agency Selection", href: "/admin/ngo-selection", icon: Award, featureKey: "enableNGOSelection" },
  { label: "Fund Monitoring", href: "/admin/fund-monitoring", icon: Coins, featureKey: "enableFundDisbursement" },
  { label: "Projects", href: "/convergence-projects", icon: Compass },
  { label: "Verification Queue", href: "/admin/applications", icon: Clock },
  { label: "Reports", href: "/admin/reports", icon: BarChart2 },
  { label: "Audit Trail", href: "/admin/audit-trail", icon: FileText },
];

const masterItems: NavItem[] = [
  { label: "Dashboard", href: "/master/dashboard", icon: Layers },
  { label: "Tenants", href: "/master/tenants", icon: Globe2 },
  { label: "Create Tenant", href: "/master/tenants/create", icon: Sparkles },
  { label: "Organizations", href: "/master/organizations", icon: Landmark },
  { label: "Users", href: "/master/users", icon: Users },
  { label: "Audit Logs", href: "/master/audit-logs", icon: FileText },
  { label: "Settings", href: "/master/settings", icon: ShieldCheck },
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
  CSR_RELATIONSHIP_MANAGER: rmItems,
  JOINT_SECRETARY: jsItems,
  PLANNING_SECRETARY: secretaryItems,
  STATE_CSR_CELL: stateCellItems,
  DISTRICT_NODAL_OFFICER: nodalItems,
  NODAL_OFFICER: nodalItems,
  CORPORATE_USER: partnerItems,
  CORPORATE_PARTNER: partnerItems,
  COMPANY_ADMIN: partnerItems,
  COMPANY_MEMBER: partnerItems,
  IMPLEMENTING_AGENCY_USER: agencyItems,
};

const GENERIC_DASHBOARD_PREFIXES = [
  "/dashboard", "/onboarding", "/queries", "/csr-projects", "/payments",
  "/fund-releases", "/reports", "/audit-logs", "/profile", "/settings",
];

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
  const roleIs = (...roles: string[]) => Boolean(role && roles.includes(role));

  // 1. Fixed-role menus (original `if (storedRole)` early returns).
  if (role && ROLE_NAV[role]) {
    return ROLE_NAV[role];
  }

  // 2. Workflow-area pathname fallbacks (deep links / roles without a fixed menu).
  if (pathname.startsWith("/rm")) return rmItems;
  if (pathname.startsWith("/js")) return jsItems;
  if (pathname.startsWith("/secretary")) return secretaryItems;
  if (pathname.startsWith("/state-cell")) return stateCellItems;
  if (pathname.startsWith("/nodal")) return nodalItems;
  if (pathname === "/partner" || pathname.startsWith("/partner/")) return partnerItems;
  if (pathname.startsWith("/agency")) return agencyItems;
  if (pathname.startsWith("/master")) return masterItems;

  // 3. Org/admin areas — role OR pathname (original order preserved).
  if (roleIs("BENEFICIARY_AGENCY") || pathname.startsWith("/beneficiary") || pathname.startsWith("/department")) {
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
      roleIs("BENEFICIARY_AGENCY") ||
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
