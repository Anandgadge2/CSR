
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  organizationId: 'organizationId',
  email: 'email',
  passwordHash: 'passwordHash',
  role: 'role',
  accountStatus: 'accountStatus',
  isSystemSeeded: 'isSystemSeeded',
  isVerified: 'isVerified',
  otpCode: 'otpCode',
  otpExpiresAt: 'otpExpiresAt',
  refreshToken: 'refreshToken',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ngoId: 'ngoId',
  companyId: 'companyId',
  assignedDistrict: 'assignedDistrict'
};

exports.Prisma.NGOScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  organizationId: 'organizationId',
  name: 'name',
  registrationNumber: 'registrationNumber',
  darpanNumber: 'darpanNumber',
  csr1Number: 'csr1Number',
  pan: 'pan',
  certificate12AUrl: 'certificate12AUrl',
  certificate80GUrl: 'certificate80GUrl',
  fcraDetails: 'fcraDetails',
  address: 'address',
  state: 'state',
  district: 'district',
  taluka: 'taluka',
  village: 'village',
  website: 'website',
  socialLinks: 'socialLinks',
  impactStatistics: 'impactStatistics',
  status: 'status',
  empanelmentStatus: 'empanelmentStatus',
  empanelmentRemarks: 'empanelmentRemarks',
  rejectionReason: 'rejectionReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  areasOfOperation: 'areasOfOperation',
  city: 'city',
  csrSectors: 'csrSectors',
  displayName: 'displayName',
  officialEmail: 'officialEmail',
  officialPhone: 'officialPhone',
  organizationType: 'organizationType',
  pincode: 'pincode',
  registrationAuthority: 'registrationAuthority',
  registrationDate: 'registrationDate',
  yearEstablished: 'yearEstablished'
};

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  organizationId: 'organizationId',
  name: 'name',
  cin: 'cin',
  gst: 'gst',
  pan: 'pan',
  csrBudget: 'csrBudget',
  csrRegistrationNo: 'csrRegistrationNo',
  csrPolicyUrl: 'csrPolicyUrl',
  registeredAddress: 'registeredAddress',
  csrHeadName: 'csrHeadName',
  csrHeadEmail: 'csrHeadEmail',
  csrHeadMobile: 'csrHeadMobile',
  annualCsrBudget: 'annualCsrBudget',
  preferredDistricts: 'preferredDistricts',
  preferredBudgetMin: 'preferredBudgetMin',
  preferredBudgetMax: 'preferredBudgetMax',
  pastCsrWork: 'pastCsrWork',
  companyLogoUrl: 'companyLogoUrl',
  focusAreas: 'focusAreas',
  contactInfo: 'contactInfo',
  status: 'status',
  rejectionReason: 'rejectionReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  ngoId: 'ngoId',
  title: 'title',
  description: 'description',
  focusArea: 'focusArea',
  sdgGoal: 'sdgGoal',
  beneficiaryCount: 'beneficiaryCount',
  budgetRequested: 'budgetRequested',
  budgetFunded: 'budgetFunded',
  state: 'state',
  district: 'district',
  taluka: 'taluka',
  village: 'village',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MilestoneScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  projectId: 'projectId',
  name: 'name',
  description: 'description',
  amount: 'amount',
  dueDate: 'dueDate',
  status: 'status',
  completionEvidence: 'completionEvidence',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChatScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  projectId: 'projectId',
  ngoId: 'ngoId',
  companyId: 'companyId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  chatId: 'chatId',
  senderId: 'senderId',
  text: 'text',
  fileUrl: 'fileUrl',
  fileType: 'fileType',
  readBy: 'readBy',
  createdAt: 'createdAt'
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  organizationId: 'organizationId',
  title: 'title',
  fileUrl: 'fileUrl',
  fileType: 'fileType',
  expiryDate: 'expiryDate',
  ngoId: 'ngoId',
  companyId: 'companyId',
  projectId: 'projectId',
  chatId: 'chatId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MatchScoreScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  projectId: 'projectId',
  score: 'score',
  factors: 'factors',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReportScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  title: 'title',
  type: 'type',
  content: 'content',
  fileUrl: 'fileUrl',
  createdById: 'createdById',
  ngoId: 'ngoId',
  companyId: 'companyId',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  title: 'title',
  message: 'message',
  isRead: 'isRead',
  type: 'type',
  createdAt: 'createdAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  userId: 'userId',
  actorUserId: 'actorUserId',
  actorRole: 'actorRole',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  details: 'details',
  oldValueJson: 'oldValueJson',
  newValueJson: 'newValueJson',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.OnboardingApplicationScalarFieldEnum = {
  id: 'id',
  ngoId: 'ngoId',
  legalName: 'legalName',
  displayName: 'displayName',
  organizationType: 'organizationType',
  registrationNumber: 'registrationNumber',
  registrationDate: 'registrationDate',
  registrationAuthority: 'registrationAuthority',
  stateOfRegistration: 'stateOfRegistration',
  panNumber: 'panNumber',
  ngoDarpanId: 'ngoDarpanId',
  csr1RegistrationNumber: 'csr1RegistrationNumber',
  yearEstablished: 'yearEstablished',
  officialEmail: 'officialEmail',
  officialPhone: 'officialPhone',
  website: 'website',
  headOfficeAddress: 'headOfficeAddress',
  state: 'state',
  district: 'district',
  city: 'city',
  pincode: 'pincode',
  areasOfOperation: 'areasOfOperation',
  csrSectors: 'csrSectors',
  csr1Status: 'csr1Status',
  has12A: 'has12A',
  has80G: 'has80G',
  gstRegistered: 'gstRegistered',
  gstin: 'gstin',
  fcraStatus: 'fcraStatus',
  fcraRegistrationNumber: 'fcraRegistrationNumber',
  founderDetails: 'founderDetails',
  trusteesDirectors: 'trusteesDirectors',
  authorizedSignatory: 'authorizedSignatory',
  bankAccountHolder: 'bankAccountHolder',
  bankName: 'bankName',
  bankBranch: 'bankBranch',
  bankAccountNumber: 'bankAccountNumber',
  ifscCode: 'ifscCode',
  accountType: 'accountType',
  auditorName: 'auditorName',
  auditorFirm: 'auditorFirm',
  auditorContact: 'auditorContact',
  annualTurnover: 'annualTurnover',
  yearsOfOperation: 'yearsOfOperation',
  previousProjects: 'previousProjects',
  beneficiaryCountLastFY: 'beneficiaryCountLastFY',
  staffCount: 'staffCount',
  volunteerCount: 'volunteerCount',
  blacklistDeclaration: 'blacklistDeclaration',
  litigationDeclaration: 'litigationDeclaration',
  conflictOfInterest: 'conflictOfInterest',
  relatedPartyDeclaration: 'relatedPartyDeclaration',
  dataPrivacyConsent: 'dataPrivacyConsent',
  verificationConsent: 'verificationConsent',
  status: 'status',
  completenessPercentage: 'completenessPercentage',
  submittedAt: 'submittedAt',
  reviewedAt: 'reviewedAt',
  approvedAt: 'approvedAt',
  rejectedAt: 'rejectedAt',
  assignedReviewerId: 'assignedReviewerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OnboardingStatusHistoryScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  fromStatus: 'fromStatus',
  toStatus: 'toStatus',
  changedById: 'changedById',
  reason: 'reason',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.OnboardingQueryScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  raisedById: 'raisedById',
  queryText: 'queryText',
  documentType: 'documentType',
  fieldName: 'fieldName',
  status: 'status',
  priority: 'priority',
  dueDate: 'dueDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.QueryResponseScalarFieldEnum = {
  id: 'id',
  queryId: 'queryId',
  respondedById: 'respondedById',
  responseText: 'responseText',
  attachmentUrls: 'attachmentUrls',
  createdAt: 'createdAt'
};

