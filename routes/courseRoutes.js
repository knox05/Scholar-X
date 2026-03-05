const express = require("express");
const router = express.Router();

const { createCourse, getAllCourses, } = require("../controllers/academic/courseController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("admin"), createCourse);
router.get("/", protect, getAllCourses);

module.exports = router;