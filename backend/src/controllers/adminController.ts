import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { ROLE_ID, getRoleId } from "../types/role";
import { createInvitation } from "../services/invitationService";

export const getAdminOverview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const where = {};
    const [
      users,
      pendingNgos,
      pendingCompanies,
      submittedProjects,
      auditLogs
    ] = await Promise.all([
      prisma.user.count({ where }),
      prisma.organization.count({ where: { kind: "NGO" } }),
      prisma.organization.count({ where: { kind: "CSR_COMPANY" } }),
      prisma.project.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
      prisma.auditLog.count({ where })
    ]);

    return res.json({ users, pendingNgos, pendingCompanies, submittedProjects, auditLogs });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || "";

    const where: any = { deletedAt: null };
    if (search) {
      where.email = { contains: search, mode: "insensitive" };
    }
    if (status) {
      where.accountStatus = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          organizationId: true,
          email: true,
          firstName: true,
          lastName: true,
          mobile: true,
          designation: true,
          accountStatus: true,
          isVerified: true,
          createdAt: true,
          roleId: true,
          role: { select: { id: true, name: true } },
          organization: { select: { id: true, name: true, kind: true } },
          officerProfile: { select: { designation: true, fullName: true, department: true, district: true, taluka: true, mobile: true } }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password, roleId: inputRoleId, role: inputRole, accountStatus = "ACTIVE", organizationId, firstName: rawFirstName, lastName: rawLastName, fullName, mobile: rawMobile, designation: rawDesignation, department: rawDepartment, district, taluka } = req.body;
    const firstName = String(rawFirstName || (fullName ? String(fullName).trim().split(/\s+/)[0] : "")).trim();
    const lastName = String(rawLastName || (fullName ? String(fullName).trim().split(/\s+/).slice(1).join(" ") : "")).trim();
    const mobile = String(rawMobile || "").trim();
    const designation = String(rawDesignation || "").trim();
    const department = String(rawDepartment || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ error: "A valid official email is required." });
    if (!firstName || !lastName) return res.status(400).json({ error: "First name and last name are required." });
    if (!designation) return res.status(400).json({ error: "Designation is required." });
    if (!department) return res.status(400).json({ error: "Department / organisation is required." });
    if (!/^\+?[1-9]\d{9,14}$/.test(mobile)) return res.status(400).json({ error: "A valid mobile number is required." });

    const requestedRole = inputRoleId ?? inputRole;
    let roleId = getRoleId(requestedRole);
    if (!roleId && typeof requestedRole === "string" && requestedRole.trim()) {
      const dynamicRole = await prisma.role.findFirst({ where: { name: requestedRole.trim() }, select: { id: true } });
      roleId = dynamicRole?.id ?? null;
    }
    if (!roleId || !Number.isInteger(roleId)) return res.status(400).json({ error: "A valid platform role is required." });
    const roleRecord = await prisma.role.findUnique({ where: { id: roleId }, select: { id: true, name: true } });
    if (!roleRecord) return res.status(400).json({ error: "Selected role does not exist." });
    if ((roleId === ROLE_ID.DISTRICT_NODAL_OFFICER || roleId === ROLE_ID.DISTRICT_NODAL_CONSULTANT) && !String(district || "").trim()) {
      return res.status(400).json({ error: "A district is required for district nodal officers and consultants." });
    }

    // Check active non-deleted user with this email
    const activeUser = await prisma.user.findFirst({ where: { email: normalizedEmail, deletedAt: null } });
    if (activeUser) return res.status(409).json({ error: "Email already registered" });

    // Release legacy soft-deleted user record occupying exact email if present
    const legacyDeletedUser = await prisma.user.findFirst({ where: { email: normalizedEmail, NOT: { deletedAt: null } } });
    if (legacyDeletedUser) {
      await prisma.user.update({
        where: { id: legacyDeletedUser.id },
        data: {
          email: `${normalizedEmail}.deleted.${legacyDeletedUser.id.slice(0, 8)}_${Date.now()}`,
          mobile: legacyDeletedUser.mobile ? `${legacyDeletedUser.mobile}_del_${Date.now()}` : null
        }
      });
    }

    if (mobile) {
      const activeMobile = await prisma.user.findFirst({ where: { mobile, deletedAt: null } });
      if (activeMobile) return res.status(409).json({ error: "Mobile number is already registered." });

      const legacyDeletedMobileUser = await prisma.user.findFirst({ where: { mobile, NOT: { deletedAt: null } } });
      if (legacyDeletedMobileUser) {
        await prisma.user.update({
          where: { id: legacyDeletedMobileUser.id },
          data: { mobile: `${mobile}_del_${Date.now()}` }
        });
      }
    }
    if (organizationId) {
      const organization = await prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true } });
      if (!organization) return res.status(400).json({ error: "Selected organization does not exist." });
    }

    const useInvitation = !password;
    const passwordHash = await bcrypt.hash(
      useInvitation ? crypto.randomBytes(32).toString("hex") : password,
      10
    );

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        roleId,
        organizationId: organizationId || null,
        firstName: firstName || null,
        lastName: lastName || null,
        mobile: mobile || null,
        designation,
        accountStatus: useInvitation ? "PENDING_ACTIVATION" : (accountStatus as any),
        isVerified: !useInvitation,
        ...(district || taluka || designation || firstName || lastName ? {
          officerProfile: {
            create: {
              fullName: [firstName, lastName].filter(Boolean).join(" "),
              designation,
              department,
              district: district || null,
              taluka: taluka || null,
              mobile: mobile || null
            }
          }
        } : {})
      },
      select: {
        id: true,
        email: true,
        roleId: true,
        accountStatus: true,
        isVerified: true,
        createdAt: true,
        firstName: true,
        lastName: true,
        designation: true,
        mobile: true,
        officerProfile: { select: { fullName: true, designation: true, department: true, district: true, taluka: true } }
      }
    });

    return res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/** Bulk import creates invitation-backed accounts; credentials are never
 * generated or returned in plaintext. Relationship Managers join the eligible
 * assignment pool only after accepting and verifying their account. */
