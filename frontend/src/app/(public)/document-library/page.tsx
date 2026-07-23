import Link from "next/link";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovButton from "@/components/gov/GovButton";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";

export default function DocumentLibraryPage() {
  const items = [
    { title: "Companies Act, 2013 - Section 135 CSR applicability", href: "/csr-policy", tag: "Legal" },
    { title: "CSR Rules 2014 & MCA amendments", href: "/csr-policy", tag: "Rules" },
    { title: "Schedule VII eligible CSR activities", href: "/csr-policy", tag: "Schedule VII" },
    { title: "Assessment Report + 13-Point Feasibility Checklist", href: "/workflow", tag: "Annexure A" },
    { title: "Standard MoU Template", href: "/standard-mou-template", tag: "Annexure B" },
    { title: "Progress, UC and Milestone Tracking Formats", href: "/resources", tag: "Formats" },
  ];

  return (
    <GovPortalLayout showSidebar={false}>
      <div className="gov-public-main">
        <div className="gov-page-header">
          <div className="gov-breadcrumb">Home / Document Library</div>
          <h1 className="gov-page-title">Document Library</h1>
          <p className="gov-page-description">CSR Rules 2014 & MCA amendments; Schedule VII; State GRs; progress formats; checklists.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
          {[
            ["Legal Framework", "Section 135"],
            ["Eligibility", "Schedule VII"],
            ["Portal Annexures", "A + B"],
            ["Support", "Helpdesk 2 days"],
          ].map(([label, value]) => (
            <GovCard key={label}>
              <GovCardBody>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--gov-text-muted)", textTransform: "uppercase" }}>{label}</div>
                <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800, color: "var(--gov-primary-dark)" }}>{value}</div>
              </GovCardBody>
            </GovCard>
          ))}
        </div>
        <GovCard>
          <GovCardBody>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              {items.map((item) => (
                <div key={item.title} style={{ padding: 14, border: "1px solid var(--gov-border)", background: "#fff" }}>
                  <span className="gov-status gov-status-info" style={{ marginBottom: 10 }}>{item.tag}</span>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>{item.title}</div>
                  <Link href={item.href}>
                    <GovButton variant="secondary" style={{ width: "100%" }}>Open</GovButton>
                  </Link>
                </div>
              ))}
            </div>
          </GovCardBody>
        </GovCard>
      </div>
    </GovPortalLayout>
  );
}
