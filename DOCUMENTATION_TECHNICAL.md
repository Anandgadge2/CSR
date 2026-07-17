# MahaCSR Portal — Technical Documentation

**Repository baseline:** 17 July 2026. This document is an implementation inventory, not an API contract; controller code and the runtime route registry are authoritative.

## 1. System at a glance

```text
Next.js 14 frontend (App Router)
  ├─ React Query + Zustand + Tailwind/custom government UI
  ├─ REST calls and Socket.IO notification client
  └─ 190 route pages / 61 TSX components
             │
Express 4 API + Socket.IO
  ├─ middleware: CORS, Helmet, JSON body parsing, cookies, rate limiting,
  │             auth, tenant/feature/permission checks and error handling
  ├─ 47 route modules, 45 controllers, 20 service modules
  └─ API Setu verification, Cloudinary upload, Redis/BullMQ, mail/SMS helpers
             │
PostgreSQL via Prisma 5
  └─ 89 models, 40 enums, 6 migration directories
```

The active backend is `backend/src/app.ts`; the server listens on port 5000 unless `PORT` is set and exports the Express app for Vercel. The frontend is an independent Next.js application in `frontend/`. Both deploy folders contain `vercel.json`.

## 2. Stack

| Layer | Implementation |
|---|---|
| Frontend | Next.js 14.2, React 18, TypeScript, Tailwind 3, React Hook Form/Zod, TanStack Query, Zustand, Framer Motion, Recharts, Three, Socket.IO client. |
| Backend | Node/TypeScript, Express 4, Prisma 5/PostgreSQL, Zod, bcryptjs, JWT, Socket.IO, Helmet, CORS, express-rate-limit, Multer, Cloudinary, Nodemailer, Redis and BullMQ. |
| Verification | API Setu client for GST and Aadhaar OTP/eKYC; AES-256-GCM encrypted payload storage. |
| Documentation/test support | Jest + ts-jest/supertest; verification integration/unit tests; OpenAPI YAML for the verification module. |

Key commands:

```powershell
cd backend; npm run dev
cd frontend; npm run dev

cd backend; npm run typecheck; npm test; npm run build
cd frontend; npm run typecheck; npm run build
```

## 3. Runtime and request architecture

`app.ts` installs CORS, Helmet, 10 MB JSON parsing, cookie parsing and concise request logging. It then mounts REST routers and finishes with the error middleware. Socket.IO is attached to the same HTTP server for notification events. Chat socket support is only enabled when `ENABLE_LEGACY_NGO_MARKETPLACE` is enabled.

```text
Browser → Next page/component → lib/api.ts / hooks → Express route
        → auth + role/permission/tenant/feature middleware → controller
        → service (where applicable) → Prisma transaction/query → PostgreSQL
        → response + AuditLog/Notification/WebSocket side effect
```

The current route registry mounts these prefixes:

| Concern | Active prefix(es) |
|---|---|
| Auth and identity | `/api/auth`, `/api/otp`, `/api/onboarding`, `/api/org`, `/api/roles`, `/api/platform` |
| Core administration | `/api/admin`, `/api/companies`, `/api/government-departments`, `/api/audit-logs`, `/api/analytics` |
| Documents and communication | `/api/upload`, `/api/documents`, `/api/reports`, `/api/notifications`, `/api/tracking`, `/api/public` |
| Requirements/lifecycle | `/api/csr-dashboard`, `/api/csr-requirements`, `/api/company-interests`, plus project lifecycle routes mounted at `/api` |
| Convergence | `/api/corporate-enquiries`, `/api/rm`, `/api/feasibility`, `/api/government-pitches`, `/api/nodal`, `/api/convergence-projects`, `/api/js`, `/api/implementing-agency`, `/api/secretary`, `/api/district`, `/api/assignments` |
| Service management | `/api/grievances`, `/api/helpdesk` |

`GET /health` returns an `ok` status and timestamp. The root endpoint returns a platform gateway message.

## 4. Security and access control

### Authentication

- Registration, login, OTP verification, refresh and logout are provided by `/api/auth`.
- JWT bearer tokens are parsed by `authenticateToken`; `optionalAuthenticateToken` enables public-or-authenticated endpoints.
- Authentication, OTP and strict rate limiters are applied in auth routes.
- Cookies are parsed; refresh-token/session support is modelled through `Session` and user refresh fields.

### Authorisation and tenancy

- Static `Role` enum has 23 roles (administrative, corporate, NGO, government and convergence roles).
- The dynamic layer uses `OrganizationRole`, `Permission`, `OrganizationRolePermission` and `UserOrganizationRole`.
- `checkPermission`, tenant resolution, active-tenant checks, feature-gate checks and explicit role middleware are applied by routes as applicable.
- Tenant feature names include registration, requirement, marketplace, interest, NGO selection, fund disbursement, milestone monitoring, GIS, public transparency, report export, messaging, notification and document-verification controls.

