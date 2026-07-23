import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import { getJwtRefreshSecret, getJwtSecret } from "../config/env";
import { getRoleId } from "../types/role";
import { computeUserPermissions } from "../services/permissionService";

const JWT_SECRET = getJwtSecret();
const JWT_REFRESH_SECRET = getJwtRefreshSecret();

const generateTokens = (user: {
  id: string;
  email: string;
  roleId: number | null;
  organizationId?: string | null;
  accountStatus?: string | null;
}) => {
  const payload = {
    id: user.id,
    email: user.email,
    roleId: user.roleId,
    organizationId: user.organizationId,
    accountStatus: user.accountStatus
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, role: rawRole, profile } = req.body;
    const roleId = getRoleId(rawRole);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let organizationId: string | null = null;
    if (profile?.name) {
      const org = await prisma.organization.create({
        data: {
          name: profile.name,
          kind: roleId === 8 ? "CSR_COMPANY" : roleId === 7 ? "GOVERNMENT_DEPARTMENT" : "NGO",
          cin: profile.cin,
          pan: profile.pan,
          officialEmail: email,
          address: profile.address,
          district: profile.district
        }
      });
      organizationId = org.id;
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        roleId,
        organizationId,
        isVerified: false
      }
    });

    return res.status(201).json({
      message: "Registration successful. Please verify your email.",
      userId: user.id
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const otpRecord = await prisma.otpVerification.findFirst({
      where: { identifier: email, verified: false },
      orderBy: { createdAt: "desc" }
    });

    if (!otpRecord || new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true }
    });

    const tokens = generateTokens(user);
    return res.json({ message: "Email verified successfully", tokens, user });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ message: "OTP resent successfully" });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const userRecord = await prisma.user.findUnique({
      where: { email },
      include: { organization: true, role: true }
    });

    if (!userRecord) return res.status(401).json({ error: "Invalid email or password" });

    const validPassword = await bcrypt.compare(password, userRecord.passwordHash);
    if (!validPassword) return res.status(401).json({ error: "Invalid email or password" });

    const roleName = userRecord.role?.name || "SUPER_ADMIN";
    const roleSlug = roleName.toLowerCase().replace(/_/g, "-");

    const user = {
      ...userRecord,
      roleNumericId: userRecord.roleId,
      roleSlug,
      role: roleName
    };

    const tokens = generateTokens(userRecord);

    const permissionData = await computeUserPermissions({
      userId: userRecord.id,
      role: userRecord.role?.name,
      roleId: userRecord.roleId,
      organizationId: userRecord.organizationId
    });

    return res.json({
      message: "Login successful",
      ...tokens,
      user,
      permissions: permissionData.permissions,
      roles: permissionData.roles,
      roleDetails: permissionData.roleDetails,
      isAdmin: permissionData.isAdmin
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true, role: true }
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ error: "Refresh token is required" });

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ error: "Invalid token" });

    const tokens = generateTokens(user);
    return res.json(tokens);
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

export const logout = async (_req: Request, res: Response) => {
  return res.json({ message: "Logged out successfully" });
};
