// Conflict Resolution Dialog — HTTP 409 handler with version diff
"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, RefreshCw, Upload, X } from "lucide-react";

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serverVersion: number;
  clientVersion: number;
  resourceLabel: string;
  onUseServerVersion: () => void;
  onForceOverwrite: () => void;
}

export function ConflictResolutionDialog({
  isOpen,
  onClose,
  serverVersion,
  clientVersion,
  resourceLabel,
  onUseServerVersion,
  onForceOverwrite,
}: ConflictResolutionDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Version Conflict Detected">
      <div className="flex flex-col gap-5">
        {/* Warning banner */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200/60 rounded-xl">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Concurrent Modification
            </p>
            <p className="text-xs text-amber-700 mt-1">
              <strong>{resourceLabel}</strong> was modified by another user while you were editing.
              Your changes are based on version <strong>v{clientVersion}</strong>,
              but the server is now at version <strong>v{serverVersion}</strong>.
            </p>
          </div>
        </div>

        {/* Version comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Version</p>
            <p className="text-lg font-bold text-slate-700">v{clientVersion}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200/60">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Server Version</p>
            <p className="text-lg font-bold text-blue-700">v{serverVersion}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            variant="primary"
            fullWidth
            icon={RefreshCw}
            onClick={onUseServerVersion}
          >
            Reload Server Version
          </Button>
          <Button
            variant="warning"
            fullWidth
            icon={Upload}
            onClick={onForceOverwrite}
          >
            Force Overwrite
          </Button>
          <Button
            variant="ghost"
            fullWidth
            icon={X}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
