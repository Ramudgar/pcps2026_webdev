const Comment = require("../models/comment.model");
const Course = require("../models/course.model");

const handleError = (res, error) => {
  console.error("Comment Controller Error:", error.message);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error",
  });
};

// GET /api/courses/:courseId/comments — public
const getCourseComments = async (req, res) => {
  try {
    const { courseId } = req.params;

    const comments = await Comment.find({ course: courseId })
      .populate("user", "name avatar role")
      .sort({ createdAt: -1 })
      .lean();

    // Organize into top-level + replies tree
    const topLevel = comments.filter((c) => !c.parentComment);
    const replies = comments.filter((c) => c.parentComment);

    const withReplies = topLevel.map((c) => ({
      ...c,
      replies: replies
        .filter((r) => r.parentComment.toString() === c._id.toString())
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    }));

    res.status(200).json({ success: true, data: { comments: withReplies } });
  } catch (error) {
    handleError(res, error);
  }
};

// POST /api/courses/:courseId/comments — authenticated
const addComment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { text, parentComment } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // If replying, enforce that only the course instructor or admin can reply
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({ success: false, message: "Parent comment not found" });
      }
      const isInstructor = course.instructor.toString() === req.user.id;
      const isAdmin = req.user.role === "admin";
      if (!isInstructor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only the course instructor or admin can reply to comments",
        });
      }
    }

    const comment = await Comment.create({
      course: courseId,
      user: req.user.id,
      text: text.trim(),
      parentComment: parentComment || null,
    });

    await comment.populate("user", "name avatar role");

    res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    handleError(res, error);
  }
};

// DELETE /api/courses/:courseId/comments/:commentId — owner, course instructor, or admin
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const course = await Course.findById(comment.course);
    const isOwner = comment.user.toString() === req.user.id;
    const isInstructor = course && course.instructor.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isInstructor && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
    }

    // Delete replies too if this was a top-level comment
    await Comment.deleteMany({ $or: [{ _id: commentId }, { parentComment: commentId }] });

    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { getCourseComments, addComment, deleteComment };