exports.Prisma.VerificationCheckScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  checkType: 'checkType',
  checkStatus: 'checkStatus',
  checkResult: 'checkResult',
  verifiedById: 'verifiedById',
  verifiedAt: 'verifiedAt',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TenantScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  state: 'state',
  status: 'status',
  domain: 'domain',
  logo: 'logo',
  primaryColor: 'primaryColor',
  secondaryColor: 'secondaryColor',
  isHidden: 'isHidden',
  configJson: 'configJson',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TenantFeatureScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  featureKey: 'featureKey',
  isEnabled: 'isEnabled',
  configJson: 'configJson',
  updatedBy: 'updatedBy',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrganizationScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  organizationType: 'organizationType',
  name: 'name',
  legalName: 'legalName',
  displayName: 'displayName',
  registrationNumber: 'registrationNumber',
  cin: 'cin',
  llpin: 'llpin',
  pan: 'pan',
  gst: 'gst',
  gstin: 'gstin',
  departmentCode: 'departmentCode',
  parentDepartment: 'parentDepartment',
  email: 'email',
  officialEmail: 'officialEmail',
  phone: 'phone',
  officialPhone: 'officialPhone',
  website: 'website',
  address: 'address',
  stateId: 'stateId',
  districtId: 'districtId',
  talukaId: 'talukaId',
  villageId: 'villageId',
  district: 'district',
  taluka: 'taluka',
  onboardingStatus: 'onboardingStatus',
  verificationStatus: 'verificationStatus',
  status: 'status',
  approvedBy: 'approvedBy',
  approvedAt: 'approvedAt',
  rejectedBy: 'rejectedBy',
  rejectedAt: 'rejectedAt',
  rejectionReason: 'rejectionReason',
  clarificationRemarks: 'clarificationRemarks',
  sourceNgoId: 'sourceNgoId',
  sourceCompanyId: 'sourceCompanyId',
  sourceBeneficiaryProfileId: 'sourceBeneficiaryProfileId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrganizationDocumentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  organizationId: 'organizationId',
  documentType: 'documentType',
  fileUrl: 'fileUrl',
  fileName: 'fileName',
  mimeType: 'mimeType',
  fileSize: 'fileSize',
  verificationStatus: 'verificationStatus',
  remarks: 'remarks',
  uploadedBy: 'uploadedBy',
  verifiedBy: 'verifiedBy',
  verifiedAt: 'verifiedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CSRCompanyProfileScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  tenantId: 'tenantId',
  companyType: 'companyType',
  yearOfIncorporation: 'yearOfIncorporation',
  mcaVerificationStatus: 'mcaVerificationStatus',
  companyStatus: 'companyStatus',
  registeredOfficeAddress: 'registeredOfficeAddress',
  corporateOfficeAddress: 'corporateOfficeAddress',
  officialEmailDomain: 'officialEmailDomain',
  csrApplicable: 'csrApplicable',
  financialYear: 'financialYear',
  netWorth: 'netWorth',
  turnover: 'turnover',
  netProfit: 'netProfit',
  averageNetProfit: 'averageNetProfit',
  csrObligationAmount: 'csrObligationAmount',
  twoPercentCsrObligation: 'twoPercentCsrObligation',
  currentYearCsrBudget: 'currentYearCsrBudget',
  unspentCsrAmount: 'unspentCsrAmount',
  ongoingProjectAmount: 'ongoingProjectAmount',
  csrCommitteeApplicable: 'csrCommitteeApplicable',
  csrCommitteeDetails: 'csrCommitteeDetails',
  csrCommitteeConstitutionDate: 'csrCommitteeConstitutionDate',
  csrPolicyApprovalDate: 'csrPolicyApprovalDate',
  boardApprovalStatus: 'boardApprovalStatus',
  csrHeadName: 'csrHeadName',
  csrHeadDesignation: 'csrHeadDesignation',
  csrHeadEmail: 'csrHeadEmail',
  csrHeadMobile: 'csrHeadMobile',
  financeOfficerName: 'financeOfficerName',
  financeOfficerDesignation: 'financeOfficerDesignation',
  financeOfficerEmail: 'financeOfficerEmail',
  authorizedSignatoryName: 'authorizedSignatoryName',
  authorizedSignatoryDesignation: 'authorizedSignatoryDesignation',
  authorizedSignatoryEmail: 'authorizedSignatoryEmail',
  authorizedSignatoryMobile: 'authorizedSignatoryMobile',
  authorizationReferenceNumber: 'authorizationReferenceNumber',
  csrPolicyDocumentId: 'csrPolicyDocumentId',
  boardResolutionDocumentId: 'boardResolutionDocumentId',
  preferredDistricts: 'preferredDistricts',
  preferredTalukas: 'preferredTalukas',
  preferredSectors: 'preferredSectors',
  preferredProjectSize: 'preferredProjectSize',
  preferredBeneficiaryGroups: 'preferredBeneficiaryGroups',
  scheduleVIIFocusAreas: 'scheduleVIIFocusAreas',
  sdgFocusAreas: 'sdgFocusAreas',
  esgFocusAreas: 'esgFocusAreas',
  minFundingAmount: 'minFundingAmount',
  maxFundingAmount: 'maxFundingAmount',
  fundingPreference: 'fundingPreference',
  implementationPreference: 'implementationPreference',
  declarationAccepted: 'declarationAccepted',
  declarationAcceptedAt: 'declarationAcceptedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GovernmentDepartmentProfileScalarFieldEnum = {
  id: 'id',
  organizationId: 'organizationId',
  tenantId: 'tenantId',
  departmentType: 'departmentType',
  parentDepartment: 'parentDepartment',
  departmentCode: 'departmentCode',
  villageOrCity: 'villageOrCity',
  officeWebsite: 'officeWebsite',
  officialEmailDomain: 'officialEmailDomain',
  officePhone: 'officePhone',
  governmentOfficeIdentifier: 'governmentOfficeIdentifier',
  nodalOfficerName: 'nodalOfficerName',
  nodalOfficerDesignation: 'nodalOfficerDesignation',
  nodalOfficerDepartment: 'nodalOfficerDepartment',
  nodalOfficerEmail: 'nodalOfficerEmail',
  nodalOfficerMobile: 'nodalOfficerMobile',
  nodalOfficerOfficePhone: 'nodalOfficerOfficePhone',
  nodalOfficerEmployeeId: 'nodalOfficerEmployeeId',
  reportingOfficerName: 'reportingOfficerName',
  reportingOfficerDesignation: 'reportingOfficerDesignation',
  reportingOfficerEmail: 'reportingOfficerEmail',
  authorizationLetterNumber: 'authorizationLetterNumber',
  authorizationLetterDate: 'authorizationLetterDate',
  issuingAuthorityName: 'issuingAuthorityName',
  issuingAuthorityDesignation: 'issuingAuthorityDesignation',
  canCreateRequirements: 'canCreateRequirements',
  canConfirmHandover: 'canConfirmHandover',
  canUploadOfficialDocuments: 'canUploadOfficialDocuments',
  departmentApprovalRequired: 'departmentApprovalRequired',
  internalApprovalReference: 'internalApprovalReference',
  jurisdictionType: 'jurisdictionType',
  allowedDistrictIds: 'allowedDistrictIds',
  allowedTalukaIds: 'allowedTalukaIds',
  allowedVillageIds: 'allowedVillageIds',
  allowedSectors: 'allowedSectors',
  canCreateStateLevelRequirement: 'canCreateStateLevelRequirement',
  canCreateDistrictLevelRequirement: 'canCreateDistrictLevelRequirement',
  canCreateLocalBodyLevelRequirement: 'canCreateLocalBodyLevelRequirement',
  requiresDistrictVerification: 'requiresDistrictVerification',
  requirementPermissionSectors: 'requirementPermissionSectors',
  declarationAccepted: 'declarationAccepted',
  declarationAcceptedAt: 'declarationAcceptedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OnboardingReviewScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  organizationId: 'organizationId',
  reviewedBy: 'reviewedBy',
  reviewAction: 'reviewAction',
  remarks: 'remarks',
  createdAt: 'createdAt'
};

