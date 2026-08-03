"use client";

import { useMemo, useState } from "react";
import { Building2, Loader2, Mail, Plus, ShieldCheck, UserPlus, Users } from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import { GovPageHeader } from "@/components/layout/GovPageHeader";
import { useApiQuery } from "@/lib/apiHooks";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function AgencySubLoginsPage() {
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const roleNames = roles?.length ? roles : user?.role ? [user.role] : [];
  const isNgoAdmin = roleNames.some((role) => /NGO.*ADMIN|IMPLEMENTING.*AGENCY/i.test(role));
  const { data: rowsResponse, isLoading, refetch } = useApiQuery<any>(["agency-sub-logins"], "/implementing-agency/sub-logins");
  const { data: ngoResponse } = useApiQuery<any>(["eligible-ngos"], "/implementing-agency/eligible-ngos", { enabled: !isNgoAdmin });
  const { data: projectResponse } = useApiQuery<any>(["agency-projects"], "/convergence-projects", { enabled: !isNgoAdmin });
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [agencyOrganizationId, setAgencyOrganizationId] = useState("");
  const [assignedProjectId, setAssignedProjectId] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const rows = Array.isArray(rowsResponse?.data) ? rowsResponse.data : Array.isArray(rowsResponse) ? rowsResponse : [];
  const ngos = Array.isArray(ngoResponse?.data) ? ngoResponse.data : [];
  const projects = Array.isArray(projectResponse?.data) ? projectResponse.data : Array.isArray(projectResponse) ? projectResponse : [];
  const stats = useMemo(() => ({ active: rows.filter((row: any) => row.status === "ACTIVE").length, invited: rows.filter((row: any) => row.status === "INVITE_SENT").length }), [rows]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      const body = isNgoAdmin ? { email } : { email, agencyOrganizationId, assignedProjectId, contactPerson, phone };
      const result = await apiFetch<any>("/implementing-agency/sub-logins", { method: "POST", body: JSON.stringify(body) });
      setMessage(result?.message || "Invitation created."); setEmail(""); setAgencyOrganizationId(""); setAssignedProjectId(""); setContactPerson(""); setPhone(""); setShowForm(false); refetch();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to create the invitation."); } finally { setSaving(false); }
  };
  return <GovPortalLayout><main className="mx-auto min-h-screen max-w-screen-xl space-y-4 px-4 py-4 md:px-6"><GovPageHeader eyebrow={isNgoAdmin ? "NGO Admin" : "Company Admin"} title={isNgoAdmin ? "Internal NGO Staff Access" : "Implementing Agency Project Access"} description={isNgoAdmin ? "Invite your verified organization’s internal staff." : "Invite an already approved NGO to one project. Access remains inactive until the invitation is accepted."} actions={<button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white"><UserPlus size={15} /> {isNgoAdmin ? "Invite staff" : "Invite implementing NGO"}</button>} />
    <section className="grid gap-3 sm:grid-cols-3"><Metric icon={<Users size={18} />} label="Active access" value={stats.active} /><Metric icon={<Mail size={18} />} label="Invitations pending" value={stats.invited} /><Metric icon={<ShieldCheck size={18} />} label="Access policy" value={isNgoAdmin ? "Internal staff" : "Per project"} /></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-extrabold text-slate-900">Authorized accounts</h2><p className="mt-1 text-xs text-slate-500">No credentials are issued to an NGO until Super Admin has approved its organization.</p></div>{isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-900" /></div> : rows.length === 0 ? <p className="p-10 text-center text-xs font-semibold text-slate-500">No sub-logins have been created.</p> : <div className="divide-y divide-slate-100">{rows.map((row: any) => <div key={row.id} className="grid gap-2 px-5 py-4 sm:grid-cols-4 sm:items-center"><div><p className="font-bold text-slate-900">{row.ngoName}</p><p className="text-xs text-slate-500">{row.darpanId || "Darpan ID not recorded"}</p></div><p className="break-all text-xs text-blue-800">{row.email}</p><p className="text-xs font-semibold text-slate-700">{row.assignedProject?.title || "Internal organization staff"}</p><span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-extrabold ${row.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{row.status}</span></div>)}</div>}</section>
    {message && <p className="text-xs font-semibold text-blue-800">{message}</p>}
    {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"><form onSubmit={submit} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl"><div><h2 className="text-base font-extrabold text-slate-900">{isNgoAdmin ? "Invite internal NGO staff" : "Invite approved implementing NGO"}</h2><p className="mt-1 text-xs text-slate-500">{isNgoAdmin ? "Staff inherit only your NGO organization context." : "The invite creates project-scoped access only after the NGO is approved."}</p></div>{!isNgoAdmin && <><label className="block text-xs font-bold text-slate-700">Approved NGO<select required value={agencyOrganizationId} onChange={(event) => setAgencyOrganizationId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5"><option value="">Select NGO</option>{ngos.map((ngo: any) => <option key={ngo.id} value={ngo.id}>{ngo.name}{ngo.ngoProfile?.darpanNumber ? ` — ${ngo.ngoProfile.darpanNumber}` : ""}</option>)}</select></label><label className="block text-xs font-bold text-slate-700">Assigned project<select required value={assignedProjectId} onChange={(event) => setAssignedProjectId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5"><option value="">Select project</option>{projects.map((project: any) => <option key={project.id} value={project.id}>{project.projectCode} — {project.title}</option>)}</select></label></>}<label className="block text-xs font-bold text-slate-700">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5" /></label>{!isNgoAdmin && <div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs font-bold text-slate-700">Contact person<input value={contactPerson} onChange={(event) => setContactPerson(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5" /></label><label className="block text-xs font-bold text-slate-700">Phone<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5" /></label></div>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700">Cancel</button><button disabled={saving} className="rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white">{saving ? "Creating…" : "Create invitation"}</button></div></form></div>}</main></GovPortalLayout>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-blue-800">{icon}<p className="text-[11px] font-extrabold uppercase tracking-wider">{label}</p></div><p className="mt-3 text-xl font-extrabold text-slate-900">{value}</p></div>; }
