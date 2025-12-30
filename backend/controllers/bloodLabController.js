import mongoose from "mongoose";
import Blood from "../models/bloodModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import Facility from "../models/facilityModel.js";
import BloodRequest from "../models/bloodRequestModel.js";

// ======================
// Constants
// ======================
const BLOOD_EXPIRY_DAYS = 42;

// ======================
// Helpers
// ======================
const pushHistory = async (
  facilityId,
  { eventType, description, referenceId }
) => {
  await Facility.findByIdAndUpdate(facilityId, {
    $push: {
      history: { eventType, description, date: new Date(), referenceId },
    },
  });
};

const parsePageLimit = (page, limit) => ({
  page: Math.max(Number(page) || 1, 1),
  limit: Math.max(Number(limit) || 10, 1),
});

// ======================
// Blood Lab Dashboard
// ======================
export const getBloodLabDashboard = async (req, res) => {
  try {
    const labId = req.user._id;
    const [camps, stock, facility] = await Promise.all([
      BloodCamp.find({ hospital: labId }).sort({ createdAt: -1 }),
      Blood.find({ bloodLab: labId }),
      Facility.findById(labId).select(
        "history name email phone address operatingHours status lastLogin"
      ),
    ]);

    const totalCamps = camps.length;
    const upcomingCamps = camps.filter((c) => c.status === "Upcoming").length;
    const completedCamps = camps.filter((c) => c.status === "Completed").length;
    const totalDonors = camps.reduce(
      (sum, c) => sum + (c.actualDonors || 0),
      0
    );
    const totalUnits = stock.reduce((sum, s) => sum + (s.quantity || 0), 0);

    res.json({
      success: true,
      data: {
        stats: {
          totalCamps,
          upcomingCamps,
          completedCamps,
          totalDonors,
          totalUnits,
        },
        recentCamps: camps.slice(0, 5),
        facility,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch blood lab dashboard data",
      });
  }
};

export const getBloodLabHistory = async (req, res) => {
  try {
    const labId = req.user._id;
    const lab = await Facility.findById(labId).select("history lastLogin");

    if (!lab)
      return res
        .status(404)
        .json({ success: false, message: "Blood Lab not found" });

    const activity = lab.history
      .filter((i) =>
        ["Blood Camp", "Verification", "Login", "Stock Update"].includes(
          i.eventType
        )
      )
      .sort((a, b) => b.date - a.date);

    const logins = lab.history
      .filter((i) => i.eventType === "Login")
      .map((i) => ({ date: i.date, ip: i.description || "Unknown" }));

    res.json({ success: true, data: { activity, logins } });
  } catch (error) {
    console.error("History Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch blood lab history" });
  }
};

// ======================
// Blood Camp CRUD
// ======================
export const createBloodCamp = async (req, res) => {
  try {
    const labId = req.user._id;
    const { title, description, date, time, location, expectedDonors } =
      req.body;

    const missing = [];
    if (!title) missing.push("title");
    if (!date) missing.push("date");
    if (!time?.start) missing.push("start time");
    if (!time?.end) missing.push("end time");
    if (!location?.venue) missing.push("venue");
    if (!location?.city) missing.push("city");
    if (!location?.state) missing.push("state");

    if (missing.length)
      return res
        .status(400)
        .json({
          success: false,
          message: `Missing required: ${missing.join(", ")}`,
        });

    const campDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (campDate < today)
      return res
        .status(400)
        .json({ success: false, message: "Camp date cannot be in the past" });
    if (time.start >= time.end)
      return res
        .status(400)
        .json({ success: false, message: "End time must be after start time" });

    const camp = await BloodCamp.create({
      hospital: labId,
      title,
      description,
      date: campDate,
      time,
      location,
      expectedDonors,
    });
    await pushHistory(labId, {
      eventType: "Blood Camp",
      description: `Organized "${title}" at ${location.venue}, ${location.city}`,
      referenceId: camp._id,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Blood camp created successfully",
        data: camp,
      });
  } catch (error) {
    console.error("Create Blood Camp Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getBloodLabCamps = async (req, res) => {
  try {
    const labId = req.user._id;
    const { status, page, limit } = req.query;
    const { page: currentPage, limit: perPage } = parsePageLimit(page, limit);

    const filter = { hospital: labId };
    if (status && status !== "all") filter.status = status;

    const skip = (currentPage - 1) * perPage;
    const [camps, total] = await Promise.all([
      BloodCamp.find(filter).sort({ date: -1 }).skip(skip).limit(perPage),
      BloodCamp.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        camps,
        pagination: {
          total,
          currentPage,
          totalPages: Math.ceil(total / perPage),
        },
      },
    });
  } catch (error) {
    console.error("Get Blood Camps Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch blood camps" });
  }
};