exports.Prisma.PermissionScalarFieldEnum = {
  id: 'id',
  key: 'key',
  description: 'description',
  module: 'module',
  createdAt: 'createdAt'
};

exports.Prisma.OrganizationRoleScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  organizationId: 'organizationId',
  name: 'name',
  description: 'description',
  scope: 'scope',
  isSystemRole: 'isSystemRole',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrganizationRolePermissionScalarFieldEnum = {
  roleId: 'roleId',
  permissionId: 'permissionId'
};

exports.Prisma.UserOrganizationRoleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  roleId: 'roleId',
  organizationId: 'organizationId',
  tenantId: 'tenantId',
  createdAt: 'createdAt'
};

exports.Prisma.NgoDocumentScalarFieldEnum = {
  id: 'id',
  ngoId: 'ngoId',
  documentType: 'documentType',
  title: 'title',
  description: 'description',
  fileUrl: 'fileUrl',
  fileName: 'fileName',
  fileSize: 'fileSize',
  fileType: 'fileType',
  fileHash: 'fileHash',
  status: 'status',
  expiryDate: 'expiryDate',
  issueDate: 'issueDate',
  issuingAuthority: 'issuingAuthority',
  documentNumber: 'documentNumber',
  verifiedById: 'verifiedById',
  verifiedAt: 'verifiedAt',
  verificationNotes: 'verificationNotes',
  rejectionReason: 'rejectionReason',
  version: 'version',
  parentDocumentId: 'parentDocumentId',
  uploadedById: 'uploadedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NgoContactScalarFieldEnum = {
  id: 'id',
  ngoId: 'ngoId',
  contactType: 'contactType',
  name: 'name',
  designation: 'designation',
  email: 'email',
  phone: 'phone',
  mobile: 'mobile',
  isPrimary: 'isPrimary',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GovernanceMemberScalarFieldEnum = {
  id: 'id',
  ngoId: 'ngoId',
  memberType: 'memberType',
  name: 'name',
  designation: 'designation',
  email: 'email',
  mobile: 'mobile',
  panNumber: 'panNumber',
  aadhaarMasked: 'aadhaarMasked',
  tenureStartDate: 'tenureStartDate',
  tenureEndDate: 'tenureEndDate',
  isActive: 'isActive',
  idProofUrl: 'idProofUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BankAccountScalarFieldEnum = {
  id: 'id',
  ngoId: 'ngoId',
  accountHolderName: 'accountHolderName',
  bankName: 'bankName',
  branchName: 'branchName',
  accountNumber: 'accountNumber',
  ifscCode: 'ifscCode',
  accountType: 'accountType',
  isPrimary: 'isPrimary',
  isVerified: 'isVerified',
  verificationMethod: 'verificationMethod',
  verifiedAt: 'verifiedAt',
  cancelledChequeUrl: 'cancelledChequeUrl',
  bankStatementUrl: 'bankStatementUrl',
  verificationNotes: 'verificationNotes',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RiskScoreScalarFieldEnum = {
  id: 'id',
  ngoId: 'ngoId',
  overallScore: 'overallScore',
  riskLevel: 'riskLevel',
  legalRegistrationScore: 'legalRegistrationScore',
  identitySignatoryScore: 'identitySignatoryScore',
  financialScore: 'financialScore',
  complianceScore: 'complianceScore',
  governanceScore: 'governanceScore',
  documentQualityScore: 'documentQualityScore',
  paymentBankScore: 'paymentBankScore',
  scoreBreakdown: 'scoreBreakdown',
  calculatedAt: 'calculatedAt',
  calculatedById: 'calculatedById'
};

exports.Prisma.RiskFlagScalarFieldEnum = {
  id: 'id',
  riskScoreId: 'riskScoreId',
  flagType: 'flagType',
  severity: 'severity',
  description: 'description',
  recommendation: 'recommendation',
  isResolved: 'isResolved',
  resolvedAt: 'resolvedAt',
  resolvedById: 'resolvedById',
  resolutionNotes: 'resolutionNotes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentOrderScalarFieldEnum = {
  id: 'id',
  orderNumber: 'orderNumber',
  ngoId: 'ngoId',
  companyId: 'companyId',
  projectId: 'projectId',
  bankAccountId: 'bankAccountId',
  amount: 'amount',
  currency: 'currency',
  purpose: 'purpose',
  description: 'description',
  status: 'status',
  gatewayName: 'gatewayName',
  gatewayOrderId: 'gatewayOrderId',
  gatewayPaymentId: 'gatewayPaymentId',
  gatewaySignature: 'gatewaySignature',
  idempotencyKey: 'idempotencyKey',
  metadata: 'metadata',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentTransactionScalarFieldEnum = {
  id: 'id',
  paymentOrderId: 'paymentOrderId',
  transactionId: 'transactionId',
  gatewayTransactionId: 'gatewayTransactionId',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  paymentMethod: 'paymentMethod',
  paymentDetails: 'paymentDetails',
  utrNumber: 'utrNumber',
  failureReason: 'failureReason',
  failureCode: 'failureCode',
  processedAt: 'processedAt',
  settledAt: 'settledAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentWebhookLogScalarFieldEnum = {
  id: 'id',
  paymentOrderId: 'paymentOrderId',
  gatewayName: 'gatewayName',
  eventType: 'eventType',
  webhookPayload: 'webhookPayload',
  webhookSignature: 'webhookSignature',
  isSignatureValid: 'isSignatureValid',
  processedAt: 'processedAt',
  processingStatus: 'processingStatus',
  processingError: 'processingError',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt'
};

exports.Prisma.FundReleaseScalarFieldEnum = {
  id: 'id',
  paymentOrderId: 'paymentOrderId',
  ngoId: 'ngoId',
  projectId: 'projectId',
  milestoneId: 'milestoneId',
  bankAccountId: 'bankAccountId',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  approvedById: 'approvedById',
  approvedAt: 'approvedAt',
  releasedAt: 'releasedAt',
  rejectionReason: 'rejectionReason',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BeneficiaryProfileScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  organizationId: 'organizationId',
  userId: 'userId',
  agencyName: 'agencyName',
  agencyType: 'agencyType',
  district: 'district',
  taluka: 'taluka',
  village: 'village',
  city: 'city',
  address: 'address',
  pincode: 'pincode',
  contactPerson: 'contactPerson',
  contactEmail: 'contactEmail',
  contactPhone: 'contactPhone',
  designation: 'designation',
  website: 'website',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CSRRequirementScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  beneficiaryProfileId: 'beneficiaryProfileId',
  title: 'title',
  category: 'category',
  description: 'description',
  district: 'district',
  taluka: 'taluka',
  village: 'village',
  city: 'city',
  address: 'address',
  geoLatitude: 'geoLatitude',
  geoLongitude: 'geoLongitude',
  estimatedCost: 'estimatedCost',
  beneficiaryCount: 'beneficiaryCount',
  expectedImpact: 'expectedImpact',
  priorityLevel: 'priorityLevel',
  completionTimeline: 'completionTimeline',
  contactPersonName: 'contactPersonName',
  contactPersonPhone: 'contactPersonPhone',
  contactPersonEmail: 'contactPersonEmail',
  agencyType: 'agencyType',
  sdgGoals: 'sdgGoals',
  declarationAccepted: 'declarationAccepted',
  status: 'status',
  verificationRemarks: 'verificationRemarks',
  rejectionReason: 'rejectionReason',
  verifiedById: 'verifiedById',
  verifiedAt: 'verifiedAt',
  fieldVerificationNotes: 'fieldVerificationNotes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CSRRequirementDocumentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  csrRequirementId: 'csrRequirementId',
  title: 'title',
  fileUrl: 'fileUrl',
  fileName: 'fileName',
  fileType: 'fileType',
  fileSize: 'fileSize',
  documentCategory: 'documentCategory',
  uploadedById: 'uploadedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NGOApplicationScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  csrRequirementId: 'csrRequirementId',
  ngoId: 'ngoId',
  proposedPlan: 'proposedPlan',
  proposedTimeline: 'proposedTimeline',
  estimatedCost: 'estimatedCost',
  teamDetails: 'teamDetails',
  pastExperience: 'pastExperience',
  proposalDocumentUrl: 'proposalDocumentUrl',
  remarks: 'remarks',
  status: 'status',
  rejectionReason: 'rejectionReason',
  matchScore: 'matchScore',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CompanyInterestScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  csrRequirementId: 'csrRequirementId',
  companyId: 'companyId',
  fundingAmount: 'fundingAmount',
  fundingType: 'fundingType',
  preferredNgoId: 'preferredNgoId',
  focusAlignmentNotes: 'focusAlignmentNotes',
  discussionMessage: 'discussionMessage',
  expectedTimeline: 'expectedTimeline',
  companyRemarks: 'companyRemarks',
  status: 'status',
  selectedNgoId: 'selectedNgoId',
  selectedAt: 'selectedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AgreementScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  csrRequirementId: 'csrRequirementId',
  companyId: 'companyId',
  ngoId: 'ngoId',
  beneficiaryProfileId: 'beneficiaryProfileId',
  fundingAmount: 'fundingAmount',
  milestonePlan: 'milestonePlan',
  expectedStartDate: 'expectedStartDate',
  expectedCompletionDate: 'expectedCompletionDate',
  termsAndConditions: 'termsAndConditions',
  signedDocumentUrl: 'signedDocumentUrl',
  status: 'status',
  rejectionReason: 'rejectionReason',
  revisionNotes: 'revisionNotes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CSRFundMilestoneScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  csrRequirementId: 'csrRequirementId',
  milestoneName: 'milestoneName',
  milestonePercentage: 'milestonePercentage',
  amount: 'amount',
  dueDate: 'dueDate',
  releaseDate: 'releaseDate',
  utilizationProofUrl: 'utilizationProofUrl',
  invoiceUrl: 'invoiceUrl',
  adminRemarks: 'adminRemarks',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CSRProjectScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  csrRequirementId: 'csrRequirementId',
  companyId: 'companyId',
  ngoId: 'ngoId',
  beneficiaryProfileId: 'beneficiaryProfileId',
  title: 'title',
  approvedBudget: 'approvedBudget',
  committedAmount: 'committedAmount',
  releasedAmount: 'releasedAmount',
  utilizedAmount: 'utilizedAmount',
  projectStatus: 'projectStatus',
  startDate: 'startDate',
  expectedEndDate: 'expectedEndDate',
  actualEndDate: 'actualEndDate',
  agreementDocument: 'agreementDocument',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CSRFundReleaseScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  csrProjectId: 'csrProjectId',
  csrRequirementId: 'csrRequirementId',
  companyId: 'companyId',
  ngoId: 'ngoId',
  trancheNumber: 'trancheNumber',
  trancheName: 'trancheName',
  approvedAmount: 'approvedAmount',
  releasedAmount: 'releasedAmount',
  releaseDate: 'releaseDate',
  paymentReference: 'paymentReference',
  status: 'status',
  utilizationCertificateId: 'utilizationCertificateId',
  remarks: 'remarks',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AssetHandoverScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  csrProjectId: 'csrProjectId',
  csrRequirementId: 'csrRequirementId',
  beneficiaryProfileId: 'beneficiaryProfileId',
  assetDescription: 'assetDescription',
  handoverDate: 'handoverDate',
  confirmationStatus: 'confirmationStatus',
  confirmedById: 'confirmedById',
  handoverCertificate: 'handoverCertificate',
  remarks: 'remarks',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectInspectionScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  csrProjectId: 'csrProjectId',
  csrRequirementId: 'csrRequirementId',
  districtOfficerId: 'districtOfficerId',
  visitDate: 'visitDate',
  latitude: 'latitude',
  longitude: 'longitude',
  geoTaggedImages: 'geoTaggedImages',
  remarks: 'remarks',
  issuesFound: 'issuesFound',
  actionRequired: 'actionRequired',
  nextVisitDate: 'nextVisitDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ImpactMetricScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  csrProjectId: 'csrProjectId',
  csrRequirementId: 'csrRequirementId',
  studentsBenefited: 'studentsBenefited',
  patientsBenefited: 'patientsBenefited',
  villagesBenefited: 'villagesBenefited',
  householdsBenefited: 'householdsBenefited',
  womenBeneficiaries: 'womenBeneficiaries',
  farmersBenefited: 'farmersBenefited',
  otherMetrics: 'otherMetrics',
  sdgMapping: 'sdgMapping',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProgressReportScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  csrRequirementId: 'csrRequirementId',
  submittedByNgoId: 'submittedByNgoId',
  progressTitle: 'progressTitle',
  progressDescription: 'progressDescription',
  physicalProgressPercent: 'physicalProgressPercent',
  financialUtilPercent: 'financialUtilPercent',
  photoUrls: 'photoUrls',
  videoUrls: 'videoUrls',
  geoLatitude: 'geoLatitude',
  geoLongitude: 'geoLongitude',
  challenges: 'challenges',
  nextSteps: 'nextSteps',
  status: 'status',
  verificationRemarks: 'verificationRemarks',
  verifiedById: 'verifiedById',
  verifiedAt: 'verifiedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CompletionReportScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  csrRequirementId: 'csrRequirementId',
  submittedByNgoId: 'submittedByNgoId',
  workCompletedSummary: 'workCompletedSummary',
  finalCost: 'finalCost',
  fundUtilizationSummary: 'fundUtilizationSummary',
  beforePhotoUrls: 'beforePhotoUrls',
  afterPhotoUrls: 'afterPhotoUrls',
  beneficiaryCount: 'beneficiaryCount',
  outcomeIndicators: 'outcomeIndicators',
  certificateUrls: 'certificateUrls',
  beneficiaryFeedback: 'beneficiaryFeedback',
  inspectionReportUrl: 'inspectionReportUrl',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ImpactReportScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  csrRequirementId: 'csrRequirementId',
  projectSummary: 'projectSummary',
  companyContribution: 'companyContribution',
  ngoExecutionSummary: 'ngoExecutionSummary',
  beneficiaryReach: 'beneficiaryReach',
  beforeAfterComparison: 'beforeAfterComparison',
  fundUtilization: 'fundUtilization',
  impactScore: 'impactScore',
  timelyCompletionScore: 'timelyCompletionScore',
  fundUtilAccuracyScore: 'fundUtilAccuracyScore',
  beneficiaryFeedbackScore: 'beneficiaryFeedbackScore',
  govVerificationScore: 'govVerificationScore',
  socialImpactScore: 'socialImpactScore',
  documentationScore: 'documentationScore',
  generatedAt: 'generatedAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CorporateEnquiryScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  trackingId: 'trackingId',
  companyName: 'companyName',
  sector: 'sector',
  preferredDistricts: 'preferredDistricts',
  indicativeBudget: 'indicativeBudget',
  contactPersonName: 'contactPersonName',
  contactPersonDesignation: 'contactPersonDesignation',
  mobile: 'mobile',
  mobileVerified: 'mobileVerified',
  email: 'email',
  emailVerified: 'emailVerified',
  mca21Cin: 'mca21Cin',
  proposedCsrWork: 'proposedCsrWork',
  assignedRelationshipManagerId: 'assignedRelationshipManagerId',
  status: 'status',
  submittedAt: 'submittedAt',
  firstResponseDueAt: 'firstResponseDueAt',
  firstContactedAt: 'firstContactedAt',
  currentEscalationLevel: 'currentEscalationLevel',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CorporateEnquiryInteractionScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  corporateEnquiryId: 'corporateEnquiryId',
  actorUserId: 'actorUserId',
  note: 'note',
  interactionType: 'interactionType',
  attachmentUrls: 'attachmentUrls',
  createdAt: 'createdAt'
};

exports.Prisma.FeasibilityAssessmentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  reportReference: 'reportReference',
  corporateEnquiryId: 'corporateEnquiryId',
  governmentPitchId: 'governmentPitchId',
  relationshipManagerId: 'relationshipManagerId',
  companyName: 'companyName',
  cin: 'cin',
  sector: 'sector',
  contactSummary: 'contactSummary',
  proposedLocationDistrict: 'proposedLocationDistrict',
  indicativeBudget: 'indicativeBudget',
  developmentNeedAddressed: 'developmentNeedAddressed',
  dateOfFirstContact: 'dateOfFirstContact',
  summaryOfInteraction: 'summaryOfInteraction',
  feasibilityResult: 'feasibilityResult',
  recommendation: 'recommendation',
  suggestedNodalOfficerDomain: 'suggestedNodalOfficerDomain',
  conditionText: 'conditionText',
  submittedToJsAt: 'submittedToJsAt',
  jsDecisionById: 'jsDecisionById',
  jsDecisionAt: 'jsDecisionAt',
  jsDecisionRemarks: 'jsDecisionRemarks',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeasibilityChecklistItemScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  assessmentId: 'assessmentId',
  itemNumber: 'itemNumber',
  dimension: 'dimension',
  checkText: 'checkText',
  isCritical: 'isCritical',
  answer: 'answer',
  remarks: 'remarks',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GovernmentPitchScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  pitchReferenceId: 'pitchReferenceId',
  officialName: 'officialName',
  designation: 'designation',
  department: 'department',
  officeName: 'officeName',
  serviceClass: 'serviceClass',
  mobile: 'mobile',
  mobileVerified: 'mobileVerified',
  email: 'email',
  emailVerified: 'emailVerified',
  district: 'district',
  taluka: 'taluka',
  exactLocation: 'exactLocation',
  csrRequirement: 'csrRequirement',
  estimatedCost: 'estimatedCost',
  govtFundDeclaration: 'govtFundDeclaration',
  certificationType: 'certificationType',
  hodCertificationDocument: 'hodCertificationDocument',
  status: 'status',
  assignedRelationshipManagerId: 'assignedRelationshipManagerId',
  submittedAt: 'submittedAt',
  verificationDueAt: 'verificationDueAt',
  jsApprovalDueAt: 'jsApprovalDueAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GovernmentPitchPhotoScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  governmentPitchId: 'governmentPitchId',
  fileUrl: 'fileUrl',
  latitude: 'latitude',
  longitude: 'longitude',
  capturedAt: 'capturedAt',
  isGeoTagged: 'isGeoTagged',
  createdAt: 'createdAt'
};

exports.Prisma.CorporatePitchInterestScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  interestTrackingId: 'interestTrackingId',
  governmentPitchId: 'governmentPitchId',
  companyName: 'companyName',
  mca21Cin: 'mca21Cin',
  contactPersonName: 'contactPersonName',
  contactPersonDesignation: 'contactPersonDesignation',
  mobile: 'mobile',
  mobileVerified: 'mobileVerified',
  email: 'email',
  emailVerified: 'emailVerified',
  indicativeBudget: 'indicativeBudget',
  preferredStartTimeline: 'preferredStartTimeline',
  implementationMode: 'implementationMode',
  messageToGovernment: 'messageToGovernment',
  declarationAccepted: 'declarationAccepted',
  status: 'status',
  coordinationNotes: 'coordinationNotes',
  dialogueInitiated: 'dialogueInitiated',
  nodalOfficerRecommended: 'nodalOfficerRecommended',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NodalOfficerAppointmentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  corporateEnquiryId: 'corporateEnquiryId',
  governmentPitchId: 'governmentPitchId',
  assessmentId: 'assessmentId',
  district: 'district',
  domain: 'domain',
  nodalOfficerUserId: 'nodalOfficerUserId',
  nodalOfficerName: 'nodalOfficerName',
  designation: 'designation',
  department: 'department',
  appointmentLetterUrl: 'appointmentLetterUrl',
  appointedByJsId: 'appointedByJsId',
  appointedAt: 'appointedAt',
  collectorCc: 'collectorCc',
  zpCeoCc: 'zpCeoCc',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.StandardMouScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  mouReferenceId: 'mouReferenceId',
  corporateEnquiryId: 'corporateEnquiryId',
  governmentPitchId: 'governmentPitchId',
  projectId: 'projectId',
  districtDepartmentName: 'districtDepartmentName',
  nodalOfficerName: 'nodalOfficerName',
  corporateName: 'corporateName',
  cin: 'cin',
  projectTitle: 'projectTitle',
  projectDescription: 'projectDescription',
  scheduleVIIClause: 'scheduleVIIClause',
  projectLocation: 'projectLocation',
  deliverables: 'deliverables',
  timelineMonths: 'timelineMonths',
  financialContribution: 'financialContribution',
  governmentContribution: 'governmentContribution',
  implementationMode: 'implementationMode',
  implementingAgencyName: 'implementingAgencyName',
  ownershipAfterCompletion: 'ownershipAfterCompletion',
  maintenanceResponsibility: 'maintenanceResponsibility',
  signedDocumentUrl: 'signedDocumentUrl',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConvergenceProjectScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  projectId: 'projectId',
  corporateEnquiryId: 'corporateEnquiryId',
  governmentPitchId: 'governmentPitchId',
  mouId: 'mouId',
  title: 'title',
  district: 'district',
  taluka: 'taluka',
  location: 'location',
  sector: 'sector',
  corporateName: 'corporateName',
  nodalOfficerUserId: 'nodalOfficerUserId',
  implementingAgencyUserId: 'implementingAgencyUserId',
  approvedBudget: 'approvedBudget',
  utilizedAmount: 'utilizedAmount',
  physicalProgressPercent: 'physicalProgressPercent',
  financialProgressPercent: 'financialProgressPercent',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectDeliverableMilestoneScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  convergenceProjectId: 'convergenceProjectId',
  name: 'name',
  description: 'description',
  workType: 'workType',
  status: 'status',
  fundsUtilized: 'fundsUtilized',
  geoTaggedPhotoUrls: 'geoTaggedPhotoUrls',
  verifiedByNodalOfficerId: 'verifiedByNodalOfficerId',
  verifiedAt: 'verifiedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UtilizationCertificateScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  convergenceProjectId: 'convergenceProjectId',
  milestoneId: 'milestoneId',
  csrFundReleaseId: 'csrFundReleaseId',
  csrProjectId: 'csrProjectId',
  csrRequirementId: 'csrRequirementId',
  ngoId: 'ngoId',
  verifiedById: 'verifiedById',
  uploadedByUserId: 'uploadedByUserId',
  certificateDocumentUrl: 'certificateDocumentUrl',
  amountUtilized: 'amountUtilized',
  remarks: 'remarks',
  invoiceDocuments: 'invoiceDocuments',
  verificationStatus: 'verificationStatus',
  verifiedByNodalOfficerId: 'verifiedByNodalOfficerId',
  uploadedAt: 'uploadedAt',
  verifiedAt: 'verifiedAt'
};

exports.Prisma.GrievanceScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  grievanceId: 'grievanceId',
  convergenceProjectId: 'convergenceProjectId',
  raisedByUserId: 'raisedByUserId',
  raisedByType: 'raisedByType',
  issueTitle: 'issueTitle',
  issueDescription: 'issueDescription',
  status: 'status',
  level1DueAt: 'level1DueAt',
  level2DueAt: 'level2DueAt',
  assignedNodalOfficerId: 'assignedNodalOfficerId',
  assignedStateCellUserId: 'assignedStateCellUserId',
  finalAuthorityUserId: 'finalAuthorityUserId',
  resolutionText: 'resolutionText',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GrievanceActionLogScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  grievanceId: 'grievanceId',
  actorUserId: 'actorUserId',
  action: 'action',
  note: 'note',
  createdAt: 'createdAt'
};

