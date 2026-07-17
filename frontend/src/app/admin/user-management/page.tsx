"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovInput from "@/components/gov/GovInput";
import GovModal from "@/components/gov/GovModal";
import GovSelect from "@/components/gov/GovSelect";
import "../../../styles/gov-theme.css";

// Base platform roles come from the Prisma enum; everything else is a dynamic
// OrganizationRole fetched from the RBAC engine — never hardcoded here.
const BASE_PLATFORM_ROLES = [
  "SUPER_ADMIN",
  "GOVERNMENT_OFFICER",
  "CORPORATE_USER",
] as const;

const MAHARASHTRA_DISTRICTS = [
  "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara",
  "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli",
  "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban",
  "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar",
  "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara",
  "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal",
];

type UserRow = {
  id: string;
  email: string;
  role: string | null;
  roleId?: string | null;
  roleRelation?: { id: string; name: string } | null;
  accountStatus?: string;
  assignedDistrict?: string | null;
  isVerified?: boolean;
  ngo?: { name: string };
  company?: { name: string };
  dynamicRoles?: { roleId: string; roleName: string }[];
};

type DynamicRole = {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  isSystemRole: boolean;
  permissions: string[];
};

const EMPTY_USER_FORM = {
  email: "",
  role: "GOVERNMENT_OFFICER",
  assignedDistrict: "",
};

// Resolve the effective role value shown in the dropdown: base enum role
// first, otherwise the linked dynamic role's name.
const effectiveRole = (u: UserRow) => u.role || u.roleRelation?.name || "";

