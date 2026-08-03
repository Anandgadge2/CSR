// Role Audit Tab — Audit log with expandable before/after diff
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown, ChevronRight, User, Activity, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuditLogs } from "@/hooks/useAccessControl";
import type { Role, AuditEntry } from "@/types/accessControl";

interface RoleAuditTabProps {
  role: Role;
}

export function RoleAuditTab({ role }: RoleAuditTabProps) {
  const [page, setPage] = useState(1);
  const { data: auditData, isLoading, refetch } = useAuditLogs({ roleId: role.id, page, pageSize: 20 });
  const entries = auditData?.data ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const actionVariant = (action: string): "primary" | "success" | "warning" | "danger" | "info" | "muted" => {
    if (action.includes("create") || action.includes("clone")) return "success";
    if (action.includes("delete") || action.includes("remove")) return "danger";
    if (action.includes("deactivate") || action.includes("archive")) return "warning";
    if (action.includes("activate")) return "primary";
    return "info";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Activity size={14} className="text-blue-500" aria-hidden="true" />
          Audit History
        </h4>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-slate-400">Loading audit history...</div>
      ) : entries.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">No audit entries found for this role.</div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div
                key={entry.id}
                className="border border-slate-200/60 rounded-xl overflow-hidden bg-white/60"
              >
                {/* Entry header */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/40 transition-colors min-h-[48px]"
                  aria-expanded={isExpanded}
                >
                  <span className="shrink-0 text-slate-400">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={actionVariant(entry.action)} size="sm">
                        {entry.action}
                      </Badge>
                      <span className="text-xs text-slate-600 font-semibold truncate">
                        {entry.actorEmail || entry.actor}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-xs text-slate-400">
                    <Clock size={12} aria-hidden="true" />
                    <time dateTime={entry.timestamp}>
                      {new Date(entry.timestamp).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100/60 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <AuditField label="Actor" value={entry.actorEmail || entry.actor} icon={<User size={11} />} />
                          <AuditField label="Action" value={entry.action} icon={<Activity size={11} />} />
                          <AuditField
                            label="Date/Time"
                            value={new Date(entry.timestamp).toLocaleString()}
                            icon={<Clock size={11} />}
                          />
                          <AuditField label="Scope" value={entry.scope || "—"} />
                          <AuditField label="Correlation ID" value={entry.correlationId || "—"} mono />
                          {entry.reason && <AuditField label="Reason" value={entry.reason} className="sm:col-span-2" />}
                        </div>

                        {/* Before / After Diff */}
                        {(entry.before || entry.after) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {entry.before && (
                              <div className="p-3 bg-red-50/60 rounded-lg border border-red-200/40">
                                <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Before</p>
                                <pre className="text-[10px] font-mono text-red-700 whitespace-pre-wrap break-words max-h-40 overflow-y-auto" data-lenis-prevent>
                                  {JSON.stringify(entry.before, null, 2)}
                                </pre>
                              </div>
                            )}
                            {entry.after && (
                              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200/40">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">After</p>
                                <pre className="text-[10px] font-mono text-emerald-700 whitespace-pre-wrap break-words max-h-40 overflow-y-auto" data-lenis-prevent>
                                  {JSON.stringify(entry.after, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {auditData && auditData.total > 20 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-xs text-slate-500">
            Page {page} of {Math.ceil(auditData.total / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(auditData.total / 20)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function AuditField({
  label,
  value,
  icon,
  mono,
  className,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-slate-400">{icon}</span>}
        <p className={`text-xs text-slate-700 ${mono ? "font-mono bg-slate-50 px-1.5 py-0.5 rounded" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
