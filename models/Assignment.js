const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    // Assignment title (required)
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
      maxlength: 100,
    },

    // Optional description
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Subject this assignment belongs to
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
    },

    // Section/Class this assignment is assigned to
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Section is required"],
    },

    // Teacher who created it
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher ID is required"],
    },

    // Deadline
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
  
);

// Prevent duplicate assignment with same title + subject + section
assignmentSchema.index(
  { title: 1, subjectId: 1, sectionId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);