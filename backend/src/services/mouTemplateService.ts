/**
 * MoU (Memorandum of Understanding) Template Service
 * 
 * Maharashtra CSR Portal - Convergence Framework
 * 
 * This service generates MoU documents based on the StandardMou model.
 * The MoU follows the standard template required for CSR convergence projects
 * in Maharashtra, including all mandatory sections and clauses.
 * 
 * Key Sections:
 * 1. Government Party (District Administration)
 * 2. Corporate Partner
 * 3. Implementing Agency (if applicable)
 * 4. Purpose and Objectives
 * 5. Project Location
 * 6. Deliverables and Milestones
 * 7. Timeline
 * 8. Financial Contributions
 * 9. Monitoring and Reporting
 * 10. Utilization Certificate
 * 11. Asset Ownership
 * 12. Grievance Mechanism
 * 13. Recognition and Publicity
 * 14. Termination Conditions
 * 15. Dispute Resolution
 */

import prisma from "../config/db";
import { StandardMou } from "@prisma/client";

/**
 * Interface for MoU generation input
 * Combines StandardMou model fields with additional metadata
 */
export interface MoUGenerationInput {
  // References
  corporateEnquiryId?: string;
  governmentPitchId?: string;
  
  // Government Party
  districtDepartmentName: string;
  nodalOfficerName: string;
  nodalOfficerDesignation?: string;
  nodalOfficerDepartment?: string;
  nodalOfficerEmail?: string;
  nodalOfficerPhone?: string;
  
  // Corporate Partner
  corporateName: string;
  cin: string;
  corporateAddress?: string;
  corporateAuthorizedSignatory?: string;
  corporateAuthorizedSignatoryDesignation?: string;
  
  // Implementing Agency (optional)
  implementingAgencyName?: string;
  implementingAgencyType?: "NGO" | "GOVERNMENT" | "CORPORATE_FOUNDATION" | "SELF";
  implementingAgencyRegistrationNo?: string;
  implementingAgencyAuthorizedPerson?: string;
  
  // Project Details
  projectTitle: string;
  projectDescription: string;
  scheduleVIIClause: string;
  projectLocation: string;
  district: string;
  taluka?: string;
  village?: string;
  
  // Deliverables as structured data
  deliverables: DeliverableItem[];
  
  // Timeline
  timelineMonths: number;
  startDate?: Date;
  completionDate?: Date;
  
  // Financial
  financialContribution: number;
  governmentContribution?: number;
  paymentSchedule?: PaymentScheduleItem[];
  
  // Implementation
  implementationMode: "SELF" | "OWN_FOUNDATION" | "NGO_PARTNER" | "GOVERNMENT_IMPLEMENTED";
  
  // Post-Completion
  ownershipAfterCompletion: string;
  maintenanceResponsibility: string;
  maintenancePeriodMonths?: number;
  
  // Additional Terms
  forceMajeureClause?: string;
  confidentialityClause?: boolean;
  amendmentProcedure?: string;
}

/**
 * Interface for deliverable items
 */
export interface DeliverableItem {
  milestoneNo: number;
  description: string;
  completionCriteria: string;
  timeline: string;
  percentageOfFunds: number;
  amount: number;
}

/**
 * Interface for payment schedule
 */
export interface PaymentScheduleItem {
  installmentNo: number;
  milestoneDescription: string;
  percentage: number;
  amount: number;
  conditions: string;
}

/**
 * Interface for generated MoU result
 */
export interface GeneratedMoU {
  html: string;
  text: string;
  placeholders: {
    mouReferenceId: string;
    dateOfAgreement: string;
    [key: string]: string;
  };
  requiredSignatures: {
    government: {
      name: string;
      designation: string;
      department: string;
    };
    corporate: {
      name: string;
      company: string;
      designation: string;
    };
    implementingAgency?: {
      name: string;
      organization: string;
      designation: string;
    };
  };
}

/**
 * Format currency in Indian format
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number in Indian format (e.g., 1,00,000)
 */
function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Convert number to words
 */
function numberToWords(num: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convertLessThanOneThousand(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convertLessThanOneThousand(n % 100) : "");
  }

  if (num === 0) return "Zero";

  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  let result = "";
  if (crores) result += convertLessThanOneThousand(crores) + " Crore ";
  if (lakhs) result += convertLessThanOneThousand(lakhs) + " Lakh ";
  if (thousands) result += convertLessThanOneThousand(thousands) + " Thousand ";
  if (remainder) result += convertLessThanOneThousand(remainder);

  return result.trim() + " Rupees Only";
}

/**
 * Generate Schedule VII reference text
 */
function getScheduleVIIText(clause: string): string {
  const scheduleVIIItems: Record<string, string> = {
    "1": "Eradicating hunger, poverty and malnutrition",
    "2": "Promoting health care including preventive health care and sanitation",
    "3": "Promoting education, including special education and employment enhancing vocation skills",
    "4": "Promoting gender equality and empowering women",
    "5": "Ensuring environmental sustainability and ecological balance",
    "6": "Protection of national heritage, art and culture",
    "7": "Measures for the benefit of armed forces veterans, war widows and their dependents",
    "8": "Training to promote rural sports, nationally recognized sports, paralympic sports and Olympic sports",
    "9": "Contribution to the Prime Minister's National Relief Fund or any other fund set up by the Central Government",
    "10": "Rural development projects",
    "11": "Slum area development",
    "12": "Disaster management, including relief, rehabilitation and reconstruction",
  };

  return scheduleVIIItems[clause] || "Schedule VII activities";
}

