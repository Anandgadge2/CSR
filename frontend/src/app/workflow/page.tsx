import Link from "next/link";
import GovPortalLayout from "@/components/layout/GovPortalLayout";
import GovButton from "@/components/gov/GovButton";
import { GovCard, GovCardHeader, GovCardTitle, GovCardBody } from "@/components/gov/GovCard";

const corporateSteps = [
  ["1", "Corporate Enquiry Form", "Company details, sector, geography, optional budget, CSR contact, OTP-verified mobile and email, MCA21 CIN, and proposed CSR work."],
  ["2", "Unique Tracking ID", "Tracking ID is generated instantly and sent by SMS and email for live status tracking."],
  ["3", "RM Response", "A dedicated CSR Relationship Manager responds within 5 days and records every interaction."],
  ["4", "Assessment to JS", "RM submits the assessment report and 13-point feasibility checklist to the Joint Secretary."],
  ["5", "JS Decision", "JS approves, approves with conditions, or records a reason for not proceeding. If approved, a District Nodal Officer is appointed."],
  ["6-8", "Dialogue, MoU, Onboarding", "Nodal officer and corporate finalize the project, execute the standard MoU, and onboard the project with a Project ID."],
];

const guarantees = [
  "RM response: 5 days",
  "RM silence: escalates to Joint Secretary for action within 3 days",
  "JS silence after escalation: escalates to Planning Secretary within 2 days",
  "JS decision SLA: 5 days, then Secretary decision within 2 days",
];

const implementationSteps = [
  ["Sub-Login", "Corporates using their own NGO or foundation can use an implementing-agency sub-login. The agency updates progress while the corporate remains accountable."],
  ["Simple Statuses", "Every deliverable uses only Not Started, In Progress, or Completed."],
  ["Evidence", "Against each milestone, the agency records funds utilized and attaches geo-tagged photo evidence."],
  ["UC and Verification", "The agency uploads the Utilization Certificate. The District Nodal Officer verifies completion and UC evidence."],
  ["Optional M&E", "Independent third-party monitoring and evaluation reports can be linked as supporting documents."],
];

const slaRows = [
  ["Initial response to corporate enquiry", "CSR Relationship Manager", "5 days", "Joint Secretary (3 days)", "Planning Secretary (2 days)"],
  ["Decision on report & Nodal Officer appointment", "Joint Secretary", "5 days", "Planning Secretary (2 days)", "-"],
  ["Government pitch verification", "CSR Relationship Manager", "5 days", "Joint Secretary (3 days)", "Planning Secretary (2 days)"],
  ["Grievance resolution", "District Nodal Officer", "15 days", "State CSR Cell (30 days)", "JS / Planning Secretary"],
  ["Static helpdesk query", "Helpdesk", "2 days", "-", "-"],
];

const assessmentFields = [
  ["Report Reference & Date", "Auto-generated"],
  ["Corporate Tracking ID", "Unique ID from enquiry"],
  ["Company Name & CIN", "MCA21-verified"],
  ["Sector & Contact", "From enquiry form, OTP-verified"],
  ["Proposed CSR Work", "Relationship Manager summary"],
  ["Proposed Location / District", "Where the corporate wants to work"],
  ["Indicative Budget", "If provided"],
  ["Development Need Addressed", "Genuine, verified need addressed"],
  ["Date of First Contact", "Confirms the 5-day response time was met"],
  ["Summary of Interaction", "Brief dialogue record"],
  ["Feasibility Result", "FEASIBLE / PROCEED WITH CONDITIONS / NOT FEASIBLE"],
  ["Recommendation", "Proceed / Proceed with conditions / Do Not Proceed, with reasons"],
  ["Suggested Nodal Officer Domain", "Education Officer, District Health Officer, Executive Engineer, etc."],
];

const feasibilityChecklist = [
  [1, "Mandate & Legal [C]", "Activity falls within Schedule VII of the Companies Act", "Yes / No"],
  [2, "Mandate & Legal [C]", "Not a prohibited CSR activity", "Yes / No"],
  [3, "Need & Alignment [C]", "Addresses a genuine, verified development need", "Yes / No"],
  [4, "Need & Alignment [C]", "Does NOT duplicate an existing government scheme or project in the same location", "Yes / No"],
  [5, "Site & Govt Support [C]", "Site/land is available, clear, and in government ownership/control for construction/renovation", "Yes / No / NA"],
  [6, "Site & Govt Support [C]", "Required permissions/clearances are obtainable within a reasonable time", "Yes / No"],
  [7, "Site & Govt Support [C]", "Required government support/personnel/access is confirmed", "Yes / No"],
  [8, "Financial", "Indicative budget is adequate for the proposed scope", "Yes / No"],
  [9, "Financial", "Cost estimate is realistic and benchmarked against similar works", "Yes / No"],
  [10, "Implementation", "Implementing capacity exists", "Yes / No"],
  [11, "Implementation", "Timeline is realistic for the scope", "Yes / No"],
  [12, "Sustainability [C]", "Post-completion ownership of the asset is clear", "Yes / No"],
  [13, "Sustainability [C]", "Maintenance / recurring-cost responsibility is identified", "Yes / No"],
];

