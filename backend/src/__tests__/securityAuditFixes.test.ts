import { authenticateToken, optionalAuthenticateToken } from "../middlewares/authMiddleware";
import { checkPermission } from "../middlewares/accessControlMiddleware";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import { getJwtSecret } from "../config/env";

jest.mock("../config/db", () => ({
  user: {
    findUnique: jest.fn(),
  },
  auditLog: {
    create: jest.fn().mockResolvedValue({ id: "audit-1" }),
  },
}));

describe("Security Audit Remediation Regression Tests", () => {
  const secret = getJwtSecret();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("1. authenticateToken denies unverified users (isVerified = false)", async () => {
    const token = jwt.sign({ id: "user-unverified", tokenVersion: 1 }, secret);
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-unverified",
      email: "unverified@test.com",
      accountStatus: "PENDING_ACTIVATION",
      isVerified: false,
      deletedAt: null,
      tokenVersion: 1,
    });

    authenticateToken(req, res, next);

    // Wait for async jwt callback
    await new Promise((r) => setTimeout(r, 50));

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Account is inactive, unverified, suspended, or deleted" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("2. authenticateToken denies INACTIVE account status", async () => {
    const token = jwt.sign({ id: "user-inactive", tokenVersion: 1 }, secret);
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-inactive",
      email: "inactive@test.com",
      accountStatus: "INACTIVE",
      isVerified: true,
      deletedAt: null,
      tokenVersion: 1,
    });

    authenticateToken(req, res, next);
    await new Promise((r) => setTimeout(r, 50));

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("3. optionalAuthenticateToken does NOT populate req.user for unverified or inactive users", async () => {
    const token = jwt.sign({ id: "user-inactive", tokenVersion: 1 }, secret);
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res: any = {};
    const next = jest.fn();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-inactive",
      email: "inactive@test.com",
      accountStatus: "INACTIVE",
      isVerified: false,
      deletedAt: null,
      tokenVersion: 1,
    });

    optionalAuthenticateToken(req, res, next);
    await new Promise((r) => setTimeout(r, 50));

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  test("4. checkPermission recognizes Super Admin by roleId string or slug", async () => {
    const req: any = { user: { id: "admin-1", role: "SUPER_ADMIN", roleId: "1" } };
    const res: any = {};
    const next = jest.fn();

    const middleware = checkPermission("role:delete");
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
