import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "../controllers/notificationController";

const router = Router();

router.get("/", authenticateToken, listNotifications);
router.patch("/read-all", authenticateToken, markAllNotificationsRead);
router.patch("/:id/read", authenticateToken, markNotificationRead);

export default router;
