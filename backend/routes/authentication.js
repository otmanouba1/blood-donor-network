// routes/authRouter.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/UserModel.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const ALLOWED_ROLES = ["donor", "hospital", "admin"];

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set");
  process.exit(1);
}

// ------------------ Middleware ------------------
const validateRegistration = (req, res, next) => {
  const { name, email, password, role, bloodType, hospitalInfo } = req.body;

  if (!name || !email || !password || !role)
    return res.status(400).json({ success: false, message: "Name, email, password, role required" });

  if (!ALLOWED_ROLES.includes(role))
    return res.status(400).json({ success: false, message: `Role must be one of: ${ALLOWED_ROLES.join(", ")}` });

  if (password.length < 6)
    return res.status(400).json({ success: false, message: "Password must be >= 6 chars" });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, message: "Invalid email" });

  if (role === "donor" && !bloodType)
    return res.status(400).json({ success: false, message: "Blood type required for donors" });

  if (role === "hospital" && (!hospitalInfo || !hospitalInfo.licenseNumber))
    return res.status(400).json({ success: false, message: "License number required for hospitals" });

  next();
};

// ------------------ Helpers ------------------
const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
};

// ------------------ Routes ------------------

// REGISTER
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { name, email, password, role, phone, address, bloodType, healthInfo, hospitalInfo } = req.body;

    // Check for duplicate
    const existingUser = await User.findOne({
      $or: [{ email }, { "hospitalInfo.licenseNumber": hospitalInfo?.licenseNumber }],
    });
    if (existingUser) {
      const message = existingUser.email === email ? "Email already registered" : "License number already registered";
      return res.status(409).json({ success: false, message });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      isActive: true,
      ...(role === "donor" && { bloodType, healthInfo }),
      ...(role === "hospital" && { hospitalInfo }),
    });

    await user.save();

    const token = createToken(user);
    const userData = await User.findById(user._id).select("-password");

    return res.status(201).json({ success: true, message: "Account created", token, user: userData });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({ success: false, message: `${field} already exists` });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(", ") });
    }
    return res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email & password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = createToken(user);
    const userData = await User.findById(user._id).select("-password");

    return res.json({ success: true, message: "Login successful", token, user: userData });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
});

export default router;
