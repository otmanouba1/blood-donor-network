// routes/donorRoutes.js
import express from "express";
import {
  getDonorCamps,
  getDonorHistory,
  getDonorProfile,
  getDonorStats,
  updateDonorProfile,
} from "../controllers/donorController.js";

import { protectDonor } from "../middlewares/donorMiddleware.js";
import { scheduleDonation,getUpcomingDonations } from "../controllers/scheduleDonation.js";

const router = express.Router();

// ------------------ PROFILE ------------------
router.get("/profile", protectDonor, getDonorProfile);
router.put("/profile", protectDonor, updateDonorProfile);

// ------------------ CAMPS ------------------
router.get("/camps", protectDonor, getDonorCamps);

// ------------------ HISTORY ------------------
router.get("/history", protectDonor, getDonorHistory);

// ------------------ STATISTICS ------------------
router.get("/stats", protectDonor, getDonorStats);

router.post("/schedule", protectDonor, scheduleDonation);

router.get("/upcoming", protectDonor, getUpcomingDonations);


export default router;
