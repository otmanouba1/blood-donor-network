import DonationSchedule from "../models/donationScheduleModel.js"


export const scheduleDonation = async (req, res) => {
  try {
    const { center, date, time } = req.body;

    if (!center || !date || !time) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Prevent duplicate active schedules
    const existing = await DonationSchedule.findOne({
      donor: req.donor._id,
      status: "Scheduled",
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You already have a scheduled donation" });
    }

    const appointment = await DonationSchedule.create({
      donor: req.donor._id,
      center,
      date,
      time,
    });

    res.status(201).json({
      message: "Donation scheduled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



export const getUpcomingDonations = async (req, res) => {
  try {
    const upcoming = await DonationSchedule.findOne({
      donor: req.donor._id,
      status: "Scheduled",
      date: { $gte: new Date().toISOString().split("T")[0] },
    }).sort({ date: 1, time: 1 });

    if (!upcoming) {
      return res.json(null);
    }

    res.json({
      center: upcoming.center,
      date: upcoming.date,
      time: upcoming.time,
      address: "Location details",
      bloodType: req.donor.bloodGroup
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch upcoming donations" });
  }
};