exports.Prisma.OtpVerificationScalarFieldEnum = {
  id: 'id',
  purpose: 'purpose',
  channel: 'channel',
  target: 'target',
  otpHash: 'otpHash',
  verificationToken: 'verificationToken',
  attempts: 'attempts',
  expiresAt: 'expiresAt',
  verifiedAt: 'verifiedAt',
  createdAt: 'createdAt'
};

exports.Prisma.SLAEscalationScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  entityType: 'entityType',
  entityId: 'entityId',
  stage: 'stage',
  responsibleUserId: 'responsibleUserId',
  dueAt: 'dueAt',
  escalatedToUserId: 'escalatedToUserId',
  escalatedAt: 'escalatedAt',
  isResolved: 'isResolved',
  resolvedAt: 'resolvedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConvergenceProjectInspectionScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  convergenceProjectId: 'convergenceProjectId',
  districtOfficerId: 'districtOfficerId',
  visitDate: 'visitDate',
  latitude: 'latitude',
  longitude: 'longitude',
  geoTaggedImages: 'geoTaggedImages',
  remarks: 'remarks',
  issuesFound: 'issuesFound',
  actionRequired: 'actionRequired',
  nextVisitDate: 'nextVisitDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  MASTER_ADMIN: 'MASTER_ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
  DISTRICT_ADMIN: 'DISTRICT_ADMIN',
  BENEFICIARY_AGENCY: 'BENEFICIARY_AGENCY',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  COMPANY_MEMBER: 'COMPANY_MEMBER',
  NGO_ADMIN: 'NGO_ADMIN',
  NGO_MEMBER: 'NGO_MEMBER',
  PORTAL_ADMIN: 'PORTAL_ADMIN',
  CSR_ADMIN: 'CSR_ADMIN',
  ANALYST_REVIEWER: 'ANALYST_REVIEWER',
  COMPLIANCE_REVIEWER: 'COMPLIANCE_REVIEWER',
  FINANCE_USER: 'FINANCE_USER',
  APPROVER: 'APPROVER',
  AUDITOR: 'AUDITOR',
  AUTHORIZED_SIGNATORY: 'AUTHORIZED_SIGNATORY',
  CSR_RELATIONSHIP_MANAGER: 'CSR_RELATIONSHIP_MANAGER',
  JOINT_SECRETARY: 'JOINT_SECRETARY',
  PLANNING_SECRETARY: 'PLANNING_SECRETARY',
  DISTRICT_NODAL_OFFICER: 'DISTRICT_NODAL_OFFICER',
  STATE_CSR_CELL: 'STATE_CSR_CELL',
  CORPORATE_USER: 'CORPORATE_USER',
  IMPLEMENTING_AGENCY_USER: 'IMPLEMENTING_AGENCY_USER',
  GOVERNMENT_OFFICER: 'GOVERNMENT_OFFICER'
};

