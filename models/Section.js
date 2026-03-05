const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
    },
    sectionName: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Section", sectionSchema);