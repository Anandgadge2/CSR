"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovInput from "@/components/gov/GovInput";
import GovModal from "@/components/gov/GovModal";
import { useToastActions } from "@/components/ui/Toast";
import { Save, Check, Loader2 } from "lucide-react";
import "@/styles/gov-theme.css";

type Permission = {
  id: string;
  key: string;
  description: string;
  module: string;
  type?: "ACTION" | "PAGE";
};

type PageDef = {
  slug: string;
  label: string;
  route: string;
  group: string;
  permissionKey: string;
};

type PermissionGroup = {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
};

type DynamicRole = {
  id: string;
  name: string;
  description: string | null;
  scope: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  isSystemRole: boolean;
  isPermanent: boolean;
  category: string | null;
  displayOrder: number;
  permissions: string[];
};

const MATRIX_COLUMNS = [
  { label: "View", suffix: [":view", ":view-history", ":dashboard"] },
  { label: "Create", suffix: [":create", ":submit", ":commit"] },
  { label: "Edit", suffix: [":update", ":reverify"] },
  { label: "Delete", suffix: [":delete", ":suspend", ":disable"] },
  { label: "Assign", suffix: [":assign"] },
  { label: "Approve", suffix: [":approve", ":publish", ":verify", ":release", ":execute", ":verify-utilization"] }
];

const PERMISSION_TITLE_MAP: Record<string, { title: string; hint: string }> = {
  "dashboard:view": { title: "View Dashboard", hint: "Access the main unified dashboard." },
  "dashboard:widget-kpis": { title: "Headline KPI Cards", hint: "Display top metric summary cards on dashboard." },
  "dashboard:widget-workqueue": { title: "Work Queue Widget", hint: "Display pending work queue items." },
  "dashboard:widget-sla": { title: "SLA / Escalation Timers", hint: "Display SLA timers & escalation alerts." },
  "dashboard:widget-approvals": { title: "Pending Approvals Widget", hint: "Display pending approvals summary card." },
  "dashboard:widget-charts": { title: "Analytics Charts", hint: "Display analytics charts on dashboard." },
  "dashboard:widget-activity": { title: "Recent Activity Feed", hint: "Display recent audit trail activity." },
  "dashboard:widget-quick-actions": { title: "Quick Action Shortcuts", hint: "Display quick shortcut buttons." },

  "requirement:view": { title: "View CSR Requirements", hint: "Browse department CSR needs & requirements." },
  "requirement:create": { title: "Create CSR Requirements", hint: "Submit department CSR requirement." },
  "requirement:approve": { title: "Approve Requirements", hint: "Approve submitted CSR requirements." },

  "pitch:view": { title: "View Govt Pitches", hint: "View government development pitches." },
  "pitch:create": { title: "Create Govt Pitch", hint: "Create a new government development pitch." },
  "pitch:edit_before_approval": { title: "Edit Pitch Draft", hint: "Edit pitch before final approval." },
  "pitch:submit": { title: "Submit Pitch for Review", hint: "Submit pitch for review." },
  "pitch:approve": { title: "Approve Govt Pitches", hint: "Approve development pitches." },
  "pitch:reject": { title: "Reject Govt Pitches", hint: "Reject submitted pitches." },
  "pitch:verify": { title: "Verify Pitch Details", hint: "Verify feasibility & pitch documentation." },

  "assessment:view": { title: "View Feasibility Assessments", hint: "View need assessment reports." },
  "assessment:create": { title: "Create Assessment Report", hint: "Generate need assessment report." },
  "assessment:submit": { title: "Submit Assessment to JS", hint: "Send feasibility report to Joint Secretary." },

  "interest:view": { title: "View Corporate Interests", hint: "See expressions of interest." },
  "interest:express": { title: "Express Corporate Interest", hint: "Submit corporate interest in project." },
  "interest:approve": { title: "Approve Corporate Interest", hint: "Approve corporate project interest." },

  "project:view": { title: "View CSR Projects", hint: "View convergence projects." },
  "project:create": { title: "Create CSR Projects", hint: "Create new convergence project." },
  "project:approve": { title: "Approve CSR Projects", hint: "Approve project for execution." },
  "project:assign": { title: "Assign Project Officers", hint: "Assign nodal officers to project." },
  "project:close": { title: "Close Completed Projects", hint: "Mark completed projects closed." },

  "milestone:view": { title: "View Milestones", hint: "View project milestone progress." },
  "milestone:create": { title: "Create Milestones", hint: "Add milestone deliverables." },
  "milestone:verify": { title: "Verify Milestones", hint: "Verify milestone deliverables." },

  "inspection:upload": { title: "Upload Field Inspections", hint: "Upload inspection logs & reports." },
  "photo:upload": { title: "Upload Inspection Photos", hint: "Upload field photos." },
  "photo:upload_geotagged": { title: "Upload Geo-Tagged Photos", hint: "Upload GPS-tagged field photos." },

  "fund:view": { title: "View Funds & Utilization", hint: "View fund releases & UC status." },
  "fund:commit": { title: "Commit Corporate Funds", hint: "Pledge corporate CSR funds." },
  "fund:release": { title: "Release Funds to Agency", hint: "Release funds to implementing NGO." },
  "uc:upload": { title: "Upload Utilization Certificate (UC)", hint: "Upload signed UC document." },
  "bill:upload": { title: "Upload Expenditure Receipts", hint: "Upload bills & receipts." },

  "company_profile:manage": { title: "Manage Corporate Profile & KYC", hint: "Manage corporate organization details & KYC." },
  "organization:approve": { title: "Approve Organization Onboarding", hint: "Approve company, dept, or NGO onboarding." },

  "user:create": { title: "Create Users", hint: "Create user accounts." },
  "user:invite": { title: "Invite Org Users", hint: "Invite organization team members." },
  "user:activate": { title: "Activate User Accounts", hint: "Activate pending user accounts." },
  "user:suspend": { title: "Suspend User Accounts", hint: "Suspend user access." },

  "role:view": { title: "View System Roles", hint: "View role catalog." },
  "role:create": { title: "Create Custom Roles", hint: "Create dynamic role." },
  "role:configure": { title: "Configure Permissions Matrix", hint: "Edit role permission matrix." },

  "mou:sign": { title: "Sign MoU Agreement", hint: "Sign Memorandum of Understanding." },
  "audit:view": { title: "View Audit Logs", hint: "Inspect system audit trail." },
  "record:delete-single": { title: "Delete Single Record", hint: "Delete individual database record." },
  "record:delete-bulk": { title: "Bulk Delete Records", hint: "Delete multiple selected records." },
  "record:import-excel": { title: "Bulk Import Data", hint: "Bulk import records from Excel/CSV." },
};

