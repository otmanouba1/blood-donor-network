// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import Donor from "../models/donorModel.js";
import Admin from "../models/adminModel.js";
import Facility from "../models/facilityModel.js";

const sendError = (res, status = 401, message = "Unauthorized") =>
  res.status(status).json({ success: false, message });

const getTokenFromHeader = (req) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) return null;
  return parts[1];
};

/**
 * Protect route middleware for donors, admins, and facilities
 */
export const protect = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return sendError(res, 401, "No token provided");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, role } = decoded;

    let user = null;

    switch (role) {
      case "donor":
        user = await Donor.findById(id).select("-password");
        break;
      case "admin":
        user = await Admin.findById(id).select("-password");
        break;
      case "hospital":
      case "blood-lab":
        user = await Facility.findById(id).select("-password");
        break;
      default:
        return sendError(res, 403, "Invalid role");
    }

    if (!user) return sendError(res, 401, "User not found or unauthorized");

    req.user = { id: user._id, role };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    const message = error.name === "TokenExpiredError" ? "Token expired" : "Token invalid";
    sendError(res, 401, message);
  }
};

/**
 * Role-based authorization middleware
 * Usage: authorize("admin"), authorize("donor", "facility")
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return sendError(res, 403, "Access denied");
  next();
};
