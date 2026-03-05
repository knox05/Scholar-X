const Material = require("../../models/Material");
const User = require("../../models/User");

const normalizeFileUrl = (filePath = "") => {
  const withForwardSlash = String(filePath).replace(/\\/g, "/").trim();

  if (!withForwardSlash) return "";
  if (withForwardSlash.startsWith("http://") || withForwardSlash.startsWith("https://")) {
    return withForwardSlash;
  }

  if (withForwardSlash.startsWith("/api/uploads/")) return withForwardSlash;
  if (withForwardSlash.startsWith("api/uploads/")) return `/${withForwardSlash}`;
  if (withForwardSlash.startsWith("/uploads/")) {
    return `/api${withForwardSlash}`;
  }
  if (withForwardSlash.startsWith("uploads/")) {
    return `/api/${withForwardSlash}`;
  }

  const uploadsSegment = withForwardSlash.match(/(?:^|\/)uploads\/(.+)$/);
  if (uploadsSegment?.[1]) {
    return `/api/uploads/${uploadsSegment[1]}`;
  }

  return `/api/uploads/${withForwardSlash.replace(/^\/+/, "")}`;
};

//Upload Material
exports.uploadMaterial = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, subjectId, sectionId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    const material = await Material.create({
      title,
      subjectId,
      sectionId,
      uploadedBy: userId,
      fileUrl: normalizeFileUrl(req.file.path),
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    const populatedMaterial = await Material.findById(material._id)
      .populate("uploadedBy", "name role");

    res.status(201).json({
      message: "Material uploaded successfully",
      material: populatedMaterial,
    });

  } catch (error) {
    console.log("UPLOAD MATERIAL ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//Get Materials
exports.getMaterialsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const materials = await Material.find({ subjectId })
      .populate("uploadedBy", "name role")
      .sort({ createdAt: -1 });

    const normalizedMaterials = materials.map((material) => ({
      ...material.toObject(),
      fileUrl: normalizeFileUrl(material.fileUrl),
    }));

    res.json(normalizedMaterials);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
