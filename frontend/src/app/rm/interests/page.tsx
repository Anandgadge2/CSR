"use client";

import { useState } from "react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovPageHeader from "@/components/layout/GovPageHeader";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import GovDataTable from "@/components/gov/GovDataTable";
import GovAlert from "@/components/gov/GovAlert";
import GovInput from "@/components/gov/GovInput";
import GovTextarea from "@/components/gov/GovTextarea";
import GovModal from "@/components/gov/GovModal";
import { useApiQuery, useApiMutation } from "@/lib/apiHooks";
import { MessageSquare, Phone, Mail, Building, MapPin, CheckCircle, Save } from "lucide-react";

interface PitchInterest {
  id: string;
  interestTrackingId: string;
  companyName: string;
  mca21Cin: string;
  contactPersonName: string;
  contactPersonDesignation: string;
  email: string;
  mobile: string;
  indicativeBudget: number | null;
  preferredStartTimeline: string;
  implementationMode: string;
  messageToGovernment: string | null;
  status: string;
  coordinationNotes: string | null;
  dialogueInitiated: boolean;
  nodalOfficerRecommended: string | null;
  governmentPitch: {
    pitchReferenceId: string;
    csrRequirement: string;
    district: string;
  };
}

export default function RMCorporateInterestsPage() {
  const [selectedInterest, setSelectedInterest] = useState<PitchInterest | null>(null);
  const [notes, setNotes] = useState("");
  const [dialogue, setDialogue] = useState(false);
  const [recommendedNodal, setRecommendedNodal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: response, isLoading, refetch } = useApiQuery<{ success: boolean; data: PitchInterest[] }>(
    ["rm", "interests", "list"],
    "/rm/interests",
    { staleTime: 30 * 1000 }
  );

  const updateMutation = useApiMutation<void, { status: string; coordinationNotes: string; dialogueInitiated: boolean; nodalOfficerRecommended: string }>(
    "PATCH",
    `/rm/interests/${selectedInterest?.id || ""}`,
    {
      onSuccess: () => {
        setSuccess("Coordination log updated successfully");
        refetch();
        setSelectedInterest(null);
        setTimeout(() => setSuccess(null), 3000);
      },
      onError: (err: any) => {
        setError(err.message || "Failed to update coordination details");
      }
    }
  );

  const interests = response?.data || [];

  const handleOpenCoordination = (interest: PitchInterest) => {
    setSelectedInterest(interest);
    setNotes(interest.coordinationNotes || "");
    setDialogue(interest.dialogueInitiated);
    setRecommendedNodal(interest.nodalOfficerRecommended || "");
    setError(null);
  };

  const handleSaveCoordination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterest) return;

    try {
      await updateMutation.mutateAsync({
        status: dialogue ? "RM_CONTACTED" : "INTERESTED",
        coordinationNotes: notes,
        dialogueInitiated: dialogue,
        nodalOfficerRecommended: recommendedNodal,
      });
    } catch {
      // Handled by mutation error callback
    }
  };

  const columns = [
    {
      key: "interestTrackingId",
      label: "Interest ID",
      render: (v: unknown) => <span style={{ fontWeight: 700, color: "var(--gov-primary)" }}>{v as string}</span>,
    },
    {
      key: "companyName",
      label: "Corporate Partner",
      render: (v: unknown, row: Record<string, unknown>) => {
        const castRow = row as unknown as PitchInterest;
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600 }}>{v as string}</span>
            <span style={{ fontSize: 11, color: "var(--gov-text-muted)" }}>CIN: {castRow.mca21Cin}</span>
          </div>
        );
      },
    },
    {
      key: "governmentPitch",
      label: "Government Pitch Linked",
      render: (v: unknown) => {
        const pitch = v as PitchInterest["governmentPitch"];
        return (
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 300 }}>
            <span style={{ fontWeight: 600, color: "var(--gov-text)" }}>{pitch.pitchReferenceId}</span>
            <span style={{ fontSize: 11, color: "var(--gov-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {pitch.csrRequirement}
            </span>
          </div>
        );
      },
    },
    {
      key: "indicativeBudget",
      label: "Offered Budget",
      render: (v: unknown) => (v ? `₹${Number(v).toLocaleString("en-IN")}` : "—"),
    },
    {
      key: "dialogueInitiated",
      label: "Dialogue State",
      render: (v: unknown) => (
        <GovStatusBadge variant={v ? "success" : "warning"}>
          {v ? "Dialogue Initiated" : "Pending Contact"}
        </GovStatusBadge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => {
        const interest = row as unknown as PitchInterest;
        return (
          <GovButton variant="secondary" style={{ minHeight: 28, padding: "4px 10px", fontSize: 12 }} onClick={() => handleOpenCoordination(interest)}>
            <MessageSquare size={14} style={{ marginRight: 4 }} /> Coordinate
          </GovButton>
        );
      },
    },
  ];

  return (
    <GovPortalLayout userRole="CSR_RELATIONSHIP_MANAGER">
      <GovPageHeader
        title="Corporate Interests (Government Pitches)"
        description="Monitor interests submitted by corporate partners for government pitches, log dialogue, and recommend Nodal Officers"
        breadcrumb="Home / Corporate Interests"
      />

      {success && <GovAlert variant="success" style={{ marginBottom: 20 }}>{success}</GovAlert>}

      <GovCard>
        <GovCardHeader>
          <GovCardTitle>Interests Queue ({interests.length})</GovCardTitle>
        </GovCardHeader>
        <GovCardBody style={{ padding: 0 }}>
          <GovDataTable
            columns={columns}
            data={interests as unknown as Record<string, unknown>[]}
            loading={isLoading}
            emptyMessage="No corporate interests received."
          />
        </GovCardBody>
      </GovCard>

      {/* Coordination Modal */}
      {selectedInterest && (
        <GovModal
          open={!!selectedInterest}
          title={`Coordinate Interest - ${selectedInterest.interestTrackingId}`}
          onClose={() => setSelectedInterest(null)}
        >
          <form onSubmit={handleSaveCoordination} style={{ display: "flex", flexDirection: "column", gap: 16, width: 480 }}>
            {error && <GovAlert variant="danger">{error}</GovAlert>}

            <div>
              <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", marginBottom: 4 }}>COMPANY DETAILS</span>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedInterest.companyName}</div>
              <div style={{ fontSize: 13, color: "var(--gov-text-muted)", marginTop: 2 }}>
                Contact: {selectedInterest.contactPersonName} ({selectedInterest.contactPersonDesignation})
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 12, color: "var(--gov-link)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Phone size={12} /> {selectedInterest.mobile}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Mail size={12} /> {selectedInterest.email}</span>
              </div>
            </div>

            <div>
              <span style={{ display: "block", fontSize: 12, color: "var(--gov-text-muted)", marginBottom: 4 }}>CORPORATE MESSAGE</span>
              <p style={{ margin: 0, fontSize: 13, background: "#f8fafc", padding: 8, borderRadius: 4 }}>
                {selectedInterest.messageToGovernment || "No message recorded."}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                id="dialogueCheck"
                checked={dialogue}
                onChange={(e) => setDialogue(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              <label htmlFor="dialogueCheck" style={{ fontSize: 14, fontWeight: 600 }}>Dialogue / Consultation Initiated</label>
            </div>

            <GovTextarea
              label="Coordination & Interaction Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record meetings, calls, budget alignments..."
              rows={4}
              required
            />

            <GovInput
              label="Recommended District Nodal Officer Domain"
              value={recommendedNodal}
              onChange={(e) => setRecommendedNodal(e.target.value)}
              placeholder="e.g. Collector Office Thane / Zilla Parishad Pune"
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <GovButton variant="secondary" type="button" onClick={() => setSelectedInterest(null)}>
                Cancel
              </GovButton>
              <GovButton variant="primary" type="submit" disabled={updateMutation.isPending}>
                <Save size={16} style={{ marginRight: 6 }} /> Save Changes
              </GovButton>
            </div>
          </form>
        </GovModal>
      )}
    </GovPortalLayout>
  );
}
