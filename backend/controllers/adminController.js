import Donor from "../models/donorModel.js";
import Facility from "../models/facilityModel.js";

// 📊 Get Dashboard Overview Stats
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalDonors,
      totalFacilities,
      pendingFacilities,
      approvedFacilities,
      activeDonors,
      donationAggregation,
    ] = await Promise.all([
      Donor.countDocuments(),
      Facility.countDocuments(),
      Facility.countDocuments({ status: "pending" }),
      Facility.countDocuments({ status: "approved" }),
      Donor.countDocuments({ isEligible: true }),
      Donor.aggregate([
        {
          $project: {
            donationCount: { $size: { $ifNull: ["$donationHistory", []] } },
          },
        },
        {
          $group: {
            _id: null,
            totalDonations: { $sum: "$donationCount" },
          },
        },
      ]),
    ]);

    const totalDonations = donationAggregation[0]?.totalDonations || 0;

    res.status(200).json({
      totalDonors,
      totalFacilities,
      approvedFacilities,
      pendingFacilities,
      totalDonations,
      activeDonors,
      upcomingCamps: 3, 
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// Get All Donors
export const getAllDonors = async (req, res) => {
  try {
    const donors = await Donor.find().select("-password");
    res.status(200).json({ donors });
  } catch (error) {
    console.error("Get Donors Error:", error);
    res.status(500).json({ message: "Error fetching donors" });
  }
};

//  Get All Facilities
export const getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.status(200).json({ facilities });
  } catch (error) {
    console.error("Get Facilities Error:", error);
    res.status(500).json({ message: "Error fetching facilities" });
  }
};

//  Approve a Facility
export const approveFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    facility.status = "approved";
    facility.rejectionReason = undefined;

    await facility.save();

    res.status(200).json({
      message: "Facility approved successfully",
      facility,
    });
  } catch (error) {
    console.error("Approve Facility Error:", error);
    res.status(500).json({ message: "Error approving facility" });
  }
};

//  Reject a Facility
export const rejectFacility = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res
        .status(400)
        .json({ message: "Rejection reason is required" });
    }

    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    facility.status = "rejected";
    facility.rejectionReason = rejectionReason;

    await facility.save();

    res.status(200).json({
      message: "Facility rejected successfully",
      facility,
    });
  } catch (error) {
    console.error("Reject Facility Error:", error);
    res.status(500).json({ message: "Error rejecting facility" });
  }
};