export default function AdminUserManagementPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [dynamicRoles, setDynamicRoles] = useState<DynamicRole[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [togglingId, setTogglingId] = useState("");

  // Create user modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);

  // Edit user modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{
    userId: string;
    email: string;
    role: string;
    assignedDistrict: string;
    accountStatus: string;
    dynamicRoleIds: string[];
  }>({ userId: "", email: "", role: "", assignedDistrict: "", accountStatus: "ACTIVE", dynamicRoleIds: [] });

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const usersData = await apiFetch<any>("/admin/users");
      const rawUsers = usersData?.data || usersData || [];
      const parsedUsers = (Array.isArray(rawUsers) ? rawUsers : []).map((u: any) => ({
        ...u,
        dynamicRoles: (Array.isArray(u.organizationRoles) ? u.organizationRoles : [])
          .map((or: any) => (or?.role ? { roleId: or.role.id, roleName: or.role.name } : null))
          .filter(Boolean),
      }));
      setUsers(parsedUsers);

      // Fetch ALL dynamic roles (system + custom) — high limit so pagination
      // never hides roles from the dropdowns.
      const rolesResponse = await apiFetch<any>("/roles?limit=200");
      const rolesData = rolesResponse?.data || rolesResponse || {};
      setDynamicRoles(rolesData?.roles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeDynamicRoles = dynamicRoles.filter((r) => r.status === "ACTIVE");
  const systemRoles = activeDynamicRoles.filter((r) => r.isSystemRole);
  const customRoles = activeDynamicRoles.filter((r) => !r.isSystemRole);

  const roleOptions = (
    <>
      <optgroup label="Base Platform Roles">
        {BASE_PLATFORM_ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </optgroup>
      {systemRoles.length > 0 && (
        <optgroup label="System Roles">
          {systemRoles.map((r) => (
            <option key={r.id} value={r.name}>{r.name}</option>
          ))}
        </optgroup>
      )}
      {customRoles.length > 0 && (
        <optgroup label="Custom Roles">
          {customRoles.map((r) => (
            <option key={r.id} value={r.name}>{r.name}</option>
          ))}
        </optgroup>
      )}
    </>
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const created = await apiFetch<any>("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: userForm.email.trim(),
          role: userForm.role,
          assignedDistrict: userForm.assignedDistrict || undefined,
        }),
      });
      const result = created?.data || created;
      setSuccess(
        result?.invitationSent
          ? `User created. A secure activation link has been emailed to ${userForm.email.trim()} — no password is ever sent by email.`
          : "User created successfully."
      );
      setCreateModalOpen(false);
      setUserForm(EMPTY_USER_FORM);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (user: UserRow) => {
    setEditForm({
      userId: user.id,
      email: user.email,
      role: effectiveRole(user),
      assignedDistrict: user.assignedDistrict || "",
      accountStatus: user.accountStatus || "ACTIVE",
      dynamicRoleIds: (user.dynamicRoles || []).map((r) => r.roleId),
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiFetch(`/admin/users/${editForm.userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({
          role: editForm.role,
          assignedDistrict: editForm.assignedDistrict || undefined,
          accountStatus: editForm.accountStatus,
        }),
      });
      // Save additional dynamic role assignments (multi-role mapping)
      await apiFetch(`/roles/users/${editForm.userId}`, {
        method: "POST",
        body: JSON.stringify({ roleIds: editForm.dynamicRoleIds }),
      }).catch(() => undefined);
      setSuccess(`User ${editForm.email} updated successfully.`);
      setEditModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: UserRow) => {
    const nextStatus = user.accountStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setTogglingId(user.id);
    setError("");
    setSuccess("");
    try {
      await apiFetch(`/admin/users/${user.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ accountStatus: nextStatus }),
      });
      setUsers((curr) => curr.map((c) => (c.id === user.id ? { ...c, accountStatus: nextStatus } : c)));
      setSuccess(`${user.email} is now ${nextStatus}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
      fetchData();
    } finally {
      setTogglingId("");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const result = await apiFetch<any>(`/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      const data = result?.data || result;
      setSuccess(
        data?.suspended
          ? `${deleteTarget.email} has linked records and was suspended instead of deleted.`
          : `${deleteTarget.email} deleted permanently.`
      );
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || (u.accountStatus || "ACTIVE") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <GovPortalLayout>
      <GovPageHeader
        title="User Management"
        breadcrumb="Admin / Security / Users"
        description="Create platform users, manage their roles, districts and account status."
        actions={
          <GovButton variant="primary" onClick={() => setCreateModalOpen(true)}>
            Create User
          </GovButton>
        }
      />

      <div className="gov-container">
        {error && <div className="gov-alert gov-alert-danger gov-mb-4">{error}</div>}
        {success && <div className="gov-alert gov-alert-success gov-mb-4">{success}</div>}

        <GovCard>
          <GovCardHeader>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: 12 }}>
              <GovCardTitle>User Directory ({filteredUsers.length})</GovCardTitle>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select
                  className="gov-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ minWidth: 140 }}
                >
                  <option value="">All statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="PENDING_ACTIVATION">PENDING_ACTIVATION</option>
                </select>
                <input
                  type="text"
                  className="gov-input"
                  placeholder="Search users by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ minWidth: 240 }}
                />
              </div>
            </div>
          </GovCardHeader>
          <GovCardBody>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 w-full bg-white">
                <div className="w-10 h-10 rounded-full border-4 border-[#14274e] border-t-transparent animate-spin" />
                <span className="text-xs text-slate-500 font-semibold">Loading user accounts...</span>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="gov-table-container">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>User Email</th>
                      <th>Role</th>
                      <th>Additional Dynamic Roles</th>
                      <th>Assigned District</th>
                      <th>Status</th>
                      <th className="gov-text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isActive = (u.accountStatus || "ACTIVE") === "ACTIVE";
                      return (
                        <tr key={u.id}>
                          <td className="gov-font-semibold gov-text-primary" style={{ verticalAlign: "middle" }}>
                            {u.email}
                            {(u.ngo?.name || u.company?.name) && (
                              <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 400 }}>
                                {u.ngo?.name || u.company?.name}
                              </div>
                            )}
                          </td>
                          <td style={{ verticalAlign: "middle" }}>
                            {effectiveRole(u) ? (
                              <span
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: 12,
                                  backgroundColor: u.role ? "#f1f5f9" : "#eff6ff",
                                  color: u.role ? "#334155" : "#1e40af",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                {effectiveRole(u)}
                              </span>
                            ) : (
                              <span className="gov-text-muted" style={{ fontSize: 12 }}>No role</span>
                            )}
                          </td>
                          <td style={{ verticalAlign: "middle" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {u.dynamicRoles && u.dynamicRoles.length > 0 ? (
                                u.dynamicRoles.map((dr) => (
                                  <span
                                    key={dr.roleId}
                                    style={{
                                      padding: "3px 8px",
                                      borderRadius: 12,
                                      backgroundColor: "#eff6ff",
                                      color: "#1e40af",
                                      fontSize: 11,
                                      fontWeight: 600,
                                      border: "1px solid #bfdbfe",
                                    }}
                                  >
                                    {dr.roleName}
                                  </span>
                                ))
                              ) : (
                                <span className="gov-text-muted" style={{ fontSize: 12 }}>—</span>
                              )}
                            </div>
                          </td>
                          <td style={{ verticalAlign: "middle" }}>{u.assignedDistrict || <span className="gov-text-muted">State level</span>}</td>
                          <td style={{ verticalAlign: "middle" }}>
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: 12,
                                fontSize: 11,
                                fontWeight: 700,
                                backgroundColor: isActive ? "#ecfdf5" : u.accountStatus === "SUSPENDED" ? "#fff1f2" : "#f1f5f9",
                                color: isActive ? "#047857" : u.accountStatus === "SUSPENDED" ? "#be123c" : "#475569",
                              }}
                            >
                              {u.accountStatus || "ACTIVE"}
                            </span>
                          </td>
                          <td className="gov-text-right" style={{ verticalAlign: "middle" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
                              <GovButton variant="secondary" onClick={() => openEditModal(u)}>
                                Edit
                              </GovButton>
                              {/* Activate / Inactivate toggle */}
                              <button
                                type="button"
                                role="switch"
                                aria-checked={isActive}
                                title={isActive ? "Inactivate user" : "Activate user"}
                                disabled={togglingId === u.id}
                                onClick={() => handleToggleStatus(u)}
                                style={{
                                  width: 44,
                                  height: 24,
                                  borderRadius: 12,
                                  border: "none",
                                  position: "relative",
                                  cursor: togglingId === u.id ? "wait" : "pointer",
                                  backgroundColor: isActive ? "#047857" : "#cbd5e1",
                                  transition: "background-color 0.2s",
                                  flexShrink: 0,
                                }}
                              >
                                <span
                                  style={{
                                    position: "absolute",
                                    top: 3,
                                    left: isActive ? 23 : 3,
                                    width: 18,
                                    height: 18,
                                    borderRadius: "50%",
                                    backgroundColor: "#fff",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                    transition: "left 0.2s",
                                  }}
                                />
                              </button>
                              <GovButton variant="danger" onClick={() => setDeleteTarget(u)}>
                                Delete
                              </GovButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="gov-empty">No users matching search query found.</div>
            )}
          </GovCardBody>
        </GovCard>
      </div>

      {/* CREATE USER MODAL */}
      <GovModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Platform User" width={640}>
        <form onSubmit={handleCreateUser}>
          <div className="gov-alert gov-alert-info gov-mb-4" style={{ fontSize: 13 }}>
            The user receives a secure, single-use activation link by email and sets their
            own password. Passwords are never generated or sent by email.
          </div>
          <div className="gov-grid gov-grid-cols-2 gov-gap-4">
            <GovInput
              label="Official email"
              required
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="user@mahacsr.gov.in"
            />
            <GovSelect
              label="Role"
              required
              value={userForm.role}
              onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))}
              help="Base platform, system and custom roles are all listed."
            >
              {roleOptions}
            </GovSelect>
            <GovSelect
              label="Assigned district"
              value={userForm.assignedDistrict}
              onChange={(e) => setUserForm((prev) => ({ ...prev, assignedDistrict: e.target.value }))}
              help="Applies mostly to district consultants and nodal officers."
            >
              <option value="">State level / not applicable</option>
              {MAHARASHTRA_DISTRICTS.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </GovSelect>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
            <GovButton type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </GovButton>
            <GovButton type="submit" variant="primary" disabled={saving}>
              {saving ? "Creating..." : "Create & Send Invitation"}
            </GovButton>
          </div>
        </form>
      </GovModal>

      {/* EDIT USER MODAL */}
      <GovModal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit User: ${editForm.email}`} width={640}>
        <form onSubmit={handleSaveEdit}>
          <div className="gov-grid gov-grid-cols-2 gov-gap-4">
            <GovSelect
              label="Role"
              value={editForm.role}
              onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="">None (dynamic roles only)</option>
              {roleOptions}
            </GovSelect>
            <GovSelect
              label="Account status"
              required
              value={editForm.accountStatus}
              onChange={(e) => setEditForm((prev) => ({ ...prev, accountStatus: e.target.value }))}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="PENDING_ACTIVATION">PENDING_ACTIVATION</option>
            </GovSelect>
            <GovSelect
              label="Assigned district"
              value={editForm.assignedDistrict}
              onChange={(e) => setEditForm((prev) => ({ ...prev, assignedDistrict: e.target.value }))}
            >
              <option value="">State level / not applicable</option>
              {MAHARASHTRA_DISTRICTS.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </GovSelect>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: 6, marginBottom: 10 }}>
              Additional Dynamic Role Assignments
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto", padding: 4 }}>
              {activeDynamicRoles.map((role) => {
                const isChecked = editForm.dynamicRoleIds.includes(role.id);
                return (
                  <label
                    key={role.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      cursor: "pointer",
                      backgroundColor: isChecked ? "#f8fafc" : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        setEditForm((prev) => ({
                          ...prev,
                          dynamicRoleIds: prev.dynamicRoleIds.includes(role.id)
                            ? prev.dynamicRoleIds.filter((id) => id !== role.id)
                            : [...prev.dynamicRoleIds, role.id],
                        }))
                      }
                      style={{ width: 16, height: 16, accentColor: "#1e3a8a" }}
                    />
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13, color: "#334155" }}>{role.name}</span>
                      {role.isSystemRole && (
                        <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: "#991b1b", backgroundColor: "#fee2e2", padding: "1px 6px", borderRadius: 4 }}>
                          SYSTEM
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
              {activeDynamicRoles.length === 0 && (
                <span className="gov-text-muted" style={{ fontSize: 12 }}>No dynamic roles configured yet.</span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
            <GovButton type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </GovButton>
            <GovButton type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </GovButton>
          </div>
        </form>
      </GovModal>

      {/* DELETE CONFIRMATION MODAL */}
      <GovModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User" width={460}>
        <p style={{ fontSize: 14, color: "#475569", marginBottom: 8 }}>
          Are you sure you want to delete <strong>{deleteTarget?.email}</strong>?
        </p>
        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>
          This action cannot be undone. If the user has linked records (assignments, audit
          history), the account will be suspended instead of removed.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <GovButton type="button" variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </GovButton>
          <GovButton type="button" variant="danger" onClick={handleDeleteUser} disabled={saving}>
            {saving ? "Deleting..." : "Delete User"}
          </GovButton>
        </div>
      </GovModal>
    </GovPortalLayout>
  );
}