### Security implementation notes

- Helmet and allow-listed CORS origins are applied globally. `FRONTEND_URL` and `ALLOWED_ORIGINS` extend the default origin list.
- Sensitive auth paths are redacted in request logs.
- API Setu data uses masked identifiers in normal fields and encrypted full payloads.
- Audit records can include actor, action, entity, old/new JSON values, IP and user agent.
- **Production risk:** environment helpers retain development fallbacks for JWT secrets and verification encryption. Set strong non-default `JWT_SECRET`, `JWT_REFRESH_SECRET`, `VERIFICATION_ENCRYPTION_KEY`, API Setu and database values before deployment.

## 5. Prisma data model

Datasource: PostgreSQL from `DATABASE_URL`; client: `prisma-client-js`.

```text
User ── Organization / Company / NGO
 │       └─ roles, permissions, onboarding, documents, verification
 │
 ├─ CorporateEnquiry ─ FeasibilityAssessment ─ ConvergenceProject
 ├─ GovernmentPitch ─ CorporatePitchInterest ─ ConvergenceProject
 ├─ BeneficiaryProfile ─ CSRRequirement ─ Interest/Agreement/CSRProject
 ├─ Notification / AuditLog / Session / VerificationRecord
 └─ Assignment, invitation and dynamic workflow history
```

### Model groups

| Group | Models |
|---|---|
| Identity/RBAC | User, Organization, Permission, PermissionGroup, OrganizationRole, RoleHierarchy, OrganizationRolePermission, UserOrganizationRole, Session, PlatformSetting. |
| Organisation/onboarding | NGO, Company, CSRCompanyProfile, GovernmentDepartmentProfile, OnboardingApplication, OnboardingStatusHistory, OnboardingQuery, QueryResponse, OnboardingReview, OrganizationDocument, NgoDocument, NgoContact, GovernanceMember, BankAccount. |
| Verification/risk | VerificationRecord, VerificationCheck, RiskScore, RiskFlag, OtpVerification. |
| Requirements/lifecycle | BeneficiaryProfile, CSRRequirement, CSRRequirementDocument, NGOApplication, CompanyInterest, Agreement, CSRProject, CSRFundMilestone, CSRFundRelease, AssetHandover, ProjectInspection, ImpactMetric, ProgressReport, CompletionReport, ImpactReport. |
| Convergence | CorporateEnquiry, CorporateEnquiryInteraction, FeasibilityAssessment, FeasibilityChecklistItem, GovernmentPitch, GovernmentPitchPhoto, CorporatePitchInterest, NodalOfficerAppointment, StandardMou, ConvergenceProject, ProjectDeliverableMilestone, UtilizationCertificate, ConvergenceProjectInspection, Grievance, GrievanceActionLog, HelpdeskQuery, SLAEscalation. |
| Payments/communications | PaymentOrder, PaymentTransaction, PaymentWebhookLog, FundRelease, Notification, NotificationTemplate, NotificationLog, AuditLog. |
| Workflow/assignment | WorkflowDefinition, WorkflowStage, WorkflowTransition, WorkflowCondition, WorkflowAssignmentRule, WorkflowRule, WorkflowInstance, WorkflowHistory, ProjectAssignment, UserInvitation, UserOfficerProfile, DistrictNodalMapping. |
| Legacy model | Project, Milestone, Chat, Message, Document, MatchScore, Report. |

The schema also has 40 enums for status and policy states. Important status enums are `CorporateEnquiryStatus`, `GovernmentPitchStatus`, `CSRRequirementStatus`, `ProjectStatus`, `GrievanceStatus`, `SLAStage`, `OnboardingStatus`, `PaymentStatus`, `FundReleaseStatus` and verification/document states.

### Migration history

Six migration directories are present: initial schema; inspection support; public OTP/framework routes; coordination fields; NGO invitations; and completion fields. Use Prisma migration commands rather than manually changing the database.

## 6. Core workflows as code

### Corporate enquiry

`corporateEnquiryController` validates entity details, OTP tokens for anonymous callers, duplicate active CIN records, generates the tracking ID and RM due date, writes `AuditLog`, and triggers a notification. RM interactions/assessment and subsequent JS/Nodal actions are exposed through the convergence routers and controllers.

### Government pitch and project delivery

`governmentPitchController` creates `GP-MH-YYYY-nnnnnn` records with location evidence, manages RM/JS verification and pitch interest, and invokes convergence onboarding. `convergenceProjectController` filters projects by caller role; calculates physical progress from completed milestones and financial progress from verified UCs.