function getFriendlyPermission(key: string, defaultDesc?: string) {
  const mapped = PERMISSION_TITLE_MAP[key];
  if (mapped) return mapped;
  const parts = key.split(":");
  const title = parts.map((p) => p.replace(/[-_]/g, " ")).join(" · ");
  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    hint: defaultDesc || key,
  };
}

export default function AdminRolesPermissionsPage() {
  const [loading, setLoading] = useState(true);
  const [dynamicRoles, setDynamicRoles] = useState<DynamicRole[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedRolePerms, setSelectedRolePerms] = useState<string[]>([]);
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("");
  const [roleTypeFilter, setRoleTypeFilter] = useState<"all" | "system" | "custom">("all");

  const [pages, setPages] = useState<PageDef[]>([]);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameForm, setRenameForm] = useState({ name: "", description: "" });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const toast = useToastActions();

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    scope: "GLOBAL",
    category: "General",
  });

  const [cloneForm, setCloneForm] = useState({ name: "", description: "" });

  const fetchData = async (preserveSelection = false) => {
    setLoading(true);
    setError("");
    try {
      const rolesResponse = await apiFetch<any>("/roles?limit=200");
      const rolesData = rolesResponse?.data || rolesResponse || {};
      const fetchedRoles: DynamicRole[] = rolesData?.roles || [];
      setDynamicRoles(fetchedRoles);
      if (fetchedRoles.length > 0 && (!preserveSelection || !selectedRoleId)) {
        setSelectedRoleId((curr) => curr && fetchedRoles.some((r) => r.id === curr) ? curr : fetchedRoles[0].id);
        const target = fetchedRoles.find((r) => r.id === selectedRoleId) || fetchedRoles[0];
        setSelectedRolePerms(target.permissions || []);
      }

      const groupsResponse = await apiFetch<any>("/roles/permission-groups");
      const groupsData = groupsResponse?.data || groupsResponse || [];
      const groupsList = Array.isArray(groupsData) ? groupsData : (groupsData?.groups || []);
      setPermissionGroups(Array.isArray(groupsList) ? groupsList : []);

      const pagesResponse = await apiFetch<any>("/roles/pages");
      const pagesData = pagesResponse?.data || pagesResponse || {};
      setPages(Array.isArray(pagesData?.pages) ? pagesData.pages : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    setJustSaved(false);
    const role = dynamicRoles.find((r) => r.id === roleId);
    if (role) setSelectedRolePerms(role.permissions || []);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const createdResponse = await apiFetch<any>("/roles", {
        method: "POST",
        body: JSON.stringify({
          name: roleForm.name.trim(),
          description: roleForm.description.trim(),
          scope: roleForm.scope,
          category: roleForm.category,
          permissions: newRolePerms,
        }),
      });
      const msg = `Role '${roleForm.name}' created successfully with selected permissions.`;
      setSuccess(msg);
      toast.success("Role Created", msg);
      setRoleModalOpen(false);
      setRoleForm({ name: "", description: "", scope: "GLOBAL", category: "General" });
      setNewRolePerms([]);
      await fetchData(true);
      const created = createdResponse?.data || createdResponse;
      if (created?.id) {
        setSelectedRoleId(created.id);
        setSelectedRolePerms(newRolePerms);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to create role";
      setError(errMsg);
      toast.error("Role Creation Failed", errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleCloneRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const clonedResponse = await apiFetch<any>(`/roles/${selectedRoleId}/clone`, {
        method: "POST",
        body: JSON.stringify({
          newName: cloneForm.name.trim(),
          newDescription: cloneForm.description.trim(),
        }),
      });
      setSuccess("Role cloned successfully.");
      toast.success("Role Cloned", `Role '${cloneForm.name}' created as a clone.`);
      setCloneModalOpen(false);
      setCloneForm({ name: "", description: "" });
      fetchData(true);
      const cloned = clonedResponse?.data || clonedResponse;
      if (cloned?.id) setSelectedRoleId(cloned.id);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to clone role";
      setError(errMsg);
      toast.error("Clone Failed", errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRoleStatus = async (role: DynamicRole, nextStatus: "ACTIVE" | "INACTIVE" | "ARCHIVED") => {
    setError("");
    setSuccess("");
    try {
      await apiFetch(`/roles/${role.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      const msg = `Role status updated to ${nextStatus}.`;
      setSuccess(msg);
      toast.success("Status Updated", msg);
      fetchData(true);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to update role status";
      setError(errMsg);
      toast.error("Update Failed", errMsg);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm("Are you sure you want to delete this custom role? This action cannot be undone.")) return;
    setError("");
    setSuccess("");
    try {
      await apiFetch(`/roles/${roleId}`, { method: "DELETE" });
      setSuccess("Role deleted successfully.");
      toast.success("Role Deleted", "Custom role deleted successfully.");
      setSelectedRoleId("");
      fetchData();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete role";
      setError(errMsg);
      toast.error("Delete Failed", errMsg);
    }
  };

  const handleRenameRole = async () => {
    if (!selectedRole) return;
    if (!renameForm.name.trim()) {
      setError("Role name cannot be empty.");
      toast.error("Validation Error", "Role name cannot be empty.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiFetch(`/roles/${selectedRole.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: renameForm.name.trim(),
          description: renameForm.description.trim(),
        }),
      });
      setSuccess("Role details updated.");
      toast.success("Role Updated", `Role renamed to '${renameForm.name.trim()}'.`);
      setRenameModalOpen(false);
      await fetchData(true);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to rename role";
      setError(errMsg);
      toast.error("Rename Failed", errMsg);
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permKey: string) => {
    setSelectedRolePerms((current) =>
      current.includes(permKey)
        ? current.filter((k) => k !== permKey)
        : [...current, permKey]
    );
  };

  const handleSaveMatrix = async () => {
    if (!selectedRoleId || !selectedRole) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiFetch(`/roles/${selectedRoleId}`, {
        method: "PUT",
        body: JSON.stringify({ permissions: selectedRolePerms }),
      });
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSavedTime(now);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 4000);

      const msg = `Matrix permissions updated for "${selectedRole.name}" (${selectedRolePerms.length} active permissions).`;
      setSuccess(msg);
      toast.success("Permission Matrix Saved", msg);

      setDynamicRoles((prev) =>
        prev.map((r) => (r.id === selectedRoleId ? { ...r, permissions: [...selectedRolePerms] } : r))
      );
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to save permission matrix";
      setError(errMsg);
      toast.error("Save Failed", errMsg);
    } finally {
      setSaving(false);
    }
  };

  const filteredRoles = dynamicRoles.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(roleSearchTerm.toLowerCase());
    const matchesType =
      roleTypeFilter === "all" ||
      (roleTypeFilter === "system" ? r.isSystemRole : !r.isSystemRole);
    return matchesSearch && matchesType;
  });

  const selectedRole = dynamicRoles.find((r) => r.id === selectedRoleId);

  const isMatrixDirty = Boolean(
    selectedRole &&
      (selectedRolePerms.length !== (selectedRole.permissions || []).length ||
        selectedRolePerms.some((p) => !(selectedRole.permissions || []).includes(p)) ||
        (selectedRole.permissions || []).some((p) => !selectedRolePerms.includes(p)))
  );

  // Filter permission groups based on search term
  const term = permissionSearchTerm.toLowerCase();
  const filteredGroups = permissionGroups.filter((g) => {
    if (!term) return true;
    if (g.name.toLowerCase().includes(term)) return true;
    return g.permissions.some(
      (p) =>
        p.key.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        getFriendlyPermission(p.key).title.toLowerCase().includes(term)
    );
  });

  return (
    <GovPortalLayout>
      <GovPageHeader
        title="Roles & Permissions"
        breadcrumb="Admin / Security / Roles"
        description="Configure dynamic enterprise roles and map action permissions via the matrix grid. System and custom roles are both listed."
        actions={
          <GovButton variant="primary" onClick={() => setRoleModalOpen(true)}>
            Create Dynamic Role
          </GovButton>
        }
      />

      <div className="gov-container">
        {error && <div className="gov-alert gov-alert-danger gov-mb-4">{error}</div>}
        {success && <div className="gov-alert gov-alert-success gov-mb-4">{success}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
          {/* Left Panel: Roles List */}
          <GovCard>
            <GovCardHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                <GovCardTitle>Roles ({filteredRoles.length})</GovCardTitle>
                <input
                  type="text"
                  className="gov-input"
                  placeholder="Search roles..."
                  value={roleSearchTerm}
                  onChange={(e) => setRoleSearchTerm(e.target.value)}
                  style={{ padding: "6px 10px", fontSize: "13px" }}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  {(["all", "system", "custom"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setRoleTypeFilter(t)}
                      style={{
                        flex: 1,
                        padding: "4px 0",
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 6,
                        border: "1px solid " + (roleTypeFilter === t ? "#1e3a8a" : "#e2e8f0"),
                        backgroundColor: roleTypeFilter === t ? "#1e3a8a" : "#fff",
                        color: roleTypeFilter === t ? "#fff" : "#64748b",
                        cursor: "pointer",
                        textTransform: "uppercase",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </GovCardHeader>
            <GovCardBody style={{ padding: 0 }}>
              {loading ? (
                <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>Loading roles...</div>
              ) : filteredRoles.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {filteredRoles.map((role) => {
                    const isSelected = role.id === selectedRoleId;
                    return (
                      <div
                        key={role.id}
                        onClick={() => selectRole(role.id)}
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          backgroundColor: isSelected ? "#f1f5f9" : "transparent",
                          borderLeft: isSelected ? "4px solid #1e3a8a" : "4px solid transparent",
                          borderBottom: "1px solid #e2e8f0",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                          <div style={{ fontWeight: 600, fontSize: "14px", color: isSelected ? "#1e3a8a" : "#334155" }}>
                            {role.name}
                          </div>
                          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: "8px",
                                backgroundColor: role.isSystemRole ? "#fef3c7" : "#eff6ff",
                                color: role.isSystemRole ? "#92400e" : "#1e40af"
                              }}
                            >
                              {role.isSystemRole ? "SYSTEM" : "CUSTOM"}
                            </span>
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: "8px",
                                backgroundColor: role.status === "ACTIVE" ? "#ecfdf5" : role.status === "ARCHIVED" ? "#f1f5f9" : "#fff1f2",
                                color: role.status === "ACTIVE" ? "#047857" : role.status === "ARCHIVED" ? "#475569" : "#be123c"
                              }}
                            >
                              {role.status}
                            </span>
                          </div>
                        </div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: 4 }}>
                          {(role.permissions || []).length} permissions
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>No roles found.</div>
              )}
            </GovCardBody>
          </GovCard>

          {/* Right Panel: Role permissions matrix */}
          <div>
            {selectedRole ? (
              <GovCard>
                <GovCardHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <GovCardTitle style={{ fontSize: "20px" }}>{selectedRole.name}</GovCardTitle>
                        {selectedRole.isPermanent && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              backgroundColor: "#fee2e2",
                              color: "#991b1b",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              letterSpacing: "0.5px"
                            }}
                          >
                            ROOT SUPER ADMIN - FULL ACCESS
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "13px", color: "#64748b", marginTop: 4 }}>
                        {selectedRole.description || "No description provided."}
                      </p>
                    </div>

                    {!selectedRole.isPermanent && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <GovButton
                          variant="secondary"
                          onClick={() => {
                            setRenameForm({ name: selectedRole.name, description: selectedRole.description || "" });
                            setRenameModalOpen(true);
                          }}
                        >
                          Rename
                        </GovButton>
                        <GovButton
                          variant="secondary"
                          onClick={() => {
                            setCloneForm({ name: `${selectedRole.name} (Copy)`, description: selectedRole.description || "" });
                            setCloneModalOpen(true);
                          }}
                        >
                          Clone Role
                        </GovButton>
                        {selectedRole.status === "ACTIVE" ? (
                          <GovButton variant="secondary" onClick={() => handleUpdateRoleStatus(selectedRole, "INACTIVE")}>
                            Deactivate
                          </GovButton>
                        ) : (
                          <GovButton variant="secondary" onClick={() => handleUpdateRoleStatus(selectedRole, "ACTIVE")}>
                            Activate
                          </GovButton>
                        )}
                        <GovButton variant="danger" onClick={() => handleDeleteRole(selectedRole.id)}>
                          Delete Role
                        </GovButton>
                      </div>
                    )}
                  </div>
                </GovCardHeader>
                <GovCardBody>
                  <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <h4 style={{ fontWeight: 600, color: "#1e293b", margin: 0 }}>Permissions Matrix Mapping</h4>
                        {justSaved ? (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              backgroundColor: "#dcfce7",
                              color: "#15803d",
                              padding: "2px 10px",
                              borderRadius: "12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              border: "1px solid #86efac"
                            }}
                          >
                            <Check size={12} /> Matrix Saved
                          </span>
                        ) : isMatrixDirty ? (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              backgroundColor: "#fef3c7",
                              color: "#b45309",
                              padding: "2px 10px",
                              borderRadius: "12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              border: "1px solid #fcd34d"
                            }}
                          >
                            ● Unsaved changes
                          </span>
                        ) : lastSavedTime ? (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              backgroundColor: "#f1f5f9",
                              color: "#64748b",
                              padding: "2px 10px",
                              borderRadius: "12px",
                              border: "1px solid #e2e8f0"
                            }}
                          >
                            Saved at {lastSavedTime}
                          </span>
                        ) : null}
                      </div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Active permissions assigned: <strong>{selectedRolePerms.length}</strong>
                      </span>
                    </div>
                    <input
                      type="text"
                      className="gov-input"
                      placeholder="Filter permissions (e.g. pitch, fund, user)..."
                      value={permissionSearchTerm}
                      onChange={(e) => setPermissionSearchTerm(e.target.value)}
                      style={{ padding: "6px 12px", fontSize: "13px", width: "280px" }}
                    />
                  </div>

                  <div
                    className="gov-table-container"
                    style={{
                      border: justSaved ? "2px solid #22c55e" : "1px solid #e2e8f0",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: justSaved ? "0 0 16px rgba(34, 197, 94, 0.25)" : "none",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <table className="gov-table" style={{ margin: 0 }}>
                      <thead style={{ backgroundColor: "#f8fafc" }}>
                        <tr>
                          <th style={{ width: "280px" }}>Permission Group / Module</th>
                          {MATRIX_COLUMNS.map((col) => (
                            <th key={col.label} style={{ textAlign: "center", width: "100px" }}>{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGroups.map((group) => (
                          <tr key={group.id}>
                            <td style={{ fontWeight: 600, color: "#334155" }}>
                              <div style={{ fontSize: "14px" }}>{group.name}</div>
                              {group.description && (
                                <div style={{ fontSize: "11px", fontWeight: "normal", color: "#94a3b8", marginTop: 2 }}>
                                  {group.description}
                                </div>
                              )}
                            </td>
                            {MATRIX_COLUMNS.map((col) => {
                              const matchedPerm = group.permissions.find((p) =>
                                col.suffix.some((suf) => p.key.endsWith(suf))
                              );

                              if (!matchedPerm) {
                                return (
                                  <td key={col.label} style={{ textAlign: "center", verticalAlign: "middle" }}>
                                    <span style={{ color: "#cbd5e1" }}>-</span>
                                  </td>
                                );
                              }

                              const friendly = getFriendlyPermission(matchedPerm.key, matchedPerm.description || undefined);
                              const isChecked = selectedRolePerms.includes(matchedPerm.key);
                              const disabled = selectedRole.isPermanent;

                              return (
                                <td key={col.label} style={{ textAlign: "center", verticalAlign: "middle" }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={disabled}
                                    onChange={() => togglePermission(matchedPerm.key)}
                                    style={{
                                      width: "18px",
                                      height: "18px",
                                      cursor: disabled ? "not-allowed" : "pointer",
                                      accentColor: "#1e3a8a"
                                    }}
                                    title={`${friendly.title} (${matchedPerm.key}): ${friendly.hint}`}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Non-standard Capabilities list */}
                  {filteredGroups.some((g) =>
                    g.permissions.some((p) =>
                      !p.key.startsWith("page:") &&
                      !MATRIX_COLUMNS.some((col) => col.suffix.some((suf) => p.key.endsWith(suf)))
                    )
                  ) && (
                    <div style={{ marginTop: 24 }}>
                      <h5 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>Bulk & Action Capabilities</h5>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
                        {filteredGroups.flatMap((g) =>
                          g.permissions.filter((p) =>
                            !p.key.startsWith("page:") &&
                            !MATRIX_COLUMNS.some((col) => col.suffix.some((suf) => p.key.endsWith(suf)))
                          )
                        ).map((perm) => {
                          const friendly = getFriendlyPermission(perm.key, perm.description || undefined);
                          const isChecked = selectedRolePerms.includes(perm.key);
                          const disabled = selectedRole.isPermanent;
                          return (
                            <label
                              key={perm.id}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 10,
                                padding: "10px 12px",
                                backgroundColor: isChecked ? "#f0f9ff" : "#f8fafc",
                                borderRadius: "6px",
                                border: "1px solid " + (isChecked ? "#bae6fd" : "#e2e8f0"),
                                cursor: disabled ? "not-allowed" : "pointer"
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={disabled}
                                onChange={() => togglePermission(perm.key)}
                                style={{ marginTop: 2, accentColor: "#1e3a8a" }}
                              />
                              <div>
                                <div style={{ fontWeight: 700, fontSize: "13px", color: "#1e293b" }}>
                                  {friendly.title}
                                </div>
                                <div style={{ fontSize: "10px", color: "#0284c7", fontWeight: 600, fontFamily: "monospace", marginTop: 1 }}>
                                  {perm.key}
                                </div>
                                <div style={{ fontSize: "11px", color: "#64748b", marginTop: 3, lineHeight: "1.3" }}>
                                  {friendly.hint}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Page Access */}
                  {pages.length > 0 && (
                    <div style={{ marginTop: 28 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <h5 style={{ fontWeight: 600, color: "#1e293b", margin: 0 }}>Page Access</h5>
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          Lit = page visible & reachable · Unlit = hidden + route blocked
                        </span>
                      </div>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: "0 0 12px" }}>
                        Controls which pages this role sees in the sidebar and can open directly. Super Admin always sees every page.
                      </p>
                      {Object.entries(
                        pages.reduce((acc, pg) => {
                          (acc[pg.group] ||= []).push(pg);
                          return acc;
                        }, {} as Record<string, PageDef[]>)
                      ).map(([groupName, groupPages]) => (
                        <div key={groupName} style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", marginBottom: 8 }}>
                            {groupName}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 8 }}>
                            {groupPages.map((pg) => {
                              const isChecked = selectedRolePerms.includes(pg.permissionKey);
                              const disabled = selectedRole.isPermanent;
                              return (
                                <label
                                  key={pg.slug}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "9px 12px",
                                    backgroundColor: isChecked ? "#eff6ff" : "#f8fafc",
                                    borderRadius: 6,
                                    border: "1px solid " + (isChecked ? "#bfdbfe" : "#e2e8f0"),
                                    cursor: disabled ? "not-allowed" : "pointer",
                                  }}
                                  title={pg.route}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={disabled}
                                    onChange={() => togglePermission(pg.permissionKey)}
                                    style={{ width: 16, height: 16, accentColor: "#1e3a8a", cursor: disabled ? "not-allowed" : "pointer" }}
                                  />
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>{pg.label}</div>
                                    <div style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pg.route}</div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!selectedRole.isPermanent && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 24,
                        paddingTop: 16,
                        borderTop: "1px solid #e2e8f0",
                        flexWrap: "wrap",
                        gap: 12
                      }}
                    >
                      <div style={{ fontSize: "13px" }}>
                        {justSaved ? (
                          <span style={{ color: "#16a34a", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <Check size={16} /> Matrix saved successfully!
                          </span>
                        ) : isMatrixDirty ? (
                          <span style={{ color: "#d97706", fontWeight: 600 }}>
                            You have unsaved changes on this permission matrix.
                          </span>
                        ) : (
                          <span style={{ color: "#64748b", fontWeight: 400 }}>
                            All permission changes are up to date.
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveMatrix}
                        disabled={saving}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 22px",
                          borderRadius: "8px",
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "#ffffff",
                          backgroundColor: justSaved ? "#16a34a" : saving ? "#94a3b8" : isMatrixDirty ? "#1d4ed8" : "#2563eb",
                          border: "none",
                          cursor: saving ? "not-allowed" : "pointer",
                          boxShadow: justSaved
                            ? "0 4px 14px rgba(22, 163, 74, 0.4)"
                            : isMatrixDirty
                            ? "0 4px 14px rgba(29, 78, 216, 0.4)"
                            : "0 2px 6px rgba(37, 99, 235, 0.2)",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {saving ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Saving Matrix...
                          </>
                        ) : justSaved ? (
                          <>
                            <Check size={16} />
                            Matrix Saved!
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Permission Matrix
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </GovCardBody>
              </GovCard>
            ) : (
              <div style={{ backgroundColor: "#f8fafc", border: "2px dashed #cbd5e1", borderRadius: 8, padding: 48, textAlign: "center", color: "#64748b" }}>
                Select a role from the left panel to configure its permissions matrix.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE DYNAMIC ROLE MODAL */}
      <GovModal open={roleModalOpen} onClose={() => setRoleModalOpen(false)} title="Create Dynamic Role" width={960}>
        <form onSubmit={handleCreateRole}>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontWeight: 600, fontSize: "14px", color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
                Role Metadata Details
              </div>
              <GovInput
                label="Role Name"
                required
                value={roleForm.name}
                onChange={(e) => setRoleForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. CSR_CONSULTANT"
              />
              <GovInput
                label="Description"
                required
                value={roleForm.description}
                onChange={(e) => setRoleForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Explain the purpose or assignments of this role..."
              />
              <GovInput
                label="Category"
                value={roleForm.category}
                onChange={(e) => setRoleForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Audit, Operations, Approval"
              />
            </div>

            <div style={{ flex: 1.3, borderLeft: "1px solid #e2e8f0", paddingLeft: 24, display: "flex", flexDirection: "column" }}>
              <div style={{ fontWeight: 600, fontSize: "14px", color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: 6, marginBottom: 12 }}>
                Assign Initial Permissions ({newRolePerms.length} Selected)
              </div>
              <div style={{ maxHeight: "380px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingRight: 8 }} data-lenis-prevent>
                {permissionGroups.map((group) => (
                  <div key={group.id} style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: 12, backgroundColor: "#f8fafc" }}>
                    <div style={{ fontWeight: 700, fontSize: "12px", color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: 4, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{group.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const keys = group.permissions.map(p => p.key);
                          const allChecked = keys.every(k => newRolePerms.includes(k));
                          if (allChecked) {
                            setNewRolePerms(prev => prev.filter(k => !keys.includes(k)));
                          } else {
                            setNewRolePerms(prev => Array.from(new Set([...prev, ...keys])));
                          }
                        }}
                        style={{ fontSize: "10px", color: "#1789d6", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        {group.permissions.map(p => p.key).every(k => newRolePerms.includes(k)) ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {group.permissions.map((perm) => {
                        const friendly = getFriendlyPermission(perm.key, perm.description || undefined);
                        const isChecked = newRolePerms.includes(perm.key);
                        return (
                          <label key={perm.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", padding: "4px 6px", backgroundColor: isChecked ? "#eff6ff" : "transparent", borderRadius: 4 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setNewRolePerms((prev) =>
                                  prev.includes(perm.key)
                                    ? prev.filter((k) => k !== perm.key)
                                    : [...prev, perm.key]
                                );
                              }}
                              style={{ marginTop: 2, accentColor: "#1e3a8a" }}
                            />
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
                                {friendly.title}
                              </span>
                              <span style={{ fontSize: "10px", color: "#0284c7", fontWeight: 600, fontFamily: "monospace" }}>
                                {perm.key}
                              </span>
                              <span style={{ fontSize: "10px", color: "#64748b", lineHeight: "1.2", marginTop: 2 }}>
                                {friendly.hint}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
            <GovButton type="button" variant="secondary" onClick={() => { setRoleModalOpen(false); setNewRolePerms([]); }}>
              Cancel
            </GovButton>
            <GovButton type="submit" variant="primary" disabled={saving}>
              {saving ? "Creating..." : "Create Dynamic Role"}
            </GovButton>
          </div>
        </form>
      </GovModal>

      {/* CLONE ROLE MODAL */}
      <GovModal open={cloneModalOpen} onClose={() => setCloneModalOpen(false)} title="Duplicate / Clone Role" width={500}>
        <form onSubmit={handleCloneRole}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <GovInput
              label="New Role Name"
              required
              value={cloneForm.name}
              onChange={(e) => setCloneForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <GovInput
              label="New Description"
              value={cloneForm.description}
              onChange={(e) => setCloneForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
            <GovButton type="button" variant="secondary" onClick={() => setCloneModalOpen(false)}>
              Cancel
            </GovButton>
            <GovButton type="submit" variant="primary" disabled={saving}>
              {saving ? "Cloning..." : "Clone Role"}
            </GovButton>
          </div>
        </form>
      </GovModal>

      <GovModal open={renameModalOpen} onClose={() => setRenameModalOpen(false)} title="Rename Role" width={500}>
        <form onSubmit={handleRenameRole}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              The role&apos;s display name and description are editable. Its internal
              identity (used by workflows and permissions) never changes when you rename it.
            </p>
            <GovInput
              label="Role Name"
              required
              value={renameForm.name}
              onChange={(e) => setRenameForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <GovInput
              label="Description"
              value={renameForm.description}
              onChange={(e) => setRenameForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
            <GovButton type="button" variant="secondary" onClick={() => setRenameModalOpen(false)}>
              Cancel
            </GovButton>
            <GovButton type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </GovButton>
          </div>
        </form>
      </GovModal>
    </GovPortalLayout>
  );
}
