const express = require("express");
const router = express.Router();

const {
  takeAttendance,
  getAttendanceBySubject,
  getStudentAttendanceBySubject,
} = require("../controllers/attendance/attendanceController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// =======================================
// Teacher - Take Attendance
// =======================================
router.post(
  "/",
  protect,
  authorizeRoles("teacher"),
  takeAttendance
);

// =======================================
// Student - Subject Attendance %
router.get(
  "/student/:subjectId",
  protect,
  authorizeRoles("student"),
  getStudentAttendanceBySubject
);

// =======================================
// Get All Attendance of Subject
// =======================================
router.get(
  "/:subjectId",
  protect,
  getAttendanceBySubject
);

module.exports = router;