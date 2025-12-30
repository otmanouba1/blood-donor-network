import express from "express";
import { register, login, getProfile } from "../controllers/authContoller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ------------------ Auth Routes ------------------

// Register a new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Get profile (protected route)
router.get("/profile", protect, getProfile);

export default router;
