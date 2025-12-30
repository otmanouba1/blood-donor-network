// routes/hospitalBloodRoutes.js
import express from "express";
import Blood from "../models/bloodModel.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// -------------------- GET BLOOD UNITS --------------------
router.get(
  "/hospital/blood",
  authenticate,
  authorize("hospital", "admin"),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status, bloodType } = req.query;
      const filter = { hospital: req.user.id };
      if (status) filter.status = status;
      if (bloodType) filter.bloodType = bloodType;

      const bloodUnits = await Blood.find(filter)
        .sort({ collectionDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Blood.countDocuments(filter);

      res.json({
        success: true,
        bloodUnits,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      });
    } catch (error) {
      console.error("Get blood units error:", error);
      res.status(500).json({ success: false, message: "Server error while fetching blood units" });
    }
  }
);

// -------------------- GET BLOOD INVENTORY SUMMARY --------------------
router.get(
  "/hospital/blood/inventory",
  authenticate,
  authorize("hospital", "admin"),
  async (req, res) => {
    try {
      const inventory = await Blood.aggregate([
        {
          $match: {
            hospital: req.user._id,
            status: "available",
            expirationDate: { $gt: new Date() },
          },
        },
        {
          $group: {
            _id: "$bloodType",
            totalQuantity: { $sum: "$quantity" },
            units: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({ success: true, inventory });
    } catch (error) {
      console.error("Get inventory error:", error);
      res.status(500).json({ success: false, message: "Server error while fetching inventory" });
    }
  }
);

// -------------------- ADD BLOOD UNIT --------------------
router.post(
  "/hospital/blood",
  authenticate,
  authorize("hospital", "admin"),
  async (req, res) => {
    try {
      const { bloodType, quantity, collectionDate } = req.body;
      if (!bloodType || !quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: "Blood type and valid quantity required" });
      }

      const bloodUnit = new Blood({
        bloodType,
        quantity,
        collectionDate: collectionDate || new Date(),
        hospital: req.user.id,
        status: "available",
      });

      await bloodUnit.save();
      res.status(201).json({ success: true, message: "Blood unit added", bloodUnit });
    } catch (error) {
      console.error("Add blood unit error:", error);
      res.status(500).json({ success: false, message: "Server error while adding blood unit" });
    }
  }
);

// -------------------- UPDATE BLOOD UNIT --------------------
router.put(
  "/hospital/blood/:id",
  authenticate,
  authorize("hospital", "admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const bloodUnit = await Blood.findOne({ _id: id, hospital: req.user.id });
      if (!bloodUnit) return res.status(404).json({ success: false, message: "Blood unit not found" });

      Object.assign(bloodUnit, updates);
      if (updates.collectionDate) bloodUnit.expirationDate = undefined; // reset expiration
      await bloodUnit.save();

      res.json({ success: true, message: "Blood unit updated", bloodUnit });
    } catch (error) {
      console.error("Update blood unit error:", error);
      res.status(500).json({ success: false, message: "Server error while updating blood unit" });
    }
  }
);

// -------------------- DELETE BLOOD UNIT --------------------
router.delete(
  "/hospital/blood/:id",
  authenticate,
  authorize("hospital", "admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const bloodUnit = await Blood.findOneAndDelete({ _id: id, hospital: req.user.id });
      if (!bloodUnit) return res.status(404).json({ success: false, message: "Blood unit not found" });

      res.json({ success: true, message: "Blood unit deleted" });
    } catch (error) {
      console.error("Delete blood unit error:", error);
      res.status(500).json({ success: false, message: "Server error while deleting blood unit" });
    }
  }
);

// -------------------- GET EXPIRED BLOOD --------------------
router.get(
  "/hospital/blood/expired",
  authenticate,
  authorize("hospital", "admin"),
  async (req, res) => {
    try {
      const expiredBlood = await Blood.find({ hospital: req.user.id, expirationDate: { $lt: new Date() } });
      res.json({ success: true, expiredBlood, count: expiredBlood.length });
    } catch (error) {
      console.error("Get expired blood error:", error);
      res.status(500).json({ success: false, message: "Server error while fetching expired blood" });
    }
  }
);

// -------------------- MARK BLOOD AS USED --------------------
router.patch(
  "/hospital/blood/:id/use",
  authenticate,
  authorize("hospital", "admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { usedQuantity } = req.body;

      const bloodUnit = await Blood.findOne({ _id: id, hospital: req.user.id });
      if (!bloodUnit) return res.status(404).json({ success: false, message: "Blood unit not found" });
      if (bloodUnit.status !== "available") return res.status(400).json({ success: false, message: "Only available blood can be used" });
      if (bloodUnit.isExpired) return res.status(400).json({ success: false, message: "Expired blood cannot be used" });

      if (usedQuantity) {
        if (usedQuantity > bloodUnit.quantity) return res.status(400).json({ success: false, message: "Used quantity exceeds available quantity" });
        bloodUnit.quantity -= usedQuantity;
        if (bloodUnit.quantity === 0) bloodUnit.status = "used";
      } else {
        bloodUnit.status = "used";
      }

      await bloodUnit.save();
      res.json({ success: true, message: `Blood unit ${usedQuantity ? "partially" : "fully"} used`, bloodUnit });
    } catch (error) {
      console.error("Use blood error:", error);
      res.status(500).json({ success: false, message: "Server error while using blood" });
    }
  }
);

export default router;
