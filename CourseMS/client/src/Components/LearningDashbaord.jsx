import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getMyEnrollments } from "../services/userApi";
import { API_BASE_URL } from "../config/api.config";

export const LearningDashbaord = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}

  if (!token) { navigate("/login", { state: { from: "/learning" } }); return null; }

  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");

  useEffect(() => { loadEnrollments(); }, [page]);

  const loadEnrollments = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyEnrollments(token, page);
      setEnrollments(data.enrollments || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter((e) => {
    if (filter === "all") return true;
    return e.status === filter;
  });

  const getProgressColor = (p) => p >= 80 ? "bg-emerald-500" : p >= 40 ? "bg-amber-500" : "bg-indigo-500";
  const getProgressText = (p) => p >= 80 ? "text-emerald-500" : p >= 40 ? "text-amber-500" : "text-indigo-500";

  const stats = [
    { label: "Enrolled", value: enrollments.length, bg: "bg-indigo-50", color: "text-indigo-500" },
    { label: "In Progress", value: enrollments.filter((e) => e.status === "active").length, bg: "bg-amber-50", color: "text-amber-500" },
    { label: "Completed", value: enrollments.filter((e) => e.status === "completed").length, bg: "bg-emerald-50", color: "text-emerald-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="max-w-[1100px] mx-auto px-5 py-8"
    >
      <div className="mb-7">
        <h1 className="text-[28px] font-bold text-gray-900 mb-1.5">My Learning</h1>
        <p className="text-[15px] text-gray-500">
          Welcome back, {user?.name || "Learner"}! Continue where you left off.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2 }}
            className="flex items-center gap-3.5 bg-white p-5 rounded-2xl border border-gray-200"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${stat.bg} ${stat.color}`}>
              {stat.value}
            </div>
            <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {["all", "active", "completed"].map((f) => (
          <motion.button
            key={f} onClick={() => setFilter(f)}
            whileTap={{ scale: 0.96 }}
            className={`px-5 py-2 rounded-lg text-[13px] font-medium border cursor-pointer transition-colors ${
              filter === f
                ? "bg-indigo-500 border-indigo-500 text-white font-semibold"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-9 h-9 border-[3px] border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">{error}</div>
      ) : filteredEnrollments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 px-5 bg-white rounded-2xl border border-gray-200"
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
          </svg>
          <h3 className="text-gray-700 mt-4 mb-2 font-semibold">
            {filter === "all" ? "No courses yet" : `No ${filter} courses`}
          </h3>
          <p className="text-gray-400 text-sm">
            {filter === "all" ? "Browse our catalog and enroll in a course to start learning!" : ""}
          </p>
          {filter === "all" && (
            <Link to="/" className="inline-block mt-5 px-7 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold no-underline">
              Browse Courses
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence>
            {filteredEnrollments.map((enrollment) => {
              const course = enrollment.course || {};
              const instructor = course.instructor || {};
              const progress = enrollment.progress || 0;

              return (
                <motion.div
                  key={enrollment._id}
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.08)" }}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 cursor-pointer"
                >
                  <div className="relative h-40 bg-gray-100">
                    {course.thumbnail ? (
                      <img src={`${API_BASE_URL}${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
                        </svg>
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-semibold text-white capitalize ${
                      enrollment.status === "completed" ? "bg-emerald-500" : "bg-indigo-500"
                    }`}>
                      {enrollment.status}
                    </span>
                  </div>

                  <div className="p-[18px]">
                    <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-1.5">
                      {course.category || "General"}
                    </p>
                    <h3 className="text-base font-semibold text-gray-900 mb-1 leading-[1.4]">
                      {course.title || "Untitled Course"}
                    </h3>
                    <p className="text-[13px] text-gray-400 mb-4">
                      by {instructor.name || "Unknown"}
                    </p>

                    <div className="mb-3.5">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className={`text-xs font-bold ${getProgressText(progress)}`}>
                          {progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`h-full rounded-full ${getProgressColor(progress)}`}
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <span className="text-xs text-gray-400">{course.totalLessons || 0} lessons</span>
                      <span className="text-xs text-gray-400">{enrollment.completedLessons?.length || 0} done</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <motion.button
            onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            whileTap={{ scale: 0.96 }}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </motion.button>
          <span className="text-[13px] text-gray-500">Page {page} of {totalPages}</span>
          <motion.button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            whileTap={{ scale: 0.96 }}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};
