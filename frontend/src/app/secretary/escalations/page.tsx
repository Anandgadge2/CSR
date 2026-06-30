"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  Calendar,
  FileText,
  AlertTriangle,
} from "lucide-react";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";
import GovStatusBadge from "@/components/gov/GovStatusBadge";
import GovButton from "@/components/gov/GovButton";
import GovAlert from "@/components/gov/GovAlert";
import { PageSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api";

// Types
interface Escalation {
  id: string;
  type: "RM_MISSED_DEADLINE" | "JS_MISSED_DECISION" | "FINAL_ESCALATION";
  referenceId: string;
  referenceType: string;
  title: string;
  description: string;
  raisedBy: {
    id: string;
    name: string;
    role: string;
  };
  raisedDate: string;
  deadlineDate: string;
  daysOverdue: number;
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  status: "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}

interface EscalationsData {
  rmMissedDeadlines: Escalation[];
  jsMissedDecisions: Escalation[];
  finalEscalations: Escalation[];
}

// Fetch escalations
const fetchEscalations = async (): Promise<EscalationsData> => {
  return apiFetch<EscalationsData>("/secretary/escalations");
};

// Resolve escalation
const resolveEscalation = async ({
  escalationId,
  decision,
  notes,
}: {
  escalationId: string;
  decision: "APPROVE" | "REJECT" | "DEFER";
  notes: string;
}): Promise<void> => {
  return apiFetch<void>("/secretary/escalations/" + escalationId + "/resolve", {
    method: "POST",
    body: JSON.stringify({ decision, notes }),
  });
};

function EscalationTypeBadge({ type }: { type: Escalation["type"] }) {
  const variantMap: Record<Escalation["type"], "info" | "warning" | "danger"> = {
    RM_MISSED_DEADLINE: "warning",
    JS_MISSED_DECISION: "danger",
    FINAL_ESCALATION: "danger",
  };

  const labelMap: Record<Escalation["type"], string> = {
    RM_MISSED_DEADLINE: "RM Missed Deadline",
    JS_MISSED_DECISION: "JS Missed Decision",
    FINAL_ESCALATION: "Final Escalation",
  };

  return <GovStatusBadge variant={variantMap[type]}>{labelMap[type]}</GovStatusBadge>;
}

function PriorityBadge({ priority }: { priority: Escalation["priority"] }) {
  const variantMap: Record<Escalation["priority"], "muted" | "info" | "warning" | "danger"> = {
    LOW: "muted",
    MEDIUM: "info",
    HIGH: "warning",
    URGENT: "danger",
  };

  return <GovStatusBadge variant={variantMap[priority]}>{priority}</GovStatusBadge>;
}

function EscalationsTable({
  escalations,
  showDecisionButtons = false,
  onDecision,
  processingId,
}: {
  escalations: Escalation[];
  showDecisionButtons?: boolean;
  onDecision?: (escalation: Escalation, decision: "APPROVE" | "REJECT" | "DEFER") => void;
  processingId?: string | null;
}) {
  if (escalations.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          title="No Escalations"
          description="There are no escalations in this category."
          icon={CheckCircle2}
        />
      </div>
    );
  }

  return (
    <div className="gov-table-container">
      <table className="gov-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Raised By</th>
            <th>Deadline</th>
            <th>Days Overdue</th>
            {showDecisionButtons && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {escalations.map((escalation) => (
            <tr key={escalation.id}>
              <td>
                <span className="font-mono text-sm">#{escalation.id}</span>
              </td>
              <td>
                <div className="font-medium text-slate-900">{escalation.title}</div>
                <div className="text-xs text-slate-500 line-clamp-2">
                  {escalation.description}
                </div>
              </td>
              <td>
                <EscalationTypeBadge type={escalation.type} />
              </td>
              <td>
                <PriorityBadge priority={escalation.priority} />
              </td>
              <td>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm">{escalation.raisedBy.name}</div>
                    <div className="text-xs text-slate-500">{escalation.raisedBy.role}</div>
                  </div>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(escalation.deadlineDate).toLocaleDateString("en-IN")}
                </div>
              </td>
              <td>
                <span
                  className={`font-bold ${
                    escalation.daysOverdue > 7
                      ? "text-red-600"
                      : escalation.daysOverdue > 3
                      ? "text-orange-600"
                      : "text-yellow-600"
                  }`}
                >
                  {escalation.daysOverdue} days
                </span>
              </td>
              {showDecisionButtons && (
                <td>
                  <div className="flex gap-2">
                    <GovButton
                      variant="secondary"
                      className="text-xs py-1 px-2"
                      onClick={() => onDecision?.(escalation, "APPROVE")}
                      disabled={processingId === escalation.id}
                    >
                      {processingId === escalation.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      Approve
                    </GovButton>
                    <GovButton
                      variant="muted"
                      className="text-xs py-1 px-2"
                      onClick={() => onDecision?.(escalation, "REJECT")}
                      disabled={processingId === escalation.id}
                    >
                      {processingId === escalation.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      Reject
                    </GovButton>
                    <GovButton
                      variant="muted"
                      className="text-xs py-1 px-2"
                      onClick={() => onDecision?.(escalation, "DEFER")}
                      disabled={processingId === escalation.id}
                    >
                      {processingId === escalation.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      Defer
                    </GovButton>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SecretaryEscalationsPage() {
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [pendingDecision, setPendingDecision] = useState<"APPROVE" | "REJECT" | "DEFER" | null>(null);

  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<EscalationsData>({
    queryKey: ["secretary-escalations"],
    queryFn: fetchEscalations,
    retry: 1,
  });

  const resolveMutation = useMutation({
    mutationFn: resolveEscalation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secretary-escalations"] });
      setSelectedEscalation(null);
      setDecisionNotes("");
      setPendingDecision(null);
    },
  });

  const handleDecisionClick = (
    escalation: Escalation,
    decision: "APPROVE" | "REJECT" | "DEFER"
  ) => {
    setSelectedEscalation(escalation);
    setPendingDecision(decision);
  };

  const handleConfirmDecision = () => {
    if (selectedEscalation && pendingDecision) {
      resolveMutation.mutate({
        escalationId: selectedEscalation.id,
        decision: pendingDecision,
        notes: decisionNotes,
      });
    }
  };

  const handleCancelDecision = () => {
    setSelectedEscalation(null);
    setDecisionNotes("");
    setPendingDecision(null);
  };

  if (isLoading) {
    return (
      <GovPortalLayout userRole="PLANNING_SECRETARY">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="gov-page-header">
            <div className="gov-breadcrumb">
              Home / Secretary / Escalations
            </div>
            <h1 className="gov-page-title">Escalations Management</h1>
            <p className="gov-page-description">
              Review and resolve escalations that require your attention as Planning Secretary.
            </p>
          </div>
          <PageSkeleton />
        </div>
      </GovPortalLayout>
    );
  }

  if (error) {
    return (
      <GovPortalLayout userRole="PLANNING_SECRETARY">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="gov-page-header">
            <div className="gov-breadcrumb">
              Home / Secretary / Escalations
            </div>
            <h1 className="gov-page-title">Escalations Management</h1>
            <p className="gov-page-description">
              Review and resolve escalations that require your attention as Planning Secretary.
            </p>
          </div>
          <GovAlert variant="danger">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>
                Failed to load escalations.
                <button
                  onClick={() => refetch()}
                  className="underline font-medium ml-1"
                >
                  Retry
                </button>
              </span>
            </div>
          </GovAlert>
        </div>
      </GovPortalLayout>
    );
  }

  const rmMissedDeadlines = data?.rmMissedDeadlines ?? [];
  const jsMissedDecisions = data?.jsMissedDecisions ?? [];
  const finalEscalations = data?.finalEscalations ?? [];

  const totalEscalations =
    rmMissedDeadlines.length + jsMissedDecisions.length + finalEscalations.length;

  return (
    <GovPortalLayout userRole="PLANNING_SECRETARY">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="gov-page-header">
          <div className="gov-breadcrumb">
            Home / Secretary / Escalations
          </div>
          <h1 className="gov-page-title">Escalations Management</h1>
          <p className="gov-page-description">
            Review and resolve escalations that require your attention as Planning Secretary.
          </p>
        </div>

        {/* Summary Alert */}
        {totalEscalations > 0 && (
          <GovAlert variant="warning" className="mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>
                You have <strong>{totalEscalations}</strong> pending escalations requiring your review.
              </span>
            </div>
          </GovAlert>
        )}

        {/* Decision Modal */}
        {selectedEscalation && pendingDecision && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                {pendingDecision === "APPROVE" && "Approve Escalation"}
                {pendingDecision === "REJECT" && "Reject Escalation"}
                {pendingDecision === "DEFER" && "Defer Escalation"}
              </h3>
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  <strong>Escalation:</strong> #{selectedEscalation.id} - {selectedEscalation.title}
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Description:</strong> {selectedEscalation.description}
                </p>
              </div>
              <div className="mb-4">
                <label className="gov-label">Decision Notes</label>
                <textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Enter your notes or reasoning for this decision..."
                  className="gov-textarea w-full"
                  rows={4}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <GovButton
                  variant="muted"
                  onClick={handleCancelDecision}
                  disabled={resolveMutation.isPending}
                >
                  Cancel
                </GovButton>
                <GovButton
                  onClick={handleConfirmDecision}
                  disabled={resolveMutation.isPending}
                  variant={
                    pendingDecision === "APPROVE"
                      ? "primary"
                      : pendingDecision === "REJECT"
                      ? "danger"
                      : "secondary"
                  }
                >
                  {resolveMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {pendingDecision === "APPROVE" && <CheckCircle2 className="w-4 h-4" />}
                      {pendingDecision === "REJECT" && <XCircle className="w-4 h-4" />}
                      {pendingDecision === "DEFER" && <Clock className="w-4 h-4" />}
                      Confirm {pendingDecision.charAt(0) + pendingDecision.slice(1).toLowerCase()}
                    </>
                  )}
                </GovButton>
              </div>
            </div>
          </div>
        )}

        {/* Escalations Sections */}
        <div className="space-y-6">
          {/* RM Missed Deadlines */}
          <GovCard>
            <GovCardHeader>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <GovCardTitle>RM Missed Deadlines</GovCardTitle>
                {rmMissedDeadlines.length > 0 && (
                  <GovStatusBadge variant="warning">
                    {rmMissedDeadlines.length} Pending
                  </GovStatusBadge>
                )}
              </div>
            </GovCardHeader>
            <GovCardBody>
              <EscalationsTable
                escalations={rmMissedDeadlines}
                showDecisionButtons={true}
                onDecision={handleDecisionClick}
                processingId={resolveMutation.isPending ? selectedEscalation?.id : null}
              />
            </GovCardBody>
          </GovCard>

          {/* JS Missed Decisions */}
          <GovCard>
            <GovCardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <GovCardTitle>JS Missed Decisions</GovCardTitle>
                {jsMissedDecisions.length > 0 && (
                  <GovStatusBadge variant="danger">
                    {jsMissedDecisions.length} Pending
                  </GovStatusBadge>
                )}
              </div>
            </GovCardHeader>
            <GovCardBody>
              <EscalationsTable
                escalations={jsMissedDecisions}
                showDecisionButtons={true}
                onDecision={handleDecisionClick}
                processingId={resolveMutation.isPending ? selectedEscalation?.id : null}
              />
            </GovCardBody>
          </GovCard>

          {/* Final Escalations */}
          <GovCard>
            <GovCardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-700" />
                <GovCardTitle>Final Escalations Requiring Decision</GovCardTitle>
                {finalEscalations.length > 0 && (
                  <GovStatusBadge variant="danger">
                    {finalEscalations.length} Pending
                  </GovStatusBadge>
                )}
              </div>
            </GovCardHeader>
            <GovCardBody>
              <EscalationsTable
                escalations={finalEscalations}
                showDecisionButtons={true}
                onDecision={handleDecisionClick}
                processingId={resolveMutation.isPending ? selectedEscalation?.id : null}
              />
            </GovCardBody>
          </GovCard>
        </div>
      </div>
    </GovPortalLayout>
  );
}
