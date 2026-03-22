const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  progress: {
    type: Number,
    default: 0, // Percentage completed
  },
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
  }],
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  }
}, { timestamps: true });

// Prevent duplicate enrollments by compounding user and course indices
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model("Enrollment", EnrollmentSchema);

module.exports = Enrollment;
