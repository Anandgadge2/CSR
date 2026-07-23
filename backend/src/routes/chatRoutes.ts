import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { getOrCreateChat, sendMessage, getMessages, getUserChats } from "../controllers/chatController";

const router = Router();
router.use(authenticateToken);

router.post("/", getOrCreateChat);
router.post("/:chatId/messages", sendMessage);
router.get("/:chatId/messages", getMessages);
router.get("/", getUserChats);

export default router;
