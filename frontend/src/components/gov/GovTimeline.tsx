"use client";

import "../../styles/gov-theme.css";

export interface TimelineStep {
  label: string;
  description?: string;
  date?: string;
  status: "completed" | "active" | "pending";
}

interface GovTimelineProps {
  steps: TimelineStep[];
}

/**
 * Vertical status timeline using gov-stepper/gov-step CSS.
 */
export default function GovTimeline({ steps }: GovTimelineProps) {
  return (
    <div className="gov-stepper">
      {steps.map((step, idx) => (
        <div key={idx} className={`gov-step ${step.status}`}>
          <div className="gov-step-number">
            {step.status === "completed" ? "✓" : idx + 1}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--gov-primary-dark)" }}>
              {step.label}
            </div>
            {step.description && (
              <div style={{ fontSize: 12, color: "var(--gov-text-muted)", marginTop: 2 }}>
                {step.description}
              </div>
            )}
            {step.date && (
              <div style={{ fontSize: 11, color: "var(--gov-text-muted)", marginTop: 3 }}>
                {new Date(step.date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