exports.UserAccountStatus = exports.$Enums.UserAccountStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED'
};

exports.VerificationStatus = exports.$Enums.VerificationStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
};

exports.NGOEmpanelmentStatus = exports.$Enums.NGOEmpanelmentStatus = {
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  PROFILE_SUBMITTED: 'PROFILE_SUBMITTED',
  DOCUMENT_REVIEW: 'DOCUMENT_REVIEW',
  FIELD_VERIFICATION: 'FIELD_VERIFICATION',
  EMPANELLED: 'EMPANELLED',
  EMPANELMENT_REJECTED: 'EMPANELMENT_REJECTED',
  SUSPENDED: 'SUSPENDED',
  BLACKLISTED: 'BLACKLISTED'
};

exports.OrganizationType = exports.$Enums.OrganizationType = {
  TRUST: 'TRUST',
  SOCIETY: 'SOCIETY',
  SECTION_8_COMPANY: 'SECTION_8_COMPANY',
  GOVERNMENT_ENTITY: 'GOVERNMENT_ENTITY',
  OTHER: 'OTHER'
};

exports.ProjectStatus = exports.$Enums.ProjectStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  FUNDED: 'FUNDED',
  COMPLETED: 'COMPLETED'
};

exports.MilestoneStatus = exports.$Enums.MilestoneStatus = {
  PENDING: 'PENDING',
  APPROVED_BY_NGO: 'APPROVED_BY_NGO',
  APPROVED_BY_COMPANY: 'APPROVED_BY_COMPANY',
  RELEASED: 'RELEASED'
};

