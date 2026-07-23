/**
 * Expanded per-page/module permissions.
 * Each tuple: [key, description, module]
 *
 * Naming convention:  <module>:<action>
 * Standard actions: view, create, update, delete, assign, approve, import, export
 */
export const PERMISSIONS = [
  // ── Dashboard ──
  // Core access + the permission-gated widget/section families the unified
  // Dashboard Engine renders. Each key gates a cross-cutting dashboard block;
  // entity-specific widgets reuse their own module perms (enquiry:view, etc.).
  ["dashboard:view", "View dashboard", "dashboard"],
  ["dashboard:widget-kpis", "See headline KPI cards on the dashboard", "dashboard"],
  ["dashboard:widget-workqueue", "See the personal work-queue widget", "dashboard"],
  ["dashboard:widget-sla", "See SLA / escalation timers on the dashboard", "dashboard"],
  ["dashboard:widget-approvals", "See the pending-approvals widget", "dashboard"],
  ["dashboard:widget-charts", "See analytics charts on the dashboard", "dashboard"],
  ["dashboard:widget-activity", "See the recent-activity feed on the dashboard", "dashboard"],
  ["dashboard:widget-quick-actions", "See quick-action shortcuts on the dashboard", "dashboard"],
  ["dashboard:analytics-global", "See platform-wide (unscoped) analytics on the dashboard", "dashboard"],

  // ── Requirements ──
  ["requirement:view", "View CSR requirements", "requirements"],
  ["requirement:create", "Create department CSR requirements", "requirements"],
  ["requirement:update", "Update CSR requirements", "requirements"],
  ["requirement:delete", "Delete requirements", "requirements"],
  ["requirement:submit", "Submit requirements for approval", "requirements"],
  ["requirement:approve", "Approve requirements", "requirements"],
  ["requirement:publish", "Publish requirements", "requirements"],
  ["requirement:assign", "Assign requirements to officers", "requirements"],
  ["requirement:import", "Import requirements data", "requirements"],
  ["requirement:export", "Export requirements data", "requirements"],

  // ── Marketplace ──
  ["marketplace:view", "View CSR marketplace", "marketplace"],
  ["marketplace:create", "Create marketplace listings", "marketplace"],
  ["marketplace:update", "Update marketplace listings", "marketplace"],

  // ── Interests ──
  ["interest:view", "View company interests", "interests"],
  ["interest:create", "Create company interest", "interests"],
  ["interest:update", "Update company interest", "interests"],
  ["interest:delete", "Delete company interest", "interests"],
  ["interest:approve", "Approve company interests", "interests"],
  ["interest:import", "Import interests data", "interests"],
  ["interest:export", "Export interests data", "interests"],

  // ── Projects ──
  ["project:view", "View CSR projects", "projects"],
  ["project:create", "Create CSR projects", "projects"],
  ["project:update", "Update CSR projects", "projects"],
  ["project:delete", "Delete CSR projects", "projects"],
  ["project:approve", "Approve CSR projects", "projects"],
  ["project:assign", "Assign officers to approved projects", "projects"],
  ["project:import", "Import projects data", "projects"],
  ["project:export", "Export projects data", "projects"],

  // ── Milestones ──
  ["milestone:view", "View milestones", "milestones"],
  ["milestone:create", "Create milestones", "milestones"],
  ["milestone:update", "Update milestones", "milestones"],
  ["milestone:verify", "Verify milestones", "milestones"],

  // ── Funds ──
  ["fund:view", "View funds", "funds"],
  ["fund:create", "Create fund entries", "funds"],
  ["fund:update", "Update fund entries", "funds"],
  ["fund:delete", "Delete fund entries", "funds"],
  ["fund:commit", "Commit funds", "funds"],
  ["fund:release", "Release funds", "funds"],
  ["fund:verify-utilization", "Verify fund utilization", "funds"],
  ["fund:import", "Import funds data", "funds"],
  ["fund:export", "Export funds data", "funds"],

  // ── Reports ──
  ["report:view", "View reports", "reports"],
  ["report:create", "Create reports", "reports"],
  ["report:update", "Update reports", "reports"],
  ["report:delete", "Delete reports", "reports"],
  ["report:import", "Import reports data", "reports"],
  ["report:export", "Export reports data", "reports"],

  // ── Organization ──
  ["organization:view", "View organizations", "organization"],
  ["organization:create", "Create organizations", "organization"],
  ["organization:update", "Update organizations", "organization"],
  ["organization:delete", "Delete organizations", "organization"],
  ["organization:approve", "Approve organizations", "organization"],
  ["organization:suspend", "Suspend organizations", "organization"],
  ["organization:import", "Import organization data", "organization"],
  ["organization:export", "Export organization data", "organization"],

  // ── Users ──
  ["user:view", "View users", "users"],
  ["user:create", "Create users", "users"],
  ["user:invite", "Invite organization users", "users"],
  ["user:update", "Update organization users", "users"],
  ["user:delete", "Delete users", "users"],
  ["user:import", "Import users data", "users"],
  ["user:export", "Export users data", "users"],

  // ── Roles ──
  ["role:view", "View roles", "roles"],
  ["role:create", "Create roles", "roles"],
  ["role:update", "Update roles", "roles"],
  ["role:delete", "Delete roles", "roles"],
  ["role:configure", "Configure roles for users", "roles"],
  ["role:assignable_list", "List assignable roles for officers", "roles"],

  // ── Permissions ──
  ["permission:view", "View permissions", "permissions"],
  ["permission:configure", "Configure permissions and groups", "permissions"],

  // ── Enquiries ──
  ["enquiry:view", "View corporate enquiries", "enquiries"],
  ["enquiry:create", "Create corporate enquiries", "enquiries"],
  ["enquiry:update", "Update corporate enquiries", "enquiries"],
  ["enquiry:delete", "Delete corporate enquiries", "enquiries"],
  ["enquiry:assign", "Assign relationship managers to enquiries", "enquiries"],
  ["enquiry:contact", "Record corporate contact interactions", "enquiries"],
  ["enquiry:import", "Import enquiries data", "enquiries"],
  ["enquiry:export", "Export enquiries data", "enquiries"],

  // ── Assignments ──
  ["officer:create", "Create and invite new officers", "assignments"],
  ["officer:search", "Search existing officers", "assignments"],
  ["district_mapping:manage", "Manage district nodal officer mappings", "assignments"],

  // ── Workflow ──
  ["workflow:view", "View workflow stage and history", "workflow"],
  ["workflow:update", "Update workflow configuration", "workflow"],
  ["workflow:system_transition", "Perform system workflow transitions", "workflow"],

  // ── Features ──
  ["feature-toggle:view", "View feature toggles", "features"],
  ["feature-toggle:update", "Update feature toggles", "features"],

  // ── Audit ──
  ["audit:view", "View audit logs", "audit"],
  ["audit:export", "Export audit logs", "audit"],

  // ── Bulk / destructive capabilities ──
  // Requested cross-cutting permission types. These gate the corresponding
  // UI affordances (row-level trash, multi-select toolbar, Excel importer).
  ["record:delete-single", "Delete a single record", "bulk-ops"],
  ["record:delete-bulk", "Delete multiple selected records at once", "bulk-ops"],
  ["record:import-excel", "Bulk import records from an Excel/CSV file", "bulk-ops"],
] as const;