/**
 * Generate MoU HTML document
 * 
 * @param input - The MoU generation input
 * @param mouReferenceId - Optional reference ID for existing MoU
 * @returns The generated MoU HTML and metadata
 */
export async function generateMoU(
  input: MoUGenerationInput,
  mouReferenceId?: string
): Promise<GeneratedMoU> {
  try {
    // Generate reference ID if not provided
    const referenceId = mouReferenceId || `MOU-MH-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(6, "0")}`;
    const dateOfAgreement = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const totalContribution = input.financialContribution + (input.governmentContribution || 0);

    // Generate HTML content
    const html = generateMoUHtml(input, referenceId, dateOfAgreement, totalContribution);

    // Generate plain text version
    const text = generateMoUText(input, referenceId, dateOfAgreement, totalContribution);

    return {
      html,
      text,
      placeholders: {
        mouReferenceId: referenceId,
        dateOfAgreement,
        governmentDepartment: input.districtDepartmentName,
        corporateName: input.corporateName,
        projectTitle: input.projectTitle,
        totalAmount: formatCurrency(totalContribution),
        totalAmountWords: numberToWords(totalContribution),
      },
      requiredSignatures: {
        government: {
          name: input.nodalOfficerName,
          designation: input.nodalOfficerDesignation || "Nodal Officer",
          department: input.nodalOfficerDepartment || input.districtDepartmentName,
        },
        corporate: {
          name: input.corporateAuthorizedSignatory || "Authorized Signatory",
          company: input.corporateName,
          designation: input.corporateAuthorizedSignatoryDesignation || "CSR Head",
        },
        ...(input.implementingAgencyName && input.implementingAgencyAuthorizedPerson
          ? {
              implementingAgency: {
                name: input.implementingAgencyAuthorizedPerson,
                organization: input.implementingAgencyName,
                designation: "Authorized Representative",
              },
            }
          : {}),
      },
    };
  } catch (error) {
    console.error("Error generating MoU:", error);
    throw new Error("Failed to generate MoU document");
  }
}

/**
 * Generate MoU HTML content
 */
