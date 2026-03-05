const Subject = require("../../models/Subject");
const Programme = require("../../models/Course");
const User = require("../../models/User");
const Section = require("../../models/Section");

// ==============================
// Create Subject (Teacher Only)
// ==============================
exports.createSubject = async (req, res) => {
  try {
    const { name, courseId, semester, teacherId, sectionId } = req.body;

    if (!name || !courseId || !semester || !teacherId || !sectionId) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check Programme exists
    const programme = await Programme.findById(courseId);
    if (!programme) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Check Section exists
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    // Check Teacher exists
    const teacher = await User.findOne({
      _id: teacherId,
      role: "teacher",
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    // Prevent duplicate subject in SAME semester + section
    const existing = await Subject.findOne({
      name,
      semester,
      sectionId,
    });

    if (existing) {
      return res.status(400).json({
        message:
          "Subject already exists for this semester in this section",
      });
    }

    const subject = await Subject.create({
      name,
      courseId,
      semester,
      teacherId,
      sectionId,
    });

    res.status(201).json({
      message: "Subject created successfully",
      subject,
    });

  } catch (error) {
    console.log("SUBJECT ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==============================
// Get All Subjects
// ==============================
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find()
      .populate("courseId", "name")
      .populate("teacherId", "name email")
      .populate("sectionId", "sectionName semester");

    res.status(200).json(subjects);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==============================
// Get Subjects By Section
// ==============================
exports.getSubjectsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const subjects = await Subject.find({ sectionId })
      .populate("teacherId", "name email")
      .populate("courseId", "name");

    res.status(200).json(subjects);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==============================
// Get Subjects By Teacher
// ==============================
exports.getSubjectsByTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const subjects = await Subject.find({ teacherId })
      .populate("courseId", "name")
      .populate("sectionId", "sectionName semester");

    res.status(200).json(subjects);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==============================
// Delete Subject (Admin/Teacher)
// ==============================
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    await subject.deleteOne();

    res.status(200).json({
      message: "Subject deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};
