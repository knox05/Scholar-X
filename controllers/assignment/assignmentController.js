const Assignment = require("../../models/Assignment");
const User = require("../../models/User");


//Teacher Creates Assignment
exports.createAssignment = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { title, description, subjectId, sectionId, dueDate } = req.body;

    const assignment = await Assignment.create({
      title,
      description,
      subjectId,
      sectionId,
      teacherId,
      dueDate,
    });

    res.status(201).json({
      message: "Assignment created",
      assignment,
    });

  } catch (error) {
      // Duplicate key error (unique index violation)
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Assignment already exists for this subject and section."
        });
      }

      res.status(500).json({
        message: "Something went wrong while creating the assignment."
      });
    }
};

//Student Views Assignments
exports.getStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await User.findById(studentId).select("sectionId");

    const assignments = await Assignment.find({
      sectionId: student.sectionId,
    }).sort({ dueDate: 1 });

    res.json(assignments);

  } catch (error) {
      console.log("ERROR:", error);
      res.status(500).json({ message: error.message });
    }
};

const Submission = require("../../models/Submission");

// Student Submits Assignment
exports.submitAssignment = async (req, res) => {
  console.log("SUBMIT ROUTE HIT");
  console.log("File:", req.file?.filename);
  console.log("Body:", req.body);
  try {
    const studentId = req.user.id;
    const { assignmentId, submissionText } = req.body;

    if (!assignmentId) {
      return res.status(400).json({
        message: "Assignment ID is required",
      });
    }

    // 🔎 Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    // ❌ Prevent duplicate submission (extra safety)
    const alreadySubmitted = await Submission.findOne({
      assignmentId,
      studentId,
    });

    if (alreadySubmitted) {
      return res.status(400).json({
        message: "You have already submitted this assignment",
      });
    }

    // 🕒 Late submission check
    const isLate = new Date() > new Date(assignment.dueDate);

    // 📁 Create submission
    const submission = await Submission.create({
      assignmentId,
      studentId,
      submissionText: submissionText || "",

      // File metadata (if uploaded)
      fileUrl: req.file ? req.file.path : null,
      fileName: req.file ? req.file.originalname : null,
      fileType: req.file ? req.file.mimetype : null,
      fileSize: req.file ? req.file.size : null,

      isLate,
    });

    res.status(201).json({
      message: "Assignment submitted successfully",
      submission,
    });

  } catch (error) {
    console.log("SUBMISSION ERROR:", error);

    // Handle duplicate index error (Mongo unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already submitted this assignment",
      });
    }

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get submissions
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({
        message: "Assignment ID is required",
      });
    }

    const submissions = await Submission.find({ assignmentId })
      .populate("studentId", "name enrollmentNumber role avatarUrl")
      .sort({ createdAt: -1 });

    res.json(submissions);

  } catch (error) {
    console.log("GET SUBMISSIONS ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get assignments for teacher with optional filters
exports.getTeacherAssignments = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { subjectId, sectionId } = req.query;

    const filter = { teacherId };
    if (subjectId) {
      filter.subjectId = subjectId;
    }
    if (sectionId) {
      filter.sectionId = sectionId;
    }

    const assignments = await Assignment.find(filter).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    console.log("GET TEACHER ASSIGNMENTS ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
