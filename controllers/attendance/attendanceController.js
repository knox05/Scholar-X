const Attendance = require("../../models/Attendance");
const Subject = require("../../models/Subject");
const Section = require("../../models/Section");
const User = require("../../models/User");

// =======================================
// TAKE ATTENDANCE (Teacher)
// =======================================
exports.takeAttendance = async (req, res) => {
  try {
    const { subjectId, sectionId, date, records } = req.body;
    const teacherId = req.user.id;

    if (!subjectId || !sectionId || !date || !records || !records.length) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        message: "Subject not found",
      });
    }

    // Check section exists
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        message: "Section not found",
      });
    }

    // Prevent duplicate attendance for same day
    const existingAttendance = await Attendance.findOne({
      subjectId,
      sectionId,
      date: new Date(date),
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Attendance already taken for this date",
      });
    }

    const attendance = await Attendance.create({
      subjectId,
      sectionId,
      teacherId,
      date,
      records,
    });

    res.status(201).json({
      message: "Attendance recorded successfully",
      attendance,
    });

  } catch (error) {
    console.error("ATTENDANCE ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// =======================================
// GET ATTENDANCE BY SUBJECT
// =======================================
exports.getAttendanceBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const attendance = await Attendance.find({ subjectId })
      .populate("records.studentId", "name enrollmentNumber")
      .populate("teacherId", "name")
      .populate("sectionId", "sectionName semester");

    res.json(attendance);

  } catch (error) {
    console.error("GET SUBJECT ATTENDANCE ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// =======================================
// GET STUDENT ATTENDANCE FOR ONE SUBJECT
// =======================================
exports.getStudentAttendanceBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const studentId = req.user.id;

    const attendanceRecords = await Attendance.find({ subjectId });

    let totalClasses = attendanceRecords.length;
    let attended = 0;

    attendanceRecords.forEach(record => {
      const studentRecord = record.records.find(
        r => r.studentId.toString() === studentId
      );

      if (studentRecord && studentRecord.status === "Present") {
        attended++;
      }
    });

    const percentage =
      totalClasses === 0 ? 0 : (attended / totalClasses) * 100;

    res.json({
      totalClasses,
      attended,
      percentage: Number(percentage.toFixed(2)),
      eligible: percentage >= 75,
    });

  } catch (error) {
    console.error("STUDENT ATTENDANCE ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};