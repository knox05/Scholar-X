const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "teacher","admin"],
      required: true,
    },

    enrollmentNumber: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return this.role === "student";
      },
    },

    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: false,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);


// HASH PASSWORD BEFORE SAVE

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// CLEAN STUDENT FIELDS FOR TEACHER

userSchema.pre("save", function () {
  if (this.role === "teacher") {
    this.enrollmentNumber = undefined;
    this.sectionId = undefined;
  }
});


//COMPARE PASSWORD

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
