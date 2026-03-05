const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");


dotenv.config();

const app = express();



// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/authRoutes");
const { protect } = require("./middleware/authMiddleware");
const { authorizeRoles } = require("./middleware/roleMiddleware");
const courseRoutes = require("./routes/courseRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const materialRoutes = require("./routes/materialRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const studentRoutes = require("./routes/studentRoutes");



app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/students", studentRoutes);


// Teacher-only route
app.get(
  "/api/teacher-only",
  protect,
  authorizeRoles("teacher"),
  (req, res) => {
    res.json({
      message: "Welcome Teacher 👨‍🏫"
    });
  }
);
app.get("/api/protected", protect, (req, res) => {
   res.json({
      message: "You accessed protected route 🎉",
      user: req.user
   });
});



// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Test Route
app.get("/", (req, res) => {
  res.send("LMS Backend API is running 🚀");
});

const PORT = process.env.PORT || 5000;

connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