exports.ReportType = exports.$Enums.ReportType = {
  CSR: 'CSR',
  IMPACT: 'IMPACT',
  BENEFICIARY: 'BENEFICIARY',
  ANNUAL: 'ANNUAL'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  IN_APP: 'IN_APP'
};

exports.OnboardingStatus = exports.$Enums.OnboardingStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  AUTO_CHECK_PENDING: 'AUTO_CHECK_PENDING',
  AUTO_CHECK_PASSED: 'AUTO_CHECK_PASSED',
  AUTO_CHECK_FAILED: 'AUTO_CHECK_FAILED',
  UNDER_ANALYST_REVIEW: 'UNDER_ANALYST_REVIEW',
  QUERY_RAISED: 'QUERY_RAISED',
  RESUBMITTED: 'RESUBMITTED',
  UNDER_COMPLIANCE_REVIEW: 'UNDER_COMPLIANCE_REVIEW',
  APPROVAL_PENDING: 'APPROVAL_PENDING',
  APPROVED: 'APPROVED',
  CONDITIONALLY_APPROVED: 'CONDITIONALLY_APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  EXPIRED: 'EXPIRED',
  REVERIFICATION_DUE: 'REVERIFICATION_DUE'
};

exports.DocumentType = exports.$Enums.DocumentType = {
  REGISTRATION_CERTIFICATE: 'REGISTRATION_CERTIFICATE',
  TRUST_DEED: 'TRUST_DEED',
  MOA: 'MOA',
  AOA: 'AOA',
  SOCIETY_RULES: 'SOCIETY_RULES',
  PAN_CARD: 'PAN_CARD',
  CSR1_CERTIFICATE: 'CSR1_CERTIFICATE',
  CERTIFICATE_12A: 'CERTIFICATE_12A',
  CERTIFICATE_80G: 'CERTIFICATE_80G',
  CANCELLED_CHEQUE: 'CANCELLED_CHEQUE',
  BANK_STATEMENT: 'BANK_STATEMENT',
  BANK_VERIFICATION_LETTER: 'BANK_VERIFICATION_LETTER',
  AUTHORIZED_SIGNATORY_PROOF: 'AUTHORIZED_SIGNATORY_PROOF',
  BOARD_RESOLUTION: 'BOARD_RESOLUTION',
  AUTHORITY_LETTER: 'AUTHORITY_LETTER',
  TRUSTEE_LIST: 'TRUSTEE_LIST',
  AUDITED_FINANCIAL_STATEMENT: 'AUDITED_FINANCIAL_STATEMENT',
  ANNUAL_REPORT: 'ANNUAL_REPORT',
  DECLARATION_FORM: 'DECLARATION_FORM',
  CONSENT_FORM: 'CONSENT_FORM',
  GST_CERTIFICATE: 'GST_CERTIFICATE',
  FCRA_CERTIFICATE: 'FCRA_CERTIFICATE',
  FCRA_PRIOR_PERMISSION: 'FCRA_PRIOR_PERMISSION',
  FC4_RETURN: 'FC4_RETURN',
  FCRA_BANK_PROOF: 'FCRA_BANK_PROOF',
  ITR7_ACKNOWLEDGEMENT: 'ITR7_ACKNOWLEDGEMENT',
  FORM_10B: 'FORM_10B',
  FORM_10BB: 'FORM_10BB',
  PROJECT_COMPLETION_CERTIFICATE: 'PROJECT_COMPLETION_CERTIFICATE',
  DONOR_REFERENCE_LETTER: 'DONOR_REFERENCE_LETTER',
  LITIGATION_DOCUMENT: 'LITIGATION_DOCUMENT',
  POWER_OF_ATTORNEY: 'POWER_OF_ATTORNEY',
  NGO_DARPAN_CERTIFICATE: 'NGO_DARPAN_CERTIFICATE',
  OTHER: 'OTHER'
};

