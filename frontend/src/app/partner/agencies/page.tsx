"use client";

/**
 * Corporate Partner — Implementing Agencies
 *
 * Convergence framework (Section 6.1): corporates create NGO/Foundation
 * sub-logins (CSR-1 required). Each sub-login activates only after District
 * Nodal Officer approval; approved agencies can then be assigned to projects.
 */
import { useEffect, useState } from "react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovInput from "@/components/gov/GovInput";
import GovSelect from "@/components/gov/GovSelect";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import { apiFetch, invalidateCache } from "@/lib/api";
import { Users, Plus, Loader2, ShieldCheck, Link2 } from "lucide-react";

interface SubLogin {
  id: string;
  email: string;
  accountStatus: string;
  iaAgencyName?: string;
  iaCsr1Number?: string;
  iaApprovedByUser?: { email: string } | null;
  iaProjects?: { id: string; projectId: string; title: string; status: string }[];
  createdAt: string;
}

interface ProjectOption {
  id: string;
  projectId: string;
  title: string;
}

const statusVariant = (status: string): "success" | "warning" | "danger" | "muted" => {
  if (status === "ACTIVE") return "success";
  if (status === "PENDING_APPROVAL") return "warning";
  if (status === "SUSPENDED") return "danger";
  return "muted";
};

const statusLabel = (status: string) => {
  if (status === "ACTIVE") return "Approved";
  if (status === "PENDING_APPROVAL") return "Awaiting Nodal Approval";
  if (status === "SUSPENDED") return "Rejected";
  return status.replace(/_/g, " ");
};

