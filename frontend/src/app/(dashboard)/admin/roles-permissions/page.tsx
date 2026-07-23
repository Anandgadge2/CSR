"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovInput from "@/components/gov/GovInput";
import GovModal from "@/components/gov/GovModal";
import "../../../styles/gov-theme.css";

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

export default function AdminRolesPermissionsPage() {
  const [loading, setLoading] = useState(true);
  const [dynamicRoles, setDynamicRoles] = useState<DynamicRole[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedRolePerms, setSelectedRolePerms] = useState<string[]>([]);
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState("");
  const [roleTypeFilter, setRoleTypeFilter] = useState<"all" | "system" | "custom">("all");

  const [pages, setPages] = useState<PageDef[]>([]);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameForm, setRenameForm] = useState({ name: "", description: "" });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      // High limit so pagination never hides system or custom roles.
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
      // Controller may return { groups: [...] } or a bare array.
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
      setSuccess(`Role '${roleForm.name}' created successfully with selected permissions.`);
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
      setError(err instanceof Error ? err.message : "Failed to create role");
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
      setCloneModalOpen(false);
      setCloneForm({ name: "", description: "" });
      fetchData(true);
      const cloned = clonedResponse?.data || clonedResponse;
      if (cloned?.id) setSelectedRoleId(cloned.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clone role");
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
      setSuccess(`Role status updated to ${nextStatus}.`);
      fetchData(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role status");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm("Are you sure you want to delete this custom role? This action cannot be undone.")) return;
    setError("");
    setSuccess("");
    try {
      await apiFetch(`/roles/${roleId}`, { method: "DELETE" });
      setSuccess("Role deleted successfully.");
      setSelectedRoleId("");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete role");
    }
  };

  const handleRenameRole = async () => {
    if (!selectedRole) return;
    if (!renameForm.name.trim()) {
      setError("Role name cannot be empty.");
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
      setRenameModalOpen(false);
      await fetchData(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename role");
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
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiFetch(`/roles/${selectedRoleId}`, {
        method: "PUT",
        body: JSON.stringify({ permissions: selectedRolePerms }),
      });
      setSuccess("Role permission matrix saved successfully.");
      const rolesResponse = await apiFetch<any>("/roles?limit=200");
      const rolesData = rolesResponse?.data || rolesResponse || {};
      setDynamicRoles(rolesData?.roles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save permission matrix");
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
                            SYSTEM ROLE - IMMUTABLE
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
                  <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ fontWeight: 600, color: "#1e293b", margin: 0 }}>Permissions Matrix Mapping</h4>
                    <span style={{ fontSize: "13px", color: "#475569" }}>
                      Selected permissions: <strong>{selectedRolePerms.length}</strong>
                    </span>
                  </div>

                  <div className="gov-table-container" style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                    <table className="gov-table" style={{ margin: 0 }}>
                      <thead style={{ backgroundColor: "#f8fafc" }}>
                        <tr>
                          <th style={{ width: "240px" }}>Permission Group / module</th>
                          {MATRIX_COLUMNS.map((col) => (
                            <th key={col.label} style={{ textAlign: "center", width: "100px" }}>{col.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {permissionGroups.map((group) => (
                          <tr key={group.id}>
                            <td style={{ fontWeight: 600, color: "#334155" }}>
                              <div>{group.name}</div>
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
                                    title={matchedPerm.description}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Non-standard Permissions list — excludes PAGE perms (page:*),
                      which get their own Page Access section below. */}
                  {permissionGroups.some((g) =>
                    g.permissions.some((p) =>
                      !p.key.startsWith("page:") &&
                      !MATRIX_COLUMNS.some((col) => col.suffix.some((suf) => p.key.endsWith(suf)))
                    )
                  ) && (
                    <div style={{ marginTop: 24 }}>
                      <h5 style={{ fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>Bulk / Miscellaneous Capabilities</h5>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
                        {permissionGroups.flatMap((g) =>
                          g.permissions.filter((p) =>
                            !p.key.startsWith("page:") &&
                            !MATRIX_COLUMNS.some((col) => col.suffix.some((suf) => p.key.endsWith(suf)))
                          )
                        ).map((perm) => {
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
                                backgroundColor: "#f8fafc",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
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
                                <div style={{ fontWeight: 600, fontSize: "13px", color: "#334155" }}>{perm.key}</div>
                                <div style={{ fontSize: "11px", color: "#64748b", marginTop: 2 }}>{perm.description}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Page Access — PAGE-visibility permissions (checkbox lit = page
                      visible in nav and reachable; unlit = hidden + route blocked). */}
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
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
                      <GovButton variant="primary" onClick={handleSaveMatrix} disabled={saving}>
                        {saving ? "Saving..." : "Save Permission Matrix"}
                      </GovButton>
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
                        const isChecked = newRolePerms.includes(perm.key);
                        return (
                          <label key={perm.id} style={{ display: "flex", alignItems: "flex-start", gap: 6, cursor: "pointer" }}>
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
                              <span style={{ fontSize: "11px", fontWeight: 600, color: "#334155" }} title={perm.key}>
                                {perm.key}
                              </span>
                              <span style={{ fontSize: "9px", color: "#64748b", lineHeight: "1.2" }}>
                                {perm.description}
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
