const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../models/User");
const Section = require("../../models/Section");

/*
========================================
SIGNUP
========================================
*/
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      enrollmentNumber,
      sectionId,
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    if (!["student", "teacher","admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    // Student validations
    if (role === "student") {
      if (!enrollmentNumber) {
        return res.status(400).json({
          message: "Enrollment number is required for students",
        });
      }

      if (sectionId) {
        if (!mongoose.Types.ObjectId.isValid(sectionId)) {
          return res.status(400).json({
            message: "Invalid Section ID format",
          });
        }

        const sectionExists = await Section.findById(sectionId);
        if (!sectionExists) {
          return res.status(400).json({
            message: "Section does not exist",
          });
        }
      }
    }

    // Email check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Create user (hashing handled by model)
    const user = await User.create({
      name,
      email,
      password,
      role,
      enrollmentNumber: role === "student" ? enrollmentNumber : undefined,
      sectionId: role === "student" ? sectionId || undefined : undefined,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    // Duplicate key handling
    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      if (error.keyPattern?.enrollmentNumber) {
        return res.status(400).json({
          message: "Enrollment number already exists",
        });
      }
    }

    console.log("SIGNUP ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
========================================
LOGIN
========================================
*/
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollmentNumber: user.enrollmentNumber || null,
        sectionId: user.sectionId || null,
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