/**
 * Page-visibility registry — the single source of truth for which
 * navigable pages exist and the permission that governs each one.
 *
 * Each entry seeds a PAGE-type permission with key `page:<slug>:view`.
 * When a role holds that permission the page's nav entry renders and its
 * route is reachable; when the role lacks it the nav entry is hidden AND
 * the route is blocked (403). SUPER_ADMIN bypasses all of this.
 *
 * Tuple: [slug, label, route, group]
 */
export const PAGE_REGISTRY = [
  // Shared
  ["dashboard", "Dashboard", "/dashboard", "General"],
  ["profile", "Profile", "/profile", "General"],
  ["settings", "Settings", "/settings", "General"],
  ["reports", "Reports", "/reports", "General"],
  ["audit-trail", "Audit Trail", "/audit-logs", "General"],

  // Admin / platform administration
  ["admin-dashboard", "Admin Dashboard", "/dashboard", "Administration"],
  ["user-management", "User Management", "/admin/user-management", "Administration"],
  ["roles-permissions", "Roles & Permissions", "/admin/roles-permissions", "Administration"],
  ["onboarding-approvals", "Onboarding Approvals", "/admin/onboarding-approvals", "Administration"],
  ["organizations", "Organizations", "/admin/organizations", "Administration"],
  ["companies", "Companies", "/admin/companies", "Administration"],
  ["ngo-registry", "Implementing Agencies", "/admin/ngo-registry", "Administration"],
  ["sla-config", "SLA Configuration", "/admin/sla-config", "Administration"],

  // Workflow / applications
  ["enquiries", "Corporate Enquiries", "/enquiries", "Workflow"],
  ["pitches", "Government Pitches", "/pitches", "Workflow"],
  ["feasibility", "Feasibility Assessments", "/feasibility", "Workflow"],
  ["assignments", "Assignments", "/assignments", "Workflow"],
  ["convergence-projects", "Projects", "/convergence-projects", "Workflow"],
  ["milestones", "Milestones", "/milestones", "Workflow"],
  ["funds", "Fund Monitoring", "/admin/fund-monitoring", "Workflow"],

  // Organization self-service
  ["org-users", "Organization Users", "/organization/users", "Organization"],
  ["org-roles", "Organization Roles", "/organization/roles", "Organization"],
  ["org-onboarding", "Organization Onboarding", "/organization/onboarding", "Organization"],
  ["sub-logins", "Implementing Agency Logins", "/organization/sub-logins", "Organization"],
] as const;

