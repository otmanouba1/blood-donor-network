// routes/bloodLabRoutes.js
import express from "express";
import {
  createBloodCamp,
  deleteBloodCamp,
  getBloodLabCamps,
  getBloodLabDashboard,
  getBloodLabHistory,
  updateBloodCamp,
  updateCampStatus,
  addBloodStock,
  removeBloodStock,
  getBloodStock,
  updateBloodRequestStatus,
  getLabBloodRequests,
  getAllLabs,
} from "../controllers/bloodLabController.js";

import {
  getRecentDonations,
  markDonation,
  searchDonor
} from "../controllers/donorController.js";

import { protectFacility } from "../middlewares/facilityMiddleware.js";

const router = express.Router();

// ------------------ Dashboard ------------------
router.get("/dashboard", protectFacility, getBloodLabDashboard);
router.get("/history", protectFacility, getBloodLabHistory);

// ------------------ Blood Camp Management ------------------
router.post("/camps", protectFacility, createBloodCamp);
router.get("/camps", protectFacility, getBloodLabCamps);
router.put("/camps/:id", protectFacility, updateBloodCamp);           // Update camp info
router.patch("/camps/:id/status", protectFacility, updateCampStatus); // Change camp status
router.delete("/camps/:id", protectFacility, deleteBloodCamp);

// ------------------ Blood Stock ------------------
router.post("/blood/add", protectFacility, addBloodStock);
router.post("/blood/remove", protectFacility, removeBloodStock);
router.get("/blood/stock", protectFacility, getBloodStock);

// ------------------ Blood Requests ------------------
router.get("/blood/requests", protectFacility, getLabBloodRequests);
router.put("/blood/requests/:id", protectFacility, updateBloodRequestStatus);

// ------------------ Labs for Hospitals ------------------
router.get("/labs", protectFacility, getAllLabs);

// ------------------ Donor & Donations ------------------
router.get("/donors/search", protectFacility, searchDonor);
router.post("/donors/donate/:id", protectFacility, markDonation);
router.get("/donations/recent", protectFacility, getRecentDonations);

export default router;
