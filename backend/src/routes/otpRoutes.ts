import { Router } from "express";
import rateLimit from "express-rate-limit";
import { sendOtpController, verifyOtpController } from "../controllers/otpController";

const router = Router();

const otpSendLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many OTP requests. Please try again later." },
});

router.post("/send", otpSendLimit, sendOtpController);
router.post("/verify", verifyOtpController);

export default router;
