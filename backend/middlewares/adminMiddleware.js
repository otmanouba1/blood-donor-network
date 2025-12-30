import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

const sendError = (res, status = 401, message = "Unauthorized") =>
  res.status(status).json({ success: false, message });

const getTokenFromHeader = (req) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) return null;
  return parts[1];
};

export const protectAdmin = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return sendError(res, 401, "No token provided");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") return sendError(res, 403, "Not an admin");

    // Optionally fetch admin from DB to ensure still exists
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) return sendError(res, 401, "Admin not found");

    req.user = admin;
    next();
  } catch (error) {
    const msg = error.name === "TokenExpiredError" ? "Token expired" : "Token invalid";
    console.error("Admin auth error:", error);
    sendError(res, 401, msg);
  }
};
