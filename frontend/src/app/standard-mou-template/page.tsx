import Link from "next/link";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovButton from "@/components/gov/GovButton";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";

const parties = [
  "The [District/Department], Government of Maharashtra, represented by the District Nodal Officer, [Name & Designation] (the Government Party).",
  "[Corporate Name], a company incorporated under the Companies Act, CIN [____], office at [____] (the Corporate Partner).",
];

const clauses = [
  ["Clause 1 - Purpose and Scope", "The Corporate Partner shall undertake the following CSR project in convergence with the Government Party: [Project Title and description]. The project falls under Schedule VII clause [___] of the Companies Act, 2013."],
  ["Clause 2 - Project Location", "The project shall be implemented at [exact location: institution/village/ward, taluka, district]."],
  ["Clause 3 - Deliverables and Timeline", "Agreed deliverables, milestones, and timeline are in Schedule I. The project shall be completed within [___] months from signing, unless extended by mutual written agreement recorded on the portal."],
  ["Clause 4 - Financial Contribution", "The Corporate Partner shall contribute CSR funds of approximately Rs. [____]. Proper accounts shall be maintained and Utilisation Certificates provided as deliverables are completed."],
  ["Clause 5 - Government Party's Contribution", "The Government Party shall provide [land / building / site access / permissions / personnel, as applicable] per Schedule II, in a timely manner so as not to delay implementation."],
  ["Clause 6 - Implementation", "The project shall be implemented by [the Corporate Partner directly / the Implementing Agency on its behalf]. The Implementing Agency shall record progress against deliverables on the portal."],
  ["Clause 7 - Monitoring", "The District Nodal Officer and the Corporate Partner shall monitor the project on the portal using the standard progress format. The Corporate Partner may engage an independent third party for M&E, whose report shall be uploaded on the portal."],
  ["Clause 8 - Utilisation Certificate", "The Implementing Agency / Corporate Partner shall upload UCs on the portal as deliverables complete. The District Nodal Officer shall certify completion based on field verification."],
  ["Clause 9 - Ownership and Maintenance", "On completion, the asset shall be owned by [the Government institution/department]. Ongoing operation and maintenance shall vest with [named entity] per Schedule II."],
  ["Clause 10 - Changes to Deliverables", "Deliverables may be modified by mutual written agreement, recorded on the portal with the District Nodal Officer's approval."],
  ["Clause 11 - Grievances", "Issues shall be resolved through the portal's grievance mechanism: District Nodal Officer (15 days), escalating to the State CSR Cell (30 days)."],
  ["Clause 12 - Recognition", "The Government Party shall recognise the Corporate Partner through Success Stories, the Completed Projects Gallery, and applicable CSR awards."],
  ["Clause 13 - Term and Termination", "Valid until project completion and final UC. May be terminated by mutual agreement, or by either Party with [30] days' notice for valid cause, settling obligations for work already done."],
  ["Clause 14 - Dispute Resolution", "Disputes shall be resolved amicably through the State CSR Cell; failing which, subject to the jurisdiction of courts in the relevant district in Maharashtra."],
  ["Clause 15 - General", "This MoU is entered in good faith for public benefit. It creates no commercial relationship and does not obligate the Corporate Partner beyond its voluntary CSR commitment."],
];

const schedules = [
  ["Schedule I", "Deliverables, milestones, completion criteria, timeline, and milestone-wise fund linkage."],
  ["Schedule II", "Government contribution, site access, permissions, ownership, maintenance responsibility, and recurring-cost arrangement."],
];

export default function StandardMouTemplatePage() {
  return (
    <GovPortalLayout showSidebar={false}>
      <div className="gov-public-main">
        <div className="gov-page-header">
          <div className="gov-breadcrumb">Home / Document Library / Standard MoU Template</div>
          <h1 className="gov-page-title">Annexure B: Standard MoU Template</h1>
          <p className="gov-page-description">
            Standard Memorandum of Understanding used for CSR convergence projects under the Maharashtra CSR Portal.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 16 }}>
          <div style={{ display: "grid", gap: 16 }}>
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Memorandum of Understanding</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <p style={{ marginTop: 0, lineHeight: 1.7 }}>
                  <strong>MEMORANDUM OF UNDERSTANDING</strong><br />
                  for CSR Convergence Project under the Maharashtra CSR Portal
                </p>
                <p style={{ lineHeight: 1.7 }}>
                  This MoU is entered into on _____ day of __________, 20____, by and between:
                </p>
                <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
                  {parties.map((party) => <li key={party}>{party}</li>)}
                </ol>
              </GovCardBody>
            </GovCard>

            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Clauses</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <div style={{ display: "grid", gap: 12 }}>
                  {clauses.map(([title, body]) => (
                    <section key={title} style={{ padding: 14, border: "1px solid var(--gov-border)", background: "#fff" }}>
                      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "var(--gov-primary-dark)" }}>{title}</h2>
                      <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.7, color: "var(--gov-text-secondary)" }}>{body}</p>
                    </section>
                  ))}
                </div>
              </GovCardBody>
            </GovCard>

            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Signatures</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                  {["For the Government Party", "For the Corporate Partner", "For the Implementing Agency"].map((label) => (
                    <div key={label} style={{ padding: 14, border: "1px solid var(--gov-border)", minHeight: 96 }}>
                      <div style={{ fontWeight: 800 }}>{label}</div>
                      <div style={{ marginTop: 32, borderTop: "1px solid var(--gov-border-dark)", paddingTop: 8 }}>Signature / Name / Date</div>
                    </div>
                  ))}
                </div>
              </GovCardBody>
            </GovCard>
          </div>

          <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Portal Usage</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <div style={{ fontSize: 13, lineHeight: 1.65, color: "var(--gov-text-secondary)" }}>
                  This template is used after JS approval and Nodal Officer appointment, when the corporate, District Nodal Officer, and implementing agency finalize deliverables before project onboarding.
                </div>
                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                  <Link href="/workflow"><GovButton variant="secondary" style={{ width: "100%" }}>View Workflow</GovButton></Link>
                  <Link href="/document-library"><GovButton variant="muted" style={{ width: "100%" }}>Document Library</GovButton></Link>
                </div>
              </GovCardBody>
            </GovCard>

            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Schedules</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <div style={{ display: "grid", gap: 10 }}>
                  {schedules.map(([title, body]) => (
                    <div key={title} style={{ padding: 12, border: "1px solid var(--gov-border)", background: "#f8fafc" }}>
                      <div style={{ fontWeight: 800 }}>{title}</div>
                      <div style={{ marginTop: 4, fontSize: 13, color: "var(--gov-text-secondary)", lineHeight: 1.55 }}>{body}</div>
                    </div>
                  ))}
                </div>
              </GovCardBody>
            </GovCard>
          </div>
        </div>
      </div>
    </GovPortalLayout>
  );
}
