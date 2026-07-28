import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  clearAllNotifications,
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../controllers/notificationController";

const router = Router();

router.get("/", authenticateToken, listNotifications);
router.patch("/read-all", authenticateToken, markAllNotificationsRead);
router.patch("/:id/read", authenticateToken, markNotificationRead);
router.delete("/clear-all", authenticateToken, clearAllNotifications);
router.delete("/:id", authenticateToken, deleteNotification);

export default router;
