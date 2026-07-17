# MahaCSR Portal — CSR and Operations Document

**Repository baseline:** 17 July 2026 · **Scope:** the implemented MahaCSR web portal, API, Prisma data model, and configured integrations.

## 1. Purpose

MahaCSR is a Maharashtra-focused CSR convergence platform. It brings government development needs, corporate CSR intent, implementing agencies, district oversight, state approvals, fund controls, and public transparency into one portal. Its active operating model is **State-led, district-executed convergence**. A prior NGO-marketplace model remains in the schema and source tree for compatibility, but its routes are disabled by default.

The portal supports two related entry paths:

1. **Corporate enquiry:** a corporate declares CSR intent; a Relationship Manager (RM) assesses feasibility; Joint Secretary (JS) approval and a Nodal Officer appointment lead to an onboarded project.
2. **Government pitch:** an authorised government officer submits a location-specific need; it is RM-verified and JS-approved, publicly listed for corporate interest, then converted into a project.

## 2. Stakeholders and responsibilities

| Stakeholder | Portal responsibility |
|---|---|
| Public / citizen | Discover needs and projects, track records, submit helpdesk queries and corporate enquiries. |
| Government / beneficiary agency | Maintain profile; create, submit and clarify development requirements; submit government pitches. |
| Corporate user | Submit enquiry or interest, appoint implementing-agency sub-users, follow projects, funds and reports. |
| Implementing agency / NGO | Execute assigned work, update deliverable milestones and submit utilisation certificates (UCs). |
| Relationship Manager | Coordinate corporate enquiries and pitches, record interactions and feasibility recommendations. |
| Joint Secretary | Decide feasibility/pitch proposals and appoint district nodal officers. |
| District Nodal Officer | Supervise project execution, verify milestones and UCs, inspect sites, manage first-level grievances. |
| State CSR Cell / Planning Secretary | Monitor cross-district delivery, escalations, grievances, dashboards and reports. |
| Super/portal admin | Approve organisations and requirements, manage people, roles, permissions, feature settings, audit, and manual SLA sweeps. |

Access is implemented through a mixture of legacy role checks and dynamic organisation-role permissions. The intended control plane is permission-based RBAC; the frontend labels older hard-coded role helpers as deprecated.

## 3. End-to-end operating flows

### 3.1 Corporate enquiry to completed project

```text
Corporate submits enquiry (+ OTP when anonymous)
  → CSR-MH-YYYY-nnnnnn tracking ID
  → RM assignment and contact log
  → 13-point feasibility assessment
  → JS decision
  → Nodal Officer appointment
  → MoU / project onboarding
  → execution milestones, fund releases and UCs
  → completion, handover and impact reporting
```

The `CorporateEnquiry` status sequence is: `SUBMITTED`, `TRACKING_ID_GENERATED`, `RM_ASSIGNED`, `RM_CONTACTED`, `ASSESSMENT_PENDING`, `ASSESSMENT_SUBMITTED_TO_JS`, `JS_APPROVED`/`JS_REJECTED`, `NODAL_OFFICER_APPOINTED`, `MOU_PENDING`, `MOU_SIGNED`, `PROJECT_ONBOARDED`, `EXECUTION_STARTED`, `COMPLETED`, then `CLOSED`.

An anonymous enquiry validates mobile and email OTP verification tokens, validates the CIN/mobile/email input, prevents duplicate active CIN enquiries, generates the tracking identifier, sets the RM first-response due date, writes an audit event, and creates an in-app tracking notification.

### 3.2 Government need, requirement and pitch flow

```text
Department profile → draft requirement → submit for verification
  → district/state review → approve → publish to marketplace
  → corporate interest → NGO selection / agreement / project lifecycle

Government pitch → RM verification → JS approval → public listing
  → corporate pitch interest → nodal appointment → MoU/project onboarding
```

Requirements use `DRAFT`, `PENDING_VERIFICATION`, `VERIFIED`, `APPROVED`, `PUBLISHED`, rejection/clarification and lifecycle states in the Prisma enum. Creation requires a beneficiary profile, captures district/taluka/location, cost, beneficiaries, SDGs, expected impact and declaration, and notifies district administrators when submitted.

Government pitches capture the official/department, site and geotagged photos, requirement narrative, cost, certification and declaration. The platform generates `GP-MH-YYYY-nnnnnn` reference IDs. They are intended for a development need that is verified before corporate matching.

### 3.3 Delivery, finance and evidence

```text
Approved project → assigned IA and Nodal Officer
  → delivery milestone in progress/completed (+ photos/evidence)
  → Nodal verification → UC upload
  → UC verification → financial-progress calculation
  → inspection / handover → completion and impact reports
```

`ConvergenceProject` is the active operational project record and receives `PRJ-MH-YYYY-nnnnnn` IDs. Physical progress is calculated from completed `ProjectDeliverableMilestone` records; financial progress is calculated from verified `UtilizationCertificate` amounts against the approved budget. The broader CSR lifecycle also stores `CSRProject`, `CSRFundMilestone`, `CSRFundRelease`, `ProgressReport`, `CompletionReport`, `ImpactReport`, `AssetHandover`, `ProjectInspection` and `ImpactMetric` records.

### 3.4 Grievance and SLA flow

```text
Project participant raises grievance
  → Nodal Officer level-1 review (15 days)
  → resolve or escalate to State CSR Cell level 2 (30 days)
  → escalate to JS/Secretary where needed
  → decision/action log → closed or rejected
```

