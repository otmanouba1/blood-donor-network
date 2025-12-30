import jwt from "jsonwebtoken";
import Facility from "../models/facilityModel.js";

const sendError = (res, status = 401, message = "Unauthorized") =>
  res.status(status).json({ success: false, message });

export const protectFacility = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return sendError(res, 401, "No token provided");

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const facility = await Facility.findById(decoded.id).select("-password");
    if (!facility) return sendError(res, 404, "Facility not found");

    req.user = { id: facility._id, role: "facility", ...facility.toObject() };
    next();
  } catch (error) {
    console.error("Facility Auth Error:", error);
    const message = error.name === "TokenExpiredError" ? "Token expired" : "Token invalid";
    sendError(res, 401, message);
  }
};
