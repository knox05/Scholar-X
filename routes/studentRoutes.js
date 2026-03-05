const express = require("express");
const router = express.Router();

const { getStudentsBySection } = require("../controllers/student/studentController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.get(
  "/section/:sectionId",
  protect,
  authorizeRoles("teacher", "admin"),
  getStudentsBySection
);

module.exports = router;
