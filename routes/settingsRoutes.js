const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
  updateAvatar,
} = require("../controllers/settings/settingsController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", protect, getProfile);
router.put("/update", protect, updateProfile);
router.put("/avatar", protect, upload.single("avatar"), updateAvatar);
router.put("/change-password", protect, changePassword);

module.exports = router;
