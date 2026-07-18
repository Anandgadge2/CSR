import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import { OrganizationKind, OrganizationOnboardingStatus, OrganizationStatus, VerificationStatus } from "@prisma/client";
import { Role } from "../types/role";
import { sendOtpEmail } from "../utils/mailer";
import { getJwtRefreshSecret, getJwtSecret } from "../config/env";
import { ensureOrganizationAdminRole } from "../utils/orgRoles";
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from "../utils/apiResponse";
import { generateNumericOtp, hashToken, constantTimeEqual } from "../utils/security";

const JWT_SECRET = getJwtSecret();
const JWT_REFRESH_SECRET = getJwtRefreshSecret();

const generateTokens = (user: {
  id: string;
  email: string;
  role: Role;
  organizationId?: string | null;
  accountStatus?: string | null;
  ngoId?: string | null;
  companyId?: string | null;
  assignedDistrict?: string | null;
  beneficiaryProfileId?: string | null;
}) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    accountStatus: user.accountStatus,
    ngoId: user.ngoId,
    companyId: user.companyId,
    assignedDistrict: user.assignedDistrict,
    beneficiaryProfileId: user.beneficiaryProfileId
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, role, profile } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return validationErrorResponse(res, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // OTP is generated with a CSPRNG; only its hash is persisted (see user.create below).
  const otpCode = generateNumericOtp(6);
  const otpCodeHash = hashToken(otpCode);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // ---- Validation phase (reads + early returns, before any writes) ----
  if (role === Role.NGO_ADMIN) {
    return validationErrorResponse(res, "Direct NGO registration is disabled. You must be invited by a corporate company.");
  }

  if (role === Role.COMPANY_ADMIN) {
    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { cin: profile.cin },
          { gst: profile.gst },
          { pan: profile.pan }
        ]
      }
    });
    if (existingCompany) {
      return validationErrorResponse(res, "Company already registered with this CIN, GST, or PAN");
    }
  } else if (role === Role.CORPORATE_USER) {
    // Corporate self-registration per convergence framework: MCA CIN + OTP.
    if (!profile.cin) {
      return validationErrorResponse(res, "MCA21 CIN is required for corporate registration");
    }
    const cinPattern = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
    if (!cinPattern.test(String(profile.cin).toUpperCase())) {
      return validationErrorResponse(res, "Valid CIN is required (format: L12345MH2024PLC123456)");
    }

    // Only the first registrant per company may self-register. If a company
    // already exists for this CIN, GST or PAN, later signups must be invited
    // by the company's administrator instead of self-registering.
    const existingCompany = await prisma.company.findFirst({
      where: {
        OR: [
          { cin: profile.cin },
          profile.gst ? { gst: profile.gst } : undefined,
          profile.pan ? { pan: profile.pan } : undefined
        ].filter(Boolean) as any
      }
    });
    if (existingCompany) {
      return validationErrorResponse(
        res,
        "A company is already registered with this CIN, GST, or PAN. Please contact your company administrator to be invited."
      );
    }
  }

  // ---- Write phase (atomic) ----
  // All records for a registration are created in a single transaction so a
  // mid-sequence failure never leaves orphaned company/organization/user rows.
  let createdNgoId: string | null = null;
  let createdCompanyId: string | null = null;
  let createdBeneficiaryProfileId: string | null = null;
  let createdOrganizationId: string | null = null;
  let userId: string;

  try {
    const result = await prisma.$transaction(async (tx) => {
      let ngoId: string | null = null;
      let companyId: string | null = null;
      let beneficiaryProfileId: string | null = null;
      let organizationId: string | null = null;

      if (role === Role.COMPANY_ADMIN) {
        const company = await tx.company.create({
          data: {
            name: profile.name,
            cin: profile.cin,
            gst: profile.gst || `TEMP-GST-${profile.pan || Math.random().toString(36).substring(7).toUpperCase()}`,
            pan: profile.pan,
            csrBudget: profile.csrBudget || 0,
            focusAreas: profile.focusAreas || [],
            contactInfo: profile.contactInfo || {},
            status: VerificationStatus.PENDING
          }
        });
        companyId = company.id;
        const organization = await tx.organization.create({
          data: {
            organizationType: OrganizationKind.CSR_COMPANY,
            name: profile.name,
            registrationNumber: profile.cin,
            pan: profile.pan,
            gst: profile.gst,
            email,
            phone: profile.contactInfo?.phone,
            address: profile.address,
            district: profile.district,
            taluka: profile.taluka,
            onboardingStatus: OrganizationOnboardingStatus.REGISTERED,
            status: OrganizationStatus.ACTIVE,
            sourceCompanyId: company.id
          }
        });
        organizationId = organization.id;
        await tx.company.update({ where: { id: company.id }, data: { organizationId: organization.id } });
      } else if (role === Role.CORPORATE_USER) {
        // Create the backing Company + Organization so onboarding can proceed
        // and an administrator can verify submitted documents before approval.
        const company = await tx.company.create({
          data: {
            name: profile.name,
            cin: profile.cin,
            gst: profile.gst || `TEMP-GST-${profile.pan || Math.random().toString(36).substring(7).toUpperCase()}`,
            pan: profile.pan,
            csrBudget: profile.csrBudget || 0,
            focusAreas: profile.focusAreas || [],
            contactInfo: profile.contactInfo || {},
            status: VerificationStatus.PENDING
          }
        });
        companyId = company.id;
        const organization = await tx.organization.create({
          data: {
            organizationType: OrganizationKind.CSR_COMPANY,
            name: profile.name,
            registrationNumber: profile.cin,
            cin: profile.cin,
            pan: profile.pan,
            gst: profile.gst,
            email,
            phone: profile.contactInfo?.phone,
            address: profile.address,
            district: profile.district,
            taluka: profile.taluka,
            onboardingStatus: OrganizationOnboardingStatus.REGISTERED,
            status: OrganizationStatus.ACTIVE,
            sourceCompanyId: company.id
          }
        });
        organizationId = organization.id;
        await tx.company.update({ where: { id: company.id }, data: { organizationId: organization.id } });
      }

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
          organizationId,
          isVerified: false,
          otpCodeHash,
          otpExpiresAt,
          ngoId,
          companyId
        }
      });

      if (role === Role.BENEFICIARY_AGENCY) {
        const profileRecord = await tx.beneficiaryProfile.create({
          data: {
            userId: user.id,
            agencyName: profile.name,
            agencyType: profile.contactInfo?.entityType || "Government Department",
            district: profile.district,
            taluka: profile.taluka,
            city: profile.city || null,
            village: profile.village || null,
            address: profile.address,
            contactPerson: profile.contactInfo?.contactPerson || profile.name,
            contactEmail: email,
            contactPhone: profile.contactInfo?.phone || "Not provided",
            designation: profile.contactInfo?.designation || profile.cin || null,
            website: profile.website || null
          }
        });
        beneficiaryProfileId = profileRecord.id;
        const organization = await tx.organization.create({
          data: {
            organizationType: OrganizationKind.GOVERNMENT_DEPARTMENT,
            name: profile.name,
            registrationNumber: profile.cin,
            pan: profile.pan,
            email,
            phone: profile.contactInfo?.phone,
            address: profile.address,
            district: profile.district,
            taluka: profile.taluka,
            onboardingStatus: OrganizationOnboardingStatus.REGISTERED,
            status: OrganizationStatus.ACTIVE,
            sourceBeneficiaryProfileId: profileRecord.id
          }
        });
        organizationId = organization.id;
        await tx.beneficiaryProfile.update({
          where: { id: profileRecord.id },
          data: { organizationId: organization.id }
        });
        await tx.user.update({
          where: { id: user.id },
          data: { organizationId: organization.id }
        });
      }

      return { userId: user.id, ngoId, companyId, beneficiaryProfileId, organizationId };
    });

    userId = result.userId;
    createdNgoId = result.ngoId;
    createdCompanyId = result.companyId;
    createdBeneficiaryProfileId = result.beneficiaryProfileId;
    createdOrganizationId = result.organizationId;
  } catch (txError) {
    console.error("[register] Transaction failed, no records were persisted.", txError);
    return errorResponse(res, "Registration failed. Please try again.", 500);
  }

  const user = { id: userId, email };

  if (createdOrganizationId) {
    await ensureOrganizationAdminRole(createdOrganizationId);
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "USER_REGISTER",
      details: { email, role, organizationId: createdOrganizationId, ngoId: createdNgoId, companyId: createdCompanyId, beneficiaryProfileId: createdBeneficiaryProfileId }
    }
  });

  try {
    await sendOtpEmail(email, otpCode);
    console.log(`[SMTP] Verification code successfully sent to ${email}`);
  } catch (mailError) {
    console.error(`[SMTP Error] Failed to send email to ${email}, rolling back registration.`, mailError);
    
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTER_FAILED_SMTP",
        details: { email, error: String(mailError) }
      }
    }).catch(() => {});

    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    if (createdNgoId) {
      await prisma.nGO.delete({ where: { id: createdNgoId } }).catch(() => {});
    }
    if (createdCompanyId) {
      await prisma.company.delete({ where: { id: createdCompanyId } }).catch(() => {});
    }
    if (createdBeneficiaryProfileId) {
      await prisma.beneficiaryProfile.delete({ where: { id: createdBeneficiaryProfileId } }).catch(() => {});
    }
    if (createdOrganizationId) {
      await prisma.userOrganizationRole.deleteMany({ where: { organizationId: createdOrganizationId } }).catch(() => {});
      await prisma.organizationRole.deleteMany({ where: { organizationId: createdOrganizationId } }).catch(() => {});
      await prisma.organization.delete({ where: { id: createdOrganizationId } }).catch(() => {});
    }

    return errorResponse(res, "Failed to deliver OTP verification email. Please verify your email is correct and active.", 500);
  }

  return successResponse(res, { userId: user.id, email: user.email }, "Registration successful. Please verify OTP sent to your email.", 201);
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  const { email, otpCode } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return notFoundResponse(res, "User not found");
  }

  if (user.isVerified) {
    return validationErrorResponse(res, "User is already verified");
  }

  if (!user.otpCodeHash || !user.otpExpiresAt) {
    return validationErrorResponse(res, "Invalid OTP code");
  }

  // Check expiry before comparing so an expired code is never treated as valid.
  if (new Date() > user.otpExpiresAt) {
    return validationErrorResponse(res, "OTP has expired. Please request a new one.");
  }

  // Constant-time hash comparison — never compare the raw code directly.
  if (!constantTimeEqual(user.otpCodeHash, hashToken(String(otpCode)))) {
    return validationErrorResponse(res, "Invalid OTP code");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      otpCodeHash: null,
      otpExpiresAt: null
    }
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "USER_VERIFY_OTP",
      details: { email }
    }
  });

  return successResponse(res, null, "Account verified successfully. You can now login.");
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;



  const user = await prisma.user.findUnique({
    where: { email },
    include: { ngo: true, company: true, beneficiaryProfile: true, roleRelation: true }
  });

  if (!user) {
    return unauthorizedResponse(res, "Invalid email or password");
  }

  if (!user.isVerified) {
    return forbiddenResponse(res, "Account not verified. Please verify OTP first.");
  }

  if (user.accountStatus !== "ACTIVE") {
    return forbiddenResponse(res, "Account is not active. Please contact your administrator.");
  }

  // Always verify against the bcrypt hash. A previous in-memory credential cache
  // was removed: it skipped bcrypt for up to an hour after a successful login,
  // so a changed or revoked password kept working until the cache expired.
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return unauthorizedResponse(res, "Invalid email or password");
  }

  if (user.role === Role.NGO_ADMIN || user.role === Role.NGO_MEMBER) {
    if (user.ngo && user.ngo.status === VerificationStatus.REJECTED) {
      return forbiddenResponse(res, "NGO organization verification was rejected. Access denied.");
    }
  } else if (user.role === Role.COMPANY_ADMIN || user.role === Role.COMPANY_MEMBER) {
    if (user.company && user.company.status === VerificationStatus.REJECTED) {
      return forbiddenResponse(res, "Company organization verification was rejected. Access denied.");
    }
  }

  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    accountStatus: user.accountStatus,
    ngoId: user.ngoId,
    companyId: user.companyId,
    assignedDistrict: user.assignedDistrict,
    beneficiaryProfileId: user.beneficiaryProfile?.id
  });

  const [organization] = await Promise.all([
    user.organizationId
      ? prisma.organization.findUnique({
          where: { id: user.organizationId },
          select: { id: true,  name: true, organizationType: true, onboardingStatus: true, status: true }
        })
      : Promise.resolve(null),
    prisma.user.update({
      where: { id: user.id },
      // Store only the hash of the refresh token so a DB leak cannot be replayed.
      data: { refreshTokenHash: hashToken(refreshToken) }
    }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        details: { ip: req.ip }
      }
    }).catch(err => {
      console.error("Failed to create login audit log:", err);
    })
  ]);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return successResponse(res, {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      roleId: user.roleId,
      // Dynamic (RBAC) role name — the base `role` enum is only SUPER_ADMIN /
      // GOVERNMENT_OFFICER / CORPORATE_USER, so workflow personas (Joint
      // Secretary, District Nodal Officer, etc.) live here. Clients route on this.
      dynamicRole: user.roleRelation?.name || null,
      organizationId: user.organizationId,
      accountStatus: user.accountStatus,
      organization,
      ngoId: user.ngoId,
      companyId: user.companyId,
      assignedDistrict: user.assignedDistrict,
      beneficiaryProfileId: user.beneficiaryProfile?.id,
      ngo: user.ngo,
      company: user.company
    }
  });
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return unauthorizedResponse(res, "Refresh token missing");
  }

  // Look up by the stored hash, never by the raw token.
  const user = await prisma.user.findFirst({
    where: { refreshTokenHash: hashToken(refreshToken) },
    include: { ngo: true, company: true, beneficiaryProfile: true }
  });

  if (!user) {
    return forbiddenResponse(res, "Invalid refresh token");
  }

  jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err: any) => {
    if (err) return forbiddenResponse(res, "Expired refresh token");

    // Rotate the refresh token on every use so a captured token cannot be
    // replayed after the legitimate client refreshes.
    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      accountStatus: user.accountStatus,
      ngoId: user.ngoId,
      companyId: user.companyId,
      assignedDistrict: user.assignedDistrict,
      beneficiaryProfileId: user.beneficiaryProfile?.id
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: hashToken(tokens.refreshToken) }
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return successResponse(res, { accessToken: tokens.accessToken });
  });
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await prisma.user.updateMany({
      where: { refreshTokenHash: hashToken(refreshToken) },
      data: { refreshTokenHash: null }
    });
  }

  res.clearCookie("refreshToken");
  return successResponse(res, null, "Logged out successfully");
};

