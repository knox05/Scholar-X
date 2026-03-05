const User = require("../../models/User");
const Subject = require("../../models/Subject");
const Attendance = require("../../models/Attendance");

// ========================================
// GET FULL STUDENT DASHBOARD (OPTIMIZED)
// ========================================
exports.getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1️⃣ Get student
    const student = await User.findById(studentId).select("name sectionId");

    if (!student || !student.sectionId) {
      return res.json({
        studentName: student?.name || "Student",
        overallPercentage: 0,
        overallEligible: false,
        totalClasses: 0,
        totalAttended: 0,
        subjects: [],
      });
    }

    const sectionId = student.sectionId;

    // 2️⃣ Get all subjects in one query
    const subjects = await Subject.find({ sectionId }).select("name");

    if (!subjects.length) {
      return res.json({
        studentName: student.name,
        overallPercentage: 0,
        overallEligible: false,
        totalClasses: 0,
        totalAttended: 0,
        subjects: [],
      });
    }

    // 3️⃣ Aggregate attendance in ONE DB call
    const attendanceData = await Attendance.aggregate([
      {
        $match: { sectionId: sectionId },
      },
      {
        $unwind: "$records",
      },
      {
        $match: {
          "records.studentId": student._id,
        },
      },
      {
        $group: {
          _id: "$subjectId",
          totalClasses: { $sum: 1 },
          attended: {
            $sum: {
              $cond: [
                { $eq: ["$records.status", "Present"] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    let overallTotal = 0;
    let overallAttended = 0;

    // 4️⃣ Map subject-wise data
    const subjectStats = subjects.map((subject) => {
      const record = attendanceData.find(
        (item) => item._id.toString() === subject._id.toString()
      );

      const totalClasses = record?.totalClasses || 0;
      const attended = record?.attended || 0;

      const percentage =
        totalClasses === 0 ? 0 : (attended / totalClasses) * 100;

      overallTotal += totalClasses;
      overallAttended += attended;

      return {
        subjectId: subject._id,
        subjectName: subject.name,
        totalClasses,
        attended,
        percentage: Number(percentage.toFixed(2)),
        eligible: percentage >= 75,
      };
    });

    const overallPercentage =
      overallTotal === 0 ? 0 : (overallAttended / overallTotal) * 100;

    // 5️⃣ Final Response
    res.json({
      studentName: student.name,
      overallPercentage: Number(overallPercentage.toFixed(2)),
      overallEligible: overallPercentage >= 75,
      totalClasses: overallTotal,
      totalAttended: overallAttended,
      subjects: subjectStats,
    });

  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ========================================
// GET TEACHER DASHBOARD (OPTIMIZED)
// ========================================
exports.getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // 1️⃣ Get subjects handled by teacher
    const subjects = await Subject.find({ teacherId })
      .select("name sectionId courseId")
      .populate("courseId", "name");

    if (!subjects.length) {
      return res.json({ subjects: [] });
    }

    const dashboardData = [];

    for (const subject of subjects) {
      
      // 2️⃣ Get total students in that section
      const totalStudents = await User.countDocuments({
        sectionId: subject.sectionId,
        role: "student",
      });

      // 3️⃣ Aggregate attendance for this subject
      const attendanceStats = await Attendance.aggregate([
        {
          $match: { subjectId: subject._id },
        },
        {
          $unwind: "$records",
        },
        {
          $group: {
            _id: "$records.studentId",
            totalClasses: { $sum: 1 },
            attended: {
              $sum: {
                $cond: [
                  { $eq: ["$records.status", "Present"] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

      const totalClasses = await Attendance.countDocuments({
        subjectId: subject._id,
      });

      let defaulters = 0;
      let totalAttendanceSum = 0;

      attendanceStats.forEach((student) => {
        const percentage =
          student.totalClasses === 0
            ? 0
            : (student.attended / student.totalClasses) * 100;

        totalAttendanceSum += percentage;

        if (percentage < 75) defaulters++;
      });

      const averageAttendance =
        attendanceStats.length === 0
          ? 0
          : totalAttendanceSum / attendanceStats.length;

      dashboardData.push({
        subjectId: subject._id,
        subjectName: subject.name,
        programmeName: subject.courseId?.name || "N/A",
        totalClasses,
        totalStudents,
        averageAttendance: Number(averageAttendance.toFixed(2)),
        defaulters,
      });
    }

    res.json({
      totalSubjects: subjects.length,
      subjects: dashboardData,
    });

  } catch (error) {
    console.error("TEACHER DASHBOARD ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
