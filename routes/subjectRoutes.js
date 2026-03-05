const express = require("express");
const router = express.Router();

const {
  createSubject,
  getAllSubjects,
} = require("../controllers/subject/subjectController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

router.post("/", protect, authorizeRoles("admin"), createSubject);
router.get("/", protect, getAllSubjects);


module.exports = router;