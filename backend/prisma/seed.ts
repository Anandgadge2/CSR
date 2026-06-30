import "dotenv/config";
import { PrismaClient, Role, VerificationStatus, ProjectStatus, MilestoneStatus, OnboardingStatus, OrganizationType, CSRCategory, PriorityLevel, CSRRequirementStatus, NGOApplicationStatus, CompanyInterestStatus, AgreementStatus, CSRFundMilestoneStatus, ProgressReportStatus, OrganizationKind, OrganizationOnboardingStatus, OrganizationStatus, RoleScope, FeasibilityResult, ChecklistAnswer } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS, ROLE_PERMISSION_MAP, TENANT_FEATURES } from "../src/config/platformAccess";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "111111";
const MASTER_ADMIN_PASSWORD = "agadge797@gmail";

async function main() {
  console.log("Starting database seed with realistic Maharashtra CSR data...");
  const defaultPasswordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const masterPasswordHash = await bcrypt.hash(MASTER_ADMIN_PASSWORD, 10);

  await prisma.$transaction(async (tx) => {
    // 1. Clean Database
    console.log("Cleaning database...");
    await tx.auditLog.deleteMany();
    await tx.notification.deleteMany();
    await tx.userOrganizationRole.deleteMany();
    await tx.organizationRolePermission.deleteMany();
    await tx.organizationRole.deleteMany();
    await tx.permission.deleteMany();
    await tx.organizationDocument.deleteMany();
    await tx.organization.deleteMany();
    await tx.tenantFeature.deleteMany();
    await tx.tenant.deleteMany();
    await tx.report.deleteMany();
    await tx.matchScore.deleteMany();
    await tx.document.deleteMany();
    await tx.message.deleteMany();
    await tx.chat.deleteMany();
    await tx.milestone.deleteMany();
    await tx.project.deleteMany();

    // Clean new tables
    await tx.impactReport.deleteMany();
    await tx.completionReport.deleteMany();
    await tx.progressReport.deleteMany();
    await tx.cSRFundMilestone.deleteMany();
    await tx.agreement.deleteMany();
    await tx.companyInterest.deleteMany();
    await tx.nGOApplication.deleteMany();
    await tx.cSRRequirementDocument.deleteMany();
    await tx.cSRRequirement.deleteMany();
    await tx.beneficiaryProfile.deleteMany();
    await tx.otpVerification.deleteMany();
    await tx.sLAEscalation.deleteMany();
    await tx.grievanceActionLog.deleteMany();
    await tx.grievance.deleteMany();
    await tx.utilizationCertificate.deleteMany();
    await tx.projectDeliverableMilestone.deleteMany();
    await tx.convergenceProject.deleteMany();
    await tx.standardMou.deleteMany();
    await tx.nodalOfficerAppointment.deleteMany();
    await tx.feasibilityChecklistItem.deleteMany();
    await tx.feasibilityAssessment.deleteMany();
    await tx.corporatePitchInterest.deleteMany();
    await tx.governmentPitchPhoto.deleteMany();
    await tx.governmentPitch.deleteMany();
    await tx.corporateEnquiryInteraction.deleteMany();
    await tx.corporateEnquiry.deleteMany();

    await tx.user.deleteMany();
    await tx.nGO.deleteMany();
    await tx.company.deleteMany();
    console.log("Database cleared.");

    // ============================================
    // 2. CREATE TENANT, FEATURES, PERMISSIONS AND ADMIN USERS
    // ============================================

    const tenant = await tx.tenant.create({
      data: {
        name: "Maharashtra CSR Portal",
        code: "MH-CSR",
        state: "Maharashtra",
        status: "ACTIVE",
        primaryColor: "#1e3a8a",
        secondaryColor: "#f97316",
        features: {
          create: TENANT_FEATURES.map((featureKey) => ({ featureKey, isEnabled: true }))
        }
      }
    });
    console.log("✓ Tenant seeded:", tenant.name);

    await tx.permission.createMany({
      data: PERMISSIONS.map(([key, description, module]) => ({ key, description, module })),
      skipDuplicates: true
    });
    const permissions = await tx.permission.findMany();
    const permissionIdByKey = new Map(permissions.map((permission) => [permission.key, permission.id]));

    const masterAdmin = await tx.user.create({
      data: {
        email: "master@example.com",
        passwordHash: masterPasswordHash,
        role: Role.MASTER_ADMIN,
        accountStatus: "ACTIVE",
        isVerified: true,
        isSystemSeeded: true,
      },
    });
    console.log("✓ Master Admin created:", masterAdmin.email);

    const masterRole = await tx.organizationRole.create({
      data: {
        name: "MASTER_ADMIN",
        description: "Global platform owner with all permissions",
        scope: RoleScope.GLOBAL,
        isSystemRole: true,
        rolePermissions: {
          create: (ROLE_PERMISSION_MAP.MASTER_ADMIN || []).map((key) => ({ permissionId: permissionIdByKey.get(key)! })).filter((item) => item.permissionId)
        }
      }
    });
    await tx.userOrganizationRole.create({
      data: { userId: masterAdmin.id, roleId: masterRole.id }
    });
    
    const superAdmin = await tx.user.create({
      data: {
        email: "admin@mahacsr.gov.in",
        passwordHash: defaultPasswordHash,
        role: Role.SUPER_ADMIN,
        tenantId: tenant.id,
        isVerified: true,
      },
    });
    console.log("✓ Super Admin created:", superAdmin.email);

    const portalAdmin = await tx.user.create({
      data: {
        email: "portal.admin@mahacsr.gov.in",
        passwordHash: defaultPasswordHash,
        role: Role.PORTAL_ADMIN,
        tenantId: tenant.id,
        isVerified: true,
      },
    });
    console.log("✓ Portal Admin created:", portalAdmin.email);

    const csrAdmin = await tx.user.create({
      data: {
        email: "csr.admin@mahacsr.gov.in",
        passwordHash: defaultPasswordHash,
        role: Role.CSR_ADMIN,
        tenantId: tenant.id,
        isVerified: true,
      },
    });
    console.log("✓ CSR Admin created:", csrAdmin.email);

    const rmUser = await tx.user.create({ data: { email: "rm.user@mahacsr.gov.in", passwordHash: defaultPasswordHash, role: Role.CSR_RELATIONSHIP_MANAGER, tenantId: tenant.id, assignedDistrict: "Pune", isVerified: true } });
    const jsUser = await tx.user.create({ data: { email: "js.user@mahacsr.gov.in", passwordHash: defaultPasswordHash, role: Role.JOINT_SECRETARY, tenantId: tenant.id, isVerified: true } });
    const secretaryUser = await tx.user.create({ data: { email: "secretary.user@mahacsr.gov.in", passwordHash: defaultPasswordHash, role: Role.PLANNING_SECRETARY, tenantId: tenant.id, isVerified: true } });
    const nodalUser = await tx.user.create({ data: { email: "nodal.user@mahacsr.gov.in", passwordHash: defaultPasswordHash, role: Role.DISTRICT_NODAL_OFFICER, tenantId: tenant.id, assignedDistrict: "Pune", isVerified: true } });
    const stateCellUser = await tx.user.create({ data: { email: "statecell.user@mahacsr.gov.in", passwordHash: defaultPasswordHash, role: Role.STATE_CSR_CELL, tenantId: tenant.id, isVerified: true } });
    const corporateUser = await tx.user.create({ data: { email: "corporate.user@mahacsr.gov.in", passwordHash: defaultPasswordHash, role: Role.CORPORATE_USER, tenantId: tenant.id, isVerified: true } });
    const corporateTestUser = await tx.user.create({ data: { email: "corporate.user@testcsr.com", passwordHash: defaultPasswordHash, role: Role.CORPORATE_USER, tenantId: tenant.id, isVerified: true } });
    const iaUser = await tx.user.create({ data: { email: "ia.user@mahacsr.gov.in", passwordHash: defaultPasswordHash, role: Role.IMPLEMENTING_AGENCY_USER, tenantId: tenant.id, isVerified: true } });
    const agencyUser = await tx.user.create({ data: { email: "agency.user@mahacsr.gov.in", passwordHash: defaultPasswordHash, role: Role.IMPLEMENTING_AGENCY_USER, tenantId: tenant.id, isVerified: true } });
    const govtOfficerUser = await tx.user.create({ data: { email: "government.user@mahacsr.gov.in", passwordHash: defaultPasswordHash, role: Role.GOVERNMENT_OFFICER, tenantId: tenant.id, isVerified: true } });

    // ============================================
    // MAHA CSR FRAMEWORK TEST DATA - Joint Secretary Testing
    // ============================================

    // Test Enquiry 1: Submitted to JS, awaiting decision (FEASIBLE)
    const sampleEnquiry = await tx.corporateEnquiry.create({
      data: {
        tenantId: tenant.id,
        trackingId: "CSR-MH-2026-000001",
        companyName: "Maharashtra Industries CSR Foundation",
        sector: "EDUCATION",
        preferredDistricts: ["Pune"],
        indicativeBudget: 2500000,
        contactPersonName: "Amit Deshpande",
        mobile: "9876543210",
        mobileVerified: true,
        email: "csr@mahacorp.example",
        emailVerified: true,
        mca21Cin: "U12345MH2024PTC123456",
        proposedCsrWork: "Smart classroom support for government schools in Pune district.",
        assignedRelationshipManagerId: rmUser.id,
        status: "ASSESSMENT_SUBMITTED_TO_JS",
        submittedAt: new Date("2026-06-20"),
        firstResponseDueAt: new Date("2026-06-27"),
        firstContactedAt: new Date("2026-06-21"),
      }
    });

    // Test Enquiry 2: Submitted to JS - PROCEED_WITH_CONDITIONS scenario
    const sampleEnquiry2 = await tx.corporateEnquiry.create({
      data: {
        tenantId: tenant.id,
        trackingId: "CSR-MH-2026-000002",
        companyName: "Tata Consultancy Services CSR",
        sector: "HEALTH",
        preferredDistricts: ["Mumbai", "Thane"],
        indicativeBudget: 5000000,
        contactPersonName: "Priya Sharma",
        mobile: "9876543212",
        mobileVerified: true,
        email: "csr@tcs.example",
        emailVerified: true,
        mca21Cin: "L22222MH1990PLC054321",
        proposedCsrWork: "Mobile health clinics in rural Mumbai suburbs.",
        assignedRelationshipManagerId: rmUser.id,
        status: "ASSESSMENT_SUBMITTED_TO_JS",
        submittedAt: new Date("2026-06-25"),
        firstResponseDueAt: new Date("2026-07-02"),
        firstContactedAt: new Date("2026-06-26"),
      }
    });

    // Test Enquiry 3: Submitted to JS - NOT_FEASIBLE scenario (will be rejected)
    const sampleEnquiry3 = await tx.corporateEnquiry.create({
      data: {
        tenantId: tenant.id,
        trackingId: "CSR-MH-2026-000003",
        companyName: "Reliance Foundation",
        sector: "RURAL_DEVELOPMENT",
        preferredDistricts: ["Nagpur"],
        indicativeBudget: 10000000,
        contactPersonName: "Vijay Kumar",
        mobile: "9876543213",
        mobileVerified: true,
        email: "csr@reliance.example",
        emailVerified: true,
        mca21Cin: "L17110MH1973PLC019786",
        proposedCsrWork: "Village infrastructure development in Nagpur district.",
        assignedRelationshipManagerId: rmUser.id,
        status: "ASSESSMENT_SUBMITTED_TO_JS",
        submittedAt: new Date("2026-06-28"),
        firstResponseDueAt: new Date("2026-07-05"),
        firstContactedAt: new Date("2026-06-29"),
      }
    });

    // Test Enquiry 4: RM missed SLA - escalated to JS (overdue)
    const sampleEnquiry4 = await tx.corporateEnquiry.create({
      data: {
        tenantId: tenant.id,
        trackingId: "CSR-MH-2026-000004",
        companyName: "Infosys Limited",
        sector: "SKILL_DEVELOPMENT",
        preferredDistricts: ["Pune"],
        indicativeBudget: 3500000,
        contactPersonName: "Rahul Mehta",
        mobile: "9876543214",
        mobileVerified: true,
        email: "csr@infosys.example",
        emailVerified: true,
        mca21Cin: "L85110KA1981PLC013115",
        proposedCsrWork: "IT training center for rural youth in Pune.",
        assignedRelationshipManagerId: rmUser.id,
        status: "ASSESSMENT_SUBMITTED_TO_JS",
        submittedAt: new Date("2026-06-10"), // Overdue - more than 3 days
        firstResponseDueAt: new Date("2026-06-17"),
        firstContactedAt: new Date("2026-06-11"),
      }
    });

    // Test Pitch 1: JS Approved (already processed)
    const samplePitch = await tx.governmentPitch.create({
      data: {
        tenantId: tenant.id,
        pitchReferenceId: "GP-MH-2026-000001",
        officialName: "Rajesh Patil",
        designation: "Block Education Officer",
        department: "School Education",
        officeName: "Zilla Parishad Pune",
        serviceClass: "CLASS_1",
        mobile: "9876543211",
        mobileVerified: true,
        email: "zp.pune@mahacsr.gov.in",
        emailVerified: true,
        district: "Pune",
        taluka: "Haveli",
        exactLocation: "ZP School Loni Kalbhor",
        csrRequirement: "Digital smart classroom setup for secondary students.",
        estimatedCost: 2500000,
        govtFundDeclaration: true,
        certificationType: "SELF",
        status: "JS_APPROVED",
        assignedRelationshipManagerId: rmUser.id,
        submittedAt: new Date("2026-06-18"),
        verificationDueAt: new Date("2026-06-25"),
        jsApprovalDueAt: new Date("2026-06-30"),
        photos: { create: [
          { tenantId: tenant.id, fileUrl: "https://dev.mahacsr.local/photos/site-1.jpg", latitude: 18.5204, longitude: 73.8567, isGeoTagged: true },
          { tenantId: tenant.id, fileUrl: "https://dev.mahacsr.local/photos/site-2.jpg", latitude: 18.5214, longitude: 73.8577, isGeoTagged: true },
        ] }
      }
    });

    // Test Pitch 2: Awaiting JS approval
    const samplePitch2 = await tx.governmentPitch.create({
      data: {
        tenantId: tenant.id,
        pitchReferenceId: "GP-MH-2026-000002",
        officialName: "Sunita Deshmukh",
        designation: "District Health Officer",
        department: "Health",
        officeName: "Zilla Parishad Nagpur",
        serviceClass: "CLASS_1",
        mobile: "9876543215",
        mobileVerified: true,
        email: "health.nagpur@mahacsr.gov.in",
        emailVerified: true,
        district: "Nagpur",
        taluka: "Nagpur",
        exactLocation: "Primary Health Center, Kamptee Road",
        csrRequirement: "Equipment upgrade for pediatric ward including monitors and ventilators.",
        estimatedCost: 4500000,
        govtFundDeclaration: true,
        certificationType: "HOD",
        hodCertificationDocument: "https://dev.mahacsr.local/docs/hod-cert-002.pdf",
        status: "JS_APPROVAL_PENDING",
        assignedRelationshipManagerId: rmUser.id,
        submittedAt: new Date("2026-06-26"),
        verificationDueAt: new Date("2026-07-03"),
        jsApprovalDueAt: new Date("2026-07-10"),
        photos: { create: [
          { tenantId: tenant.id, fileUrl: "https://dev.mahacsr.local/photos/health-1.jpg", latitude: 21.1458, longitude: 79.0882, isGeoTagged: true },
          { tenantId: tenant.id, fileUrl: "https://dev.mahacsr.local/photos/health-2.jpg", latitude: 21.1468, longitude: 79.0892, isGeoTagged: true },
          { tenantId: tenant.id, fileUrl: "https://dev.mahacsr.local/photos/health-3.jpg", latitude: 21.1478, longitude: 79.0902, isGeoTagged: true },
        ] }
      }
    });

    // Test Pitch 3: Awaiting JS approval (Mumbai)
    const samplePitch3 = await tx.governmentPitch.create({
      data: {
        tenantId: tenant.id,
        pitchReferenceId: "GP-MH-2026-000003",
        officialName: "Anil Sharma",
        designation: "Municipal Commissioner",
        department: "Urban Development",
        officeName: "Mumbai Municipal Corporation",
        serviceClass: "CLASS_1",
        mobile: "9876543216",
        mobileVerified: true,
        email: "commissioner@mumbai.gov.in",
        emailVerified: true,
        district: "Mumbai",
        taluka: "Mumbai City",
        exactLocation: "Dharavi Community Center, 90 Feet Road",
        csrRequirement: "Skill development center for women with focus on tailoring and embroidery.",
        estimatedCost: 1800000,
        govtFundDeclaration: false,
        certificationType: "SELF",
        status: "JS_APPROVAL_PENDING",
        assignedRelationshipManagerId: rmUser.id,
        submittedAt: new Date("2026-06-27"),
        verificationDueAt: new Date("2026-07-04"),
        jsApprovalDueAt: new Date("2026-07-11"),
        photos: { create: [
          { tenantId: tenant.id, fileUrl: "https://dev.mahacsr.local/photos/skill-1.jpg", latitude: 19.0360, longitude: 72.8530, isGeoTagged: true },
          { tenantId: tenant.id, fileUrl: "https://dev.mahacsr.local/photos/skill-2.jpg", latitude: 19.0370, longitude: 72.8540, isGeoTagged: true },
        ] }
      }
    });

    const checklist = [
      "Activity falls within Schedule VII of the Companies Act.",
      "Not a prohibited CSR activity: not employee-only, not political, not normal course of business.",
      "Addresses a genuine, verified development need.",
      "Does NOT duplicate an existing government scheme or ongoing project in same location.",
      "For construction/renovation: site/land is available, clear, and in government ownership/control.",
      "Required permissions/clearances are obtainable within a reasonable time.",
      "Required government support/personnel/access is confirmed.",
      "Indicative budget is adequate for the proposed scope.",
      "Cost estimate is realistic and benchmarked against similar works.",
      "Implementing capacity exists: corporate/foundation/NGO is capable.",
      "Timeline is realistic for the scope.",
      "Post-completion ownership of the asset is clear.",
      "Maintenance / recurring-cost responsibility is identified.",
    ];
    const dimensions = ["Mandate & Legal", "Mandate & Legal", "Need & Alignment", "Need & Alignment", "Site & Govt Support", "Site & Govt Support", "Site & Govt Support", "Financial", "Financial", "Implementation", "Implementation", "Sustainability", "Sustainability"];

    // Assessment 1: FEASIBLE - Already decided by JS
    const sampleAssessment = await tx.feasibilityAssessment.create({
      data: {
        tenantId: tenant.id,
        reportReference: "FES-MH-2026-000001",
        corporateEnquiryId: sampleEnquiry.id,
        relationshipManagerId: rmUser.id,
        companyName: sampleEnquiry.companyName,
        cin: sampleEnquiry.mca21Cin,
        sector: sampleEnquiry.sector,
        contactSummary: "Initial call completed and documents verified.",
        proposedLocationDistrict: "Pune",
        indicativeBudget: 2500000,
        developmentNeedAddressed: "Smart classroom infrastructure gap in ZP school.",
        dateOfFirstContact: new Date("2026-06-21"),
        summaryOfInteraction: "Company confirmed budget and implementation support.",
        feasibilityResult: FeasibilityResult.FEASIBLE,
        recommendation: "Recommended for approval. Company has strong track record in education CSR.",
        suggestedNodalOfficerDomain: "School Education",
        submittedToJsAt: new Date("2026-06-22"),
        jsDecisionById: jsUser.id,
        jsDecisionAt: new Date("2026-06-23"),
        jsDecisionRemarks: "Approved for nodal appointment. Proceed with standard MoU.",
        checklistItems: { create: checklist.map((checkText, index) => ({ tenantId: tenant.id, itemNumber: index + 1, dimension: dimensions[index], checkText, isCritical: [1,2,3,4,5,6,7,12,13].includes(index + 1), answer: ChecklistAnswer.YES, remarks: index === 0 ? "Verified Schedule VII compliance" : undefined })) }
      }
    });

    // Assessment 2: PROCEED_WITH_CONDITIONS - Pending JS decision
    const sampleAssessment2 = await tx.feasibilityAssessment.create({
      data: {
        tenantId: tenant.id,
        reportReference: "FES-MH-2026-000002",
        corporateEnquiryId: sampleEnquiry2.id,
        relationshipManagerId: rmUser.id,
        companyName: sampleEnquiry2.companyName,
        cin: sampleEnquiry2.mca21Cin,
        sector: sampleEnquiry2.sector,
        contactSummary: "Multiple calls and site visits completed.",
        proposedLocationDistrict: "Mumbai",
        indicativeBudget: 5000000,
        developmentNeedAddressed: "Mobile health clinics for underserved areas.",
        dateOfFirstContact: new Date("2026-06-26"),
        summaryOfInteraction: "Company interested but has conditions regarding government support.",
        feasibilityResult: FeasibilityResult.PROCEED_WITH_CONDITIONS,
        recommendation: "Proceed with conditions. Requires dedicated government liaison.",
        suggestedNodalOfficerDomain: "Health",
        conditionText: "Government to provide designated liaison officer and permits for mobile clinics in restricted areas.",
        submittedToJsAt: new Date("2026-06-28"),
        // No JS decision yet - pending
        checklistItems: { create: checklist.map((checkText, index) => ({ tenantId: tenant.id, itemNumber: index + 1, dimension: dimensions[index], checkText, isCritical: [1,2,3,4,5,6,7,12,13].includes(index + 1), answer: index === 6 ? ChecklistAnswer.NO : ChecklistAnswer.YES, remarks: index === 6 ? "Limited government support confirmed" : undefined })) }
      }
    });

    // Assessment 3: NOT_FEASIBLE - Pending JS decision (will be rejected)
    const sampleAssessment3 = await tx.feasibilityAssessment.create({
      data: {
        tenantId: tenant.id,
        reportReference: "FES-MH-2026-000003",
        corporateEnquiryId: sampleEnquiry3.id,
        relationshipManagerId: rmUser.id,
        companyName: sampleEnquiry3.companyName,
        cin: sampleEnquiry3.mca21Cin,
        sector: sampleEnquiry3.sector,
        contactSummary: "Initial contact and preliminary assessment.",
        proposedLocationDistrict: "Nagpur",
        indicativeBudget: 10000000,
        developmentNeedAddressed: "Village infrastructure development.",
        dateOfFirstContact: new Date("2026-06-29"),
        summaryOfInteraction: "Company interested but project scope overlaps with ongoing government scheme.",
        feasibilityResult: FeasibilityResult.NOT_FEASIBLE,
        recommendation: "Not recommended. Duplicates existing government infrastructure scheme.",
        suggestedNodalOfficerDomain: "Rural Development",
        submittedToJsAt: new Date("2026-06-30"),
        // No JS decision yet - pending
        checklistItems: { create: checklist.map((checkText, index) => ({ tenantId: tenant.id, itemNumber: index + 1, dimension: dimensions[index], checkText, isCritical: [1,2,3,4,5,6,7,12,13].includes(index + 1), answer: index === 3 ? ChecklistAnswer.NO : index === 4 ? ChecklistAnswer.NO : ChecklistAnswer.YES, remarks: index === 3 ? "Duplicates PMGSY Phase III work" : index === 4 ? "Land not clearly demarcated" : undefined })) }
      }
    });

    // Assessment 4: FEASIBLE - Overdue (RM missed SLA, escalated to JS)
    const sampleAssessment4 = await tx.feasibilityAssessment.create({
      data: {
        tenantId: tenant.id,
        reportReference: "FES-MH-2026-000004",
        corporateEnquiryId: sampleEnquiry4.id,
        relationshipManagerId: rmUser.id,
        companyName: sampleEnquiry4.companyName,
        cin: sampleEnquiry4.mca21Cin,
        sector: sampleEnquiry4.sector,
        contactSummary: "Delayed due to RM availability.",
        proposedLocationDistrict: "Pune",
        indicativeBudget: 3500000,
        developmentNeedAddressed: "IT skill development for rural youth.",
        dateOfFirstContact: new Date("2026-06-11"),
        summaryOfInteraction: "Company ready to proceed immediately. Training curriculum ready.",
        feasibilityResult: FeasibilityResult.FEASIBLE,
        recommendation: "Highly recommended. Addresses skill gap in district.",
        suggestedNodalOfficerDomain: "Skill Development",
        submittedToJsAt: new Date("2026-06-12"), // Overdue by more than 3 days
        // No JS decision yet - overdue
        checklistItems: { create: checklist.map((checkText, index) => ({ tenantId: tenant.id, itemNumber: index + 1, dimension: dimensions[index], checkText, isCritical: [1,2,3,4,5,6,7,12,13].includes(index + 1), answer: ChecklistAnswer.YES })) }
      }
    });

    // Assessment 5: Government Pitch Assessment (RM Verified, pending JS)
    const sampleAssessment5 = await tx.feasibilityAssessment.create({
      data: {
        tenantId: tenant.id,
        reportReference: "FES-MH-2026-000005",
        governmentPitchId: samplePitch2.id,
        relationshipManagerId: rmUser.id,
        companyName: "Government Pitch - Health Equipment",
        cin: "N/A",
        sector: "HEALTH",
        contactSummary: "Site verification completed.",
        proposedLocationDistrict: "Nagpur",
        indicativeBudget: 4500000,
        developmentNeedAddressed: "Critical pediatric ward equipment shortage.",
        dateOfFirstContact: new Date("2026-06-27"),
        summaryOfInteraction: "Official verified. Requirements genuine and urgent.",
        feasibilityResult: FeasibilityResult.FEASIBLE,
        recommendation: "Highly recommended. Addresses critical healthcare gap.",
        suggestedNodalOfficerDomain: "Health",
        submittedToJsAt: new Date("2026-06-28"),
        // No JS decision yet - pending
        checklistItems: { create: checklist.map((checkText, index) => ({ tenantId: tenant.id, itemNumber: index + 1, dimension: dimensions[index], checkText, isCritical: [1,2,3,4,5,6,7,12,13].includes(index + 1), answer: index === 1 ? ChecklistAnswer.NA : ChecklistAnswer.YES })) }
      }
    });

    // Assessment 6: Government Pitch Assessment (Mumbai - pending JS)
    const sampleAssessment6 = await tx.feasibilityAssessment.create({
      data: {
        tenantId: tenant.id,
        reportReference: "FES-MH-2026-000006",
        governmentPitchId: samplePitch3.id,
        relationshipManagerId: rmUser.id,
        companyName: "Government Pitch - Skill Development",
        cin: "N/A",
        sector: "SKILL_DEVELOPMENT",
        contactSummary: "Site visit completed. Community center suitable.",
        proposedLocationDistrict: "Mumbai",
        indicativeBudget: 1800000,
        developmentNeedAddressed: "Women empowerment through skill training.",
        dateOfFirstContact: new Date("2026-06-28"),
        summaryOfInteraction: "Good community participation. Training demand confirmed.",
        feasibilityResult: FeasibilityResult.FEASIBLE,
        recommendation: "Recommended. Strong community support.",
        suggestedNodalOfficerDomain: "Skill Development",
        submittedToJsAt: new Date("2026-06-29"),
        // No JS decision yet - pending
        checklistItems: { create: checklist.map((checkText, index) => ({ tenantId: tenant.id, itemNumber: index + 1, dimension: dimensions[index], checkText, isCritical: [1,2,3,4,5,6,7,12,13].includes(index + 1), answer: ChecklistAnswer.YES })) }
      }
    });

    // Nodal Appointment 1: For approved assessment
    await tx.nodalOfficerAppointment.create({
      data: {
        tenantId: tenant.id,
        corporateEnquiryId: sampleEnquiry.id,
        assessmentId: sampleAssessment.id,
        district: "Pune",
        domain: "School Education",
        nodalOfficerUserId: nodalUser.id,
        nodalOfficerName: "Nodal Officer Pune",
        designation: "District Nodal Officer",
        department: "School Education",
        appointedByJsId: jsUser.id,
        appointmentLetterUrl: "https://dev.mahacsr.local/letters/appointment-001.pdf",
        collectorCc: true,
        zpCeoCc: true,
      }
    });

    // Create SLA Escalation record for overdue case (sampleAssessment4)
    await tx.sLAEscalation.create({
      data: {
        tenantId: tenant.id,
        entityType: "CORPORATE_ENQUIRY",
        entityId: sampleEnquiry4.id,
        stage: "JS_DECISION",
        responsibleUserId: jsUser.id,
        dueAt: new Date("2026-06-15"), // Overdue
        isResolved: false,
      }
    });

    // Create SLA Escalation for government pitch awaiting JS approval
    await tx.sLAEscalation.create({
      data: {
        tenantId: tenant.id,
        entityType: "GOVERNMENT_PITCH",
        entityId: samplePitch2.id,
        stage: "JS_DECISION",
        responsibleUserId: jsUser.id,
        dueAt: new Date("2026-07-05"), // Due soon
        isResolved: false,
      }
    });

    const sampleMou = await tx.standardMou.create({
      data: {
        tenantId: tenant.id,
        mouReferenceId: "MOU-MH-2026-000001",
        corporateEnquiryId: sampleEnquiry.id,
        districtDepartmentName: "Zilla Parishad Pune",
        nodalOfficerName: "Nodal Officer Pune",
        corporateName: sampleEnquiry.companyName,
        cin: sampleEnquiry.mca21Cin,
        projectTitle: "ZP School Smart Classroom Convergence Project",
        projectDescription: "Digital smart classroom setup in Pune district.",
        scheduleVIIClause: "3",
        projectLocation: "ZP School Loni Kalbhor, Haveli, Pune",
        deliverables: [{ milestoneNo: 1, description: "Procurement", timeline: "Month 1", amount: 1250000 }, { milestoneNo: 2, description: "Installation and training", timeline: "Month 2", amount: 1250000 }],
        timelineMonths: 2,
        financialContribution: 2500000,
        governmentContribution: 0,
        implementationMode: "OWN_FOUNDATION",
        implementingAgencyName: "District Education Implementation Team",
        ownershipAfterCompletion: "Government school",
        maintenanceResponsibility: "School Education Department",
        status: "SIGNED",
        signedDocumentUrl: "https://dev.mahacsr.local/mou/signed.pdf",
      }
    });

    const sampleProject = await tx.convergenceProject.create({
      data: {
        tenantId: tenant.id,
        projectId: "PRJ-MH-2026-000001",
        corporateEnquiryId: sampleEnquiry.id,
        mouId: sampleMou.id,
        title: "ZP School Smart Classroom Convergence Project",
        district: "Pune",
        taluka: "Haveli",
        location: "Loni Kalbhor",
        sector: "Education",
        corporateName: sampleEnquiry.companyName,
        nodalOfficerUserId: nodalUser.id,
        implementingAgencyUserId: iaUser.id,
        approvedBudget: 2500000,
        utilizedAmount: 750000,
        physicalProgressPercent: 50,
        financialProgressPercent: 30,
        status: "IN_PROGRESS",
      }
    });

    const milestone1 = await tx.projectDeliverableMilestone.create({ data: { tenantId: tenant.id, convergenceProjectId: sampleProject.id, name: "Hardware Procurement", description: "Procure panels and classroom devices", workType: "EQUIPMENT_PURCHASE", status: "COMPLETED", fundsUtilized: 750000, geoTaggedPhotoUrls: ["https://dev.mahacsr.local/photos/m1.jpg"], verifiedByNodalOfficerId: nodalUser.id, verifiedAt: new Date("2026-06-28") } });
    await tx.projectDeliverableMilestone.create({ data: { tenantId: tenant.id, convergenceProjectId: sampleProject.id, name: "Installation and Teacher Training", description: "Install equipment and train teachers", workType: "SOFT_COMPONENT", status: "IN_PROGRESS", fundsUtilized: 0, geoTaggedPhotoUrls: [] } });
    await tx.utilizationCertificate.create({ data: { tenantId: tenant.id, convergenceProjectId: sampleProject.id, milestoneId: milestone1.id, uploadedByUserId: iaUser.id, certificateDocumentUrl: "https://dev.mahacsr.local/uc/uc-q1.pdf", amountUtilized: 750000, verificationStatus: "VERIFIED", verifiedByNodalOfficerId: nodalUser.id, verifiedAt: new Date("2026-06-29"), invoiceDocuments: [] } });
    await tx.grievance.create({ data: { tenantId: tenant.id, grievanceId: "GRV-MH-2026-000001", convergenceProjectId: sampleProject.id, raisedByUserId: corporateUser.id, raisedByType: "CORPORATE", issueTitle: "Installation delay clarification", issueDescription: "Requesting updated installation schedule for the second milestone.", status: "LEVEL_1_REVIEW", level1DueAt: new Date("2026-07-15"), assignedNodalOfficerId: nodalUser.id, actionLogs: { create: { tenantId: tenant.id, actorUserId: corporateUser.id, action: "RAISED", note: "Grievance acknowledged and assigned to nodal officer." } } } });
    await tx.corporatePitchInterest.create({ data: { tenantId: tenant.id, interestTrackingId: "INT-MH-2026-000001", governmentPitchId: samplePitch.id, companyName: "Maharashtra Industries CSR Foundation", mca21Cin: "U12345MH2024PTC123456", contactPersonName: "Amit Deshpande", contactPersonDesignation: "CSR Head", mobile: "9876543210", mobileVerified: true, email: "csr@mahacorp.example", emailVerified: true, indicativeBudget: 2500000, preferredStartTimeline: "THIS_QUARTER", implementationMode: "OWN_FOUNDATION", declarationAccepted: true } });
    console.log("✓ Framework role users and convergence sample data created.");

    // ============================================
    // 3. CREATE NGO PROFILES
    // ============================================

    // NGO 1: Sahyadri Eco Foundation (Pune)
    const ngo1 = await tx.nGO.create({
      data: {
        name: "Sahyadri Eco Foundation",
        displayName: "Sahyadri Eco Foundation",
        organizationType: OrganizationType.TRUST,
        registrationNumber: "MH/2021/0088921",
        registrationDate: new Date("2021-03-15"),
        registrationAuthority: "Charity Commissioner, Maharashtra",
        darpanNumber: "MH/2021/012345",
        csr1Number: "CSR00012345",
        pan: "AAATS2345P",
        yearEstablished: 2021,
        officialEmail: "contact@sahyadrieco.org",
        officialPhone: "+912024567890",
        certificate12AUrl: "https://cloudinary.com/sahyadri/12a.pdf",
        certificate80GUrl: "https://cloudinary.com/sahyadri/80g.pdf",
        address: "12, Karve Road, Deccan Gymkhana",
        state: "Maharashtra",
        district: "Pune",
        taluka: "Haveli",
        village: "Pune City",
        pincode: "411004",
        city: "Pune",
        website: "https://sahyadrieco.org",
        socialLinks: {
          twitter: "https://twitter.com/sahyadrieco",
          linkedin: "https://linkedin.com/company/sahyadrieco",
        },
        areasOfOperation: ["Pune", "Satara", "Sangli"],
        csrSectors: ["Water Conservation", "Environmental Sustainability", "Rural Development"],
        impactStatistics: {
          beneficiariesServed: 45000,
          projectsCompleted: 12,
        },
        status: VerificationStatus.VERIFIED,
      },
    });
    console.log("✓ NGO 1 created:", ngo1.name);

    // NGO 2: Vidarbha Development Society (Nagpur)
    const ngo2 = await tx.nGO.create({
      data: {
        name: "Vidarbha Development Society",
        displayName: "Vidarbha Development Society",
        organizationType: OrganizationType.SOCIETY,
        registrationNumber: "MH/2019/0045678",
        registrationDate: new Date("2019-06-20"),
        registrationAuthority: "Registrar of Societies, Maharashtra",
        darpanNumber: "MH/2019/045678",
        csr1Number: "CSR00045678",
        pan: "AABVD5678K",
        yearEstablished: 2019,
        officialEmail: "info@vidarbhadev.org",
        officialPhone: "+917122334455",
        address: "45, Civil Lines, Sitabuldi",
        state: "Maharashtra",
        district: "Nagpur",
        taluka: "Nagpur",
        village: "Nagpur City",
        pincode: "440001",
        city: "Nagpur",
        website: "https://vidarbhadev.org",
        areasOfOperation: ["Nagpur", "Wardha", "Chandrapur"],
        csrSectors: ["Education & Literacy", "Skill Development", "Women Empowerment"],
        impactStatistics: {
          beneficiariesServed: 28000,
          projectsCompleted: 8,
        },
        status: VerificationStatus.VERIFIED,
      },
    });
    console.log("✓ NGO 2 created:", ngo2.name);

    // NGO 3: Mumbai Education Trust (Mumbai)
    const ngo3 = await tx.nGO.create({
      data: {
        name: "Mumbai Education Trust",
        displayName: "Mumbai Education Trust",
        organizationType: OrganizationType.TRUST,
        registrationNumber: "MH/2018/0123456",
        registrationDate: new Date("2018-01-10"),
        registrationAuthority: "Charity Commissioner, Maharashtra",
        darpanNumber: "MH/2018/123456",
        csr1Number: "CSR00123456",
        pan: "AAAMT1234L",
        yearEstablished: 2018,
        officialEmail: "admin@mumbaiedu.org",
        officialPhone: "+912226789012",
        address: "23, Nariman Point, Fort",
        state: "Maharashtra",
        district: "Mumbai",
        taluka: "Mumbai City",
        village: "Mumbai",
        pincode: "400021",
        city: "Mumbai",
        website: "https://mumbaiedu.org",
        areasOfOperation: ["Mumbai", "Thane", "Raigad"],
        csrSectors: ["Education & Literacy", "Digital Literacy", "Vocational Training"],
        impactStatistics: {
          beneficiariesServed: 62000,
          projectsCompleted: 15,
        },
        status: VerificationStatus.VERIFIED,
      },
    });
    console.log("✓ NGO 3 created:", ngo3.name);

    // NGO 4: Konkan Welfare Association (Ratnagiri) - Pending Verification
    const ngo4 = await tx.nGO.create({
      data: {
        name: "Konkan Welfare Association",
        displayName: "Konkan Welfare Association",
        organizationType: OrganizationType.SOCIETY,
        registrationNumber: "MH/2023/0098765",
        registrationDate: new Date("2023-04-15"),
        registrationAuthority: "Registrar of Societies, Maharashtra",
        darpanNumber: "MH/2023/098765",
        pan: "AABKW9876M",
        yearEstablished: 2023,
        officialEmail: "contact@konkanwelfare.org",
        officialPhone: "+912352234567",
        address: "78, Ratnagiri Main Road",
        state: "Maharashtra",
        district: "Ratnagiri",
        taluka: "Ratnagiri",
        village: "Ratnagiri",
        pincode: "415612",
        city: "Ratnagiri",
        areasOfOperation: ["Ratnagiri", "Sindhudurg"],
        csrSectors: ["Coastal Development", "Fisheries", "Healthcare"],
        impactStatistics: {
          beneficiariesServed: 5000,
          projectsCompleted: 2,
        },
        status: VerificationStatus.PENDING,
      },
    });
    console.log("✓ NGO 4 created:", ngo4.name);

    // ============================================
    // 4. CREATE NGO ADMIN USERS
    // ============================================

    const ngo1Admin = await tx.user.create({
      data: {
        email: "contact@sahyadrieco.org",
        passwordHash: defaultPasswordHash,
        role: Role.NGO_ADMIN,
        isVerified: true,
        ngoId: ngo1.id,
      },
    });
    console.log("✓ NGO 1 Admin created:", ngo1Admin.email);

    const ngo2Admin = await tx.user.create({
      data: {
        email: "info@vidarbhadev.org",
        passwordHash: defaultPasswordHash,
        role: Role.NGO_ADMIN,
        isVerified: true,
        ngoId: ngo2.id,
      },
    });
    console.log("✓ NGO 2 Admin created:", ngo2Admin.email);

    const ngo3Admin = await tx.user.create({
      data: {
        email: "admin@mumbaiedu.org",
        passwordHash: defaultPasswordHash,
        role: Role.NGO_ADMIN,
        isVerified: true,
        ngoId: ngo3.id,
      },
    });
    console.log("✓ NGO 3 Admin created:", ngo3Admin.email);

    const ngo4Admin = await tx.user.create({
      data: {
        email: "contact@konkanwelfare.org",
        passwordHash: defaultPasswordHash,
        role: Role.NGO_ADMIN,
        isVerified: true,
        ngoId: ngo4.id,
      },
    });
    console.log("✓ NGO 4 Admin created:", ngo4Admin.email);

    // ============================================
    // 5. CREATE COMPANY PROFILES
    // ============================================

    // Company 1: Tata Motors (Large Cap)
    const company1 = await tx.company.create({
      data: {
        name: "Tata Motors Limited",
        cin: "L28920MH1945PLC004520",
        gst: "27AAACT2727Q1ZV",
        pan: "AAACT2727Q",
        csrBudget: 250000000.00, // 25 Crores
        csrPolicyUrl: "https://tatamotors.com/csr-policy.pdf",
        focusAreas: ["Education & Literacy", "Healthcare", "Environmental Sustainability", "Rural Development"],
        contactInfo: {
          phone: "+912266657000",
          alternateEmail: "csr.team@tatamotors.com",
        },
        status: VerificationStatus.VERIFIED,
      },
    });
    console.log("✓ Company 1 created:", company1.name);

    // Company 2: Infosys (IT Sector)
    const company2 = await tx.company.create({
      data: {
        name: "Infosys Limited",
        cin: "L85110KA1981PLC013115",
        gst: "29AAACI1681G1ZK",
        pan: "AAACI1681G",
        csrBudget: 450000000.00, // 45 Crores
        csrPolicyUrl: "https://infosys.com/csr-policy.pdf",
        focusAreas: ["Education & Literacy", "Digital Literacy", "Skill Development", "Healthcare"],
        contactInfo: {
          phone: "+918028520261",
          alternateEmail: "csr@infosys.com",
        },
        status: VerificationStatus.VERIFIED,
      },
    });
    console.log("✓ Company 2 created:", company2.name);

    // Company 3: Reliance Industries (Conglomerate)
    const company3 = await tx.company.create({
      data: {
        name: "Reliance Industries Limited",
        cin: "L17110MH1973PLC019786",
        gst: "27AAACR5055K1Z7",
        pan: "AAACR5055K",
        csrBudget: 850000000.00, // 85 Crores
        csrPolicyUrl: "https://ril.com/csr-policy.pdf",
        focusAreas: ["Rural Development", "Healthcare", "Education & Literacy", "Sports"],
        contactInfo: {
          phone: "+912240303030",
          alternateEmail: "csr.initiatives@ril.com",
        },
        status: VerificationStatus.VERIFIED,
      },
    });
    console.log("✓ Company 3 created:", company3.name);

    // Company 4: Mahindra & Mahindra
    const company4 = await tx.company.create({
      data: {
        name: "Mahindra & Mahindra Limited",
        cin: "L65990MH1945PLC004558",
        gst: "27AAACM0307L1ZB",
        pan: "AAACM0307L",
        csrBudget: 180000000.00, // 18 Crores
        csrPolicyUrl: "https://mahindra.com/csr-policy.pdf",
        focusAreas: ["Education & Literacy", "Environmental Sustainability", "Livelihood Enhancement"],
        contactInfo: {
          phone: "+912224905500",
          alternateEmail: "csr@mahindra.com",
        },
        status: VerificationStatus.VERIFIED,
      },
    });
    console.log("✓ Company 4 created:", company4.name);

    // ============================================
    // 6. CREATE COMPANY ADMIN USERS
    // ============================================

    const company1Admin = await tx.user.create({
      data: {
        email: "csr.team@tatamotors.com",
        passwordHash: defaultPasswordHash,
        role: Role.COMPANY_ADMIN,
        isVerified: true,
        companyId: company1.id,
      },
    });
    console.log("✓ Company 1 Admin created:", company1Admin.email);

    const company2Admin = await tx.user.create({
      data: {
        email: "csr@infosys.com",
        passwordHash: defaultPasswordHash,
        role: Role.COMPANY_ADMIN,
        isVerified: true,
        companyId: company2.id,
      },
    });
    console.log("✓ Company 2 Admin created:", company2Admin.email);

    const company3Admin = await tx.user.create({
      data: {
        email: "csr.initiatives@ril.com",
        passwordHash: defaultPasswordHash,
        role: Role.COMPANY_ADMIN,
        isVerified: true,
        companyId: company3.id,
      },
    });
    console.log("✓ Company 3 Admin created:", company3Admin.email);

    const company4Admin = await tx.user.create({
      data: {
        email: "csr@mahindra.com",
        passwordHash: defaultPasswordHash,
        role: Role.COMPANY_ADMIN,
        isVerified: true,
        companyId: company4.id,
      },
    });
    console.log("✓ Company 4 Admin created:", company4Admin.email);

    // ============================================
    // 7. CREATE PROJECTS
    // ============================================

    // Project 1: Water Conservation (Gadchiroli)
    const project1 = await tx.project.create({
      data: {
        ngoId: ngo1.id,
        title: "Gadchiroli Watershed & Afforestation Initiative",
        description: "Building check dams, bunds, and reforestation to restore groundwater levels in Aheri taluka, Gadchiroli. This project aims to address water scarcity in tribal areas through sustainable watershed management and community participation.",
        focusArea: "Water Conservation",
        sdgGoal: "SDG 6: Clean Water and Sanitation",
        beneficiaryCount: 12000,
        budgetRequested: 2500000.00, // 25 Lakhs
        budgetFunded: 2500000.00,
        state: "Maharashtra",
        district: "Gadchiroli",
        taluka: "Aheri",
        village: "Kamalpur",
        startDate: new Date("2026-07-01"),
        endDate: new Date("2027-06-30"),
        status: ProjectStatus.FUNDED,
      },
    });
    console.log("✓ Project 1 created:", project1.title);

    // Project 2: Education (Pune)
    const project2 = await tx.project.create({
      data: {
        ngoId: ngo1.id,
        title: "Pune Rural Digital Smart-Classrooms",
        description: "Equipping 15 Zilla Parishad schools in Haveli and Mulshi talukas with smart interactive screens, digital content, and teacher training programs to enhance quality education in rural areas.",
        focusArea: "Education & Literacy",
        sdgGoal: "SDG 4: Quality Education",
        beneficiaryCount: 6500,
        budgetRequested: 3500000.00, // 35 Lakhs
        state: "Maharashtra",
        district: "Pune",
        taluka: "Haveli",
        village: "Loni Kalbhor",
        startDate: new Date("2026-08-15"),
        endDate: new Date("2027-05-15"),
        status: ProjectStatus.APPROVED,
      },
    });
    console.log("✓ Project 2 created:", project2.title);

    // Project 3: Skill Development (Nagpur)
    const project3 = await tx.project.create({
      data: {
        ngoId: ngo2.id,
        title: "Vidarbha Youth Skill Development Program",
        description: "Vocational training in IT, tailoring, and electrical work for 500 rural youth in Nagpur and Wardha districts, with placement assistance and entrepreneurship support.",
        focusArea: "Skill Development",
        sdgGoal: "SDG 8: Decent Work and Economic Growth",
        beneficiaryCount: 500,
        budgetRequested: 1800000.00, // 18 Lakhs
        state: "Maharashtra",
        district: "Nagpur",
        taluka: "Nagpur",
        village: "Kamptee",
        startDate: new Date("2026-09-01"),
        endDate: new Date("2027-08-31"),
        status: ProjectStatus.UNDER_REVIEW,
      },
    });
    console.log("✓ Project 3 created:", project3.title);

    // Project 4: Healthcare (Mumbai)
    const project4 = await tx.project.create({
      data: {
        ngoId: ngo3.id,
        title: "Mumbai Slum Health & Nutrition Campaign",
        description: "Mobile health clinics, nutrition awareness, and free health check-ups for 10,000 slum dwellers in Mumbai suburbs, focusing on maternal and child health.",
        focusArea: "Healthcare",
        sdgGoal: "SDG 3: Good Health and Well-being",
        beneficiaryCount: 10000,
        budgetRequested: 4200000.00, // 42 Lakhs
        budgetFunded: 4200000.00,
        state: "Maharashtra",
        district: "Mumbai",
        taluka: "Mumbai Suburban",
        village: "Dharavi",
        startDate: new Date("2026-07-15"),
        endDate: new Date("2027-07-14"),
        status: ProjectStatus.FUNDED,
      },
    });
    console.log("✓ Project 4 created:", project4.title);

    // Project 5: Women Empowerment (Nagpur)
    const project5 = await tx.project.create({
      data: {
        ngoId: ngo2.id,
        title: "Women Self-Help Group Empowerment",
        description: "Formation and training of 50 women self-help groups in Wardha district for micro-enterprise development, financial literacy, and market linkages.",
        focusArea: "Women Empowerment",
        sdgGoal: "SDG 5: Gender Equality",
        beneficiaryCount: 750,
        budgetRequested: 1200000.00, // 12 Lakhs
        state: "Maharashtra",
        district: "Wardha",
        taluka: "Wardha",
        village: "Pulgaon",
        startDate: new Date("2026-10-01"),
        endDate: new Date("2027-09-30"),
        status: ProjectStatus.SUBMITTED,
      },
    });
    console.log("✓ Project 5 created:", project5.title);

    // ============================================
    // 8. CREATE MILESTONES
    // ============================================

    await tx.milestone.createMany({
      data: [
        // Project 1 Milestones
        {
          projectId: project1.id,
          name: "Phase 1: Site Survey & Ground Preparation",
          description: "Geological survey and demarcation of 3 check dam sites in Kamalpur village with community consultation.",
          amount: 500000.00,
          dueDate: new Date("2026-09-01"),
          status: MilestoneStatus.APPROVED_BY_NGO,
        },
        {
          projectId: project1.id,
          name: "Phase 2: Check Dam Construction",
          description: "Excavation and brickwork laying for all 3 designated water storing check dams with quality monitoring.",
          amount: 1200000.00,
          dueDate: new Date("2026-12-15"),
          status: MilestoneStatus.PENDING,
        },
        {
          projectId: project1.id,
          name: "Phase 3: Afforestation & Community Training",
          description: "Sapling plantation across 10 hectares and training local water committees for maintenance.",
          amount: 800000.00,
          dueDate: new Date("2027-06-01"),
          status: MilestoneStatus.PENDING,
        },
        // Project 4 Milestones
        {
          projectId: project4.id,
          name: "Phase 1: Mobile Clinic Setup",
          description: "Procurement of 2 mobile health vans with medical equipment and staff recruitment.",
          amount: 1500000.00,
          dueDate: new Date("2026-09-15"),
          status: MilestoneStatus.APPROVED_BY_COMPANY,
        },
        {
          projectId: project4.id,
          name: "Phase 2: Health Camps & Awareness",
          description: "Conducting 50 health camps and nutrition awareness sessions in target slums.",
          amount: 1700000.00,
          dueDate: new Date("2027-03-15"),
          status: MilestoneStatus.PENDING,
        },
        {
          projectId: project4.id,
          name: "Phase 3: Follow-up & Documentation",
          description: "Follow-up care, impact assessment, and documentation of health outcomes.",
          amount: 1000000.00,
          dueDate: new Date("2027-07-01"),
          status: MilestoneStatus.PENDING,
        },
      ],
    });
    console.log("✓ Milestones created for funded projects");

    // ============================================
    // 9. CREATE MATCH SCORES
    // ============================================

    await tx.matchScore.createMany({
      data: [
        {
          companyId: company1.id,
          projectId: project1.id,
          score: 85,
          factors: {
            locationMatch: "state_match",
            focusAreaMatch: false,
            budgetFitScore: 95,
            aspirationalDistrict: true,
          },
        },
        {
          companyId: company1.id,
          projectId: project2.id,
          score: 92,
          factors: {
            locationMatch: "district_match",
            focusAreaMatch: true,
            budgetFitScore: 90,
          },
        },
        {
          companyId: company2.id,
          projectId: project2.id,
          score: 98,
          factors: {
            locationMatch: "district_match",
            focusAreaMatch: true,
            budgetFitScore: 95,
          },
        },
        {
          companyId: company2.id,
          projectId: project3.id,
          score: 94,
          factors: {
            locationMatch: "state_match",
            focusAreaMatch: true,
            budgetFitScore: 92,
          },
        },
        {
          companyId: company3.id,
          projectId: project4.id,
          score: 96,
          factors: {
            locationMatch: "district_match",
            focusAreaMatch: true,
            budgetFitScore: 98,
          },
        },
        {
          companyId: company4.id,
          projectId: project1.id,
          score: 88,
          factors: {
            locationMatch: "state_match",
            focusAreaMatch: true,
            budgetFitScore: 85,
            aspirationalDistrict: true,
          },
        },
      ],
    });
    console.log("✓ Match scores created");

    // ============================================
    // 10. CREATE AUDIT LOGS
    // ============================================

    await tx.auditLog.createMany({
      data: [
        {
          userId: superAdmin.id,
          action: "USER_LOGIN",
          details: { email: superAdmin.email, role: "SUPER_ADMIN" },
          ipAddress: "103.21.58.12",
        },
        {
          userId: ngo1Admin.id,
          action: "PROJECT_CREATED",
          details: { projectId: project1.id, title: project1.title },
          ipAddress: "103.21.58.45",
        },
        {
          userId: company1Admin.id,
          action: "PROJECT_FUNDED",
          details: { projectId: project1.id, amount: 2500000 },
          ipAddress: "103.21.58.78",
        },
      ],
    });
    console.log("✓ Audit logs created");

    // ============================================
    // 11. CREATE DISTRICT ADMINS AND BENEFICIARIES
    // ============================================

    const districtAdmin = await tx.user.create({
      data: {
        email: "district.admin@mahacsr.gov.in",
        passwordHash: defaultPasswordHash,
        role: Role.DISTRICT_ADMIN,
        isVerified: true,
        assignedDistrict: "Pune",
      },
    });
    console.log("✓ District Admin created:", districtAdmin.email);

    // Beneficiary 1: ZP School Pune
    const beneficiaryUser1 = await tx.user.create({
      data: {
        email: "zp.pune@mahacsr.gov.in",
        passwordHash: defaultPasswordHash,
        role: Role.BENEFICIARY_AGENCY,
        isVerified: true,
      },
    });
    const beneficiary1 = await tx.beneficiaryProfile.create({
      data: {
        userId: beneficiaryUser1.id,
        agencyName: "Zilla Parishad School Pune",
        agencyType: "Government School",
        district: "Pune",
        taluka: "Haveli",
        village: "Loni Kalbhor",
        address: "ZP School Campus, Loni Kalbhor",
        contactPerson: "Rajesh Patil",
        contactEmail: "zp.pune@mahacsr.gov.in",
        contactPhone: "+919876543210",
        designation: "Headmaster",
      },
    });
    console.log("✓ Beneficiary 1 created:", beneficiary1.agencyName);

    // Beneficiary 2: Nagpur Municipal General Hospital
    const beneficiaryUser2 = await tx.user.create({
      data: {
        email: "nagpur.hospital@mahacsr.gov.in",
        passwordHash: defaultPasswordHash,
        role: Role.BENEFICIARY_AGENCY,
        isVerified: true,
      },
    });
    const beneficiary2 = await tx.beneficiaryProfile.create({
      data: {
        userId: beneficiaryUser2.id,
        agencyName: "Nagpur Municipal General Hospital",
        agencyType: "Government Hospital",
        district: "Nagpur",
        taluka: "Nagpur",
        address: "Civil Lines, Nagpur",
        contactPerson: "Dr. Sunita Deshmukh",
        contactEmail: "nagpur.hospital@mahacsr.gov.in",
        contactPhone: "+919876543211",
        designation: "Medical Superintendent",
      },
    });
    console.log("✓ Beneficiary 2 created:", beneficiary2.agencyName);

    // Beneficiary 3: Gram Panchayat Shikrapur
    const beneficiaryUser3 = await tx.user.create({
      data: {
        email: "gp.shikrapur@mahacsr.gov.in",
        passwordHash: defaultPasswordHash,
        role: Role.BENEFICIARY_AGENCY,
        isVerified: true,
      },
    });
    const beneficiary3 = await tx.beneficiaryProfile.create({
      data: {
        userId: beneficiaryUser3.id,
        agencyName: "Gram Panchayat Shikrapur",
        agencyType: "Gram Panchayat",
        district: "Pune",
        taluka: "Shirur",
        village: "Shikrapur",
        address: "Gram Panchayat Office, Shikrapur",
        contactPerson: "Anil Gawade",
        contactEmail: "gp.shikrapur@mahacsr.gov.in",
        contactPhone: "+919876543212",
        designation: "Gram Sevak",
      },
    });
    console.log("✓ Beneficiary 3 created:", beneficiary3.agencyName);

    // ============================================
    // 12. CREATE CSR REQUIREMENTS
    // ============================================

    // Req 1: Water Conservation at Shikrapur (DRAFT)
    const req1 = await tx.cSRRequirement.create({
      data: {
        beneficiaryProfileId: beneficiary3.id,
        title: "Rainwater Harvesting & Drinking Water Borewell",
        category: CSRCategory.WATER,
        description: "Providing a robust rainwater harvesting setup and borewell with purification system at the village center.",
        district: "Pune",
        taluka: "Shirur",
        village: "Shikrapur",
        address: "Village Square, Shikrapur",
        estimatedCost: 800000.00,
        beneficiaryCount: 3500,
        expectedImpact: "Clean drinking water access to 3500 villagers throughout the dry season.",
        priorityLevel: PriorityLevel.HIGH,
        completionTimeline: "3 months",
        contactPersonName: "Anil Gawade",
        contactPersonPhone: "+919876543212",
        contactPersonEmail: "gp.shikrapur@mahacsr.gov.in",
        status: CSRRequirementStatus.DRAFT,
      },
    });

    // Req 2: ZP School Science Lab Upgrade (PENDING_VERIFICATION)
    const req2 = await tx.cSRRequirement.create({
      data: {
        beneficiaryProfileId: beneficiary1.id,
        title: "Zilla Parishad School Science Lab Upgrade",
        category: CSRCategory.EDUCATION,
        description: "Establishing a fully equipped science laboratory with equipment, charts, and demo models for students from class 5 to 10.",
        district: "Pune",
        taluka: "Haveli",
        village: "Loni Kalbhor",
        address: "ZP School Campus, Loni Kalbhor",
        estimatedCost: 650000.00,
        beneficiaryCount: 450,
        expectedImpact: "Providing hands-on science learning resources to 450 rural students.",
        priorityLevel: PriorityLevel.MEDIUM,
        completionTimeline: "2 months",
        contactPersonName: "Rajesh Patil",
        contactPersonPhone: "+919876543210",
        contactPersonEmail: "zp.pune@mahacsr.gov.in",
        status: CSRRequirementStatus.PENDING_VERIFICATION,
      },
    });

    // Req 3: Pediatric Ward ICU Equipment (NGO_APPLICATIONS_OPEN)
    const req3 = await tx.cSRRequirement.create({
      data: {
        beneficiaryProfileId: beneficiary2.id,
        title: "Pediatric Ward ICU Equipment & Neonatal Monitors",
        category: CSRCategory.HEALTH,
        description: "Procuring 5 neonatal monitors, phototherapy units, and oxygen concentrators for the pediatric ICU department.",
        district: "Nagpur",
        taluka: "Nagpur",
        address: "Civil Lines, Nagpur",
        estimatedCost: 1500000.00,
        beneficiaryCount: 2000,
        expectedImpact: "Saving lives of approximately 2000 infants and children visiting the government hospital annually.",
        priorityLevel: PriorityLevel.CRITICAL,
        completionTimeline: "4 months",
        contactPersonName: "Dr. Sunita Deshmukh",
        contactPersonPhone: "+919876543211",
        contactPersonEmail: "nagpur.hospital@mahacsr.gov.in",
        status: CSRRequirementStatus.NGO_APPLICATIONS_OPEN,
        verifiedById: districtAdmin.id,
        verifiedAt: new Date(),
        verificationRemarks: "Verified after consulting the hospital board.",
      },
    });

    // Req 4: ZP School Pune Smart Classroom Setup (NGO_SELECTED)
    const req4 = await tx.cSRRequirement.create({
      data: {
        beneficiaryProfileId: beneficiary1.id,
        title: "ZP School Pune Smart Classroom Setup",
        category: CSRCategory.EDUCATION,
        description: "Digital smartboards and internet connectivity for Zilla Parishad School in Haveli.",
        district: "Pune",
        taluka: "Haveli",
        village: "Loni Kalbhor",
        address: "ZP School Campus, Loni Kalbhor",
        estimatedCost: 1200000.00,
        beneficiaryCount: 800,
        expectedImpact: "Digital literacy for 800 elementary students.",
        priorityLevel: PriorityLevel.HIGH,
        completionTimeline: "6 months",
        contactPersonName: "Rajesh Patil",
        contactPersonPhone: "+919876543210",
        contactPersonEmail: "zp.pune@mahacsr.gov.in",
        status: CSRRequirementStatus.NGO_SELECTED,
        verifiedById: districtAdmin.id,
        verifiedAt: new Date(),
        verificationRemarks: "High impact area.",
      },
    });

    // Req 5: ZP School Pune Girls Washroom Construction (COMPLETED)
    const req5 = await tx.cSRRequirement.create({
      data: {
        beneficiaryProfileId: beneficiary1.id,
        title: "ZP School Pune Girls Washroom Construction",
        category: CSRCategory.SANITATION,
        description: "Construction of 4 toilets and handwashing station with running water for girl students.",
        district: "Pune",
        taluka: "Haveli",
        village: "Loni Kalbhor",
        address: "ZP School Campus, Loni Kalbhor",
        estimatedCost: 500000.00,
        beneficiaryCount: 300,
        expectedImpact: "Reducing dropout rates of adolescent girl students.",
        priorityLevel: PriorityLevel.CRITICAL,
        completionTimeline: "3 months",
        contactPersonName: "Rajesh Patil",
        contactPersonPhone: "+919876543210",
        contactPersonEmail: "zp.pune@mahacsr.gov.in",
        status: CSRRequirementStatus.COMPLETED,
        verifiedById: districtAdmin.id,
        verifiedAt: new Date(),
        verificationRemarks: "Critical infrastructure sanitation needs.",
      },
    });
    console.log("✓ CSR Requirements created.");

    // ============================================
    // 13. CREATE NGO APPLICATIONS
    // ============================================

    // NGO 2 applies to Pediatric Ward ICU (Req 3)
    const app1 = await tx.nGOApplication.create({
      data: {
        csrRequirementId: req3.id,
        ngoId: ngo2.id,
        proposedPlan: "We will source FDA approved neonatal monitors, set up the ICU ward in 90 days, and conduct training.",
        proposedTimeline: "3 months",
        estimatedCost: 1450000.00,
        teamDetails: "Lead pediatrician, project coordinator, and two technicians.",
        pastExperience: "Installed health equipment in 3 other public clinics in Wardha.",
        status: NGOApplicationStatus.NGO_APPLIED,
      },
    });

    // NGO 1 applies to Smart Classrooms (Req 4)
    const app2 = await tx.nGOApplication.create({
      data: {
        csrRequirementId: req4.id,
        ngoId: ngo1.id,
        proposedPlan: "Install 10 interactive panels and train ZP teachers on digital curriculum.",
        proposedTimeline: "6 months",
        estimatedCost: 1200000.00,
        status: NGOApplicationStatus.SHORTLISTED,
      },
    });

    // NGO 3 applies to Smart Classrooms (Req 4)
    const app3 = await tx.nGOApplication.create({
      data: {
        csrRequirementId: req4.id,
        ngoId: ngo3.id,
        proposedPlan: "Digital smart classroom installation using high quality projectors and content.",
        proposedTimeline: "4 months",
        estimatedCost: 1150000.00,
        status: NGOApplicationStatus.SELECTED_BY_COMPANY,
      },
    });

    // NGO 3 applies to Girls Washroom (Req 5)
    const app4 = await tx.nGOApplication.create({
      data: {
        csrRequirementId: req5.id,
        ngoId: ngo3.id,
        proposedPlan: "Brick and mortar construction with sanitary piping and solar water pumps.",
        proposedTimeline: "3 months",
        estimatedCost: 500000.00,
        status: NGOApplicationStatus.COMPLETED,
      },
    });
    console.log("✓ NGO Applications created.");

    // ============================================
    // 14. CREATE COMPANY INTERESTS
    // ============================================

    // Tata Motors interested in ICU (Req 3)
    await tx.companyInterest.create({
      data: {
        csrRequirementId: req3.id,
        companyId: company1.id,
        fundingAmount: 1500000.00,
        fundingType: "FULL_FUNDING",
        focusAlignmentNotes: "Aligns with our primary healthcare CSR targets.",
        status: CompanyInterestStatus.INTEREST_SUBMITTED,
      },
    });

    // Infosys interested in Smart Classrooms (Req 4)
    await tx.companyInterest.create({
      data: {
        csrRequirementId: req4.id,
        companyId: company2.id,
        fundingAmount: 1200000.00,
        fundingType: "FULL_FUNDING",
        status: CompanyInterestStatus.NGO_SELECTED,
        selectedNgoId: ngo3.id,
        selectedAt: new Date(),
      },
    });

    // Mahindra interested in Girls Washroom (Req 5)
    await tx.companyInterest.create({
      data: {
        csrRequirementId: req5.id,
        companyId: company4.id,
        fundingAmount: 500000.00,
        fundingType: "FULL_FUNDING",
        status: CompanyInterestStatus.CI_COMPLETED,
        selectedNgoId: ngo3.id,
        selectedAt: new Date(),
      },
    });
    console.log("✓ Company interests created.");

    // ============================================
    // 15. CREATE AGREEMENTS
    // ============================================

    // Agreement for Smart Classrooms (Req 4)
    await tx.agreement.create({
      data: {
        csrRequirementId: req4.id,
        companyId: company2.id,
        ngoId: ngo3.id,
        beneficiaryProfileId: beneficiary1.id,
        fundingAmount: 1200000.00,
        status: AgreementStatus.APPROVED_BY_COMPANY,
        termsAndConditions: "Standard tripartite CSR execution terms. Milestones subject to verification.",
      },
    });

    // Agreement for Washroom (Req 5)
    await tx.agreement.create({
      data: {
        csrRequirementId: req5.id,
        companyId: company4.id,
        ngoId: ngo3.id,
        beneficiaryProfileId: beneficiary1.id,
        fundingAmount: 500000.00,
        status: AgreementStatus.SIGNED,
        signedDocumentUrl: "https://res.cloudinary.com/demo/image/upload/v12345/agreement_signed.pdf",
        termsAndConditions: "Executed tripartite agreement.",
      },
    });
    console.log("✓ Agreements created.");

    // ============================================
    // 16. CREATE FUND MILESTONES
    // ============================================

    // Milestones for Smart Classrooms (Req 4)
    await tx.cSRFundMilestone.create({
      data: {
        csrRequirementId: req4.id,
        milestoneName: "Phase 1: Hardware Procurement",
        milestonePercentage: 60.00,
        amount: 720000.00,
        status: CSRFundMilestoneStatus.FM_PENDING,
      },
    });
    await tx.cSRFundMilestone.create({
      data: {
        csrRequirementId: req4.id,
        milestoneName: "Phase 2: Classroom Setup & Training",
        milestonePercentage: 40.00,
        amount: 480000.00,
        status: CSRFundMilestoneStatus.FM_PENDING,
      },
    });

    // Milestones for Washroom (Req 5)
    await tx.cSRFundMilestone.create({
      data: {
        csrRequirementId: req5.id,
        milestoneName: "Phase 1: Ground Work & Materials",
        milestonePercentage: 50.00,
        amount: 250000.00,
        status: CSRFundMilestoneStatus.FM_RELEASED,
        releaseDate: new Date("2026-04-01"),
      },
    });
    await tx.cSRFundMilestone.create({
      data: {
        csrRequirementId: req5.id,
        milestoneName: "Phase 2: Structure & Sanitation Construction",
        milestonePercentage: 50.00,
        amount: 250000.00,
        status: CSRFundMilestoneStatus.FM_VERIFIED,
        releaseDate: new Date("2026-05-15"),
        utilizationProofUrl: "https://res.cloudinary.com/demo/image/upload/v12345/utilization_invoice.pdf",
      },
    });
    console.log("✓ Fund Milestones created.");

    // ============================================
    // 17. PROGRESS, COMPLETION & IMPACT REPORTS
    // ============================================

    // Progress report for Washroom (Req 5)
    await tx.progressReport.create({
      data: {
        csrRequirementId: req5.id,
        submittedByNgoId: ngo3.id,
        progressTitle: "Structural Completion and Plastering",
        progressDescription: "All 4 brick-and-mortar units are completed. Plastering and tile work are underway.",
        physicalProgressPercent: 80,
        financialUtilPercent: 50,
        status: ProgressReportStatus.PR_VERIFIED,
        verifiedById: districtAdmin.id,
        verifiedAt: new Date(),
        verificationRemarks: "Verified by physical site inspection.",
      },
    });

    // Completion report for Washroom (Req 5)
    await tx.completionReport.create({
      data: {
        csrRequirementId: req5.id,
        submittedByNgoId: ngo3.id,
        workCompletedSummary: "All 4 girl washrooms, water supply and handwashing stations fully built.",
        finalCost: 500000.00,
        fundUtilizationSummary: "2.5L on labor and excavation, 2.5L on bricks, pipes, toilets, and fittings.",
        beforePhotoUrls: ["https://res.cloudinary.com/demo/image/upload/v12345/before_washroom.jpg"],
        afterPhotoUrls: ["https://res.cloudinary.com/demo/image/upload/v12345/after_washroom.jpg"],
        beneficiaryCount: 300,
        outcomeIndicators: { dropoutRateReduction: "Estimated 15% reduction" },
      },
    });

    // Impact report for Washroom (Req 5)
    await tx.impactReport.create({
      data: {
        csrRequirementId: req5.id,
        projectSummary: "Sanitation infrastructure construction at Pune Zilla Parishad school to prevent high dropout rates of girls.",
        companyContribution: "Mahindra & Mahindra funded the full 5 Lakh budget.",
        ngoExecutionSummary: "Executed by Mumbai Education Trust on schedule.",
        beneficiaryReach: 300,
        impactScore: 92,
        timelyCompletionScore: 95,
        fundUtilAccuracyScore: 100,
        beneficiaryFeedbackScore: 90,
        govVerificationScore: 90,
        socialImpactScore: 95,
        documentationScore: 90,
      },
    });
    console.log("✓ Progress, Completion and Impact reports created.");

    // ============================================
    // 18. TENANT NORMALIZATION, ORGANIZATIONS & DEFAULT ROLES
    // ============================================

    const createSystemRole = async (name: string, scope: RoleScope, organizationId?: string | null) => {
      return tx.organizationRole.create({
        data: {
          tenantId: scope === RoleScope.GLOBAL ? null : tenant.id,
          organizationId: organizationId || null,
          name,
          description: `${name.replace(/_/g, " ")} system role`,
          scope,
          isSystemRole: true,
          rolePermissions: {
            create: (ROLE_PERMISSION_MAP[name] || ROLE_PERMISSION_MAP.VIEWER || [])
              .map((key) => ({ permissionId: permissionIdByKey.get(key)! }))
              .filter((item) => item.permissionId)
          }
        }
      });
    };

    const portalAdminOrg = await tx.organization.create({
      data: {
        tenantId: tenant.id,
        organizationType: OrganizationKind.PORTAL_ADMIN_ORG,
        name: "Maharashtra CSR Authority",
        email: "portal.admin@mahacsr.gov.in",
        district: "Mumbai",
        onboardingStatus: OrganizationOnboardingStatus.APPROVED,
        status: OrganizationStatus.ACTIVE,
        approvedBy: masterAdmin.id,
        approvedAt: new Date()
      }
    });
    await tx.user.updateMany({
      where: { id: { in: [portalAdmin.id, csrAdmin.id, districtAdmin.id, superAdmin.id] } },
      data: { tenantId: tenant.id, organizationId: portalAdminOrg.id }
    });
    const portalRole = await createSystemRole("PORTAL_ADMIN", RoleScope.TENANT, portalAdminOrg.id);
    await tx.userOrganizationRole.createMany({
      data: [portalAdmin, csrAdmin, districtAdmin, superAdmin].map((user) => ({
        userId: user.id,
        roleId: portalRole.id,
        tenantId: tenant.id,
        organizationId: portalAdminOrg.id
      })),
      skipDuplicates: true
    });

    for (const ngo of [ngo1, ngo2, ngo3, ngo4]) {
      const org = await tx.organization.create({
        data: {
          tenantId: tenant.id,
          organizationType: OrganizationKind.NGO,
          name: ngo.name,
          registrationNumber: ngo.registrationNumber,
          pan: ngo.pan,
          email: ngo.officialEmail,
          phone: ngo.officialPhone,
          address: ngo.address,
          district: ngo.district,
          taluka: ngo.taluka,
          onboardingStatus: ngo.status === VerificationStatus.VERIFIED ? OrganizationOnboardingStatus.APPROVED : OrganizationOnboardingStatus.SUBMITTED_FOR_REVIEW,
          status: OrganizationStatus.ACTIVE,
          approvedBy: ngo.status === VerificationStatus.VERIFIED ? portalAdmin.id : null,
          approvedAt: ngo.status === VerificationStatus.VERIFIED ? new Date() : null,
          sourceNgoId: ngo.id
        }
      });
      await tx.nGO.update({ where: { id: ngo.id }, data: { tenantId: tenant.id, organizationId: org.id } });
      await tx.user.updateMany({ where: { ngoId: ngo.id }, data: { tenantId: tenant.id, organizationId: org.id } });
      const role = await createSystemRole("NGO_ADMIN", RoleScope.ORGANIZATION, org.id);
      const ngoUsers = await tx.user.findMany({ where: { ngoId: ngo.id } });
      await tx.userOrganizationRole.createMany({
        data: ngoUsers.map((user) => ({ userId: user.id, roleId: role.id, tenantId: tenant.id, organizationId: org.id })),
        skipDuplicates: true
      });
    }

    for (const company of [company1, company2, company3, company4]) {
      const org = await tx.organization.create({
        data: {
          tenantId: tenant.id,
          organizationType: OrganizationKind.CSR_COMPANY,
          name: company.name,
          registrationNumber: company.cin,
          pan: company.pan,
          gst: company.gst,
          address: company.registeredAddress,
          onboardingStatus: company.status === VerificationStatus.VERIFIED ? OrganizationOnboardingStatus.APPROVED : OrganizationOnboardingStatus.SUBMITTED_FOR_REVIEW,
          status: OrganizationStatus.ACTIVE,
          approvedBy: company.status === VerificationStatus.VERIFIED ? portalAdmin.id : null,
          approvedAt: company.status === VerificationStatus.VERIFIED ? new Date() : null,
          sourceCompanyId: company.id
        }
      });
      await tx.company.update({ where: { id: company.id }, data: { tenantId: tenant.id, organizationId: org.id } });
      await tx.user.updateMany({ where: { companyId: company.id }, data: { tenantId: tenant.id, organizationId: org.id } });
      const role = await createSystemRole("COMPANY_ADMIN", RoleScope.ORGANIZATION, org.id);
      const companyUsers = await tx.user.findMany({ where: { companyId: company.id } });
      await tx.userOrganizationRole.createMany({
        data: companyUsers.map((user) => ({ userId: user.id, roleId: role.id, tenantId: tenant.id, organizationId: org.id })),
        skipDuplicates: true
      });
    }

    for (const beneficiary of [beneficiary1, beneficiary2, beneficiary3]) {
      const org = await tx.organization.create({
        data: {
          tenantId: tenant.id,
          organizationType: OrganizationKind.GOVERNMENT_DEPARTMENT,
          name: beneficiary.agencyName,
          email: beneficiary.contactEmail,
          phone: beneficiary.contactPhone,
          address: beneficiary.address,
          district: beneficiary.district,
          taluka: beneficiary.taluka,
          onboardingStatus: OrganizationOnboardingStatus.APPROVED,
          status: OrganizationStatus.ACTIVE,
          approvedBy: portalAdmin.id,
          approvedAt: new Date(),
          sourceBeneficiaryProfileId: beneficiary.id
        }
      });
      await tx.beneficiaryProfile.update({ where: { id: beneficiary.id }, data: { tenantId: tenant.id, organizationId: org.id } });
      await tx.user.update({ where: { id: beneficiary.userId }, data: { tenantId: tenant.id, organizationId: org.id } });
      const role = await createSystemRole("BENEFICIARY_AGENCY", RoleScope.ORGANIZATION, org.id);
      await tx.userOrganizationRole.create({
        data: { userId: beneficiary.userId, roleId: role.id, tenantId: tenant.id, organizationId: org.id }
      });
    }

    await tx.project.updateMany({ data: { tenantId: tenant.id } });
    await tx.milestone.updateMany({ data: { tenantId: tenant.id } });
    await tx.chat.updateMany({ data: { tenantId: tenant.id } });
    await tx.message.updateMany({ data: { tenantId: tenant.id } });
    await tx.document.updateMany({ data: { tenantId: tenant.id } });
    await tx.report.updateMany({ data: { tenantId: tenant.id } });
    await tx.notification.updateMany({ data: { tenantId: tenant.id } });
    await tx.auditLog.updateMany({ data: { tenantId: tenant.id } });
    await tx.cSRRequirement.updateMany({ data: { tenantId: tenant.id } });
    await tx.cSRRequirementDocument.updateMany({ data: { tenantId: tenant.id } });
    await tx.nGOApplication.updateMany({ data: { tenantId: tenant.id } });
    await tx.companyInterest.updateMany({ data: { tenantId: tenant.id } });
    await tx.agreement.updateMany({ data: { tenantId: tenant.id } });
    await tx.cSRFundMilestone.updateMany({ data: { tenantId: tenant.id } });
    await tx.cSRProject.updateMany({ data: { tenantId: tenant.id } });
    await tx.cSRFundRelease.updateMany({ data: { tenantId: tenant.id } });
    await tx.utilizationCertificate.updateMany({ data: { tenantId: tenant.id } });
    await tx.assetHandover.updateMany({ data: { tenantId: tenant.id } });
    await tx.projectInspection.updateMany({ data: { tenantId: tenant.id } });
    await tx.impactMetric.updateMany({ data: { tenantId: tenant.id } });
    await tx.progressReport.updateMany({ data: { tenantId: tenant.id } });
    await tx.completionReport.updateMany({ data: { tenantId: tenant.id } });
    await tx.impactReport.updateMany({ data: { tenantId: tenant.id } });
    console.log("✓ Tenant scoping, organizations and default roles created.");

  }, {
    timeout: 300000
  });

  console.log("\n========================================");
  console.log("✅ Database seed completed successfully!");
  console.log("========================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Made with Bob
