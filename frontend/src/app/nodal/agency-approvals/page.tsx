"use client";

/**
 * District Nodal Officer — Implementing Agency Approvals
 *
 * IA sub-logins created by corporates activate only after the Nodal Officer
 * verifies the CSR-1 registration and approves the account.
 */
import { useEffect, useState } from "react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";
import { apiFetch, invalidateCache } from "@/lib/api";
import { ShieldCheck, ShieldX, Loader2, Users } from "lucide-react";

interface PendingIA {
  id: string;
  email: string;
  iaAgencyName?: string;
  iaCsr1Number?: string;
  parentCorporateUser?: { id: string; email: string } | null;
  createdAt: string;
}

export default function NodalAgencyApprovalsPage() {
  const [pending, setPending] = useState<PendingIA[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{ data?: PendingIA[] } | PendingIA[]>("/implementing-agency/approvals/pending");
      setPending(Array.isArray(res) ? res : res.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decide = async (id: string, decision: "APPROVE" | "REJECT") => {
    setError("");
    setSuccess("");
    setActingOn(id);
    try {
      const remarks = decision === "REJECT"
        ? window.prompt("Reason for rejection (sent to the corporate):") || undefined
        : undefined;
      await apiFetch(`/implementing-agency/approvals/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ decision, remarks }),
      });
      setSuccess(decision === "APPROVE" ? "Agency approved and activated." : "Agency rejected.");
      invalidateCache("/implementing-agency");
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to record decision");
    } finally {
      setActingOn(null);
    }
  };

  return (
    <GovPortalLayout>
      <div className="gov-page-header">
        <div className="gov-breadcrumb">Home / Nodal Officer / Agency Approvals</div>
        <h1 className="gov-page-title flex items-center gap-3">
          <Users size={26} className="text-[#f7941d]" />
          Implementing Agency Approvals
        </h1>
        <p className="gov-page-description">
          Corporate-created NGO/Foundation sub-logins awaiting activation. Verify the CSR-1
          registration before approving — the corporate remains fully accountable for the agency.
        </p>
      </div>

      {error && <GovAlert variant="danger" className="mb-4">{error}</GovAlert>}
      {success && <GovAlert variant="success" className="mb-4">{success}</GovAlert>}

      <GovCard>
        <GovCardHeader>
          <GovCardTitle>Pending Approvals {pending.length > 0 ? `(${pending.length})` : ""}</GovCardTitle>
        </GovCardHeader>
        <GovCardBody>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#6b7280] p-4"><Loader2 size={16} className="animate-spin" /> Loading...</div>
          ) : pending.length === 0 ? (
            <p className="text-sm text-[#6b7280] p-2">No implementing agency approvals pending.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="govt-table">
                <thead>
                  <tr>
                    <th>Agency</th>
                    <th>Login Email</th>
                    <th>CSR-1</th>
                    <th>Created By (Corporate)</th>
                    <th>Requested</th>
                    <th>Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold">{item.iaAgencyName || "—"}</td>
                      <td>{item.email}</td>
                      <td className="font-mono text-xs">{item.iaCsr1Number || "—"}</td>
                      <td className="text-xs">{item.parentCorporateUser?.email || "—"}</td>
                      <td className="text-xs">{new Date(item.createdAt).toLocaleDateString("en-IN")}</td>
                      <td>
                        <div className="flex gap-2">
                          <GovButton
                            onClick={() => decide(item.id, "APPROVE")}
                            disabled={actingOn === item.id}
                            style={{ minHeight: 32, padding: "4px 10px", fontSize: 12 }}
                          >
                            {actingOn === item.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} Approve
                          </GovButton>
                          <GovButton
                            variant="danger"
                            onClick={() => decide(item.id, "REJECT")}
                            disabled={actingOn === item.id}
                            style={{ minHeight: 32, padding: "4px 10px", fontSize: 12 }}
                          >
                            <ShieldX size={14} /> Reject
                          </GovButton>
                        </div>
                      </td>
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
