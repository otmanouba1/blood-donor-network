import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Donor from "../models/donorModel.js";
import Facility from "../models/facilityModel.js";
import Admin from "../models/adminModel.js";

/**
 * REGISTER (Unified)
 */
export const register = async (req, res) => {
  try {
    const { role, email, registrationNumber } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    // 🔒 Prevent duplicate email across all users
    const existingUser =
      (await Donor.findOne({ email })) ||
      (await Admin.findOne({ email })) ||
      (await Facility.findOne({ email }));

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // 🔒 Check for duplicate registration number for facilities
    if ((role === "hospital" || role === "blood-lab") && registrationNumber) {
      const existingFacility = await Facility.findOne({ registrationNumber });
      if (existingFacility) {
        return res.status(409).json({ 
          message: "Registration number already exists. Please use a unique registration number." 
        });
      }
    }

    let user;

    if (role === "donor") {
      user = await Donor.create(req.body);
    } else if (role === "hospital" || role === "blood-lab") {
      user = await Facility.create(req.body);
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const redirect =
      role === "donor" ? "/donor/dashboard" : "/";

    res.status(201).json({
      success: true,
      message:
        role === "donor"
          ? "Donor registered successfully! Redirecting to dashboard..."
          : "Facility registered successfully! Please wait for admin approval.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      redirect,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      
      if (field === 'email') {
        return res.status(409).json({ 
          message: "Email address is already registered. Please use a different email." 
        });
      } else if (field === 'registrationNumber') {
        return res.status(409).json({ 
          message: "Registration number already exists. Please use a unique registration number." 
        });
      } else {
        return res.status(409).json({ 
          message: `${field} already exists. Please use a different value.` 
        });
      }
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors 
      });
    }
    
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

/**
 * LOGIN (Unified)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    //  Find user (priority order)
    const user =
      (await Admin.findOne({ email }).select("+password")) ||
      (await Donor.findOne({ email }).select("+password")) ||
      (await Facility.findOne({ email }).select("+password"));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //  Facility approval check
    if (user.role === "hospital" || user.role === "blood-lab") {
      if (user.status === "pending") {
        return res.status(403).json({
          message: "Your account is awaiting admin approval",
        });
      }
      if (user.status === "rejected") {
        return res.status(403).json({
          message: "Your registration was rejected",
        });
      }
    }

    //  JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.lastLogin = new Date();

    if (user.role === "hospital" || user.role === "blood-lab") {
      user.history.push({
        eventType: "Login",
        description: "Facility logged in",
        date: new Date(),
      });
      user.history = user.history.slice(-50);
    }

    await user.save();

    const redirectMap = {
      donor: "/donor",
      hospital: "/hospital",
      "blood-lab": "/lab",
      admin: "/admin",
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        name: user.name || user.fullName,
      },
      redirect: redirectMap[user.role] || "/",
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

/**
 * PROFILE FETCH
 */
export const getProfile = async (req, res) => {
  try {
    const modelMap = {
      donor: Donor,
      admin: Admin,
      hospital: Facility,
      "blood-lab": Facility,
    };

    const Model = modelMap[req.user.role];

    if (!Model) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await Model.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};
