import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Donor from "../models/donorModel.js";
import Facility from "../models/facilityModel.js";
import BloodCamp from "../models/bloodCampModel.js";
import Blood from "../models/bloodModel.js";

// ----------------------
// Constants
// ----------------------
const BLOOD_STOCK_EXPIRY_DAYS = 42;
const DONATION_COOLDOWN_DAYS = 90;

// ----------------------
// Helpers
// ----------------------
const pushHistory = async (
  facilityId,
  eventType,
  description,
  referenceId = null
) => {
  await Facility.findByIdAndUpdate(facilityId, {
    $push: {
      history: { eventType, description, date: new Date(), referenceId },
    },
  });
};

const parsePageLimit = (page, limit) => {
  
  return {
    page: Math.max(Number(page) || 1, 1),
    limit: Math.max(Number(limit) || 10, 1),
   
  };
};

const calculateEligibility = (lastDonation, age, weight) => {
  let nextDate = null;
  let status = "Eligible";

  if (lastDonation) {
    nextDate = new Date(lastDonation);
    nextDate.setDate(nextDate.getDate() + DONATION_COOLDOWN_DAYS);
    if (nextDate > new Date()) {
      const remainingDays = Math.ceil(
        (nextDate - new Date()) / (1000 * 60 * 60 * 24)
      );
      status = `Ineligible (Cooldown: ${remainingDays} days remaining)`;
    }
  }

  if (age < 18 || age > 65) status = "Ineligible (Age constraint)";
  if (weight < 45) status = "Ineligible (Weight constraint)";

  return { nextDate, status };
};


const addToBloodStock = async (labId, bloodType, quantity) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + BLOOD_STOCK_EXPIRY_DAYS);

  let stock = await Blood.findOne({ bloodGroup: bloodType, bloodLab: labId });
  if (stock) {
    stock.quantity += quantity;
    stock.expiryDate = expiryDate;
    await stock.save();
  } else {
    stock = await Blood.create({
      bloodGroup: bloodType,
      quantity,
      expiryDate,
      bloodLab: labId,
    });
  }
  return stock;
};

// ----------------------
// Donor Profile
// ----------------------
export const getDonorProfile = async (req, res) => {
  try {
    const donorId = req.donor.id || req.donor._id;
    const donor = await Donor.findById(donorId).select("-password -__v");
    
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    const eligibleToDonate = donor.lastDonationDate 
      ? (new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24) >= 90
      : true;

    const nextEligibleDate = donor.lastDonationDate 
      ? new Date(new Date(donor.lastDonationDate).getTime() + 90 * 24 * 60 * 60 * 1000)
      : null;

    res.status(200).json({
      success: true,
      donor: {
        ...donor.toObject(),
        eligibleToDonate,
        nextEligibleDate
      }
    });
  } catch (err) {
    console.error("Get Donor Profile Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch donor profile" });
  }
};

export const updateDonorProfile = async (req, res) => {
  try {
    const donorId = req.donor._id;
    const updateData = req.body;

    const donor = await Donor.findByIdAndUpdate(donorId, updateData, { new: true }).select("-password");
    
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      donor
    });
  } catch (err) {
    console.error("Update Donor Profile Error:", err);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

// ----------------------
// Donor Camps
// ----------------------
export const getDonorCamps = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 10 } = req.query;
    const { limit: lim, page: p } = parsePageLimit(page, limit);
    const skip = (p - 1) * limit;

    const filter = status !== "all" ? { status } : {};

    const [camps, total] = await Promise.all([
      BloodCamp.find(filter).sort({ date: 1 }).skip(skip).limit(lim),
      BloodCamp.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        camps,
        pagination: {
          total,
          currentPage: p,
          totalPages: Math.ceil(total / lim),
        },
      },
    });
  } catch (err) {
    console.error("Get Donor Camps Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch camps" });
  }
};