export const updateBloodCamp = async (req, res) => {
  try {
    const labId = req.user._id;
    const { id } = req.params;
    const { title, description, date, time, location, expectedDonors } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid camp ID" });

    const camp = await BloodCamp.findOne({ _id: id, hospital: labId });
    if (!camp)
      return res
        .status(404)
        .json({ success: false, message: "Camp not found" });

    if (title) camp.title = title;
    if (description !== undefined) camp.description = description;
    if (date) camp.date = new Date(date);
    if (time) camp.time = time;
    if (location) camp.location = location;
    if (expectedDonors) camp.expectedDonors = expectedDonors;

    await camp.save();
    await pushHistory(labId, {
      eventType: "Blood Camp",
      description: `Updated camp: ${camp.title}`,
      referenceId: camp._id,
    });

    res.json({
      success: true,
      message: "Camp updated successfully",
      data: camp,
    });
  } catch (error) {
    console.error("Update Blood Camp Error:", error);
    res.status(500).json({ success: false, message: "Failed to update camp" });
  }
};

export const deleteBloodCamp = async (req, res) => {
  try {
    const labId = req.user._id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid camp ID" });

    const camp = await BloodCamp.findOne({ _id: id, hospital: labId });
    if (!camp)
      return res
        .status(404)
        .json({ success: false, message: "Camp not found" });

    await camp.deleteOne();
    await pushHistory(labId, {
      eventType: "Blood Camp",
      description: `Deleted camp: ${camp.title}`,
    });

    res.json({ success: true, message: "Camp deleted successfully" });
  } catch (error) {
    console.error("Delete Camp Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete camp" });
  }
};

export const updateCampStatus = async (req, res) => {
  try {
    const labId = req.user._id;
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid camp ID" });

    const validStatuses = ["Upcoming", "Ongoing", "Completed", "Cancelled"];
    if (!validStatuses.includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });

    const camp = await BloodCamp.findOne({ _id: id, hospital: labId });
    if (!camp)
      return res
        .status(404)
        .json({ success: false, message: "Camp not found" });

    camp.status = status;
    await camp.save();
    await pushHistory(labId, {
      eventType: "Blood Camp",
      description: `Changed camp status to: ${status} - ${camp.title}`,
      referenceId: camp._id,
    });

    res.json({
      success: true,
      message: `Camp status updated to ${status}`,
      data: camp,
    });
  } catch (error) {
    console.error("Update Camp Status Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update camp status" });
  }
};

// ======================
// Blood Stock Management
// ======================
export const addBloodStock = async (req, res) => {
  try {
    const { bloodType, quantity } = req.body;
    const bloodLab = req.user._id;

    if (!bloodType || !quantity || quantity <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid bloodType or quantity" });

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + BLOOD_EXPIRY_DAYS);

    let stock = await Blood.findOne({ bloodGroup: bloodType, bloodLab });

    if (stock) {
      stock.quantity += Number(quantity);
      stock.expiryDate = expiryDate;
      await stock.save();
    } else {
      stock = await Blood.create({
        bloodGroup: bloodType,
        quantity: Number(quantity),
        expiryDate,
        bloodLab,
      });
    }

    await pushHistory(bloodLab, {
      eventType: "Stock Update",
      description: `Added ${quantity} units of ${bloodType}`,
    });
    res.json({
      success: true,
      message: "Blood stock added successfully",
      data: stock,
    });
  } catch (error) {
    console.error("Add Blood Stock Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add blood stock" });
  }
};