export default function PartnerAgenciesPage() {
  const [subLogins, setSubLogins] = useState<SubLogin[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ agencyName: "", email: "", password: "", csr1Number: "", projectId: "" });
  const [assign, setAssign] = useState({ projectId: "", iaUserId: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [logins, projectsRes] = await Promise.all([
        apiFetch<{ data?: SubLogin[] } | SubLogin[]>("/implementing-agency/sub-logins"),
        apiFetch<{ data?: ProjectOption[] } | ProjectOption[]>("/convergence-projects").catch(() => []),
      ]);
      setSubLogins(Array.isArray(logins) ? logins : logins.data || []);
      setProjects(Array.isArray(projectsRes) ? projectsRes : projectsRes.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load implementing agencies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await apiFetch("/implementing-agency/sub-logins", {
        method: "POST",
        body: JSON.stringify({
          agencyName: form.agencyName,
          email: form.email,
          password: form.password,
          csr1Number: form.csr1Number,
          projectId: form.projectId || undefined,
        }),
      });
      setSuccess("Sub-login created. It activates after District Nodal Officer approval.");
      setForm({ agencyName: "", email: "", password: "", csr1Number: "", projectId: "" });
      invalidateCache("/implementing-agency/sub-logins");
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to create sub-login");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await apiFetch("/implementing-agency/assign", {
        method: "POST",
        body: JSON.stringify(assign),
      });
      setSuccess("Implementing agency assigned to project.");
      setAssign({ projectId: "", iaUserId: "" });
      invalidateCache("/implementing-agency/sub-logins");
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to assign agency");
    } finally {
      setSubmitting(false);
    }
  };

  const approvedAgencies = subLogins.filter((s) => s.accountStatus === "ACTIVE");

  return (
    <GovPortalLayout>
      <div className="gov-page-header">
        <div className="gov-breadcrumb">Home / Partner / Implementing Agencies</div>
        <h1 className="gov-page-title flex items-center gap-3">
          <Users size={26} className="text-[#f7941d]" />
          Implementing Agencies
        </h1>
        <p className="gov-page-description">
          Delegate project implementation to an NGO or Foundation. Sub-logins require a valid CSR-1
          registration and District Nodal Officer approval — your company remains fully accountable.
        </p>
      </div>

      {error && <GovAlert variant="danger" className="mb-4">{error}</GovAlert>}
      {success && <GovAlert variant="success" className="mb-4">{success}</GovAlert>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {/* Create sub-login */}
        <GovCard>
          <GovCardHeader>
            <GovCardTitle className="flex items-center gap-2"><Plus size={16} /> Create Agency Sub-Login</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <GovInput label="Agency / Foundation Name" required format="name" value={form.agencyName} onChange={(e) => setForm({ ...form, agencyName: e.target.value })} />
              <GovInput label="Agency Login Email" type="email" required format="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <GovInput label="Temporary Password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} help="Share securely with the agency; they should change it on first login." />
              <GovInput label="CSR-1 Registration Number" required value={form.csr1Number} onChange={(e) => setForm({ ...form, csr1Number: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11) })} placeholder="CSR00012345" help="Mandatory MCA CSR-1 registration of the implementing agency." />
              <GovSelect label="Link to Project (optional)" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                <option value="">No project link yet</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.projectId} — {p.title}</option>
                ))}
              </GovSelect>
              <GovButton type="submit" disabled={submitting}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create Sub-Login
              </GovButton>
            </form>
          </GovCardBody>
        </GovCard>

        {/* Assign approved agency to project */}
        <GovCard>
          <GovCardHeader>
            <GovCardTitle className="flex items-center gap-2"><Link2 size={16} /> Assign Agency to Project</GovCardTitle>
          </GovCardHeader>
          <GovCardBody>
            <form onSubmit={handleAssign} className="flex flex-col gap-3">
              <GovSelect label="Project" required value={assign.projectId} onChange={(e) => setAssign({ ...assign, projectId: e.target.value })}>
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.projectId} — {p.title}</option>
                ))}
              </GovSelect>
              <GovSelect label="Approved Agency" required value={assign.iaUserId} onChange={(e) => setAssign({ ...assign, iaUserId: e.target.value })}>
                <option value="">Select agency</option>
                {approvedAgencies.map((a) => (
                  <option key={a.id} value={a.id}>{a.iaAgencyName || a.email}</option>
                ))}
              </GovSelect>
              {approvedAgencies.length === 0 && (
                <p className="text-xs text-[#6b7280]">No approved agencies yet. Create a sub-login and wait for Nodal Officer approval.</p>
              )}
              <GovButton type="submit" variant="secondary" disabled={submitting || approvedAgencies.length === 0}>
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Assign to Project
              </GovButton>
            </form>
          </GovCardBody>
        </GovCard>
      </div>

      {/* Sub-login list */}
      <GovCard className="mt-4">
        <GovCardHeader>
          <GovCardTitle>My Agency Sub-Logins</GovCardTitle>
        </GovCardHeader>
        <GovCardBody>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#6b7280] p-4"><Loader2 size={16} className="animate-spin" /> Loading...</div>
          ) : subLogins.length === 0 ? (
            <p className="text-sm text-[#6b7280] p-2">No implementing agency sub-logins yet. Create one above to delegate implementation.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="govt-table">
                <thead>
                  <tr>
                    <th>Agency</th>
                    <th>Login Email</th>
                    <th>CSR-1</th>
                    <th>Status</th>
                    <th>Assigned Projects</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {subLogins.map((s) => (
                    <tr key={s.id}>
                      <td className="font-semibold">{s.iaAgencyName || "—"}</td>
                      <td>{s.email}</td>
                      <td className="font-mono text-xs">{s.iaCsr1Number || "—"}</td>
                      <td><GovStatusBadge variant={statusVariant(s.accountStatus)}>{statusLabel(s.accountStatus)}</GovStatusBadge></td>
                      <td className="text-xs">
                        {s.iaProjects && s.iaProjects.length > 0
                          ? s.iaProjects.map((p) => p.projectId).join(", ")
                          : "—"}
                      </td>
                      <td className="text-xs">{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GovCardBody>
      </GovCard>
    </GovPortalLayout>
  );
}
