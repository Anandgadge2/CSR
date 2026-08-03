"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAVIGATION_MANIFEST = void 0;
exports.getNavItemForRoute = getNavItemForRoute;
exports.isNavItemAllowed = isNavItemAllowed;
exports.NAVIGATION_MANIFEST = [
    // Overview
    {
        id: "dashboard",
        label: "Dashboard",
        route: "/dashboard",
        iconName: "LayoutDashboard",
        section: "Overview",
        requiredAnyPermissions: ["dashboard:view", "project:view", "pitch:view", "enquiry:view", "user:view"],
        ordering: 10,
        breadcrumbMetadata: { title: "Dashboard" }
    },
    {
        id: "profile",
        label: "Profile",
        route: "/profile",
        iconName: "User",
        section: "Overview",
        ordering: 20,
        breadcrumbMetadata: { title: "User Profile", parentRoute: "/dashboard" }
    },
    {
        id: "settings",
        label: "Settings",
        route: "/settings",
        iconName: "Settings",
        section: "Overview",
        ordering: 30,
        breadcrumbMetadata: { title: "Account Settings", parentRoute: "/dashboard" }
    },
    {
        id: "notifications",
        label: "Notifications",
        route: "/notifications",
        iconName: "Bell",
        section: "Overview",
        ordering: 40,
        breadcrumbMetadata: { title: "Notifications", parentRoute: "/dashboard" }
    },
    // Applications
    {
        id: "enquiries",
        label: "Corporate Enquiries",
        route: "/enquiries",
        iconName: "FileText",
        section: "Applications",
        requiredAnyPermissions: ["enquiry:view", "enquiry:create", "enquiry:respond"],
        ordering: 10,
        breadcrumbMetadata: { title: "Corporate Enquiries", parentRoute: "/dashboard" }
    },
    {
        id: "pitches",
        label: "Government Pitches",
        route: "/pitches",
        iconName: "Send",
        section: "Applications",
        requiredAnyPermissions: ["pitch:view", "pitch:create", "pitch:verify", "pitch:approve", "pitch:assign"],
        ordering: 20,
        breadcrumbMetadata: { title: "Government Pitches", parentRoute: "/dashboard" }
    },
    {
        id: "interests",
        label: "Corporate Interests",
        route: "/interests",
        iconName: "Heart",
        section: "Applications",
        requiredAnyPermissions: ["interest:view", "interest:express", "interest:create"],
        ordering: 30,
        breadcrumbMetadata: { title: "Corporate Interests", parentRoute: "/dashboard" }
    },
    {
        id: "assessments",
        label: "Feasibility Assessments",
        route: "/assessments",
        iconName: "ClipboardCheck",
        section: "Applications",
        requiredAnyPermissions: ["assessment:view", "assessment:create", "assessment:review", "assessment:decide"],
        ordering: 40,
        breadcrumbMetadata: { title: "Feasibility Assessments", parentRoute: "/dashboard" }
    },
    {
        id: "requirements",
        label: "CSR Requirements",
        route: "/requirements",
        iconName: "ListTodo",
        section: "Applications",
        requiredAnyPermissions: ["requirement:view", "requirement:create", "requirement:verify", "requirement:approve"],
        ordering: 50,
        breadcrumbMetadata: { title: "CSR Requirements", parentRoute: "/dashboard" }
    },
    {
        id: "marketplace",
        label: "CSR Marketplace",
        route: "/marketplace",
        iconName: "Store",
        section: "Applications",
        requiredAnyPermissions: ["requirement:view", "pitch:view", "project:view"],
        ordering: 60,
        breadcrumbMetadata: { title: "CSR Marketplace", parentRoute: "/dashboard" }
    },
    {
        id: "helpdesk",
        label: "Helpdesk & Support",
        route: "/helpdesk",
        iconName: "HelpCircle",
        section: "Applications",
        requiredAnyPermissions: ["helpdesk:view", "query:respond", "dashboard:view"],
        ordering: 70,
        breadcrumbMetadata: { title: "Helpdesk", parentRoute: "/dashboard" }
    },
    {
        id: "grievances",
        label: "Grievance Redressal",
        route: "/grievances",
        iconName: "AlertTriangle",
        section: "Applications",
        requiredAnyPermissions: ["grievance:view", "grievance:resolve"],
        ordering: 80,
        breadcrumbMetadata: { title: "Grievances", parentRoute: "/dashboard" }
    },
    // Projects
    {
        id: "convergence-projects",
        label: "Projects Overview",
        route: "/convergence-projects",
        iconName: "Briefcase",
        section: "Projects",
        requiredAnyPermissions: ["project:view", "project:create", "project:update", "project:approve", "project:assign"],
        ordering: 10,
        breadcrumbMetadata: { title: "Projects", parentRoute: "/dashboard" }
    },
    {
        id: "assignments",
        label: "Project Assignments",
        route: "/assignments",
        iconName: "UserCheck",
        section: "Projects",
        requiredAnyPermissions: ["project:assign", "pitch:assign", "user:assign-role"],
        ordering: 20,
        breadcrumbMetadata: { title: "Assignments", parentRoute: "/convergence-projects" }
    },
    {
        id: "milestones",
        label: "Milestones Tracking",
        route: "/milestones",
        iconName: "Flag",
        section: "Projects",
        requiredAnyPermissions: ["milestone:update", "milestone:verify", "project:view"],
        ordering: 30,
        breadcrumbMetadata: { title: "Milestones", parentRoute: "/convergence-projects" }
    },
    {
        id: "inspections",
        label: "Field Inspections",
        route: "/inspections",
        iconName: "Search",
        section: "Projects",
        requiredAnyPermissions: ["inspection:create", "inspection:view"],
        ordering: 40,
        breadcrumbMetadata: { title: "Field Inspections", parentRoute: "/convergence-projects" }
    },
    {
        id: "handover",
        label: "Project Handover",
        route: "/handover",
        iconName: "CheckCircle",
        section: "Projects",
        requiredAnyPermissions: ["requirement:handover", "project:close"],
        ordering: 50,
        breadcrumbMetadata: { title: "Project Handover", parentRoute: "/convergence-projects" }
    },
    // Organizations
    {
        id: "organizations",
        label: "Organizations Directory",
        route: "/admin/organizations",
        iconName: "Building2",
        section: "Organizations",
        requiredAnyPermissions: ["organization:view", "organization:update", "organization:approve"],
        ordering: 10,
        breadcrumbMetadata: { title: "Organizations", parentRoute: "/dashboard" }
    },
    {
        id: "companies",
        label: "Corporate Partners",
        route: "/admin/companies",
        iconName: "Building",
        section: "Organizations",
        requiredAnyPermissions: ["organization:view", "company_profile:manage"],
        ordering: 20,
        breadcrumbMetadata: { title: "Corporate Partners", parentRoute: "/admin/organizations" }
    },
    {
        id: "ngo-registry",
        label: "Implementing Agencies",
        route: "/admin/ngo-registry",
        iconName: "Users",
        section: "Organizations",
        requiredAnyPermissions: ["organization:view", "ngo_login:create"],
        ordering: 30,
        breadcrumbMetadata: { title: "Implementing Agencies", parentRoute: "/admin/organizations" }
    },
    {
        id: "organization-onboarding",
        label: "Org Onboarding Status",
        route: "/organization/onboarding",
        iconName: "FileCheck",
        section: "Organizations",
        ordering: 40,
        breadcrumbMetadata: { title: "Onboarding Status", parentRoute: "/dashboard" }
    },
    {
        id: "sub-logins",
        label: "Sub-Logins Management",
        route: "/organization/sub-logins",
        iconName: "UserPlus",
        section: "Organizations",
        requiredAnyPermissions: ["organization:manage-users", "user:create"],
        ordering: 50,
        breadcrumbMetadata: { title: "Sub-Logins", parentRoute: "/dashboard" }
    },
    // Finance and Monitoring
    {
        id: "fund-releases",
        label: "CSR Fund Monitoring",
        route: "/fund-releases",
        iconName: "DollarSign",
        section: "Finance and Monitoring",
        requiredAnyPermissions: ["fund:view", "fund:commit", "fund:release", "fund:verify"],
        ordering: 10,
        breadcrumbMetadata: { title: "Fund Monitoring", parentRoute: "/dashboard" }
    },
    {
        id: "reports",
        label: "Analytics & Reports",
        route: "/reports",
        iconName: "BarChart3",
        section: "Finance and Monitoring",
        requiredAnyPermissions: ["report:view", "report:generate", "report:export"],
        ordering: 20,
        breadcrumbMetadata: { title: "Reports", parentRoute: "/dashboard" }
    },
    {
        id: "audit-logs",
        label: "Audit Trail",
        route: "/audit-logs",
        iconName: "ShieldAlert",
        section: "Finance and Monitoring",
        requiredAnyPermissions: ["user:view", "audit:view", "role:view"],
        ordering: 30,
        breadcrumbMetadata: { title: "Audit Trail", parentRoute: "/dashboard" }
    },
    // Administration
    {
        id: "user-management",
        label: "User Management",
        route: "/admin/user-management",
        iconName: "UserCog",
        section: "Administration",
        requiredAnyPermissions: ["user:view", "user:create", "user:update", "user:assign-role"],
        ordering: 10,
        breadcrumbMetadata: { title: "User Management", parentRoute: "/dashboard" }
    },
    {
        id: "access-control",
        label: "Access Control",
        route: "/admin/access-control",
        iconName: "Shield",
        section: "Administration",
        requiredAnyPermissions: ["role:view", "role:create", "role:configure", "user:view", "user:assign-role"],
        ordering: 20,
        breadcrumbMetadata: { title: "Access Control Overview", parentRoute: "/dashboard" }
    },
    {
        id: "access-control-roles",
        label: "Roles",
        route: "/admin/access-control/roles",
        iconName: "ShieldCheck",
        section: "Administration",
        requiredAnyPermissions: ["role:view", "role:create", "role:configure"],
        ordering: 21,
        breadcrumbMetadata: { title: "Role Management", parentRoute: "/admin/access-control" }
    },
    {
        id: "access-control-permissions",
        label: "Permissions Catalog",
        route: "/admin/access-control/permissions",
        iconName: "Key",
        section: "Administration",
        requiredAnyPermissions: ["role:view"],
        ordering: 22,
        breadcrumbMetadata: { title: "Permissions Catalog", parentRoute: "/admin/access-control" }
    },
    {
        id: "access-control-assignments",
        label: "Role Assignments",
        route: "/admin/access-control/assignments",
        iconName: "Users",
        section: "Administration",
        requiredAnyPermissions: ["user:view", "user:assign-role"],
        ordering: 23,
        breadcrumbMetadata: { title: "Role Assignments", parentRoute: "/admin/access-control" }
    },
    {
        id: "access-control-audit",
        label: "Access Audit Log",
        route: "/admin/access-control/audit",
        iconName: "Activity",
        section: "Administration",
        requiredAnyPermissions: ["user:view", "role:view"],
        ordering: 24,
        breadcrumbMetadata: { title: "Access Control Audit", parentRoute: "/admin/access-control" }
    },
    {
        id: "dnc-queue",
        label: "DNC Delegation Queue",
        route: "/assignments/dnc",
        iconName: "ShieldCheck",
        section: "Administration",
        requiredAnyPermissions: ["project:view", "project:assign"],
        ordering: 25,
        breadcrumbMetadata: { title: "DNC Delegation Queue", parentRoute: "/dashboard" }
    },
    {
        id: "gov-admin-queue",
        label: "Dept Officer Queue",
        route: "/assignments/gov-admin",
        iconName: "Building2",
        section: "Administration",
        requiredAnyPermissions: ["project:view", "project:assign"],
        ordering: 26,
        breadcrumbMetadata: { title: "Department Officer Queue", parentRoute: "/dashboard" }
    },
    {
        id: "onboarding-approvals",
        label: "Onboarding Approvals",
        route: "/admin/onboarding-approvals",
        iconName: "CheckSquare",
        section: "Administration",
        requiredAnyPermissions: ["organization:approve", "organization:reject"],
        ordering: 30,
        breadcrumbMetadata: { title: "Onboarding Approvals", parentRoute: "/dashboard" }
    },
    {
        id: "sla-config",
        label: "SLA Configuration",
        route: "/admin/sla-config",
        iconName: "Sliders",
        section: "Administration",
        requiredAnyPermissions: ["role:configure", "user:view"],
        ordering: 40,
        breadcrumbMetadata: { title: "SLA Configuration", parentRoute: "/dashboard" }
    }
];
function getNavItemForRoute(pathname) {
    let matched;
    for (const item of exports.NAVIGATION_MANIFEST) {
        if (pathname === item.route || pathname.startsWith(item.route + "/")) {
            if (!matched || item.route.length > matched.route.length) {
                matched = item;
            }
        }
    }
    return matched;
}
function isNavItemAllowed(item, hasPermission, isSuperAdmin) {
    if (isSuperAdmin)
        return true;
    if (item.requiredAllPermissions && item.requiredAllPermissions.length > 0) {
        const hasAll = item.requiredAllPermissions.every((p) => hasPermission(p));
        if (!hasAll)
            return false;
    }
    if (item.requiredAnyPermissions && item.requiredAnyPermissions.length > 0) {
        const hasAny = item.requiredAnyPermissions.some((p) => hasPermission(p));
        if (!hasAny)
            return false;
    }
    return true;
}
