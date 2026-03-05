const Section = require("../../models/Section");
const Programme = require("../../models/Course");

// ============================
// Create Section (Teacher Only)
// ============================
exports.createSection = async (req, res) => {
  try {
    const { courseId, semester, sectionName } = req.body;

    if (!courseId || !semester || !sectionName) {
      return res.status(400).json({
        message: "courseId, semester and sectionName are required",
      });
    }

    // Check if programme exists
    const programmeExists = await Programme.findById(courseId);
    if (!programmeExists) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Prevent duplicate section in same programme & semester
    const existingSection = await Section.findOne({
      courseId,
      semester,
      sectionName: sectionName.toUpperCase(),
    });

    if (existingSection) {
      return res.status(400).json({
        message: "Section already exists for this course and semester",
      });
    }

    const section = await Section.create({
      courseId,
      semester,
      sectionName,
    });

    res.status(201).json({
      message: "Section created successfully",
      section,
    });
  } catch (error) {
    console.log("SECTION ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// ============================
// Get All Sections
// ============================
exports.getAllSections = async (req, res) => {
  try {
    const sections = await Section.find()
      .populate("courseId", "name duration");

    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};