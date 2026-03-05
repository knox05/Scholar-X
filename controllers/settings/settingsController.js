//Get Profile
const User = require("../../models/User");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;

    await user.save();

    res.json({
      message: "Profile updated successfully",
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
    res.status(500).json({ message: "Server error" });
  }
};

// Update avatar
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    if (!req.file.mimetype?.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    const user = await User.findById(req.user.id);
    user.avatarUrl = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Avatar updated successfully",
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
    res.status(500).json({ message: "Server error" });
  }
};

//Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Old password incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      message: "Password changed successfully",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

