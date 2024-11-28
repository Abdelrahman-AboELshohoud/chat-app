import express from "express";
import {
  sendMessage,
  getMessages,
  getConversations,
} from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/conversations/:id", authMiddleware, getConversations);
router.get("/:id/:receiverId", authMiddleware, getMessages);
router.post("/:id/:receiverId", authMiddleware, sendMessage);

export default router;
