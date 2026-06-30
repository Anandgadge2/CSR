import Link from "next/link";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovButton from "@/components/gov/GovButton";
import { GovCard, GovCardBody } from "@/components/gov/GovCard";

export default function DocumentLibraryPage() {
  const items = [
    { title: "Assessment report format", href: "/workflow" },
    { title: "Standard MoU template", href: "/standard-mou-template" },
    { title: "Utilization Certificate format", href: "/workflow" },
    { title: "Government pitch checklist", href: "/workflow" },
  ];

  return (
    <GovPortalLayout showSidebar={false}>
      <div className="gov-public-main">
        <div className="gov-page-header">
          <div className="gov-breadcrumb">Home / Document Library</div>
          <h1 className="gov-page-title">Document Library</h1>
          <p className="gov-page-description">Official templates, formats and reference documents for MahaCSR workflows.</p>
        </div>
        <GovCard>
          <GovCardBody>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              {items.map((item) => (
                <div key={item.title} style={{ padding: 14, border: "1px solid var(--gov-border)", background: "#fff" }}>
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
