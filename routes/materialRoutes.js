const express = require("express");
const router = express.Router();

const {
  uploadMaterial,
  getMaterialsBySubject,
} = require("../controllers/material/materialController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// BOTH STUDENT & TEACHER CAN UPLOAD
router.post(
  "/upload",
  protect,
  upload.single("file"),
  uploadMaterial
);

//  BOTH CAN VIEW
router.get(
  "/:subjectId",
  protect,
  getMaterialsBySubject
);

module.exports = router;