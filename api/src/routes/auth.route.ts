import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;