export const removeBloodStock = async (req, res) => {
  try {
    const { bloodType, quantity } = req.body;
    const bloodLab = req.user._id;

    if (!bloodType || !quantity || quantity <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid bloodType or quantity" });

    const stock = await Blood.findOne({ bloodGroup: bloodType, bloodLab });
    if (!stock)
      return res
        .status(404)
        .json({
          success: false,
          message: `No stock found for blood type ${bloodType}`,
        });
    if (stock.quantity < quantity)
      return res
        .status(400)
        .json({
          success: false,
          message: `Insufficient stock. Available: ${stock.quantity}`,
        });

    stock.quantity -= Number(quantity);
    if (stock.quantity === 0) await Blood.findByIdAndDelete(stock._id);
    else await stock.save();

    await pushHistory(bloodLab, {
      eventType: "Stock Update",
      description: `Removed ${quantity} units of ${bloodType}`,
    });
    res.json({
      success: true,
      message: "Blood stock removed successfully",
      data: { bloodType, remainingQuantity: stock.quantity },
    });
  } catch (error) {
    console.error("Remove Blood Stock Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to remove blood stock" });
  }
};

export const getBloodStock = async (req, res) => {
  try {
    const labId = req.user._id;
    const stock = await Blood.find({ bloodLab: labId }).sort({ bloodGroup: 1 });
    res.json({ success: true, data: stock });
  } catch (error) {
    console.error("Get Blood Stock Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stock" });
  }
};

// ======================
// Blood Request Management
// ======================
export const getLabBloodRequests = async (req, res) => {
  try {
    const labId = req.user._id;
    const requests = await BloodRequest.find({ labId })
      .populate("hospitalId", "name email phone address")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (err) {
    console.error("Get Lab Requests Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch blood requests" });
  }
};

export const updateBloodRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const labId = req.user._id;

    if (!["accept", "reject"].includes(action))
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });

    const request = await BloodRequest.findOne({ _id: id, labId }).populate(
      "hospitalId",
      "name"
    );
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    if (request.status !== "pending")
      return res
        .status(400)
        .json({ success: false, message: "Request already processed" });

    if (action === "accept") {
      const labStock = await Blood.findOne({
        bloodLab: labId,
        bloodGroup: request.bloodType,
      });
      if (!labStock || labStock.quantity < request.units)
        return res
          .status(400)
          .json({
            success: false,
            message: `Insufficient stock. Available: ${
              labStock?.quantity || 0
            }`,
          });

      labStock.quantity -= request.units;
      if (labStock.quantity === 0) await Blood.findByIdAndDelete(labStock._id);
      else await labStock.save();

      const hospitalStock = await Blood.findOne({
        hospital: request.hospitalId._id,
        bloodGroup: request.bloodType,
      });
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + BLOOD_EXPIRY_DAYS);

      if (hospitalStock) {
        hospitalStock.quantity += request.units;
        hospitalStock.expiryDate = expiryDate;
        await hospitalStock.save();
      } else {
        await Blood.create({
          bloodGroup: request.bloodType,
          quantity: request.units,
          expiryDate,
          hospital: request.hospitalId._id,
        });
      }

      await pushHistory(labId, {
        eventType: "Stock Update",
        description: `Transferred ${request.units} units of ${request.bloodType} to ${request.hospitalId.name}`,
        referenceId: request._id,
      });
      await pushHistory(request.hospitalId._id, {
        eventType: "Stock Update",
        description: `Received ${request.units} units of ${request.bloodType} from blood lab`,
        referenceId: request._id,
      });
    } else {
      await pushHistory(labId, {
        eventType: "Stock Update",
        description: `Rejected blood request for ${request.units} units of ${request.bloodType} from ${request.hospitalId.name}`,
        referenceId: request._id,
      });
    }

    request.status = action === "accept" ? "accepted" : "rejected";
    request.processedAt = new Date();
    await request.save();

    res.json({
      success: true,
      message: `Request ${action}ed successfully`,
      data: request,
    });
  } catch (err) {
    console.error("Update Request Status Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to process request" });
  }
};

// ======================
// Get All Approved Labs (Hospital)
export const getAllLabs = async (req, res) => {
  try {
    const labs = await Facility.find({
      facilityType: "blood-lab",
      status: "approved",
    }).select("name email phone address operatingHours");
    res.json({ success: true, data: labs });
  } catch (error) {
    console.error("Get Labs Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching blood labs" });
  }
};
