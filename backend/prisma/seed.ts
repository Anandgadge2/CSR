import { PrismaClient, Role, VerificationStatus, ProjectStatus, MilestoneStatus, OnboardingStatus, OrganizationType, CSRCategory, PriorityLevel, CSRRequirementStatus, NGOApplicationStatus, CompanyInterestStatus, AgreementStatus, CSRFundMilestoneStatus, ProgressReportStatus, OrganizationKind, OrganizationOnboardingStatus, OrganizationStatus, RoleScope } from "@prisma/client";
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
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Made with Bob
