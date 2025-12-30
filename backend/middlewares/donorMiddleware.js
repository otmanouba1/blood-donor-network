// middlewares/protectDonor.js
import jwt from "jsonwebtoken";
import Donor from "../models/donorModel.js";

const sendError = (res, status = 401, message = "Unauthorized") =>
  res.status(status).json({ success: false, message });

export const protectDonor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer")) return sendError(res, 401, "No token provided");

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const donor = await Donor.findById(decoded.id).select("-password");
    if (!donor) return sendError(res, 401, "Unauthorized");

    req.donor = donor;
    next();
  } catch (error) {
    console.error("Donor auth error:", error);
    const message = error.name === "TokenExpiredError" ? "Token expired" : "Token invalid";
    sendError(res, 401, message);
  }
};
