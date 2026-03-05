const express = require("express");
const router = express.Router();

const {
  createSection,
  getAllSections,
} = require("../controllers/academic/sectionController");
const { getStudentsBySection } = require("../controllers/student/studentController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Create Section (Teacher Only)
router.post("/", protect, authorizeRoles("admin"), createSection);

// Get All Sections (Logged-in Users)
router.get("/", protect, getAllSections);
router.get("/:sectionId/students", protect, authorizeRoles("teacher", "admin"), getStudentsBySection);

module.exports = router;
