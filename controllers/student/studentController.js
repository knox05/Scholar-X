const User = require("../../models/User");
const Section = require("../../models/Section");

// =======================================
// GET STUDENTS BY SECTION (Teacher/Admin)
// =======================================
exports.getStudentsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    if (!sectionId) {
      return res.status(400).json({
        message: "Section ID is required",
      });
    }

    const section = await Section.findById(sectionId).select("sectionName");
    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    // Support both strict ObjectId linkage and potential legacy string linkage.
    const students = await User.aggregate([
      {
        $match: { role: "student" },
      },
      {
        $addFields: {
          sectionIdAsString: { $toString: "$sectionId" },
        },
      },
      {
        $match: {
          $or: [
            { sectionId: section._id },
            { sectionIdAsString: String(section._id) },
            { sectionIdAsString: section.sectionName },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          enrollmentNumber: 1,
          sectionId: 1,
          avatarUrl: 1,
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    res.status(200).json(students);
  } catch (error) {
    console.log("GET STUDENTS BY SECTION ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
