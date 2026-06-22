import PortalModulePage from "@/components/PortalModulePage";

export default function MasterDashboardPage() {
  return (
    <PortalModulePage
      eyebrow="Master Admin"
      title="Global Portal Control"
      description="Monitor portal instances, tenant feature flags, organizations, users and platform audit activity across the full MahaCSR installation."
      actions={[
        { label: "Manage Tenants", href: "/master/tenants", primary: true },
        { label: "Audit Logs", href: "/master/audit-logs" }
      ]}
      metrics={[
        { label: "Scope", value: "Global" },
        { label: "Seed Tenant", value: "Maharashtra" },
        { label: "Feature Flags", value: "Tenant Level" }
      ]}
      rows={[
        ["MASTER-1", "Tenant and portal instance management", "Master Admin", "Enabled"],
        ["MASTER-2", "Organization approval visibility", "Portal Admin", "Tracked"],
        ["MASTER-3", "Audit trail and feature controls", "Global", "Enabled"]
      ]}
    />
  );
}
