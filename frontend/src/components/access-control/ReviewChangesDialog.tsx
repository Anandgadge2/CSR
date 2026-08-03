// Review Changes Dialog — Permission diff with impact preview
"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AddedPermissionBadge, RemovedPermissionBadge } from "./PermissionBadge";
import { AlertTriangle, Save, Users, Loader2 } from "lucide-react";
import type { ImpactPreview } from "@/types/accessControl";

interface ReviewChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  addedPermissions: string[];
  removedPermissions: string[];
  impactPreview: ImpactPreview | null;
  isLoadingImpact: boolean;
  requiresReason: boolean;
  onConfirmSave: (reason: string) => void;
  isSaving: boolean;
}

export function ReviewChangesDialog({
  isOpen,
  onClose,
  addedPermissions,
  removedPermissions,
  impactPreview,
  isLoadingImpact,
  requiresReason,
  onConfirmSave,
  isSaving,
}: ReviewChangesDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirmSave(reason);
  };

  const canSave = !requiresReason || reason.trim().length >= 10;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Permission Changes" className="max-w-2xl">
      <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1" data-lenis-prevent>
        {/* Added permissions */}
        {addedPermissions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
              Permissions to Add ({addedPermissions.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {addedPermissions.map((key) => (
                <AddedPermissionBadge key={key} permKey={key} />
              ))}
            </div>
          </div>
        )}

        {/* Removed permissions */}
        {removedPermissions.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">
              Permissions to Remove ({removedPermissions.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {removedPermissions.map((key) => (
                <RemovedPermissionBadge key={key} permKey={key} />
              ))}
            </div>
          </div>
        )}

        {/* Impact Preview */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/40">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Users size={12} aria-hidden="true" />
            Impact Preview
          </h4>

          {isLoadingImpact ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              Calculating impact...
            </div>
          ) : impactPreview ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/40">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Affected Users</p>
                <p className="text-lg font-bold text-slate-800">{impactPreview.affectedUserCount}</p>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/40">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Active Sessions</p>
                <p className="text-lg font-bold text-slate-800">{impactPreview.activeSessionCount}</p>
              </div>
              {impactPreview.highRiskChanges.length > 0 && (
                <div className="col-span-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200/40">
                  <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">High-Risk Changes</p>
                  <div className="flex flex-wrap gap-1">
                    {impactPreview.highRiskChanges.map((key) => (
                      <span key={key} className="text-[10px] font-mono font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Impact preview unavailable.</p>
          )}
        </div>

        {/* Reason for high-risk changes */}
        {requiresReason && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-600" aria-hidden="true" />
              <label htmlFor="change-reason" className="text-xs font-bold text-amber-700">
                Reason Required (minimum 10 characters)
              </label>
            </div>
            <textarea
              id="change-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why these high-risk permission changes are needed..."
              className="w-full h-20 px-3 py-2 text-sm bg-white border border-slate-200/60 rounded-xl resize-none focus:outline-none focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/10 transition-all"
              aria-required="true"
            />
            {reason.length > 0 && reason.length < 10 && (
              <p className="text-[10px] text-red-500 mt-1">{10 - reason.length} more characters required</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100/60 mt-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={Save}
          loading={isSaving}
          loadingText="Saving..."
          disabled={!canSave}
          onClick={handleConfirm}
        >
          Confirm Save
        </Button>
      </div>
    </Modal>
  );
}