export default function WorkflowPage() {
  return (
    <GovPortalLayout showSidebar={false}>
      <div className="gov-public-main">
        <div className="gov-page-header">
          <div className="gov-breadcrumb">Home / Workflow</div>
          <h1 className="gov-page-title">Corporate CSR Partnership Flow</h1>
          <p className="gov-page-description">
            The red-carpet journey for corporates partnering with Maharashtra, from enquiry to tracking, assessment, MoU and project onboarding.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(280px, 1fr)", gap: 16 }}>
          <GovCard>
            <GovCardHeader>
              <GovCardTitle>Partner with Maharashtra Journey</GovCardTitle>
            </GovCardHeader>
            <GovCardBody>
              <div style={{ display: "grid", gap: 12 }}>
                {corporateSteps.map(([number, title, detail]) => (
                  <div
                    key={number}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "56px minmax(0, 1fr)",
                      gap: 14,
                      padding: 14,
                      border: "1px solid var(--gov-border)",
                      borderLeft: "4px solid var(--gov-primary)",
                      background: number === "2" || number === "5" || number === "6-8" ? "#ecfdf5" : "#e8f0f8",
                    }}
                  >
                    <div style={{ fontWeight: 800, color: "var(--gov-primary)" }}>Step {number}</div>
                    <div>
                      <div style={{ fontWeight: 800 }}>{title}</div>
                      <div style={{ marginTop: 4, color: "var(--gov-text-secondary)", fontSize: 13 }}>{detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </GovCardBody>
          </GovCard>

          <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Time-Bound Guarantee</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <div style={{ display: "grid", gap: 10 }}>
                  {guarantees.map((item) => (
                    <div key={item} style={{ padding: 12, border: "1px solid var(--gov-border)", background: "#fff7ed", fontSize: 13, fontWeight: 700 }}>
                      {item}
                    </div>
                  ))}
                </div>
              </GovCardBody>
            </GovCard>

            <GovCard>
              <GovCardHeader>
                <GovCardTitle>Access Points</GovCardTitle>
              </GovCardHeader>
              <GovCardBody>
                <div style={{ display: "grid", gap: 10 }}>
                  <Link href="/partner-with-maharashtra">
                    <GovButton style={{ width: "100%" }}>Start Corporate Enquiry</GovButton>
                  </Link>
                  <Link href="/track">
                    <GovButton variant="secondary" style={{ width: "100%" }}>Track with ID</GovButton>
                  </Link>
                </div>
              </GovCardBody>
            </GovCard>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <GovCard>
            <GovCardHeader>
              <GovCardTitle>Implementation, Tracking & Monitoring</GovCardTitle>
            </GovCardHeader>
            <GovCardBody>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {implementationSteps.map(([title, detail]) => (
                  <div key={title} style={{ padding: 14, border: "1px solid var(--gov-border)", background: "#f8fafc" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--gov-primary)" }}>{title}</div>
                    <div style={{ marginTop: 6, fontSize: 13, color: "var(--gov-text-secondary)", lineHeight: 1.55 }}>{detail}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, padding: 14, border: "1px solid var(--gov-border)", background: "#ecfdf5" }}>
                <div style={{ fontWeight: 800, color: "var(--gov-success)" }}>Where to access it after login</div>
                <div style={{ marginTop: 6, fontSize: 13, color: "var(--gov-text-secondary)", lineHeight: 1.6 }}>
                  Open <strong>/convergence-projects</strong>, select a project, then click <strong>Milestone Tracking</strong>. Direct tracking URLs use the format <strong>/projects/&lt;project-id&gt;/tracking</strong>.
                </div>
              </div>
            </GovCardBody>
          </GovCard>
        </div>

        <div style={{ marginTop: 18 }}>
          <GovCard>
            <GovCardHeader>
              <GovCardTitle>Complete Escalation & Response-Time Summary</GovCardTitle>
            </GovCardHeader>
            <GovCardBody>
              <div className="gov-table-container">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Stage</th>
                      <th>Primary Responsible</th>
                      <th>Time</th>
                      <th>First Escalation</th>
                      <th>Second Escalation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slaRows.map(([stage, responsible, time, first, second]) => (
                      <tr key={stage}>
                        <td style={{ fontWeight: 700 }}>{stage}</td>
                        <td>{responsible}</td>
                        <td>{time}</td>
                        <td>{first}</td>
                        <td>{second}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 14, padding: 14, border: "1px solid var(--gov-border)", background: "#fff7ed", fontSize: 13, lineHeight: 1.6 }}>
                <strong>Worst-case guarantee:</strong> a corporate enquiry receives a response within a maximum of 10 days even if every level misses its deadline.
              </div>
            </GovCardBody>
          </GovCard>
        </div>

        <div style={{ marginTop: 18 }}>
          <GovCard>
            <GovCardHeader>
              <GovCardTitle>Annexure A: Assessment Report + 13-Point Feasibility Checklist</GovCardTitle>
            </GovCardHeader>
            <GovCardBody>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 360px)", gap: 16 }}>
                <div>
                  <h3 className="gov-section-title">A.1 Assessment Report Format</h3>
                  <div className="gov-table-container">
                    <table className="gov-table">
                      <tbody>
                        {assessmentFields.map(([field, content]) => (
                          <tr key={field}>
                            <td style={{ width: 260, fontWeight: 700 }}>{field}</td>
                            <td>{content}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div style={{ padding: 14, border: "1px solid var(--gov-border)", background: "#ecfdf5", alignSelf: "start" }}>
                  <div style={{ fontWeight: 800, color: "var(--gov-success)" }}>Where this is used</div>
                  <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.65, color: "var(--gov-text-secondary)" }}>
                    RM login: open <strong>/rm/enquiries</strong>, select an enquiry, then open <strong>Feasibility Assessment</strong>. JS login: review submitted reports at <strong>/js/assessments</strong>.
                  </div>
                  <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                    <Link href="/rm/enquiries"><GovButton style={{ width: "100%" }}>RM Enquiry Assessments</GovButton></Link>
                    <Link href="/js/assessments"><GovButton variant="secondary" style={{ width: "100%" }}>JS Assessment Queue</GovButton></Link>
                    <Link href="/js/escalations"><GovButton variant="danger" style={{ width: "100%" }}>JS Escalations</GovButton></Link>
                    <Link href="/secretary/escalations"><GovButton variant="secondary" style={{ width: "100%" }}>Planning Secretary Escalations</GovButton></Link>
                  </div>
                </div>
              </div>

              <h3 className="gov-section-title" style={{ marginTop: 18 }}>A.2 13-Point Project Feasibility Checklist</h3>
              <div className="gov-table-container">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Dimension</th>
                      <th>Check</th>
                      <th>Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feasibilityChecklist.map(([number, dimension, check, answer]) => (
                      <tr key={number}>
                        <td>{number}</td>
                        <td style={{ fontWeight: 700 }}>{dimension}</td>
                        <td>{check}</td>
                        <td>{answer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 14, padding: 14, border: "1px solid var(--gov-border)", background: "#f8fafc", fontSize: 13, lineHeight: 1.65 }}>
                <strong>Decision Rule:</strong> all critical checks (items 1-7, 12, 13) must be YES for FEASIBLE. If a critical gap can be fixed, use PROCEED WITH CONDITIONS and state the condition. If it cannot be fixed, use NOT FEASIBLE and record the reason.
              </div>
            </GovCardBody>
          </GovCard>
        </div>

        <div style={{ marginTop: 18 }}>
          <GovCard>
            <GovCardHeader>
              <GovCardTitle>Annexure B: Standard MoU Template</GovCardTitle>
            </GovCardHeader>
            <GovCardBody>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16, alignItems: "center" }}>
                <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--gov-text-secondary)" }}>
                  The standard MoU is pre-loaded on the portal for all CSR convergence projects. Corporates may propose changes, incorporated by mutual agreement before signing. It covers purpose, location, deliverables, timeline, contribution, implementation, monitoring, UC, ownership, grievance, recognition, termination, dispute resolution and signatures.
                </div>
                <Link href="/standard-mou-template">
                  <GovButton style={{ width: "100%" }}>Open Standard MoU</GovButton>
                </Link>
              </div>
            </GovCardBody>
          </GovCard>
        </div>
      </div>
    </GovPortalLayout>
  );
}
