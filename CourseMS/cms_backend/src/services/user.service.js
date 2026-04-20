const User = require("../models/user.models");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.model");
const Comment = require("../models/comment.model");
const { deleteOldFile, getFileUrl } = require("../config/multer.config");

const registerUser = async (userData) => {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      const error = new Error("User already exists with this email");
      error.statusCode = 400;
      console.error("Error in registerUser:", error);
      throw error;
    }

    const allowedRoles = ["student", "teacher"];
    const role = allowedRoles.includes(userData.role) ? userData.role : "student";

    const user = new User({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role,
    });

    await user.save();

    const token = user.generateToken();
    const userObject = user.toObject();
    delete userObject.password;

    return {
      success: true,
      message: "User registered successfully",
      data: { user: userObject, token },
    };
  } catch (error) {
    console.error("Error in registerUser:", error.message);
    throw error;
  }
};

const loginUser = async (email, password) => {
  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error("Your account has been deactivated");
      error.statusCode = 403;
      throw error;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const token = user.generateToken();
    const userObject = user.toObject();
    delete userObject.password;

    return {
      success: true,
      message: "Login successful",
      data: { user: userObject, token },
    };
  } catch (error) {
    console.error("Error in loginUser:", error.message);
    throw error;
  }
};

const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return { success: true, data: { user } };
  } catch (error) {
    console.error("Error in getUserProfile:", error.message);
    throw error;
  }
};

const updateUserProfile = async (userId, updateData) => {
  try {
    const allowedUpdates = ["name", "phone", "address", "avatar"];
    const filteredData = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    }

    const user = await User.findByIdAndUpdate(userId, filteredData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return {
      success: true,
      message: "Profile updated successfully",
      data: { user },
    };
  } catch (error) {
    console.error("Error in updateUserProfile:", error.message);
    throw error;
  }
};

const getAllUsers = async (options = {}) => {
  try {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;
    const query = options.includeInactive ? {} : { isActive: true };

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return {
      success: true,
      data: {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    throw error;
  }
};

const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error("Current password is incorrect");
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    await user.save();

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Error in changePassword:", error.message);
    throw error;
  }
};

const deactivateUser = async (userId) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true },
    );

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return { success: true, message: "User deactivated successfully" };
  } catch (error) {
    console.error("Error in deactivateUser:", error.message);
    throw error;
  }
};

/**
 * Update user's avatar
 * @param {string} userId - User ID
 * @param {Object} file - Uploaded file object from multer
 * @returns {Object} Updated user with new avatar URL
 */
const updateAvatar = async (userId, file) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Delete old avatar if exists (not the default one)
    if (user.avatar) {
      const oldFilename = user.avatar.split("/").pop();
      deleteOldFile(oldFilename, "avatar");
    }

    // Update with new avatar URL
    const avatarUrl = getFileUrl(file.filename, "avatar");
    user.avatar = avatarUrl;
    await user.save();

    return {
      success: true,
      message: "Avatar updated successfully",
      data: {
        user,
        avatarUrl,
      },
    };
  } catch (error) {
    console.error("Error in updateAvatar:", error.message);
    throw error;
  }
};

/**
 * Delete user's avatar (reset to default)
 * @param {string} userId - User ID
 * @returns {Object} Success message
 */
const deleteAvatar = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Delete old avatar file if exists
    if (user.avatar) {
      const oldFilename = user.avatar.split("/").pop();
      deleteOldFile(oldFilename, "avatar");
    }

    // Reset avatar to null (default)
    user.avatar = null;
    await user.save();

    return {
      success: true,
      message: "Avatar removed successfully",
      data: { user },
    };
  } catch (error) {
    console.error("Error in deleteAvatar:", error.message);
    throw error;
  }
};

/**
 * Get platform-wide stats for admin dashboard
 */
const getAdminStats = async () => {
  const [totalUsers, totalStudents, totalTeachers, totalAdmins, activeUsers] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ isActive: true }),
  ]);

  const [totalCourses, publishedCourses, draftCourses, totalEnrollments, totalComments] =
    await Promise.all([
      Course.countDocuments({}),
      Course.countDocuments({ status: "published" }),
      Course.countDocuments({ status: "draft" }),
      Enrollment.countDocuments({}),
      Comment.countDocuments({}),
    ]);

  return {
    success: true,
    data: {
      users: { total: totalUsers, students: totalStudents, teachers: totalTeachers, admins: totalAdmins, active: activeUsers },
      courses: { total: totalCourses, published: publishedCourses, draft: draftCourses },
      enrollments: { total: totalEnrollments },
      comments: { total: totalComments },
    },
  };
};

/**
 * Reactivate a deactivated user (admin)
 */
const reactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return { success: true, message: "User reactivated successfully" };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  changePassword,
  deactivateUser,
  reactivateUser,
  updateAvatar,
  deleteAvatar,
  getAdminStats,
};