### Configurable workflow engine

`workflowEngineService`:

1. Finds an active `WorkflowDefinition` and initial `WorkflowStage`.
2. Creates a `WorkflowInstance` and initial `WorkflowHistory` entry using a system user.
3. Validates configured `WorkflowTransition`, required permission and condition operators (`EQUALS`, `GREATER_THAN`, `LESS_THAN`).
4. Updates the instance and history atomically.
5. Runs notification and round-robin assignment rules after commit; failures are intentionally non-fatal.

### SLA scheduler

`startSlaScheduler` performs an hourly in-process sweep by default on non-Vercel hosts. `POST /api/admin/sla/run-escalations` is the operational path for serverless/external cron. The sweep is guarded against concurrent execution.

## 7. Frontend architecture

The frontend uses the App Router (`frontend/src/app`). `layout.tsx`, `providers.tsx`, layouts and common UI components supply page structure. `lib/api.ts` is the primary API abstraction; React Query holds server state, and Zustand stores authentication, notification and chat client state. `usePermission`, `usePermissionNav` and `ProtectedComponent` support the newer permission UX.

Primary component domains:

- `components/gov`: government-branded buttons, inputs, cards, tables, modal and status controls.
- `components/layout`: headers, sidebars, dashboard/portal layouts and notification bell.
- `components/onboarding`, `components/admin`, `components/assignments`, `components/verification`.
- Map, analytics/chart, workflow, portal module and reusable UI components.

The current source has both newer dynamic permission APIs and documented deprecated static role helpers. New UI work should use permissions and the backend remains the final enforcement point.

## 8. Integrations and background behaviour

| Integration | Code location / behaviour |
|---|---|
| API Setu | `modules/verification`; GST and Aadhaar routes/services/client; request correlation, masking, encryption, audit and OpenAPI file. |
| Socket.IO | `websocket/notificationSocket.ts`; notifications persist first, then emit to connected user. |
| Redis/BullMQ | `utils/redis.ts`, worker/service dependencies; configure durable Redis where queued processing is used. |
| Cloudinary/Multer | `config/cloudinary.ts`, `uploadService`, upload routes. |
| Email/SMS | Mailer/email and SMS services exist. Several convergence notification senders log in development and persist in-app notifications; verify actual delivery adapters before production. |

## 9. Deployment configuration

Required baseline environment variables: `DATABASE_URL`; production should additionally set strong JWT/refresh secrets, verification encryption key, allowed origins/frontend URL, API Setu credentials/endpoints, Cloudinary credentials and mail/SMS/Redis values when those modules are enabled.

For Vercel, do not rely on process-local intervals. Configure a cron/integration that triggers the protected SLA sweep. Ensure CORS includes each deployed frontend origin and run `prisma generate` during backend build (already included in `npm run build`).

## 10. Verification and maintenance checklist

1. Run backend and frontend type checks, backend tests, then both production builds.
2. Apply migrations to an isolated staging database and run seed data.
3. Exercise each active route family with an account for the relevant role/tenant.
4. Test API Setu with non-production credentials and confirm no raw Aadhaar payload appears in logs or responses.
5. Test Socket.IO reconnect, notification persistence, upload type/size controls and error responses.
6. Confirm serverless SLA cron execution and alerting.
7. Remove or protect unused legacy endpoints before exposing them; only routes mounted in `app.ts` are active by default.

## 11. Known architectural boundaries

- The repository contains legacy NGO marketplace controllers/routes/schema alongside the active convergence model. `app.ts` disables the legacy mounts unless `ENABLE_LEGACY_NGO_MARKETPLACE` is set.
- A route file being present does not mean it is reachable; use the `app.ts` mount list to determine activation.
- The database model is broader than the default runtime route set, reflecting staged migration/compatibility work.
- Scheduler, email/SMS and queue functionality require production infrastructure beyond the source tree.

## 12. Useful source entry points

| Need | Source |
|---|---|
| API composition/startup | `backend/src/app.ts` |
| Prisma schema | `backend/prisma/schema.prisma` |
| Permissions/features | `backend/src/config/platformAccess.ts`, `backend/src/services/permissionService.ts` |
| Auth | `backend/src/routes/authRoutes.ts`, `backend/src/controllers/authController.ts`, `backend/src/middlewares/authMiddleware.ts` |
| Core convergence | `backend/src/controllers/corporateEnquiryController.ts`, `governmentPitchController.ts`, `convergenceProjectController.ts` |
| Workflow/SLA | `backend/src/services/workflowEngineService.ts`, `slaSchedulerService.ts`, `slaEscalationService.ts` |
| Web client | `frontend/src/app`, `frontend/src/lib/api.ts`, `frontend/src/store` |