exports.QueryStatus = exports.$Enums.QueryStatus = {
  OPEN: 'OPEN',
  RESPONDED: 'RESPONDED',
  RESOLVED: 'RESOLVED',
  ESCALATED: 'ESCALATED'
};

exports.TenantStatus = exports.$Enums.TenantStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  HIDDEN: 'HIDDEN',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED'
};

exports.OrganizationKind = exports.$Enums.OrganizationKind = {
  NGO: 'NGO',
  CSR_COMPANY: 'CSR_COMPANY',
  GOVERNMENT_DEPARTMENT: 'GOVERNMENT_DEPARTMENT',
  PORTAL_ADMIN_ORG: 'PORTAL_ADMIN_ORG'
};

exports.OrganizationOnboardingStatus = exports.$Enums.OrganizationOnboardingStatus = {
  REGISTERED: 'REGISTERED',
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  DOCUMENTS_PENDING: 'DOCUMENTS_PENDING',
  SUBMITTED_FOR_REVIEW: 'SUBMITTED_FOR_REVIEW',
  UNDER_VERIFICATION: 'UNDER_VERIFICATION',
  CLARIFICATION_REQUIRED: 'CLARIFICATION_REQUIRED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED'
};

exports.DocumentVerificationStatus = exports.$Enums.DocumentVerificationStatus = {
  UPLOADED: 'UPLOADED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  NEEDS_CORRECTION: 'NEEDS_CORRECTION',
  CLARIFICATION_REQUIRED: 'CLARIFICATION_REQUIRED'
};

exports.OrganizationStatus = exports.$Enums.OrganizationStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  HIDDEN: 'HIDDEN',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED'
};

exports.OnboardingReviewAction = exports.$Enums.OnboardingReviewAction = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CLARIFICATION_REQUIRED: 'CLARIFICATION_REQUIRED',
  SUSPENDED: 'SUSPENDED'
};

exports.RoleScope = exports.$Enums.RoleScope = {
  GLOBAL: 'GLOBAL',
  TENANT: 'TENANT',
  ORGANIZATION: 'ORGANIZATION'
};

exports.DocumentStatus = exports.$Enums.DocumentStatus = {
  PENDING_UPLOAD: 'PENDING_UPLOAD',
  UPLOADED: 'UPLOADED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  NEEDS_CORRECTION: 'NEEDS_CORRECTION'
};

exports.RiskLevel = exports.$Enums.RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  UNDER_REVIEW: 'UNDER_REVIEW'
};

exports.FundReleaseStatus = exports.$Enums.FundReleaseStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  RELEASED: 'RELEASED',
  REJECTED: 'REJECTED',
  ON_HOLD: 'ON_HOLD'
};

exports.CSRCategory = exports.$Enums.CSRCategory = {
  EDUCATION: 'EDUCATION',
  HEALTH: 'HEALTH',
  WATER: 'WATER',
  SANITATION: 'SANITATION',
  SKILL_DEVELOPMENT: 'SKILL_DEVELOPMENT',
  ENVIRONMENT: 'ENVIRONMENT',
  WOMEN_EMPOWERMENT: 'WOMEN_EMPOWERMENT',
  AGRICULTURE: 'AGRICULTURE',
  ANIMAL_HUSBANDRY: 'ANIMAL_HUSBANDRY',
  RURAL_DEVELOPMENT: 'RURAL_DEVELOPMENT',
  SPORTS: 'SPORTS',
  OTHER: 'OTHER'
};

exports.PriorityLevel = exports.$Enums.PriorityLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

exports.CSRRequirementStatus = exports.$Enums.CSRRequirementStatus = {
  DRAFT: 'DRAFT',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  CLARIFICATION_REQUIRED: 'CLARIFICATION_REQUIRED',
  FIELD_VERIFICATION_REQUIRED: 'FIELD_VERIFICATION_REQUIRED',
  VERIFIED: 'VERIFIED',
  MARKETPLACE_LISTED: 'MARKETPLACE_LISTED',
  NGO_APPLICATIONS_OPEN: 'NGO_APPLICATIONS_OPEN',
  COMPANY_INTEREST_RECEIVED: 'COMPANY_INTEREST_RECEIVED',
  NGO_SELECTED: 'NGO_SELECTED',
  AGREEMENT_PENDING: 'AGREEMENT_PENDING',
  AGREEMENT_SIGNED: 'AGREEMENT_SIGNED',
  EXECUTION_STARTED: 'EXECUTION_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETION_SUBMITTED: 'COMPLETION_SUBMITTED',
  COMPLETED: 'COMPLETED',
  IMPACT_REPORT_GENERATED: 'IMPACT_REPORT_GENERATED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

exports.NGOApplicationStatus = exports.$Enums.NGOApplicationStatus = {
  NGO_APPLIED: 'NGO_APPLIED',
  SHORTLISTED: 'SHORTLISTED',
  APPLICATION_REJECTED: 'APPLICATION_REJECTED',
  SELECTED_BY_COMPANY: 'SELECTED_BY_COMPANY',
  AGREEMENT_PENDING: 'AGREEMENT_PENDING',
  AGREEMENT_SIGNED: 'AGREEMENT_SIGNED',
  EXECUTION_STARTED: 'EXECUTION_STARTED',
  COMPLETED: 'COMPLETED',
  NOT_SELECTED: 'NOT_SELECTED'
};

exports.CompanyInterestStatus = exports.$Enums.CompanyInterestStatus = {
  INTEREST_SUBMITTED: 'INTEREST_SUBMITTED',
  UNDER_DISCUSSION: 'UNDER_DISCUSSION',
  FUNDING_APPROVED: 'FUNDING_APPROVED',
  WITHDRAWN: 'WITHDRAWN',
  NGO_SELECTED: 'NGO_SELECTED',
  CI_AGREEMENT_PENDING: 'CI_AGREEMENT_PENDING',
  CI_AGREEMENT_SIGNED: 'CI_AGREEMENT_SIGNED',
  FUND_RELEASED: 'FUND_RELEASED',
  CI_PROJECT_IN_PROGRESS: 'CI_PROJECT_IN_PROGRESS',
  CI_COMPLETED: 'CI_COMPLETED'
};

exports.AgreementStatus = exports.$Enums.AgreementStatus = {
  DRAFT_GENERATED: 'DRAFT_GENERATED',
  SENT_FOR_REVIEW: 'SENT_FOR_REVIEW',
  APPROVED_BY_GOVERNMENT: 'APPROVED_BY_GOVERNMENT',
  APPROVED_BY_COMPANY: 'APPROVED_BY_COMPANY',
  APPROVED_BY_NGO: 'APPROVED_BY_NGO',
  SIGNED: 'SIGNED',
  AGR_REJECTED: 'AGR_REJECTED',
  REVISION_REQUIRED: 'REVISION_REQUIRED'
};

exports.CSRFundMilestoneStatus = exports.$Enums.CSRFundMilestoneStatus = {
  FM_PENDING: 'FM_PENDING',
  RELEASE_REQUESTED: 'RELEASE_REQUESTED',
  FM_RELEASED: 'FM_RELEASED',
  UTILIZATION_SUBMITTED: 'UTILIZATION_SUBMITTED',
  FM_VERIFIED: 'FM_VERIFIED',
  FM_REJECTED: 'FM_REJECTED'
};

exports.ProgressReportStatus = exports.$Enums.ProgressReportStatus = {
  PR_SUBMITTED: 'PR_SUBMITTED',
  PR_VERIFIED: 'PR_VERIFIED',
  PR_REJECTED: 'PR_REJECTED',
  PR_REVISION_REQUIRED: 'PR_REVISION_REQUIRED'
};

exports.CorporateEnquiryStatus = exports.$Enums.CorporateEnquiryStatus = {
  SUBMITTED: 'SUBMITTED',
  TRACKING_ID_GENERATED: 'TRACKING_ID_GENERATED',
  RM_ASSIGNED: 'RM_ASSIGNED',
  RM_CONTACTED: 'RM_CONTACTED',
  ASSESSMENT_PENDING: 'ASSESSMENT_PENDING',
  ASSESSMENT_SUBMITTED_TO_JS: 'ASSESSMENT_SUBMITTED_TO_JS',
  JS_APPROVED: 'JS_APPROVED',
  JS_REJECTED: 'JS_REJECTED',
  NODAL_OFFICER_APPOINTED: 'NODAL_OFFICER_APPOINTED',
  MOU_PENDING: 'MOU_PENDING',
  MOU_SIGNED: 'MOU_SIGNED',
  PROJECT_ONBOARDED: 'PROJECT_ONBOARDED',
  EXECUTION_STARTED: 'EXECUTION_STARTED',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED'
};

exports.FeasibilityResult = exports.$Enums.FeasibilityResult = {
  FEASIBLE: 'FEASIBLE',
  PROCEED_WITH_CONDITIONS: 'PROCEED_WITH_CONDITIONS',
  NOT_FEASIBLE: 'NOT_FEASIBLE'
};

exports.ChecklistAnswer = exports.$Enums.ChecklistAnswer = {
  YES: 'YES',
  NO: 'NO',
  NA: 'NA'
};

exports.GovernmentPitchStatus = exports.$Enums.GovernmentPitchStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  RM_VERIFICATION_PENDING: 'RM_VERIFICATION_PENDING',
  RM_VERIFIED: 'RM_VERIFIED',
  JS_APPROVAL_PENDING: 'JS_APPROVAL_PENDING',
  JS_APPROVED: 'JS_APPROVED',
  JS_REJECTED: 'JS_REJECTED',
  PUBLIC_LISTED: 'PUBLIC_LISTED',
  CORPORATE_INTEREST_RECEIVED: 'CORPORATE_INTEREST_RECEIVED',
  NODAL_OFFICER_ASSIGNED: 'NODAL_OFFICER_ASSIGNED',
  MOU_PENDING: 'MOU_PENDING',
  MOU_SIGNED: 'MOU_SIGNED',
  PROJECT_ONBOARDED: 'PROJECT_ONBOARDED',
  COMPLETED: 'COMPLETED',
  CLOSED: 'CLOSED'
};