function generateMoUHtml(
  input: MoUGenerationInput,
  referenceId: string,
  dateOfAgreement: string,
  totalContribution: number
): string {
  const corporateContributionWords = numberToWords(input.financialContribution);
  const governmentContributionWords = input.governmentContribution
    ? numberToWords(input.governmentContribution)
    : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memorandum of Understanding - ${input.projectTitle}</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 16pt;
      text-transform: uppercase;
      margin: 0;
    }
    .header h2 {
      font-size: 14pt;
      margin: 10px 0;
    }
    .reference {
      text-align: right;
      margin: 20px 0;
      font-size: 11pt;
    }
    .section {
      margin: 25px 0;
    }
    .section-title {
      font-weight: bold;
      font-size: 13pt;
      margin-bottom: 10px;
      text-decoration: underline;
    }
    .party-block {
      margin: 15px 0;
      padding: 10px;
      border: 1px solid #ccc;
    }
    .party-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      border: 1px solid #000;
      padding: 8px;
      text-align: left;
      font-size: 11pt;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    .signatures {
      margin-top: 50px;
      page-break-inside: avoid;
    }
    .signature-block {
      display: inline-block;
      width: 45%;
      margin: 20px 2%;
      vertical-align: top;
    }
    .signature-line {
      border-top: 1px solid #000;
      margin-top: 60px;
      padding-top: 5px;
    }
    .clause {
      margin: 10px 0;
      text-align: justify;
    }
    .clause-number {
      font-weight: bold;
    }
    .schedule-section {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #000;
    }
    .schedule-title {
      font-weight: bold;
      text-align: center;
      margin-bottom: 15px;
      font-size: 13pt;
    }
    .footer {
      margin-top: 40px;
      font-size: 10pt;
      text-align: center;
      border-top: 1px solid #ccc;
      padding-top: 10px;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 60pt;
      color: rgba(200, 200, 200, 0.3);
      z-index: -1;
      pointer-events: none;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="watermark">DRAFT</div>
  
  <div class="header">
    <h1>Government of Maharashtra</h1>
    <h2>Memorandum of Understanding (MoU)</h2>
    <p>For Corporate Social Responsibility (CSR) Convergence Project</p>
  </div>

  <div class="reference">
    <strong>MoU Reference:</strong> ${referenceId}<br>
    <strong>Date:</strong> ${dateOfAgreement}<br>
    <strong>Location:</strong> ${input.district}, Maharashtra
  </div>

  <div class="section">
    <div class="section-title">ANNEXURE B STANDARD CLAUSE INDEX</div>
    <ol>
      <li>Government Party</li>
      <li>Corporate Partner</li>
      <li>Implementing Agency if applicable</li>
      <li>Purpose and Scope</li>
      <li>Project Location</li>
      <li>Deliverables and Timeline</li>
      <li>Financial Contribution</li>
      <li>Government Party Contribution</li>
      <li>Implementation</li>
      <li>Monitoring</li>
      <li>Utilisation Certificate</li>
      <li>Ownership and Maintenance</li>
      <li>Changes to Deliverables</li>
      <li>Grievances</li>
      <li>Recognition</li>
      <li>Term and Termination</li>
      <li>Dispute Resolution</li>
      <li>General</li>
      <li>Signature blocks</li>
    </ol>
  </div>

  <!-- SECTION 1: PARTIES -->
  <div class="section">
    <div class="section-title">1. PARTIES TO THIS MEMORANDUM</div>
    
    <div class="party-block">
      <div class="party-title">FIRST PARTY (GOVERNMENT)</div>
      <p><strong>${input.districtDepartmentName}</strong></p>
      <p>Represented by:</p>
      <p>
        <strong>Name:</strong> ${input.nodalOfficerName}<br>
        <strong>Designation:</strong> ${input.nodalOfficerDesignation || "Nodal Officer"}<br>
        <strong>Department:</strong> ${input.nodalOfficerDepartment || input.districtDepartmentName}<br>
        ${input.nodalOfficerEmail ? `<strong>Email:</strong> ${input.nodalOfficerEmail}<br>` : ""}
        ${input.nodalOfficerPhone ? `<strong>Phone:</strong> ${input.nodalOfficerPhone}` : ""}
      </p>
      <p>(Hereinafter referred to as "Government Party" or "District Administration")</p>
    </div>

    <div class="party-block">
      <div class="party-title">SECOND PARTY (CORPORATE PARTNER)</div>
      <p><strong>${input.corporateName}</strong></p>
      <p>CIN: ${input.cin}</p>
      <p>Represented by:</p>
      <p>
        <strong>Name:</strong> ${input.corporateAuthorizedSignatory || "Authorized Signatory"}<br>
        <strong>Designation:</strong> ${input.corporateAuthorizedSignatoryDesignation || "CSR Head"}
      </p>
      ${input.corporateAddress ? `<p><strong>Address:</strong> ${input.corporateAddress}</p>` : ""}
      <p>(Hereinafter referred to as "Corporate Partner")</p>
    </div>

    ${input.implementingAgencyName ? `
    <div class="party-block">
      <div class="party-title">THIRD PARTY (IMPLEMENTING AGENCY)</div>
      <p><strong>${input.implementingAgencyName}</strong></p>
      ${input.implementingAgencyRegistrationNo ? `<p>Registration No: ${input.implementingAgencyRegistrationNo}</p>` : ""}
      <p>Represented by:</p>
      <p>
        <strong>Name:</strong> ${input.implementingAgencyAuthorizedPerson}<br>
        <strong>Type:</strong> ${input.implementingAgencyType}
      </p>
      <p>(Hereinafter referred to as "Implementing Agency")</p>
    </div>
    ` : ""}
  </div>

  <!-- SECTION 2: PURPOSE -->
  <div class="section">
    <div class="section-title">2. PURPOSE AND OBJECTIVES</div>
    <div class="clause">
      <span class="clause-number">2.1</span> The purpose of this MoU is to formalize the collaboration between the Government Party and the Corporate Partner for the implementation of a CSR project under Schedule VII of the Companies Act, 2013.
    </div>
    <div class="clause">
      <span class="clause-number">2.2</span> <strong>Project Title:</strong> ${input.projectTitle}
    </div>
    <div class="clause">
      <span class="clause-number">2.3</span> <strong>Schedule VII Clause:</strong> ${input.scheduleVIIClause} - ${getScheduleVIIText(input.scheduleVIIClause)}
    </div>
    <div class="clause">
      <span class="clause-number">2.4</span> <strong>Project Description:</strong><br>
      ${input.projectDescription}
    </div>
    <div class="clause">
      <span class="clause-number">2.5</span> <strong>Expected Outcomes:</strong> The project aims to benefit the community through sustainable development activities as described in the project proposal.
    </div>
  </div>

  <!-- SECTION 3: LOCATION -->
  <div class="section">
    <div class="section-title">3. PROJECT LOCATION</div>
    <div class="clause">
      The project shall be implemented at the following location(s):
    </div>
    <table>
      <tr>
        <th>Location Detail</th>
        <th>Description</th>
      </tr>
      <tr>
        <td>District</td>
        <td>${input.district}</td>
      </tr>
      <tr>
        <td>Taluka</td>
        <td>${input.taluka || "N/A"}</td>
      </tr>
      <tr>
        <td>Village/Area</td>
        <td>${input.village || input.projectLocation}</td>
      </tr>
      <tr>
        <td>Exact Location</td>
        <td>${input.projectLocation}</td>
      </tr>
    </table>
  </div>

  <!-- SECTION 4: DELIVERABLES -->
  <div class="section">
    <div class="section-title">4. DELIVERABLES AND MILESTONES</div>
    <div class="clause">
      The Corporate Partner agrees to undertake the following activities:
    </div>
    <table>
      <tr>
        <th>Milestone</th>
        <th>Description</th>
        <th>Timeline</th>
        <th>Amount</th>
      </tr>
      ${input.deliverables
        .map(
          (d) => `
      <tr>
        <td>${d.milestoneNo}</td>
        <td>${d.description}</td>
        <td>${d.timeline}</td>
        <td>${formatCurrency(d.amount)} (${d.percentageOfFunds}%)</td>
      </tr>`
        )
        .join("")}
    </table>
  </div>

  <!-- SECTION 5: TIMELINE -->
  <div class="section">
    <div class="section-title">5. PROJECT TIMELINE</div>
    <div class="clause">
      <span class="clause-number">5.1</span> <strong>Total Duration:</strong> ${input.timelineMonths} months
    </div>
    <div class="clause">
      <span class="clause-number">5.2</span> <strong>Start Date:</strong> ${input.startDate ? input.startDate.toLocaleDateString("en-IN") : "To be determined upon MoU signing"}
    </div>
    <div class="clause">
      <span class="clause-number">5.3</span> <strong>Completion Date:</strong> ${input.completionDate ? input.completionDate.toLocaleDateString("en-IN") : `To be completed within ${input.timelineMonths} months from start date`}
    </div>
    <div class="clause">
      <span class="clause-number">5.4</span> Extensions may be granted with mutual written consent, provided valid reasons are submitted at least 30 days before the completion date.
    </div>
  </div>

  <!-- SECTION 6: FINANCIAL -->
  <div class="section">
    <div class="section-title">6. FINANCIAL CONTRIBUTIONS</div>
    <div class="clause">
      <span class="clause-number">6.1</span> <strong>Total Project Cost:</strong> ${formatCurrency(totalContribution)} (${numberToWords(totalContribution)})
    </div>
    <div class="clause">
      <span class="clause-number">6.2</span> <strong>Corporate Contribution:</strong> ${formatCurrency(input.financialContribution)} (${corporateContributionWords})
    </div>
    ${input.governmentContribution ? `
    <div class="clause">
      <span class="clause-number">6.3</span> <strong>Government Contribution:</strong> ${formatCurrency(input.governmentContribution)} (${governmentContributionWords})
    </div>
    ` : ""}
    <div class="clause">
      <span class="clause-number">6.${input.governmentContribution ? "4" : "3"}</span> <strong>Payment Schedule:</strong>
    </div>
    <table>
      <tr>
        <th>Installment</th>
        <th>Milestone</th>
        <th>Percentage</th>
        <th>Amount</th>
        <th>Conditions</th>
      </tr>
      ${(input.paymentSchedule || [])
        .map(
          (p) => `
      <tr>
        <td>${p.installmentNo}</td>
        <td>${p.milestoneDescription}</td>
        <td>${p.percentage}%</td>
        <td>${formatCurrency(p.amount)}</td>
        <td>${p.conditions}</td>
      </tr>`
        )
        .join("")}
    </table>
    <div class="clause">
      <span class="clause-number">6.${input.governmentContribution ? "5" : "4"}</span> Funds shall be released directly to the ${input.implementingAgencyName || "Implementing Agency"} as per the agreed payment schedule upon satisfactory completion of milestones.
    </div>
  </div>

  <!-- SECTION 7: IMPLEMENTATION -->
  <div class="section">
    <div class="section-title">7. IMPLEMENTATION ARRANGEMENTS</div>
    <div class="clause">
      <span class="clause-number">7.1</span> <strong>Implementation Mode:</strong> ${input.implementationMode.replace("_", " ")}
    </div>
    <div class="clause">
      <span class="clause-number">7.2</span> The ${input.implementingAgencyName || "Implementing Agency"} shall be responsible for the day-to-day execution of the project.
    </div>
    <div class="clause">
      <span class="clause-number">7.3</span> The Nodal Officer shall provide necessary coordination support and facilitate permissions required for project implementation.
    </div>
    <div class="clause">
      <span class="clause-number">7.4</span> All activities shall comply with applicable laws, regulations, and government guidelines.
    </div>
  </div>

  <!-- SECTION 8: MONITORING -->
  <div class="section">
    <div class="section-title">8. MONITORING AND REPORTING</div>
    <div class="clause">
      <span class="clause-number">8.1</span> Monthly progress reports shall be submitted by the Implementing Agency to the Corporate Partner and Government Party.
    </div>
    <div class="clause">
      <span class="clause-number">8.2</span> Physical inspections may be conducted by representatives of the Government Party or Corporate Partner with prior notice.
    </div>
    <div class="clause">
      <span class="clause-number">8.3</span> Geo-tagged photographs shall be provided as evidence of progress at each milestone.
    </div>
    <div class="clause">
      <span class="clause-number">8.4</span> A Joint Monitoring Committee shall be constituted comprising representatives from both parties.
    </div>
  </div>

  <!-- SECTION 9: UTILIZATION CERTIFICATE -->
  <div class="section">
    <div class="section-title">9. UTILIZATION CERTIFICATE (UC)</div>
    <div class="clause">
      <span class="clause-number">9.1</span> Utilization Certificates shall be submitted in the prescribed format after utilization of funds for each milestone.
    </div>
    <div class="clause">
      <span class="clause-number">9.2</span> UC submission is mandatory before release of subsequent installments.
    </div>
    <div class="clause">
      <span class="clause-number">9.3</span> The UC shall be certified by the Nodal Officer and accompanied by relevant supporting documents.
    </div>
    <div class="clause">
      <span class="clause-number">9.4</span> Unutilized funds, if any, shall be refunded to the Corporate Partner within 30 days of project completion.
    </div>
  </div>

  <!-- SECTION 10: OWNERSHIP -->
  <div class="section">
    <div class="section-title">10. ASSET OWNERSHIP AND MAINTENANCE</div>
    <div class="clause">
      <span class="clause-number">10.1</span> <strong>Ownership After Completion:</strong> ${input.ownershipAfterCompletion}
    </div>
    <div class="clause">
      <span class="clause-number">10.2</span> <strong>Maintenance Responsibility:</strong> ${input.maintenanceResponsibility}
    </div>
    <div class="clause">
      <span class="clause-number">10.3</span> ${input.maintenancePeriodMonths ? `The maintenance period shall be ${input.maintenancePeriodMonths} months from the date of completion.` : "The maintenance responsibility shall be defined in the project completion report."}
    </div>
    <div class="clause">
      <span class="clause-number">10.4</span> Assets created under this MoU shall not be disposed of or repurposed without mutual consent.
    </div>
  </div>

  <!-- SECTION 11: GRIEVANCE -->
  <div class="section">
    <div class="section-title">11. GRIEVANCE MECHANISM</div>
    <div class="clause">
      <span class="clause-number">11.1</span> Any grievance or dispute arising during project implementation shall be raised with the Nodal Officer in writing.
    </div>
    <div class="clause">
      <span class="clause-number">11.2</span> The District Nodal Officer shall respond within 15 days of receiving the grievance.
    </div>
    <div class="clause">
      <span class="clause-number">11.3</span> Unresolved grievances may be escalated to the State CSR Cell for resolution within 30 days.
    </div>
    <div class="clause">
      <span class="clause-number">11.4</span> A Grievance Redressal Committee may be constituted if required.
    </div>
  </div>

  <!-- SECTION 12: RECOGNITION -->
  <div class="section">
    <div class="section-title">12. RECOGNITION AND PUBLICITY</div>
    <div class="clause">
      <span class="clause-number">12.1</span> The Corporate Partner shall be duly acknowledged in all project-related communications and publicity materials.
    </div>
    <div class="clause">
      <span class="clause-number">12.2</span> The Government Party may issue appreciation certificates upon successful completion of the project.
    </div>
    <div class="clause">
      <span class="clause-number">12.3</span> Branding guidelines shall be mutually agreed upon before project commencement.
    </div>
  </div>

  <!-- SECTION 13: TERMINATION -->
  <div class="section">
    <div class="section-title">13. TERMINATION</div>
    <div class="clause">
      <span class="clause-number">13.1</span> This MoU may be terminated by mutual agreement, or by either party with 30 days written notice for valid cause.
    </div>
    <div class="clause">
      <span class="clause-number">13.2</span> Either party may terminate immediately for breach of terms after providing 15 days to cure the breach.
    </div>
    <div class="clause">
      <span class="clause-number">13.3</span> Upon termination, accounts shall be settled within 30 days and a completion report submitted.
    </div>
    <div class="clause">
      <span class="clause-number">13.4</span> Termination shall not affect rights and obligations accrued prior to termination.
    </div>
  </div>

  <!-- SECTION 14: DISPUTE -->
  <div class="section">
    <div class="section-title">14. DISPUTE RESOLUTION</div>
    <div class="clause">
      <span class="clause-number">14.1</span> Any dispute arising out of this MoU shall first be resolved amicably through the State CSR Cell.
    </div>
    <div class="clause">
      <span class="clause-number">14.2</span> If unresolved, the matter shall be referred to a committee comprising senior officials from both parties.
    </div>
    <div class="clause">
      <span class="clause-number">14.3</span> Unresolved disputes shall be subject to arbitration under the Arbitration and Conciliation Act, 1996.
    </div>
    <div class="clause">
      <span class="clause-number">14.4</span> The courts at ${input.district} shall have exclusive jurisdiction over disputes.
    </div>
  </div>

  <!-- SECTION 15: GENERAL -->
  <div class="section">
    <div class="section-title">15. GENERAL PROVISIONS</div>
    <div class="clause">
      <span class="clause-number">15.1</span> <strong>Force Majeure:</strong> Neither party shall be liable for delays caused by circumstances beyond their reasonable control.
    </div>
    <div class="clause">
      <span class="clause-number">15.2</span> <strong>Confidentiality:</strong> Both parties shall maintain confidentiality of sensitive information exchanged.
    </div>
    <div class="clause">
      <span class="clause-number">15.3</span> <strong>Amendment:</strong> This MoU may be amended only by written agreement signed by both parties.
    </div>
    <div class="clause">
      <span class="clause-number">15.4</span> <strong>Entire Agreement:</strong> This MoU constitutes the entire agreement between the parties.
    </div>
  </div>

  <!-- SIGNATURES -->
  <div class="signatures">
    <div class="section-title">IN WITNESS WHEREOF</div>
    <p>The parties have executed this Memorandum of Understanding on the date first written above.</p>
    
    <div class="signature-block">
      <p><strong>FOR GOVERNMENT PARTY</strong></p>
      <div class="signature-line">
        <strong>${input.nodalOfficerName}</strong><br>
        ${input.nodalOfficerDesignation || "Nodal Officer"}<br>
        ${input.districtDepartmentName}
      </div>
    </div>

    <div class="signature-block">
      <p><strong>FOR CORPORATE PARTNER</strong></p>
      <div class="signature-line">
        <strong>${input.corporateAuthorizedSignatory || "Authorized Signatory"}</strong><br>
        ${input.corporateAuthorizedSignatoryDesignation || "CSR Head"}<br>
        ${input.corporateName}
      </div>
    </div>

    ${input.implementingAgencyName ? `
    <div class="signature-block">
      <p><strong>FOR IMPLEMENTING AGENCY</strong></p>
      <div class="signature-line">
        <strong>${input.implementingAgencyAuthorizedPerson || "Authorized Person"}</strong><br>
        ${input.implementingAgencyType}<br>
        ${input.implementingAgencyName}
      </div>
    </div>
    ` : ""}
  </div>

  <!-- WITNESSES -->
  <div class="section" style="margin-top: 40px;">
    <div class="section-title">WITNESSES</div>
    <div class="signature-block" style="width: 100%; margin: 20px 0;">
      <div class="signature-line" style="width: 45%; display: inline-block; margin-right: 5%;">
        <strong>Witness 1</strong><br>
        Name:<br>
        Designation:<br>
        Signature:
      </div>
      <div class="signature-line" style="width: 45%; display: inline-block;">
        <strong>Witness 2</strong><br>
        Name:<br>
        Designation:<br>
        Signature:
      </div>
    </div>
  </div>

  <!-- SCHEDULES -->
  <div class="schedule-section" style="page-break-before: always;">
    <div class="schedule-title">SCHEDULE A - PROJECT DETAILS</div>
    <p><strong>Project Title:</strong> ${input.projectTitle}</p>
    <p><strong>Schedule VII Clause:</strong> ${input.scheduleVIIClause} - ${getScheduleVIIText(input.scheduleVIIClause)}</p>
    <p><strong>Implementation Mode:</strong> ${input.implementationMode}</p>
    <p><strong>Total Project Cost:</strong> ${formatCurrency(totalContribution)}</p>
  </div>

  <div class="schedule-section">
    <div class="schedule-title">SCHEDULE B - CONTACT INFORMATION</div>
    <table>
      <tr>
        <th>Party</th>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
      </tr>
      <tr>
        <td>Government Nodal Officer</td>
        <td>${input.nodalOfficerName}</td>
        <td>${input.nodalOfficerEmail || "N/A"}</td>
        <td>${input.nodalOfficerPhone || "N/A"}</td>
      </tr>
      <tr>
        <td>Corporate Contact</td>
        <td>${input.corporateAuthorizedSignatory || "TBD"}</td>
        <td>TBD</td>
        <td>TBD</td>
      </tr>
      ${input.implementingAgencyName ? `
      <tr>
        <td>Implementing Agency</td>
        <td>${input.implementingAgencyAuthorizedPerson}</td>
        <td>TBD</td>
        <td>TBD</td>
      </tr>
      ` : ""}
    </table>
  </div>

  <div class="footer">
    <p>This is a computer-generated document. For verification, contact the Maharashtra CSR Portal.</p>
    <p>MoU Reference: ${referenceId}</p>
  </div>

</body>
</html>
`;
}

/**
 * Generate plain text version of MoU (for PDF conversion or email)
 */
function generateMoUText(
  input: MoUGenerationInput,
  referenceId: string,
  dateOfAgreement: string,
  totalContribution: number
): string {
  return `
GOVERNMENT OF MAHARASHTRA
MEMORANDUM OF UNDERSTANDING (MoU)
For Corporate Social Responsibility (CSR) Convergence Project

MoU Reference: ${referenceId}
Date: ${dateOfAgreement}
Location: ${input.district}, Maharashtra

================================================================================
1. PARTIES TO THIS MEMORANDUM
================================================================================

FIRST PARTY (GOVERNMENT):
${input.districtDepartmentName}
Represented by: ${input.nodalOfficerName}, ${input.nodalOfficerDesignation || "Nodal Officer"}
Department: ${input.nodalOfficerDepartment || input.districtDepartmentName}
(Hereinafter referred to as "Government Party")

SECOND PARTY (CORPORATE PARTNER):
${input.corporateName}
CIN: ${input.cin}
Represented by: ${input.corporateAuthorizedSignatory || "Authorized Signatory"}
(Hereinafter referred to as "Corporate Partner")

${input.implementingAgencyName ? `
THIRD PARTY (IMPLEMENTING AGENCY):
${input.implementingAgencyName}
Represented by: ${input.implementingAgencyAuthorizedPerson}
(Hereinafter referred to as "Implementing Agency")
` : ""}

================================================================================
2. PURPOSE AND OBJECTIVES
================================================================================

Project Title: ${input.projectTitle}
Schedule VII Clause: ${input.scheduleVIIClause} - ${getScheduleVIIText(input.scheduleVIIClause)}

Project Description:
${input.projectDescription}

================================================================================
3. PROJECT LOCATION
================================================================================

District: ${input.district}
Taluka: ${input.taluka || "N/A"}
Village/Area: ${input.village || input.projectLocation}

================================================================================
4. FINANCIAL CONTRIBUTIONS
================================================================================

Total Project Cost: ${formatCurrency(totalContribution)}
Corporate Contribution: ${formatCurrency(input.financialContribution)}
${input.governmentContribution ? `Government Contribution: ${formatCurrency(input.governmentContribution)}` : ""}

Payment Schedule:
${(input.paymentSchedule || [])
  .map(
    (p) => `
Installment ${p.installmentNo}: ${p.milestoneDescription}
Amount: ${formatCurrency(p.amount)} (${p.percentage}%)
Conditions: ${p.conditions}
`
  )
  .join("\n")}

================================================================================
5. PROJECT TIMELINE
================================================================================

Total Duration: ${input.timelineMonths} months
${input.startDate ? `Start Date: ${input.startDate.toLocaleDateString("en-IN")}` : ""}
${input.completionDate ? `Completion Date: ${input.completionDate.toLocaleDateString("en-IN")}` : ""}

================================================================================
6. IMPLEMENTATION ARRANGEMENTS
================================================================================

Implementation Mode: ${input.implementationMode}
Ownership After Completion: ${input.ownershipAfterCompletion}
Maintenance Responsibility: ${input.maintenanceResponsibility}

================================================================================
7. MONITORING AND REPORTING
================================================================================

- Monthly progress reports to be submitted
- Physical inspections as required
- Geo-tagged photographs at milestones
- Joint Monitoring Committee to be constituted

================================================================================
8. UTILIZATION CERTIFICATE
================================================================================

- UC submission mandatory before next installment
- Certified by Nodal Officer
- Unutilized funds to be refunded within 30 days

================================================================================
9. GRIEVANCE MECHANISM
================================================================================

- Grievances to be raised with Nodal Officer in writing
- District Nodal Officer response within 15 days
- Escalation to State CSR Cell for resolution within 30 days if unresolved

================================================================================
10. TERMINATION
================================================================================

- 30 days written notice required for valid cause
- Immediate termination possible for material breach
- Accounts settlement within 30 days of termination

================================================================================
11. DISPUTE RESOLUTION
================================================================================

- Amicable resolution through the State CSR Cell first
- Senior government review if unresolved
- Courts at ${input.district} have jurisdiction

================================================================================
SIGNED BY THE PARTIES
================================================================================

FOR GOVERNMENT PARTY:
Name: ${input.nodalOfficerName}
Designation: ${input.nodalOfficerDesignation || "Nodal Officer"}
Department: ${input.districtDepartmentName}
Date: _______________
Signature: _______________

FOR CORPORATE PARTNER:
Name: ${input.corporateAuthorizedSignatory || "Authorized Signatory"}
Designation: ${input.corporateAuthorizedSignatoryDesignation || "CSR Head"}
Company: ${input.corporateName}
Date: _______________
Signature: _______________

${input.implementingAgencyName ? `
FOR IMPLEMENTING AGENCY:
Name: ${input.implementingAgencyAuthorizedPerson}
Organization: ${input.implementingAgencyName}
Date: _______________
Signature: _______________
` : ""}

--- END OF MEMORANDUM OF UNDERSTANDING ---
`;
}

/**
 * Save MoU to database
 * 
 * @param input - The MoU input data
 * @param generatedMoU - The generated MoU content
 * @returns The saved MoU record
 */
export async function saveMoU(
  input: MoUGenerationInput,
  generatedMoU: GeneratedMoU
): Promise<StandardMou> {
  try {
    const mouData: any = {
      mouReferenceId: generatedMoU.placeholders.mouReferenceId,
      districtDepartmentName: input.districtDepartmentName,
      nodalOfficerName: input.nodalOfficerName,
      corporateName: input.corporateName,
      cin: input.cin,
      projectTitle: input.projectTitle,
      projectDescription: input.projectDescription,
      scheduleVIIClause: input.scheduleVIIClause,
      projectLocation: input.projectLocation,
      deliverables: input.deliverables as any,
      timelineMonths: input.timelineMonths,
      financialContribution: input.financialContribution,
      governmentContribution: input.governmentContribution,
      implementationMode: input.implementationMode,
      implementingAgencyName: input.implementingAgencyName,
      ownershipAfterCompletion: input.ownershipAfterCompletion,
      maintenanceResponsibility: input.maintenanceResponsibility,
      status: "DRAFT",
    };

    if (input.corporateEnquiryId) {
      mouData.corporateEnquiryId = input.corporateEnquiryId;
    }

    if (input.governmentPitchId) {
      mouData.governmentPitchId = input.governmentPitchId;
    }

    const mou = await prisma.standardMou.create({
      data: mouData,
    });

    return mou;
  } catch (error) {
    console.error("Error saving MoU:", error);
    throw new Error("Failed to save MoU to database");
  }
}

/**
 * Generate MoU from existing StandardMou record
 * 
 * @param mouId - The ID of the StandardMou record
 * @returns The generated MoU
 */
export async function generateMoUFromRecord(mouId: string): Promise<GeneratedMoU> {
  try {
    const mou = await prisma.standardMou.findUnique({
      where: { id: mouId },
      include: {
        project: true,
      },
    });

    if (!mou) {
      throw new Error("MoU record not found");
    }

    // Convert Prisma Decimal to number for calculations
    const financialContribution = Number(mou.financialContribution);
    const governmentContribution = mou.governmentContribution
      ? Number(mou.governmentContribution)
      : undefined;

    // Build input from record
    // Note: Some fields are populated from related records or use defaults
    const deliverables = Array.isArray(mou.deliverables) 
      ? (mou.deliverables as unknown as DeliverableItem[]) 
      : [];
    
    const input: MoUGenerationInput = {
      districtDepartmentName: mou.districtDepartmentName || "",
      nodalOfficerName: mou.nodalOfficerName || "",
      corporateName: mou.corporateName || "",
      cin: mou.cin || "",
      projectTitle: mou.projectTitle || "",
      projectDescription: mou.projectDescription || "",
      scheduleVIIClause: mou.scheduleVIIClause || "",
      projectLocation: mou.projectLocation || "",
      district: mou.districtDepartmentName || "",
      deliverables,
      timelineMonths: mou.timelineMonths || 12,
      financialContribution,
      governmentContribution,
      implementationMode: (mou.implementationMode as any) || "DIRECT",
      ownershipAfterCompletion: mou.ownershipAfterCompletion || "",
      maintenanceResponsibility: mou.maintenanceResponsibility || "",
      implementingAgencyName: mou.implementingAgencyName || undefined,
      corporateEnquiryId: mou.corporateEnquiryId || undefined,
      governmentPitchId: mou.governmentPitchId || undefined,
      paymentSchedule: [],
    };

    return generateMoU(input, mou.mouReferenceId);
  } catch (error) {
    console.error("Error generating MoU from record:", error);
    throw new Error("Failed to generate MoU from existing record");
  }
}

/**
 * Generate MoU preview HTML (for UI display)
 * 
 * @param input - The MoU input data
 * @returns HTML string for preview
 */
export async function generateMoUPreview(input: MoUGenerationInput): Promise<string> {
  const generated = await generateMoU(input);
  return generated.html;
}

/**
 * Service class for MoU Template operations
 * Provides a consolidated interface for all MoU operations
 */
export class MouTemplateService {
  /**
   * Generate a new MoU document
   */
  static async generate(input: MoUGenerationInput): Promise<GeneratedMoU> {
    return generateMoU(input);
  }

  /**
   * Save MoU to database
   */
  static async save(input: MoUGenerationInput, generatedMoU: GeneratedMoU): Promise<StandardMou> {
    return saveMoU(input, generatedMoU);
  }

  /**
   * Generate MoU from existing record
   */
  static async fromRecord(mouId: string): Promise<GeneratedMoU> {
    return generateMoUFromRecord(mouId);
  }

  /**
   * Generate preview HTML
   */
  static async preview(input: MoUGenerationInput): Promise<string> {
    return generateMoUPreview(input);
  }

  /**
   * Update MoU status
   */
  static async updateStatus(
    mouId: string,
    status: string
  ): Promise<StandardMou> {
    try {
      const mou = await prisma.standardMou.update({
        where: { id: mouId },
        data: { status },
      });
      return mou;
    } catch (error) {
      console.error("Error updating MoU status:", error);
      throw new Error("Failed to update MoU status");
    }
  }

  /**
   * Attach signed document to MoU
   */
  static async attachSignedDocument(
    mouId: string,
    documentUrl: string
  ): Promise<StandardMou> {
    try {
      const mou = await prisma.standardMou.update({
        where: { id: mouId },
        data: {
          signedDocumentUrl: documentUrl,
          status: "SIGNED",
        },
      });
      return mou;
    } catch (error) {
      console.error("Error attaching signed document:", error);
      throw new Error("Failed to attach signed document");
    }
  }

  /**
   * Get MoU by reference ID
   */
  static async getByReferenceId(referenceId: string): Promise<StandardMou | null> {
    try {
      const mou = await prisma.standardMou.findUnique({
        where: { mouReferenceId: referenceId },
        include: {
          project: true,
        },
      });
      return mou;
    } catch (error) {
      console.error("Error fetching MoU:", error);
      throw new Error("Failed to fetch MoU");
    }
  }
}

export default MouTemplateService;