export const importAdminUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rows: unknown[] = Array.isArray(req.body?.users) ? req.body.users : [];
    if (!rows.length || rows.length > 200) return res.status(400).json({ error: "Provide between 1 and 200 users to import." });
    const imported: { email: string; roleId: number; activationUrl: string }[] = [];
    const rejected: { email: string; reason: string }[] = [];
    for (const row of rows) {
      const email = typeof (row as any)?.email === "string" ? (row as any).email.trim().toLowerCase() : "";
      const roleId = Number((row as any)?.roleId || ROLE_ID.RELATIONSHIP_MANAGER);
      if (!/^\S+@\S+\.\S+$/.test(email) || !Number.isInteger(roleId)) { rejected.push({ email: email || "(invalid)", reason: "Valid email and roleId are required." }); continue; }
      try {
        const invitation = await createInvitation({ email, roleId });
        imported.push({ email, roleId, activationUrl: invitation.activationUrl });
      } catch (error: any) { rejected.push({ email, reason: error?.message || "Could not create invitation." }); }
    }
    await prisma.auditLog.create({ data: { actorUserId: req.user!.id, userId: req.user!.id, action: "ADMIN_USER_BULK_IMPORT", entityType: "UserInvitation", details: { imported: imported.length, rejected: rejected.length } as any } });
    return res.status(201).json({ success: true, data: { imported, rejected } });
  } catch (error) { next(error); }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { accountStatus, roleId: inputRoleId, role: inputRole, firstName: rawFirstName, lastName: rawLastName, mobile: rawMobile, designation: rawDesignation, department: rawDepartment, district, taluka } = req.body;
    const firstName = rawFirstName === undefined ? undefined : String(rawFirstName).trim();
    const lastName = rawLastName === undefined ? undefined : String(rawLastName).trim();
    const mobile = rawMobile === undefined ? undefined : String(rawMobile).trim();
    const designation = rawDesignation === undefined ? undefined : String(rawDesignation).trim();
    const department = rawDepartment === undefined ? undefined : String(rawDepartment).trim();
    if (mobile !== undefined && !/^\+?[1-9]\d{9,14}$/.test(mobile)) return res.status(400).json({ error: "A valid mobile number is required." });
    if (firstName !== undefined && !firstName) return res.status(400).json({ error: "First name is required." });
    if (lastName !== undefined && !lastName) return res.status(400).json({ error: "Last name is required." });
    if (designation !== undefined && !designation) return res.status(400).json({ error: "Designation is required." });
    if (department !== undefined && !department) return res.status(400).json({ error: "Department / organisation is required." });
    if (mobile !== undefined) {
      const duplicateMobile = await prisma.user.findFirst({ where: { mobile, NOT: { id } }, select: { id: true } });
      if (duplicateMobile) return res.status(409).json({ error: "Mobile number is already registered." });
    }

    const requestedRole = inputRoleId ?? inputRole;
    let resolvedRoleId = requestedRole === undefined ? undefined : getRoleId(requestedRole);
    if (requestedRole !== undefined && !resolvedRoleId && typeof requestedRole === "string" && requestedRole.trim()) {
      const dynamicRole = await prisma.role.findFirst({ where: { name: requestedRole.trim() }, select: { id: true } });
      resolvedRoleId = dynamicRole?.id;
    }
    if (requestedRole !== undefined && (!resolvedRoleId || !Number.isInteger(resolvedRoleId))) {
      return res.status(400).json({ error: "Selected role does not exist." });
    }
    if (resolvedRoleId && (resolvedRoleId === ROLE_ID.DISTRICT_NODAL_OFFICER || resolvedRoleId === ROLE_ID.DISTRICT_NODAL_CONSULTANT) && district !== undefined && !String(district).trim()) {
      return res.status(400).json({ error: "A district is required for district nodal officers and consultants." });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(accountStatus ? { accountStatus } : {}),
        ...(resolvedRoleId ? { roleId: resolvedRoleId } : {}),
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(mobile !== undefined ? { mobile } : {}),
        ...(designation !== undefined ? { designation } : {}),
        ...(district !== undefined ? { officerProfile: { upsert: { create: { fullName: [firstName, lastName].filter(Boolean).join(" ") || "Official User", designation: designation || null, department: department || null, district: String(district || "").trim() || null, taluka: String(taluka || "").trim() || null, mobile: mobile || null }, update: { ...(firstName !== undefined || lastName !== undefined ? { fullName: [firstName, lastName].filter(Boolean).join(" ") || "Official User" } : {}), ...(designation !== undefined ? { designation } : {}), ...(department !== undefined ? { department } : {}), district: String(district || "").trim() || null, taluka: String(taluka || "").trim() || null, ...(mobile !== undefined ? { mobile } : {}) } } } } : (designation !== undefined || department !== undefined || mobile !== undefined || firstName !== undefined || lastName !== undefined ? { officerProfile: { upsert: { create: { fullName: [firstName, lastName].filter(Boolean).join(" ") || "Official User", designation: designation || null, department: department || null, mobile: mobile || null }, update: { ...(firstName !== undefined || lastName !== undefined ? { fullName: [firstName, lastName].filter(Boolean).join(" ") || "Official User" } : {}), ...(designation !== undefined ? { designation } : {}), ...(department !== undefined ? { department } : {}), ...(mobile !== undefined ? { mobile } : {}) } } } } : {}))
      },
      select: {
        id: true,
        email: true,
        roleId: true,
        accountStatus: true,
        firstName: true,
        lastName: true,
        designation: true,
        mobile: true,
        officerProfile: { select: { fullName: true, designation: true, department: true, district: true, taluka: true } },
        updatedAt: true
      }
    });

    return res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "User not found" });

    const timestamp = Date.now();
    const anonymizedEmail = existing.email.includes(".deleted.") 
      ? existing.email 
      : `${existing.email}.deleted.${timestamp}`;
    const anonymizedMobile = existing.mobile 
      ? `${existing.mobile}_del_${timestamp}` 
      : null;

    await prisma.user.update({
      where: { id },
      data: {
        email: anonymizedEmail,
        mobile: anonymizedMobile,
        accountStatus: "DELETED",
        deletedAt: new Date(),
        deletedById: req.user?.id || null
      }
    });

    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
