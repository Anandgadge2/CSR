"use client";

import { ReactNode, useEffect } from "react";
import "@/styles/gov-theme.css";

interface GovModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}

/**
 * Simple modal overlay for government-styled forms.
 */
export default function GovModal({ open, onClose, title, children, width = 600 }: GovModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.45)",
        }}
      />

      {/* Panel */}
      <div
        className="gov-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          overflow: "auto",
          animation: "govFadeInUp 0.25s ease forwards",
        }}
      >
        {/* Header */}
        <div
          className="gov-card-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <h3 className="gov-card-title">{title}</h3>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "var(--gov-text-muted)",
              lineHeight: 1,
              padding: "4px 8px",
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="gov-card-body">{children}</div>
      </div>
    </div>
  );
}