// ----------------------
// Donor Stats & History
// ----------------------
export const getDonorStats = async (req, res) => {
  try {
    const donorId = req.donor.id || req.donor._id;
    const donor = await Donor.findById(donorId);

    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    const totalDonations = donor.donationHistory.length;
    const livesImpacted = totalDonations * 3;
    const nextMilestone = Math.ceil((totalDonations + 1) / 5) * 5;
    const completionRate = (totalDonations / nextMilestone) * 100;

    res.json({
      success: true,
      totalDonations,
      livesImpacted,
      nextMilestone,
      completionRate
    });
  } catch (err) {
    console.error("Get Donor Stats Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

export const getDonorHistory = async (req, res) => {
  try {
    const donorId = req.donor.id || req.donor._id;
    const donor = await Donor.findById(donorId);

    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    const history = donor.donationHistory.map(d => ({
      _id: d._id,
      date: d.donationDate,
      facility: "Blood Donation Camp",
      bloodGroup: d.bloodGroup || donor.bloodGroup,
      quantity: d.quantity || 1,
      city: "City"
    }));

    res.json({
      success: true,
      history
    });
  } catch (err) {
    console.error("Get Donor History Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
};

// ----------------------
// Donor Search (Blood Lab)
// ----------------------
export const searchDonor = async (req, res) => {
  try {
    const { term } = req.query;
    if (!term)
      return res
        .status(400)
        .json({ success: false, message: "Search term required" });

    const donors = await Donor.find({
      $or: [
        { fullName: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
        { phone: { $regex: term, $options: "i" } },
      ],
    })
      .select(
        "fullName email phone bloodGroup lastDonationDate donationHistory"
      )
      .limit(20)
      .sort({ lastDonationDate: -1 });

    res.json({ success: true, data: donors });
  } catch (err) {
    console.error("Search Donor Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------
// Mark Donation
// ----------------------
export const markDonation = async (req, res) => {
  try {
    const donorId = req.params.id;
    const facilityId  = req.user._id;
    const { quantity = 1, remarks = "", bloodGroup } = req.body;

    const donor = await Donor.findById(donorId);
    if (!donor)
      return res
        .status(404)
        .json({ success: false, message: "Donor not found" });

    if (donor.lastDonationDate) {
      const lastDonation = new Date(donor.lastDonationDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      if (lastDonation > threeMonthsAgo) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Donor cannot donate yet. Minimum 3 months required between donations.",
          });
      }
    }

    donor.lastDonationDate = new Date();
    if (bloodGroup) donor.bloodGroup = bloodGroup;

    donor.donationHistory.push({
      donationDate: new Date(),
      facility: facilityId ,
      bloodGroup: bloodGroup || donor.bloodGroup,
      quantity,
      remarks,
      verified: true,
    });
    await donor.save();

    await pushHistory(
      facilityId ,
      "Donation",
      `Recorded donation from ${donor.fullName} - ${quantity} unit(s) of ${
        bloodGroup || donor.bloodGroup
      }`,
      donor._id
    );
    await addToBloodStock(labId, bloodGroup || donor.bloodGroup, quantity);

    res.json({
      success: true,
      message: "Donation recorded successfully",
      data: donor,
    });
  } catch (err) {
    console.error("Mark Donation Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ----------------------
// Recent Donations
// ----------------------
export const getRecentDonations = async (req, res) => {
  try {
    const facilityId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const [todayCount, weekCount, totalCount, recentDonors] = await Promise.all(
      [
        Donor.countDocuments({
          "donationHistory.facility": facilityId,
          "donationHistory.donationDate": { $gte: today },
        }),
        Donor.countDocuments({
          "donationHistory.facility": facilityId,
          "donationHistory.donationDate": { $gte: weekStart },
        }),
        Donor.aggregate([
          { $unwind: "$donationHistory" },
          { $match: { "donationHistory.facility": facilityId } },
          { $count: "total" },
        ]),
        Donor.find({ "donationHistory.facility": facilityId })
          .select("fullName bloodGroup donationHistory")
          .sort({ "donationHistory.donationDate": -1 })
          .limit(10),
      ]
    );

    const recentDonations = recentDonors
      .flatMap((donor) =>
        donor.donationHistory
          .filter((d) => d.facility.equals(facilityId))
          .slice(0, 3)
          .map((d) => ({
            donorName: donor.fullName,
            bloodGroup: d.bloodGroup,
            quantity: d.quantity,
            date: d.donationDate,
            remarks: d.remarks,
          }))
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        stats: {
          today: todayCount,
          thisWeek: weekCount,
          total: totalCount[0]?.total || 0,
        },
        donations: recentDonations,
      },
    });
  } catch (err) {
    console.error("Get Recent Donations Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch recent donations" });
  }
};
