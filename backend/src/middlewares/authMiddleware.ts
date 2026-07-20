import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../types/role";
import { userHasAnyRole } from "../services/roleResolver";
import { getJwtSecret } from "../config/env";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: Role | null;
    /** Stable slug of the user's dynamic OrganizationRole (e.g. "joint-secretary"). */
    roleSlug?: string | null;
    roleId?: string | null;
    organizationId?: string | null;
    accountStatus?: string | null;
    ngoId?: string | null;
    companyId?: string | null;
    assignedDistrict?: string | null;
    beneficiaryProfileId?: string | null;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, getJwtSecret(), (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired access token" });
    }
    req.user = decoded as AuthenticatedRequest["user"];
    next();
  });
};

export const optionalAuthenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, getJwtSecret(), (err, decoded) => {
    if (!err) {
      req.user = decoded as AuthenticatedRequest["user"];
    }
    return next();
  });
};

/**
 * Legacy role-gate. Checks the principal against the allowed identities on BOTH
 * axes (base enum bucket + dynamic role slug), so a Joint Secretary — who is
 * `GOVERNMENT_OFFICER` at the enum level with slug "joint-secretary" — still
 * matches `authorizeRoles([Role.JOINT_SECRETARY])`.
 *
 * Prefer `checkPermission(...)` for new routes; this remains for existing gates.
 */
export const authorizeRoles = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    if (!userHasAnyRole(req.user, allowedRoles)) {
      return res.status(403).json({ error: `Forbidden: role '${req.user.role}' lacks permissions` });
    }

    next();
  };
};
