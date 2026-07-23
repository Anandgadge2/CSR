"use client";

import GovPortalLayout from "../layout/GovPortalLayout";
import "@/styles/gov-theme.css";

interface AccessDeniedProps {
  requiredRoles?: string[];
}

/**
 * Shows an access denied card. Never crashes or shows a blank page.
 */
export default function AccessDenied({ requiredRoles }: AccessDeniedProps) {
  return (
    <GovPortalLayout showSidebar={false}>
      <div className="gov-public-main" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="gov-card" style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div className="gov-card-body" style={{ padding: "48px 32px" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 28,
              }}
            >
              🔒
            </div>
            <h2 style={{ color: "var(--gov-primary-dark)", fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>
              Access Denied
            </h2>
            <p style={{ color: "var(--gov-text-muted)", fontSize: 14, margin: "0 0 20px" }}>
              You do not have permission to access this page. Please log in with an authorized account.
            </p>
            {requiredRoles && requiredRoles.length > 0 && (
              <p style={{ color: "var(--gov-text-muted)", fontSize: 12, margin: "0 0 20px" }}>
                Required roles: {requiredRoles.join(", ")}
              </p>
            )}
            <a
              href="/login"
              className="gov-btn gov-btn-primary"
              style={{ textDecoration: "none" }}
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    </GovPortalLayout>
  );
}
