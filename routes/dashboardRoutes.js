const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const { getStudentDashboard , getTeacherDashboard} = require("../controllers/dashboard/dashboardController");

router.get(
  "/student",
  protect,
  authorizeRoles("student"),
  getStudentDashboard
);

router.get(
  "/teacher",
  protect,
  authorizeRoles("teacher"),
  getTeacherDashboard
);

module.exports = router;