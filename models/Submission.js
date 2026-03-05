const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    submissionText: {
      type: String,
      trim: true,
    },

    // File Upload Support
    fileUrl: {
      type: String, // stored file path
    },

    fileName: {
      type: String, // original filename
    },

    fileType: {
      type: String, // MIME type
    },

    fileSize: {
      type: Number, // in bytes
    },

    // Future Ready (Grading System)
    marks: {
      type: Number,
      default: null,
    },

    feedback: {
      type: String,
      trim: true,
    },

    isLate: {
      type: Boolean,
      default: false,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate submission
submissionSchema.index(
  { assignmentId: 1, studentId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Submission", submissionSchema);