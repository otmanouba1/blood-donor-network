// routes/facilityRoutes.js
import express from "express";
import {
  getAllLabs,
  getFacilityDashboard,
  getProfile,
  updateProfile,
} from "../controllers/facilityController.js";
import { protectFacility } from "../middlewares/facilityMiddleware.js";

const router = express.Router();

// ------------------ DASHBOARD ------------------
router.get("/dashboard", protectFacility, getFacilityDashboard);

// ------------------ PROFILE ------------------
router.get("/profile", protectFacility, getProfile);
router.put("/profile", protectFacility, updateProfile);

// ------------------ LABS ------------------
router.get("/labs", protectFacility, getAllLabs);

export default router;
