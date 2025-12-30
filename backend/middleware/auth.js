import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

const JWT_SECRET = process.env.JWT_SECRET;

// Centralized error response helper
const sendError = (res, status = 401, message = "Unauthorized") =>
  res.status(status).json({ success: false, message });

// Token parser helper
const getTokenFromHeader = (req) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) return null;

  return parts[1];
};

// JWT verification helper
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") throw new Error("Token expired");
    throw new Error("Token invalid");
  }
};

/**
 * @desc Authenticate user by JWT token
 * @access Private
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return sendError(res, 401, "Access denied. No token provided.");

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return sendError(res, 401, "Token is not valid.");

    req.user = user;
    next();
  } catch (error) {
    const msg = error.message.includes("expired") ? "Token expired" : "Token is not valid";
    sendError(res, 401, msg);
  }
};

/**
 * @desc Authorize based on user role(s)
 * @param  {...string} roles - allowed roles
 * @access Private
 */
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return sendError(res, 401, "User not authenticated");

  if (!roles.includes(req.user.role))
    return sendError(res, 403, "Access denied. Insufficient permissions");

  next();
};
