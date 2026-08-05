import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import prisma from "../config/db";
import {
  acceptInvitation as activateInvitation,
  getInvitationByToken,
  InvitationError
} from "../services/invitationService";

export const inviteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  return res.json({ success: true, message: "Invitation sent" });
};

export const getInvitation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const invitation = await getInvitationByToken(req.params.token);
    const organization = invitation.organizationId
      ? await prisma.organization.findUnique({
          where: { id: invitation.organizationId },
          select: { name: true, kind: true }
        })
      : null;

    return res.json({
      success: true,
      data: {
        email: invitation.email,
        organizationName: organization?.name || null,
        organizationType: organization?.kind || null,
        expiresAt: invitation.expiresAt.toISOString(),
        purpose: invitation.agencySubLoginId ? "NGO_ONBOARDING" : "USER_ACTIVATION"
      }
    });
  } catch (error) {
    if (error instanceof InvitationError) return res.status(error.status).json({ error: error.message });
    next(error);
  }
};

export const acceptInvitation = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await activateInvitation({ token: req.params.token, password: req.body.password });
    return res.json({
      success: true,
      message: "Account activated. Sign in with your email and new password to complete NGO onboarding.",
      data: { email: result.user.email, onboardingRequired: Boolean(result.invitation.agencySubLoginId) }
    });
  } catch (error) {
    if (error instanceof InvitationError) return res.status(error.status).json({ error: error.message });
    next(error);
  }
};
