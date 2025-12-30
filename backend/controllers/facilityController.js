import Facility from "../models/facilityModel.js";
import bcrypt from "bcryptjs";

// ----------------------
// Constants
// ----------------------
const MAX_HISTORY_LENGTH = 50;


// ----------------------
// Profile
// ----------------------
export const getProfile = async (req, res) => {
  try {
    const facility = await Facility.findById(req.user.id)
      .select("-password -__v")
      .lean();
    if (!facility)
      return res
        .status(404)
        .json({ success: false, message: "Facility not found" });

    res.status(200).json({ success: true, data: facility });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while fetching profile" });
  }
};

export const updateProfile = async (req, res) => {
  const session = await Facility.startSession();
  session.startTransaction();

  try {
    const facilityId = req.user._id;
    const updates = { ...req.body };

    const existingFacility = await Facility.findById(facilityId).session(
      session
    );
    if (!existingFacility) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Facility not found" });
    }

    const allowedFields = [
      "name",
      "phone",
      "emergencyContact",
      "operatingHours",
      "services",
      "description",
      "website",
      "contactPerson",
      "password",
    ];

    const filteredUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key) && key !== "password")
        filteredUpdates[key] = updates[key];
    });

    if (updates.address && typeof updates.address === "object") {
      filteredUpdates.address = {
        ...existingFacility.address.toObject(),
        ...updates.address,
      };
    }

    if (updates.password) {
      if (updates.password.length < 6) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }
        filteredUpdates.password = updates.password;
    }

    const updatedFacility = await Facility.findByIdAndUpdate(
      facilityId,
      {
        ...filteredUpdates,
        $push: {
          history: {
            eventType: "Profile Update",
            description: "Facility profile updated",
            date: new Date(),
          },
        },
      },
      { new: true, runValidators: true, session, select: "-password -__v" }
    );

    if (updatedFacility.history.length > MAX_HISTORY_LENGTH) {
      updatedFacility.history = updatedFacility.history.slice(
        -MAX_HISTORY_LENGTH
      );
      await updatedFacility.save({ session });
    }

    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedFacility,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Update Facility Profile Error:", err);

    let message = "Failed to update profile";
    let errors = {};
    if (err.name === "ValidationError") {
      message = "Validation failed: Please check your input.";
      for (let field in err.errors) errors[field] = err.errors[field].message;
    }

    res.status(400).json({ success: false, message, errors });
  } finally {
    session.endSession();
  }
};

// ----------------------
// Dashboard
// ----------------------
export const getFacilityDashboard = async (req, res) => {
  try {
    const facilityId = req.user._id;

    const facility = await Facility.findById(facilityId)
      .select("name history facilityType")
      .lean();
    if (!facility)
      return res
        .status(404)
        .json({ success: false, message: "Facility not found" });

    const totalCamps = await BloodCamp.countDocuments({ facility: facilityId });

    const today = new Date();
    const upcomingCamps = await BloodCamp.countDocuments({
      facility: facilityId,
      date: { $gte: today },
    });

    const bloodSlots = await Slot.countDocuments({
      facility: facilityId,
      status: "available",
    });

    const activeRequests = await Request.countDocuments({
      facility: facilityId,
      status: "pending",
    });

    const recentHistory = facility.history
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    const dashboardData = {
      totalCamps,
      upcomingCamps,
      bloodSlots,
      activeRequests,
      totalHistory: facility.history.length,
      recentHistory,
    };

    res.status(200).json({
      success: true,
      facility: facility.name,
      facilityType: facility.facilityType,
      stats: dashboardData,
    });
  } catch (error) {
    console.error("Facility Dashboard Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching dashboard data" });
  }
};

// ----------------------
// List all Labs
// ----------------------
export const getAllLabs = async (req, res) => {
  try {
    const labs = await Facility.find({
      facilityType: "blood-lab",
      status: "approved",
    }).select("name email phone address operatingHours");

    res.status(200).json({ success: true, data: labs });
  } catch (err) {
    console.error("Get Labs Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching blood labs" });
  }
};
