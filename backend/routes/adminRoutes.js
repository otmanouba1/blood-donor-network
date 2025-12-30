// routes/adminRouter.js
import express from "express";
import asyncHandler from "express-async-handler";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getAllFacilities,
  approveFacility,
  rejectFacility,
  getDashboardStats,
  getAllDonors,
} from "../controllers/adminController.js";

const router = express.Router();

// Apply protect + authorize middleware globally for all admin routes
router.use(protect, authorize("admin"));

router.get("/facilities", getAllFacilities);
router.put("/facility/approve/:id", approveFacility);
router.put("/facility/reject/:id", rejectFacility);
router.get("/dashboard", getDashboardStats);
router.get("/donors", getAllDonors);

export default router;