export type PageSlug = (typeof PAGE_REGISTRY)[number][0];

/** Permission key that governs visibility of a page slug. */
export const pageViewKey = (slug: string) => `page:${slug}:view`;

/**
 * PAGE-type permissions derived from the registry. Kept separate from
 * PERMISSIONS (which are ACTION-type) so the seed can stamp the right
 * `type` column. Tuple shape matches PERMISSIONS: [key, description, module].
 */
export const PAGE_PERMISSIONS = PAGE_REGISTRY.map(
  ([slug, label]) => [pageViewKey(slug), `Access the ${label} page`, "pages"] as const
);

/**
 * Stable numeric IDs for system-seeded roles.
 * These are deterministically assigned in the seed script and NEVER change,
 * even if the role is renamed. Used for dashboard routing only —
 * permission checks always go through the DB.
 */
// The 9 seeded, assignable roles. IDs are stable and never change; dropped
// roles (BENEFICIARY_AGENCY=9 folded into GOVERNMENT_OFFICER, STATE_CSR_CELL=10
// dropped, CORPORATE_USER=11 is a base-enum companion, not a seeded org role)
// leave intentional gaps so surviving IDs stay put.
export const SYSTEM_ROLE_IDS = {
  SUPER_ADMIN: 1,
  PLANNING_SECRETARY: 2,
  JOINT_SECRETARY: 3,
  DISTRICT_NODAL_OFFICER: 4,
  DISTRICT_NODAL_CONSULTANT: 5,
  RELATIONSHIP_MANAGER: 6,
  GOVERNMENT_OFFICER: 7,
  COMPANY_ADMIN: 8,
  NGO_ADMIN: 9,
} as const;

/**
 * Default permission sets per seeded role.
 * Used ONLY by the seed script to populate OrganizationRolePermission rows.
 * At runtime, all permission resolution is 100 % database-driven.
 */