Grievances are given `GRV-MH-YYYY-nnnnnn` IDs, tied to a convergence project, originator and responsible officers, and retain action logs. The SLA implementation also tracks RM response, JS decision, pitch verification and helpdesk time limits. Its documented 5–3–2 policy is RM response in five days, JS decision in three days and Secretary escalation in two days.

On a persistent Node deployment the scheduler runs an escalation sweep hourly by default. On Vercel/serverless it deliberately does not run a timer: an external cron should call the protected admin sweep endpoint.

## 4. Major portal modules

| Module | What it provides |
|---|---|
| Public portal | Landing content, map/statistics, public marketplace/development needs, tracking, resources, document library, stories, contact/help/feedback. |
| Organisation onboarding | Organisation registration, role-specific profile, document submission, verification, review, clarification and approval status. |
| Corporate | Dashboard, enquiries, marketplace/pitch interest, invited NGOs/IAs, project monitoring, fund and report views. |
| Government department | Dashboard, requirements/pitches, interests, handover, projects and reports. |
| NGO / IA | Dashboard, assigned projects, milestone updates, UC and fund views, proposal requests and grievances. |
| RM / JS / Nodal / State Cell / Secretary | Work queues for assessment, decision, appointment, assignment, project oversight, escalations, reports and grievances. |
| Administration | Organisation/onboarding approvals, requirement and interest queues, company/NGO registries, user/role administration, audit trail, risk/fund monitoring, feature controls and executive reporting. |

The frontend contains 190 page routes, including role-specific workspaces. Screen availability alone is not a permission guarantee; API middleware and permissions remain the authoritative boundary.

## 5. Governance, compliance and evidence

- Organisation, NGO and company records support registration, PAN/CIN/GST, operating areas, CSR focus, documents, contacts and bank information.
- NGO onboarding captures legal identity, governance, bank details, financial history, declarations, documents, review history, queries and risk scores/flags.
- Verification records preserve request metadata, masked identifiers, transaction reference, timing and a redacted response; full API response is encrypted before storage.
- `AuditLog` records actor, role, action, affected entity, old/new values, IP/user agent and timestamp where supplied.
- Project evidence includes document records, geotagged pitch/milestone photos, inspections, UCs, reports and handover records.
- Notifications are persisted in-app and sent to connected users over Socket.IO. Email/SMS helper functions exist, but several business notifications are explicitly development/logging stubs; production communication configuration and delivery monitoring are required before launch.

## 6. Data domains (Prisma)

The PostgreSQL Prisma schema has **89 models and 40 enums**. The primary domains are:

| Domain | Principal records |
|---|---|
| Identity, tenancy and RBAC | User, Organization, OrganizationRole, Permission, PermissionGroup, UserOrganizationRole, RoleHierarchy, Session, PlatformSetting. |
| Onboarding and compliance | NGO, Company, CSRCompanyProfile, GovernmentDepartmentProfile, OnboardingApplication, OrganisationDocument, NgoDocument, OnboardingReview, VerificationCheck, VerificationRecord, RiskScore/RiskFlag. |
| Needs and marketplace | BeneficiaryProfile, CSRRequirement, CSRRequirementDocument, CompanyInterest, NGOApplication, Agreement. |
| Convergence operation | CorporateEnquiry, FeasibilityAssessment/ChecklistItem, GovernmentPitch/Photo/Interest, NodalOfficerAppointment, ConvergenceProject, ProjectDeliverableMilestone, UtilizationCertificate, ConvergenceProjectInspection. |
| CSR financial lifecycle | CSRProject, CSRFundMilestone, CSRFundRelease, FundRelease, PaymentOrder, PaymentTransaction, PaymentWebhookLog. |
| Monitoring and closure | ProgressReport, CompletionReport, ImpactReport, ImpactMetric, AssetHandover, ProjectInspection, Report. |
| Service and communication | Notification/NotificationLog/Template, HelpdeskQuery, Grievance/ActionLog, OtpVerification, SLAEscalation, AuditLog. |
| Configurable workflow/assignment | WorkflowDefinition, WorkflowStage, WorkflowTransition, WorkflowCondition, WorkflowAssignmentRule, WorkflowRule, WorkflowInstance, WorkflowHistory, ProjectAssignment, UserInvitation, DistrictNodalMapping. |
| Legacy marketplace compatibility | Project, Milestone, MatchScore, Chat, Message and generic Document. These are only active if `ENABLE_LEGACY_NGO_MARKETPLACE` is enabled. |

## 7. Operational controls and readiness notes

1. Configure an external cron for SLA sweeps in serverless production.
2. Supply production secrets: database URL, JWT/refresh secrets, verification encryption key, API Setu credentials, storage and mail/SMS configuration. Default development fallbacks must not be accepted for production secrets.
3. Confirm every enabled route has an explicit authentication/permission middleware; route files exist beyond those mounted in `app.ts` and some are legacy/disabled.
4. Run the seed and migrations in a non-production environment to validate dynamic permissions, workflow definitions and master data before go-live.
5. Reconcile the configured CSR process with the reference PDFs in `docs/` (Section 135, development sectors and aspirational districts) and with the authorised government SOP.

## 8. Success measures

- Time from enquiry/pitch submission to RM contact and JS decision.
- Requirements published, corporate interest conversion and project onboarding rate.
- Funds released/verified versus approved budget; UC verification turnaround.
- Physical and financial completion rate by district, sector and SDG.
- SLA breach/escalation rate, grievance resolution time and re-open rate.
- Beneficiaries reached, outcome metrics and completed-asset handovers.

## 9. Source-of-truth note

This document describes observable implementation, not a legal or policy determination. Prisma schema, active `backend/src/app.ts` route mounts, controller validations and the deployed configuration are the source of truth when they differ from an operational SOP.
