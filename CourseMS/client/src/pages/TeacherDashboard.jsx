import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getInstructorCourses, deleteCourse, createCourse, updateCourse } from "../services/teacherApi";
import { API_BASE_URL } from "../config/api.config";

const emptyForm = {
  title: "", description: "", shortDescription: "", category: "",
  level: "beginner", price: 0, status: "draft",
};

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getInstructorCourses(user._id || user.id);
      setCourses(data.data?.courses || []);
    } catch (err) {
      setMsg({ text: err.message || "Failed to load courses", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (course) => {
    setEditing(course._id);
    setForm({
      title: course.title || "",
      description: course.description || "",
      shortDescription: course.shortDescription || "",
      category: course.category || "",
      level: course.level || "beginner",
      price: course.price || 0,
      status: course.status || "draft",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ text: "", type: "" });
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editing) {
        await updateCourse(token, editing, payload);
        setMsg({ text: "Course updated!", type: "success" });
      } else {
        await createCourse(token, payload);
        setMsg({ text: "Course created!", type: "success" });
      }
      setShowForm(false);
      load();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Save failed", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    try {
      await deleteCourse(token, id);
      setMsg({ text: "Course deleted", type: "success" });
      load();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Delete failed", type: "error" });
    }
  };

  const statusBadge = (s) => ({
    published: "bg-emerald-50 text-emerald-600",
    draft: "bg-amber-50 text-amber-600",
    archived: "bg-gray-100 text-gray-500",
  }[s] || "bg-gray-100 text-gray-500");

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="max-w-[1100px] mx-auto px-5 py-8"
    >
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 mb-1">Teacher Dashboard</h1>
          <p className="text-[15px] text-gray-500">Manage your courses and engage with students</p>
        </div>
        <motion.button
          onClick={openCreate}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="px-5 py-2.5 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold cursor-pointer border-none"
        >
          + New Course
        </motion.button>
      </div>

      {msg.text && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-3 rounded-xl border text-sm mb-5 ${
            msg.type === "success" ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}>
          {msg.text}
        </motion.div>
      )}

      {/* Course Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-7 w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {editing ? "Edit Course" : "Create New Course"}
              </h2>
              <p className="text-sm text-gray-500 mb-5">Fill in the course details below</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Title</label>
                  <input type="text" required value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-indigo-500" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Short Description</label>
                  <input type="text" value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    className="px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-indigo-500" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Description</label>
                  <textarea required rows={4} value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="px-4 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-indigo-500 resize-y" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Category</label>
                    <input type="text" required value={form.category}
                      placeholder="e.g. Programming"
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Level</label>
                    <select value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                      className="px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-indigo-500">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Price (USD)</label>
                    <input type="number" min="0" required value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-indigo-500" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Status</label>
                    <select value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-indigo-500">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <motion.button type="submit" disabled={submitting}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold cursor-pointer border-none disabled:opacity-70">
                    {submitting ? "Saving..." : editing ? "Update Course" : "Create Course"}
                  </motion.button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium cursor-pointer bg-white">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-9 h-9 border-[3px] border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-400 mb-4">You haven't created any courses yet.</p>
          <button onClick={openCreate}
            className="px-6 py-3 bg-indigo-500 text-white rounded-xl text-sm font-semibold cursor-pointer border-none">
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((c) => (
            <motion.div key={c._id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200"
            >
              <div className="h-36 bg-gray-100 relative">
                {c.thumbnail ? (
                  <img src={c.thumbnail.startsWith("http") ? c.thumbnail : `${API_BASE_URL}${c.thumbnail}`}
                    alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                )}
                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize ${statusBadge(c.status)}`}>
                  {c.status}
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-1">{c.category}</p>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{c.title}</h3>
                <div className="flex gap-3 text-xs text-gray-500 mb-4">
                  <span>{c.totalLessons || 0} lessons</span>
                  <span>{c.enrolledStudents || 0} students</span>
                  <span className="font-semibold text-gray-700">{c.price === 0 ? "Free" : `$${c.price}`}</span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/teacher/courses/${c._id}/students`}
                    className="flex-1 text-center py-2 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                    Students
                  </Link>
                  <Link to={`/courses/${c._id}`}
                    className="flex-1 text-center py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                    View
                  </Link>
                  <button onClick={() => openEdit(c)}
                    className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer border-none">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c._id)}
                    className="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer border-none">
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TeacherDashboard;