export const SEED_ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  SUPER_ADMIN: PERMISSIONS.map(([key]) => key), // all permissions

  PLANNING_SECRETARY: [
    "dashboard:view",
    "dashboard:widget-kpis", "dashboard:widget-approvals", "dashboard:widget-sla",
    "dashboard:widget-charts", "dashboard:widget-activity", "dashboard:widget-quick-actions",
    "dashboard:analytics-global",
    "organization:view", "organization:approve", "organization:suspend",
    "requirement:view", "requirement:approve", "requirement:publish", "requirement:export",
    "interest:view",
    "project:view", "project:approve", "project:export",
    "fund:view", "fund:release", "fund:verify-utilization", "fund:export",
    "milestone:view", "milestone:verify",
    "report:view", "report:export",
    "audit:view", "audit:export",
  ],

  JOINT_SECRETARY: [
    "dashboard:view",
    "dashboard:widget-kpis", "dashboard:widget-approvals", "dashboard:widget-sla",
    "dashboard:widget-workqueue", "dashboard:widget-charts", "dashboard:widget-activity",
    "dashboard:widget-quick-actions",
    "organization:view", "organization:approve",
    "requirement:view", "requirement:approve", "requirement:publish", "requirement:export",
    "interest:view", "interest:approve",
    "project:view", "project:approve", "project:assign", "project:export",
    "officer:search", "role:assignable_list", "district_mapping:manage",
    "workflow:view",
    "fund:view", "fund:release", "fund:export",
    "report:view", "report:export",
    "enquiry:view", "enquiry:assign",
  ],

  DISTRICT_NODAL_OFFICER: [
    "dashboard:view",
    "dashboard:widget-kpis", "dashboard:widget-workqueue", "dashboard:widget-sla",
    "dashboard:widget-activity", "dashboard:widget-quick-actions",
    "organization:view",
    "requirement:view",
    "project:view", "project:update", "project:assign",
    "officer:create", "officer:search", "role:assignable_list",
    "workflow:view",
    "milestone:view", "milestone:verify",
    "fund:view", "fund:verify-utilization",
    "report:view",
  ],

  DISTRICT_NODAL_CONSULTANT: [
    "dashboard:view",
    "organization:view",
    "requirement:view",
    "project:view", "project:update",
    "report:view",
  ],

  RELATIONSHIP_MANAGER: [
    "dashboard:view",
    "dashboard:widget-kpis", "dashboard:widget-workqueue", "dashboard:widget-sla",
    "dashboard:widget-activity", "dashboard:widget-quick-actions",
    "organization:view",
    "requirement:view",
    "interest:view",
    "project:view",
    "report:view",
    "enquiry:view", "enquiry:contact", "enquiry:create", "enquiry:update",
  ],

  NGO_ADMIN: [
    "dashboard:view",
    "dashboard:widget-kpis", "dashboard:widget-workqueue",
    "dashboard:widget-activity", "dashboard:widget-quick-actions",
    "organization:view", "organization:update",
    "user:view", "user:invite", "user:update",
    "marketplace:view",
    "project:view", "project:create", "project:update",
    "milestone:view", "milestone:create", "milestone:update",
    "fund:view",
    "report:view",
  ],

  COMPANY_ADMIN: [
    "dashboard:view",
    "dashboard:widget-kpis", "dashboard:widget-workqueue",
    "dashboard:widget-activity", "dashboard:widget-quick-actions",
    "organization:view", "organization:update",
    "user:view", "user:invite", "user:update",
    "marketplace:view",
    "interest:view", "interest:create",
    "project:view",
    "fund:view", "fund:commit",
    "report:view",
  ],

  CORPORATE_USER: [
    "dashboard:view",
    "dashboard:widget-kpis", "dashboard:widget-workqueue",
    "dashboard:widget-activity", "dashboard:widget-quick-actions",
    "organization:view", "organization:update",
    "user:view", "user:invite", "user:update",
    "marketplace:view",
    "interest:view", "interest:create",
    "fund:view", "fund:commit",
    "report:view",
    "project:view",
  ],

  GOVERNMENT_OFFICER: [
    "dashboard:view",
    "dashboard:widget-kpis", "dashboard:widget-workqueue",
    "dashboard:widget-activity", "dashboard:widget-quick-actions",
    "organization:view", "organization:update",
    "user:view", "user:invite", "user:update",
    "requirement:view", "requirement:create", "requirement:update", "requirement:submit",
    "interest:view",
    "project:view",
    "report:view",
  ],
};