export const getInvitationDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return validationErrorResponse(res, "Invitation token is required");
    }

    const invitation = await prisma.ngoInvitation.findUnique({
      where: { token },
      include: { company: true }
    });

    if (!invitation || invitation.status !== "PENDING") {
      return errorResponse(res, "Invitation is invalid or has already been used", 400);
    }

    return successResponse(res, {
      email: invitation.email,
      ngoName: invitation.ngoName,
      companyName: invitation.company.name,
      companyId: invitation.companyId
    }, "Invitation verified");
  } catch (error) {
    next(error);
  }
};

export const registerInvitedNgo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      token,
      password,
      pan,
      address,
      state,
      district,
      city,
      taluka,
      village,
      website,
      registrationNumber,
      darpanNumber,
      csr1Number
    } = req.body;

    if (!token) {
      return validationErrorResponse(res, "Invitation token is required");
    }

    const invitation = await prisma.ngoInvitation.findUnique({
      where: { token }
    });

    if (!invitation || invitation.status !== "PENDING") {
      return errorResponse(res, "Invitation is invalid or has already been used", 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email: invitation.email } });
    if (existingUser) {
      return validationErrorResponse(res, "Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Check if NGO already registered with registration number or PAN
    const existingNgo = await prisma.nGO.findFirst({
      where: {
        OR: [
          { registrationNumber },
          { pan }
        ]
      }
    });

    if (existingNgo) {
      return validationErrorResponse(res, "NGO already registered with this Registration Number or PAN");
    }

    // Create NGO
    const ngo = await prisma.nGO.create({
      data: {
        name: invitation.ngoName,
        registrationNumber,
        darpanNumber,
        csr1Number,
        pan,
        address,
        state: state || "Maharashtra",
        district,
        taluka,
        city: city || null,
        village: village || null,
        website: website || null,
        status: VerificationStatus.PENDING,
        officialEmail: invitation.email,
        invitedByCompanyId: invitation.companyId
      }
    });

    // Create Organization
    const organization = await prisma.organization.create({
      data: {
        organizationType: OrganizationKind.NGO,
        name: invitation.ngoName,
        registrationNumber,
        pan,
        email: invitation.email,
        address,
        district,
        taluka,
        onboardingStatus: OrganizationOnboardingStatus.REGISTERED,
        status: OrganizationStatus.ACTIVE,
        sourceNgoId: ngo.id
      }
    });

    await prisma.nGO.update({
      where: { id: ngo.id },
      data: { organizationId: organization.id }
    });

    // Create User
    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        passwordHash,
        role: Role.NGO_ADMIN,
        organizationId: organization.id,
        isVerified: true, // Email is verified since they completed register through email token
        ngoId: ngo.id,
        accountStatus: "ACTIVE"
      }
    });

    await ensureOrganizationAdminRole(organization.id);

    // Update invitation status to ACCEPTED
    await prisma.ngoInvitation.update({
      where: { token },
      data: { status: "ACCEPTED" }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "NGO_INVITATION_ACCEPTED",
        details: { email: invitation.email, ngoId: ngo.id }
      }
    });

    return successResponse(res, { userId: user.id, email: user.email }, "NGO registration successful. Please log in to complete onboarding.", 201);
  } catch (error) {
    next(error);
  }
};