exports.SimpleMilestoneStatus = exports.$Enums.SimpleMilestoneStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

exports.GrievanceStatus = exports.$Enums.GrievanceStatus = {
  RAISED: 'RAISED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  LEVEL_1_REVIEW: 'LEVEL_1_REVIEW',
  LEVEL_1_RESOLVED: 'LEVEL_1_RESOLVED',
  ESCALATED_TO_STATE_CELL: 'ESCALATED_TO_STATE_CELL',
  LEVEL_2_RESOLVED: 'LEVEL_2_RESOLVED',
  ESCALATED_TO_JS_SECRETARY: 'ESCALATED_TO_JS_SECRETARY',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED'
};

exports.SLAStage = exports.$Enums.SLAStage = {
  RM_RESPONSE: 'RM_RESPONSE',
  JS_DECISION: 'JS_DECISION',
  SECRETARY_ESCALATION: 'SECRETARY_ESCALATION',
  GOVERNMENT_PITCH_VERIFICATION: 'GOVERNMENT_PITCH_VERIFICATION',
  GRIEVANCE_LEVEL_1: 'GRIEVANCE_LEVEL_1',
  GRIEVANCE_LEVEL_2: 'GRIEVANCE_LEVEL_2',
  STATIC_HELPDESK: 'STATIC_HELPDESK'
};

exports.Prisma.ModelName = {
  User: 'User',
  NGO: 'NGO',
  Company: 'Company',
  Project: 'Project',
  Milestone: 'Milestone',
  Chat: 'Chat',
  Message: 'Message',
  Document: 'Document',
  MatchScore: 'MatchScore',
  Report: 'Report',
  Notification: 'Notification',
  AuditLog: 'AuditLog',
  OnboardingApplication: 'OnboardingApplication',
  OnboardingStatusHistory: 'OnboardingStatusHistory',
  OnboardingQuery: 'OnboardingQuery',
  QueryResponse: 'QueryResponse',
  VerificationCheck: 'VerificationCheck',
  Tenant: 'Tenant',
  TenantFeature: 'TenantFeature',
  Organization: 'Organization',
  OrganizationDocument: 'OrganizationDocument',
  CSRCompanyProfile: 'CSRCompanyProfile',
  GovernmentDepartmentProfile: 'GovernmentDepartmentProfile',
  OnboardingReview: 'OnboardingReview',
  Permission: 'Permission',
  OrganizationRole: 'OrganizationRole',
  OrganizationRolePermission: 'OrganizationRolePermission',
  UserOrganizationRole: 'UserOrganizationRole',
  NgoDocument: 'NgoDocument',
  NgoContact: 'NgoContact',
  GovernanceMember: 'GovernanceMember',
  BankAccount: 'BankAccount',
  RiskScore: 'RiskScore',
  RiskFlag: 'RiskFlag',
  PaymentOrder: 'PaymentOrder',
  PaymentTransaction: 'PaymentTransaction',
  PaymentWebhookLog: 'PaymentWebhookLog',
  FundRelease: 'FundRelease',
  BeneficiaryProfile: 'BeneficiaryProfile',
  CSRRequirement: 'CSRRequirement',
  CSRRequirementDocument: 'CSRRequirementDocument',
  NGOApplication: 'NGOApplication',
  CompanyInterest: 'CompanyInterest',
  Agreement: 'Agreement',
  CSRFundMilestone: 'CSRFundMilestone',
  CSRProject: 'CSRProject',
  CSRFundRelease: 'CSRFundRelease',
  AssetHandover: 'AssetHandover',
  ProjectInspection: 'ProjectInspection',
  ImpactMetric: 'ImpactMetric',
  ProgressReport: 'ProgressReport',
  CompletionReport: 'CompletionReport',
  ImpactReport: 'ImpactReport',
  CorporateEnquiry: 'CorporateEnquiry',
  CorporateEnquiryInteraction: 'CorporateEnquiryInteraction',
  FeasibilityAssessment: 'FeasibilityAssessment',
  FeasibilityChecklistItem: 'FeasibilityChecklistItem',
  GovernmentPitch: 'GovernmentPitch',
  GovernmentPitchPhoto: 'GovernmentPitchPhoto',
  CorporatePitchInterest: 'CorporatePitchInterest',
  NodalOfficerAppointment: 'NodalOfficerAppointment',
  StandardMou: 'StandardMou',
  ConvergenceProject: 'ConvergenceProject',
  ProjectDeliverableMilestone: 'ProjectDeliverableMilestone',
  UtilizationCertificate: 'UtilizationCertificate',
  Grievance: 'Grievance',
  GrievanceActionLog: 'GrievanceActionLog',
  OtpVerification: 'OtpVerification',
  SLAEscalation: 'SLAEscalation',
  ConvergenceProjectInspection: 'ConvergenceProjectInspection'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