/**
 * Default PAGE-visibility grants per seeded role, expressed as page slugs
 * (from PAGE_REGISTRY). The seed converts each slug to its `page:<slug>:view`
 * key. SUPER_ADMIN is intentionally omitted — it bypasses all checks and is
 * granted every permission (ACTION + PAGE) directly in the seed.
 *
 * These are sensible defaults only; a Super Admin can toggle any page for any
 * role at runtime via the roles UI (checkbox lit = visible, unlit = hidden).
 */
export const SEED_ROLE_PAGES: Record<string, readonly string[]> = {
  PLANNING_SECRETARY: [
    "dashboard", "profile", "reports", "audit-trail",
    "organizations", "convergence-projects", "milestones", "funds",
    "enquiries", "pitches", "feasibility",
  ],
  JOINT_SECRETARY: [
    "dashboard", "profile", "reports", "audit-trail",
    "organizations", "convergence-projects", "assignments",
    "enquiries", "pitches", "feasibility", "funds",
  ],
  DISTRICT_NODAL_CONSULTANT: [
    "dashboard", "profile", "reports",
    "organizations", "convergence-projects", "assignments", "user-management",
  ],
  DISTRICT_NODAL_OFFICER: [
    "dashboard", "profile", "reports",
    "convergence-projects", "milestones", "assignments",
  ],
  RELATIONSHIP_MANAGER: [
    "dashboard", "profile", "reports",
    "enquiries", "pitches", "feasibility", "convergence-projects",
  ],
  NGO_ADMIN: [
    "dashboard", "profile", "reports",
    "org-users", "org-roles", "org-onboarding", "convergence-projects", "milestones",
  ],
  COMPANY_ADMIN: [
    "dashboard", "profile", "reports",
    "org-users", "org-roles", "org-onboarding", "sub-logins", "convergence-projects",
  ],
  CORPORATE_USER: [
    "dashboard", "profile", "reports",
    "org-users", "org-roles", "org-onboarding", "sub-logins", "enquiries", "convergence-projects",
  ],
  GOVERNMENT_OFFICER: [
    "dashboard", "profile", "reports",
    "org-users", "org-roles", "org-onboarding", "pitches", "convergence-projects",
  ],
};

/**
 * Cross-cutting bulk/destructive permissions granted to roles that manage
 * records (import spreadsheets, delete rows). Kept separate so the intent is
 * explicit and easy to audit.
 */
export const SEED_ROLE_BULK_OPS: Record<string, readonly string[]> = {
  PLANNING_SECRETARY: ["record:delete-single", "record:delete-bulk", "record:import-excel"],
  JOINT_SECRETARY: ["record:delete-single", "record:import-excel"],
  DISTRICT_NODAL_CONSULTANT: ["record:delete-single", "record:import-excel"],
  DISTRICT_NODAL_OFFICER: ["record:import-excel"],
  NGO_ADMIN: ["record:delete-single"],
  COMPANY_ADMIN: ["record:delete-single", "record:import-excel"],
  CORPORATE_USER: ["record:delete-single", "record:import-excel"],
  GOVERNMENT_OFFICER: ["record:delete-single", "record:import-excel"],
};

/**
 * Resolves the COMPLETE default permission-key set for a seeded role:
 * action permissions + bulk-ops + page-visibility keys. This is the single
 * function the seed uses so action and page grants never drift apart.
 */
export function resolveSeedRolePermissionKeys(permKey: string): string[] {
  const actions = SEED_ROLE_PERMISSIONS[permKey] ?? [];
  const bulk = SEED_ROLE_BULK_OPS[permKey] ?? [];
  const pages = (SEED_ROLE_PAGES[permKey] ?? []).map((slug) => pageViewKey(slug));
  return Array.from(new Set([...actions, ...bulk, ...pages]));
}
