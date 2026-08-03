// Unsaved Changes Bar — Sticky bottom bar for dirty permission edits
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Save, Eye, AlertTriangle, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UnsavedChangesBarProps {
  isVisible: boolean;
  addedCount: number;
  removedCount: number;
  isSaving: boolean;
  hasHighRiskChanges: boolean;
  onReviewChanges: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export function UnsavedChangesBar({
  isVisible,
  addedCount,
  removedCount,
  isSaving,
  hasHighRiskChanges,
  onReviewChanges,
  onSave,
  onDiscard,
}: UnsavedChangesBarProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-lg px-6 py-3"
          role="status"
          aria-live="polite"
          aria-label="Unsaved permission changes"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            {/* Change summary */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-700">Unsaved Changes</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium">
                {addedCount > 0 && (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    +{addedCount} added
                  </span>
                )}
                {removedCount > 0 && (
                  <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200/60">
                    −{removedCount} removed
                  </span>
                )}
              </div>
              {hasHighRiskChanges && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  <AlertTriangle size={10} aria-hidden="true" />
                  HIGH-RISK
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" icon={Undo2} onClick={onDiscard}>
                Discard
              </Button>
              <Button variant="outline" size="sm" icon={Eye} onClick={onReviewChanges}>
                Review Changes
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Save}
                loading={isSaving}
                loadingText="Saving..."
                onClick={onSave}
              >
                Save Permissions
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
