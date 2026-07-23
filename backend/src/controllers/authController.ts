import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import prisma from "../config/db";
import { getJwtRefreshSecret, getJwtSecret } from "../config/env";
import { getRoleId } from "../types/role";
import { computeUserPermissions } from "../services/permissionService";

const JWT_SECRET = getJwtSecret();
const JWT_REFRESH_SECRET = getJwtRefreshSecret();

const OTP_TTL_MINUTES = 10;

// Reusable SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS || ""
  } : undefined,
});

/**
 * Generate a cryptographically secure 6-digit OTP.
 */
function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Send OTP email using the configured SMTP transport.
 */
async function sendOtpEmail(to: string, otpCode: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - MahaCSR Portal</title>
        <style>
          body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #334e68; }
          .container { max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); margin: 0 auto; }
          .header { background: #0d1c3a; padding: 30px; text-align: center; border-bottom: 4px solid #ff9800; }
          .header h1 { color: #ffffff; font-size: 22px; margin: 0; }
          .body { padding: 40px 30px; line-height: 1.6; }
          .otp-box { background: #f0f4f8; border: 2px dashed #0d1c3a; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0d1c3a; font-family: monospace; }
          .footer { background: #f0f4f8; text-align: center; padding: 20px; font-size: 12px; color: #627d98; border-top: 1px solid #d9e2ec; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MahaCSR Setu — Email Verification</h1>
          </div>
          <div class="body">
            <p>Dear User,</p>
            <p>Thank you for registering on the Maharashtra State CSR Convergence Portal. Please use the following OTP to verify your email address:</p>
            <div class="otp-box">
              <div class="otp-code">${otpCode}</div>
            </div>
            <p>This code is valid for <strong>${OTP_TTL_MINUTES} minutes</strong>. Do not share this code with anyone.</p>
            <p>If you did not request this verification, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2026 Government of Maharashtra | CSR Convergence Portal</p>
            <p>This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"MahaCSR Portal" <${process.env.SMTP_USER || "noreply@mahacsr.gov.in"}>`,
    to,
    subject: "Email Verification OTP — MahaCSR Portal",
    html,
  });
}

/**
 * Create OTP record in database and send email.
 */
async function createAndSendOtp(email: string): Promise<void> {
  const otpCode = generateOtp();
  const otpHash = await bcrypt.hash(otpCode, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpVerification.create({
    data: {
      identifier: email.trim().toLowerCase(),
      otpHash,
      expiresAt,
    },
  });

  // Log OTP in development for debugging
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV OTP] Email: ${email} | OTP: ${otpCode}`);
  }

  try {
    await sendOtpEmail(email, otpCode);
    console.log(`[Email] OTP sent to ${email}`);
  } catch (err: any) {
    console.error(`[Email] Failed to send OTP to ${email}:`, err.message);
    // Don't fail registration if email fails — OTP is logged in dev mode
  }
}

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

    const cleanPan = profile?.pan && profile.pan.trim().length > 0 ? profile.pan.trim().toUpperCase() : null;
    const cleanCin = profile?.cin && profile.cin.trim().length > 0 ? profile.cin.trim().toUpperCase() : null;

    if (cleanPan) {
      const existingPan = await prisma.organization.findFirst({ where: { pan: cleanPan } });
      if (existingPan) {
        return res.status(400).json({ error: "An organization with this PAN is already registered" });
      }
    }

    if (cleanCin) {
      const existingCin = await prisma.organization.findFirst({ where: { cin: cleanCin } });
      if (existingCin) {
        return res.status(400).json({ error: "An organization with this CIN is already registered" });
      }
    }

    let organizationId: string | null = null;
    if (profile?.name) {
      const org = await prisma.organization.create({
        data: {
          name: profile.name,
          kind: roleId === 8 ? "CSR_COMPANY" : roleId === 7 ? "GOVERNMENT_DEPARTMENT" : "NGO",
          cin: cleanCin,
          pan: cleanPan,
          officialEmail: email,
          address: profile.address || null,
          district: profile.district || null
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

    // Generate OTP, store in DB, and send verification email
    await createAndSendOtp(email);

    return res.status(201).json({
      message: "Registration successful. A 6-digit verification code has been sent to your email.",
      userId: user.id
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, otpCode } = req.body;
    const code = otp || otpCode;
    const normalizedEmail = email.trim().toLowerCase();

    if (!code) {
      return res.status(400).json({ error: "OTP code is required" });
    }

    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        identifier: normalizedEmail,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: "OTP expired or not found. Please request a new one." });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(400).json({ error: "Too many invalid attempts. Please request a new OTP." });
    }

    const isMatch = await bcrypt.compare(code, otpRecord.otpHash);
    if (!isMatch) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return res.status(400).json({ error: "Invalid OTP code. Please try again." });
    }

    // Mark OTP as verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    // Mark user as verified
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return res.status(404).json({ error: "User not found" });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, accountStatus: "ACTIVE" }
    });

    const tokens = generateTokens(user);
    return res.json({ message: "Email verified successfully", ...tokens, user });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Rate limit: max 5 OTP sends per hour
    const recentCount = await prisma.otpVerification.count({
      where: {
        identifier: normalizedEmail,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (recentCount >= 5) {
      return res.status(429).json({ error: "Too many OTP requests. Please try again later." });
    }

    await createAndSendOtp(normalizedEmail);

    return res.json({ message: "A new OTP has been sent to your email." });
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
