import crypto from "crypto";
import bcrypt from "bcryptjs";
import prisma from "../config/db";

const INVITATION_TTL_HOURS = parseInt(process.env.INVITATION_TTL_HOURS || "72", 10);

export class InvitationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function buildActivationUrl(rawToken: string): string {
  const base = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${base}/activate?token=${rawToken}`;
}

export interface CreateInvitationInput {
  email: string;
  roleId?: number;
}

export async function createInvitation(input: CreateInvitationInput) {
  const existing = await prisma.userInvitation.findFirst({
    where: {
      email: input.email.toLowerCase(),
      status: "PENDING"
    }
  });

  if (existing) {
    throw new InvitationError("An invitation is already pending for this email address", 409);
  }

  const token = crypto.randomBytes(32).toString("hex");

  const invitation = await prisma.userInvitation.create({
    data: {
      email: input.email.toLowerCase(),
      token,
      status: "PENDING",
      roleId: input.roleId || null
    }
  });

  return { invitation, rawToken: token, activationUrl: buildActivationUrl(token) };
}

export async function getInvitationByToken(token: string) {
  if (!token || token.length < 32) {
    throw new InvitationError("Invalid invitation token", 400);
  }

  const invitation = await prisma.userInvitation.findUnique({
    where: { token }
  });

  if (!invitation || invitation.status !== "PENDING") {
    throw new InvitationError("Invitation not found or invalid", 404);
  }

  return invitation;
}

export async function acceptInvitation(input: { token: string; password: string }) {
  const invitation = await getInvitationByToken(input.token);

  if (!input.password || input.password.length < 8) {
    throw new InvitationError("Password must be at least 8 characters long", 400);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.$transaction(async (tx) => {
    await tx.userInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" }
    });

    const createdUser = await tx.user.create({
      data: {
        email: invitation.email,
        passwordHash,
        accountStatus: "ACTIVE",
        isVerified: true,
        roleId: invitation.roleId
      }
    });

    return createdUser;
  });

  return { user, invitation };
}
