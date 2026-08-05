import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { FEASIBILITY_CHECKLIST_SEED } from "../src/constants/mahacsr-framework";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding rich convergence workflow data (enquiries, pitches, assessments, and logs)...");

  // 1. Fetch Demo Users
  const rmUser = await prisma.user.findFirst({
    where: { email: "rm@mahacsr.gov.in" }
  });
  if (!rmUser) {
    throw new Error("RM User (rm@mahacsr.gov.in) not found! Please run node prisma/seed.ts first.");
  }

  const jsUser = await prisma.user.findFirst({
    where: { email: "js@mahacsr.gov.in" }
  });
  if (!jsUser) {
    throw new Error("JS User (js@mahacsr.gov.in) not found! Please run node prisma/seed.ts first.");
  }

  const companyUser = await prisma.user.findFirst({
    where: { email: "company.admin@mahacsr.gov.in" }
  });

  // 2. Fetch or Create Organizations
  let companyOrg = await prisma.organization.findFirst({
    where: { kind: "CSR_COMPANY" }
  });
  if (!companyOrg) {
    companyOrg = await prisma.organization.create({
      data: {
        name: "TATA CSR Foundation",
        kind: "CSR_COMPANY",
        state: "Maharashtra",
        district: "Mumbai",
        status: "ACTIVE",
        registrationNumber: "ENC_COMP_001",
        registrationNumberHash: "HASH_COMP_001"
      }
    });
  }

  let govDept = await prisma.organization.findFirst({
    where: { kind: "GOVERNMENT_DEPARTMENT" }
  });
  if (!govDept) {
    govDept = await prisma.organization.create({
      data: {
        name: "School Education Department",
        kind: "GOVERNMENT_DEPARTMENT",
        state: "Maharashtra",
        district: "Mumbai",
        status: "ACTIVE",
        registrationNumber: "ENC_GOV_001",
        registrationNumberHash: "HASH_GOV_001"
      }
    });
  }

  // Clear existing convergent records to allow fresh seeding
  console.log("Cleaning old convergence data...");
  await prisma.applicationInteraction.deleteMany({});
  await prisma.feasibilityAssessment.deleteMany({});
  await prisma.corporateEnquiry.deleteMany({});
  await prisma.governmentPitch.deleteMany({});

  // 3. Seed Corporate Enquiries
  console.log("Seeding Corporate Enquiries...");
  const enq1 = await prisma.corporateEnquiry.create({
    data: {
      trackingId: "CSR-MH-2026-000101",
      corporateName: "Tata Consultancy Services Ltd",
      contactEmail: "csr@tcs.com",
      mca21CIN: "L72200MH1995PLC085601",
      sector: "Education & Digital Literacy",
      indicativeBudget: 35000000,
      preferredDistricts: ["Pune", "Satara"],
      contactPersonName: "Rajesh V. Sharma",
      mobile: "+91 98201 12345",
      proposedCSRWork: "Setting up 75 Digital Smart Classrooms with solar power backup and teacher training across Zilla Parishad schools in rural Pune.",
      status: "ASSESSMENT_PENDING",
      assignedRelationshipManagerId: rmUser.id,
      submittedByUserId: companyUser?.id || null,
      organizationId: companyOrg.id,
      firstContactedAt: new Date(Date.now() - 86400000 * 3)
    }
  });

  const enq2 = await prisma.corporateEnquiry.create({
    data: {
      trackingId: "CSR-MH-2026-000102",
      corporateName: "Reliance Foundation",
      contactEmail: "ananya.roy@reliancefoundation.org",
      mca21CIN: "L17110MH1973PLC019786",
      sector: "Healthcare & Infrastructure",
      indicativeBudget: 60000000,
      preferredDistricts: ["Nagpur", "Chandrapur"],
      contactPersonName: "Dr. Ananya Roy",
      mobile: "+91 98202 67890",
      proposedCSRWork: "Upgradation of 20 Primary Health Centres (PHCs) with solar microgrids and telemedicine units in tribal belts.",
      status: "ASSESSMENT_SUBMITTED_TO_JS",
      assignedRelationshipManagerId: rmUser.id,
      submittedByUserId: companyUser?.id || null,
      organizationId: companyOrg.id,
      firstContactedAt: new Date(Date.now() - 86400000 * 5)
    }
  });

  const enq3 = await prisma.corporateEnquiry.create({
    data: {
      trackingId: "CSR-MH-2026-000103",
      corporateName: "Mahindra & Mahindra Ltd",
      contactEmail: "deshmukh.vikram@mahindra.com",
      mca21CIN: "L65990MH1945PLC004558",
      sector: "Water Conservation & Watershed",
      indicativeBudget: 45000000,
      preferredDistricts: ["Nashik", "Ahmednagar"],
      contactPersonName: "Vikram Deshmukh",
      mobile: "+91 98900 11223",
      proposedCSRWork: "Desiltation of 30 farm ponds and construction of check dams under Jalyukt Shivar convergence in Nashik.",
      status: "RM_ASSIGNED",
      assignedRelationshipManagerId: rmUser.id,
      submittedByUserId: companyUser?.id || null,
      organizationId: companyOrg.id,
      firstContactedAt: new Date(Date.now() - 86400000 * 1)
    }
  });

  const enq4 = await prisma.corporateEnquiry.create({
    data: {
      trackingId: "CSR-MH-2026-000104",
      corporateName: "Infosys Foundation",
      contactEmail: "meera_kulkarni@infosys.com",
      mca21CIN: "U85300KA1996NPL020500",
      sector: "Skill Development & Livelihood",
      indicativeBudget: 28000000,
      preferredDistricts: ["Chhatrapati Sambhajinagar"],
      contactPersonName: "Meera Kulkarni",
      mobile: "+91 98450 99887",
      proposedCSRWork: "Establishing a COE (Centre of Excellence) in Electric Vehicle Servicing & Repair at Government ITIs.",
      status: "COMPLETED",
      assignedRelationshipManagerId: rmUser.id,
      submittedByUserId: companyUser?.id || null,
      organizationId: companyOrg.id,
      firstContactedAt: new Date(Date.now() - 86400000 * 10)
    }
  });

  // 4. Seed Feasibility Assessments
  console.log("Seeding Feasibility Assessments...");
  const checklistForEnq2 = FEASIBILITY_CHECKLIST_SEED.map((item) => ({
    ...item,
    answer: "YES",
    note: "All parameters checked and verified. Direct fit with state goals."
  }));

  await prisma.feasibilityAssessment.create({
    data: {
      enquiryId: enq2.id,
      checklist: checklistForEnq2,
      recommendation: "FEASIBLE",
      executiveSummary: "Highly feasible proposal that directly resolves healthcare deficit in rural and tribal sectors of Nagpur division.",
      targetDistricts: ["Nagpur"],
      targetDepartmentId: govDept.id,
      status: "SUBMITTED_TO_JS",
      assessedByUserId: rmUser.id
    }
  });

  // 5. Seed Government Pitches
  console.log("Seeding Government Pitches...");
  await prisma.governmentPitch.create({
    data: {
      pitchReferenceId: "GP-MH-2026-000501",
      title: "Pune STEM Lab Construction",
      budget: 15000000,
      officialName: "Shri Santosh Patil",
      designation: "District Collector & Magistrate",
      department: "Revenue & District Administration",
      officeName: "District Collectorate Office Pune",
      serviceClass: "CLASS_1",
      mobile: "+91 94220 11111",
      email: "collector.pune@maharashtra.gov.in",
      districts: ["Pune"],
      exactLocation: "Khed-Shivapur ZP High School Cluster",
      csrRequirement: "Construction of a 200-seat digital library and STEM laboratory for rural students.",
      estimatedCost: 15000000,
      govtFundDeclaration: true,
      certificationType: "HOD",
      status: "RM_VERIFICATION_PENDING",
      assignedRelationshipManagerId: rmUser.id
    }
  });

  await prisma.governmentPitch.create({
    data: {
      pitchReferenceId: "GP-MH-2026-000502",
      title: "Advanced Ambulances Nashik",
      budget: 8500000,
      officialName: "Dr. Sunita Kadam",
      designation: "District Health Officer",
      department: "Public Health Department",
      officeName: "District Civil Hospital Nashik",
      serviceClass: "CLASS_1",
      mobile: "+91 94220 22222",
      email: "dho.nashik@maharashtra.gov.in",
      districts: ["Nashik"],
      exactLocation: "Rural Hospital Trimbakeshwar",
      csrRequirement: "Provision of 2 Advanced Life Support (ALS) Ambulances and Mobile Medical Van.",
      estimatedCost: 8500000,
      govtFundDeclaration: true,
      certificationType: "SELF",
      status: "PUBLIC_LISTED",
      assignedRelationshipManagerId: rmUser.id
    }
  });

  await prisma.governmentPitch.create({
    data: {
      pitchReferenceId: "GP-MH-2026-000503",
      title: "Solapur Watershed Rejuvenation",
      budget: 22000000,
      officialName: "Shri Rameshwar Pawar",
      designation: "Executive Engineer",
      department: "Water Resources & Irrigation",
      officeName: "Minor Irrigation Division Solapur",
      serviceClass: "CLASS_1",
      mobile: "+91 94220 33333",
      email: "ee.irrigation.solapur@maharashtra.gov.in",
      districts: ["Solapur"],
      exactLocation: "Kavhe Village Nalla Stream",
      csrRequirement: "Desiltation and rejuvenation of 12 cement nalla bunds to augment groundwater.",
      estimatedCost: 22000000,
      govtFundDeclaration: true,
      certificationType: "HOD",
      status: "MOU_PENDING",
      assignedRelationshipManagerId: rmUser.id
    }
  });

  // 6. Seed Application Interactions
  console.log("Seeding Application Interactions (Logs)...");
  await prisma.applicationInteraction.createMany({
    data: [
      {
        entityType: "CORPORATE_ENQUIRY",
        entityId: enq1.id,
        actorUserId: rmUser.id,
        channel: "CALL",
        note: "Initial telephonic discussion with TCS CSR lead Mr. Rajesh Sharma regarding project scope in Pune ZP schools."
      },
      {
        entityType: "CORPORATE_ENQUIRY",
        entityId: enq1.id,
        actorUserId: rmUser.id,
        channel: "MEETING",
        note: "Joint field visit conducted with District Education Officer (DEO Pune) to evaluate 15 proposed school sites."
      },
      {
        entityType: "CORPORATE_ENQUIRY",
        entityId: enq2.id,
        actorUserId: rmUser.id,
        channel: "CALL",
        note: "Reviewed PHC list provided by Public Health Department. Confirmed non-duplication of funds."
      },
      {
        entityType: "CORPORATE_ENQUIRY",
        entityId: enq2.id,
        actorUserId: rmUser.id,
        channel: "PORTAL",
        note: "Assessment submitted to Joint Secretary. High feasibility score (94/100)."
      }
    ]
  });

  console.log("✓ Seeding of rich convergence data completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding convergence data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
