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

/* -------------------- DATABASE -------------------- */

connectDB();

/* -------------------- SECURITY -------------------- */

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/* -------------------- CORS -------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "https://scholar-x-frontend.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

/* -------------------- MIDDLEWARE -------------------- */

app.use(express.json());
app.use(morgan("dev"));

/* -------------------- FILE UPLOADS -------------------- */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* -------------------- ROUTES -------------------- */

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

/* -------------------- PROTECTED ROUTES -------------------- */

// Teacher only
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

// Auth test
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You accessed protected route 🎉",
    user: req.user
  });
});

/* -------------------- RATE LIMIT -------------------- */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

/* -------------------- ROOT ROUTE -------------------- */

app.get("/", (req, res) => {
  res.send("LMS Backend API is running 🚀");
});

/* -------------------- SERVER -------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
