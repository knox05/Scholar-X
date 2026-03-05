const Programme = require("../../models/Course");

exports.createCourse = async (req, res) => {
  try {
    const { name, duration } = req.body;

    if (!name || !duration) {
      return res.status(400).json({
        message: "Name and duration are required"
      });
    }

    const existing = await Programme.findOne({ name: name.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        message: "Course already exists"
      });
    }

    const programme = await Programme.create({ name, duration });

    res.status(201).json({
      message: "Course created successfully",
      programme
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};


exports.getAllCourses = async (req, res) => {
  const programmes = await Programme.find();
  res.json(programmes);
};