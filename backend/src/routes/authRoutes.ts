import { Router } from "express";
import { register, login, verifyOtp, refreshToken, logout } from "../controllers/authController";
import { getInvitation, acceptInvitation } from "../controllers/invitationController";
import { getCurrentUserPermissions, getModulePermissions, checkUserPermission } from "../controllers/permissionController";
import { validateRequest } from "../middlewares/validationMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";
import { authenticateToken } from "../middlewares/authMiddleware";
import { z } from "zod";
import { authRateLimiter, strictRateLimiter } from "../middlewares/rateLimitMiddleware";

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.union([z.number(), z.string()]),
    profile: z.object({
      name: z.string().min(2, "Name is required"),
      cin: z.string().optional(),
      pan: z.string().min(10).max(10),
      address: z.string().min(5),
      district: z.string().min(2)
    }).passthrough()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
  })
});

const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    otp: z.string().length(6, "OTP must be exactly 6 digits")
  })
});

const authRateLimit = authRateLimiter;
const otpRateLimit = strictRateLimiter;

router.post("/register", authRateLimit, validateRequest(registerSchema), asyncHandler(register));
router.post("/verify-otp", otpRateLimit, validateRequest(verifyOtpSchema), asyncHandler(verifyOtp));
router.post("/login", authRateLimit, validateRequest(loginSchema), asyncHandler(login));
router.post("/refresh", asyncHandler(refreshToken));
router.post("/logout", asyncHandler(logout));

// Officer activation via secure single-use invitation token
router.get("/invitations/:token", strictRateLimiter, asyncHandler(getInvitation));
router.post("/invitations/:token/activate", strictRateLimiter, asyncHandler(acceptInvitation));

// Dynamic permission routes
router.get("/permissions", authenticateToken, asyncHandler(getCurrentUserPermissions));
router.get("/permissions/:module", authenticateToken, asyncHandler(getModulePermissions));
router.post("/check-permission", authenticateToken, asyncHandler(checkUserPermission));

export default router;
