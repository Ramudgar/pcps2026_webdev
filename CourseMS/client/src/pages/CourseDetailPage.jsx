import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCourseById } from "../services/courseApi";
import { enrollInCourse } from "../services/userApi";
import { getCourseComments, addComment, deleteComment } from "../services/commentApi";
import { API_BASE_URL } from "../config/api.config";

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}

  const [course, setCourse] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [c, cm] = await Promise.all([fetchCourseById(id), getCourseComments(id)]);
      setCourse(c.data?.course || c.course);
      setComments(cm.data?.comments || []);
    } catch (err) {
      setMsg(err.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!token) { navigate("/login", { state: { from: `/courses/${id}` } }); return; }
    setEnrolling(true);
    try {
      await enrollInCourse(token, id);
      setMsg("Enrolled! Redirecting...");
      setTimeout(() => navigate("/learning"), 700);
    } catch (err) {
      setMsg(err.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!token) { navigate("/login"); return; }
    if (!commentText.trim()) return;
    try {
      await addComment(token, id, commentText);
      setCommentText("");
      loadAll();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to post comment");
    }
  };

  const handlePostReply = async (parentId) => {
    if (!token) { navigate("/login"); return; }
    if (!replyText.trim()) return;
    try {
      await addComment(token, id, replyText, parentId);
      setReplyText("");
      setReplyTo(null);
      loadAll();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to reply");
    }
  };

  const handleDelete = async (commentId) => {
    if (!token) return;
    try {
      await deleteComment(token, id, commentId);
      loadAll();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 border-[3px] border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return <div className="max-w-4xl mx-auto px-5 py-10 text-center text-gray-500">Course not found.</div>;
  }

  const instructor = course.instructor || {};
  const isInstructor = user && instructor._id === (user._id || user.id);
  const isAdmin = user?.role === "admin";
  const canReply = isInstructor || isAdmin;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="max-w-[1100px] mx-auto px-5 py-8"
    >
      <Link to="/" className="text-sm text-indigo-500 hover:text-indigo-600 mb-4 inline-block">← Back to courses</Link>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl overflow-hidden border border-gray-200 mb-6"
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-[420px] h-[260px] bg-gray-100 shrink-0">
            {course.thumbnail ? (
              <img src={course.thumbnail.startsWith("http") ? course.thumbnail : `${API_BASE_URL}${course.thumbnail}`}
                alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">📚</div>
            )}
          </div>
          <div className="flex-1 p-8 flex flex-col">
            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2">
              {course.category} · {course.level}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
            <p className="text-gray-600 mb-5 leading-relaxed">{course.description}</p>

            <div className="flex items-center gap-3 mb-5">
              {instructor.avatar ? (
                <img src={`${API_BASE_URL}${instructor.avatar}`} alt={instructor.name}
                  className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-semibold">
                  {instructor.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">{instructor.name}</p>
                <p className="text-xs text-gray-500">Instructor</p>
              </div>
            </div>

            <div className="flex gap-5 text-sm text-gray-500 mb-5">
              <span>{course.totalLessons || 0} lessons</span>
              <span>{course.enrolledStudents || 0} students</span>
              {course.averageRating > 0 && <span>⭐ {course.averageRating.toFixed(1)}</span>}
            </div>

            <div className="mt-auto flex items-center justify-between">
              <span className={`text-2xl font-bold ${course.price === 0 ? "text-emerald-500" : "text-indigo-500"}`}>
                {course.price === 0 ? "Free" : `$${course.price}`}
              </span>
              {!isInstructor && (
                <motion.button
                  onClick={handleEnroll} disabled={enrolling}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-70 border-none"
                >
                  {enrolling ? "Enrolling..." : "Enroll Now"}
                </motion.button>
              )}
            </div>
            {msg && <p className="text-sm text-indigo-500 mt-3">{msg}</p>}
          </div>
        </div>
      </motion.div>

      {/* Lessons */}
      {course.lessons?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Course Content</h2>
          <ul className="divide-y divide-gray-100">
            {course.lessons.map((lesson, i) => (
              <li key={lesson._id || i} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700">{lesson.title}</span>
                  {lesson.isFree && <span className="text-[10px] text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Preview</span>}
                </div>
                <span className="text-xs text-gray-400">{lesson.duration || 0}m</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Discussion <span className="text-sm font-normal text-gray-400">({comments.length})</span>
        </h2>

        {token ? (
          <form onSubmit={handlePostComment} className="flex gap-3 mb-6">
            <input
              type="text" value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Ask a question or share your thoughts..."
              className="flex-1 px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <motion.button
              type="submit" whileTap={{ scale: 0.96 }}
              className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold cursor-pointer border-none">
              Post
            </motion.button>
          </form>
        ) : (
          <p className="text-sm text-gray-500 mb-6">
            <Link to="/login" className="text-indigo-500 font-medium">Log in</Link> to join the discussion.
          </p>
        )}

        <div className="flex flex-col gap-5">
          <AnimatePresence>
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No comments yet. Be the first to ask a question!</p>
            ) : comments.map((c) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="border border-gray-100 rounded-xl p-4"
              >
                <CommentRow comment={c} onDelete={handleDelete} canDelete={token && (user?.id === c.user?._id || isInstructor || isAdmin)} />

                {c.replies?.map((r) => (
                  <div key={r._id} className="ml-10 mt-3 pl-4 border-l-2 border-indigo-100">
                    <CommentRow comment={r} isReply onDelete={handleDelete} canDelete={token && (user?.id === r.user?._id || isInstructor || isAdmin)} />
                  </div>
                ))}

                {canReply && (
                  <div className="ml-10 mt-3">
                    {replyTo === c._id ? (
                      <div className="flex gap-2">
                        <input
                          type="text" value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..." autoFocus
                          className="flex-1 px-3 py-2 border-[1.5px] border-indigo-200 rounded-lg text-sm bg-indigo-50/40 outline-none focus:border-indigo-500"
                        />
                        <button onClick={() => handlePostReply(c._id)}
                          className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium cursor-pointer border-none">
                          Reply
                        </button>
                        <button onClick={() => { setReplyTo(null); setReplyText(""); }}
                          className="px-3 py-2 text-gray-500 text-sm cursor-pointer border-none bg-transparent">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setReplyTo(c._id)}
                        className="text-xs text-indigo-500 font-medium hover:text-indigo-600 bg-transparent border-none cursor-pointer">
                        ↵ Reply as instructor
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const CommentRow = ({ comment, isReply, onDelete, canDelete }) => {
  const u = comment.user || {};
  const isTeacherReply = isReply && (u.role === "teacher" || u.role === "admin");

  return (
    <div className="flex gap-3">
      {u.avatar ? (
        <img src={`${API_BASE_URL}${u.avatar}`} alt={u.name}
          className="w-8 h-8 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-semibold shrink-0">
          {u.name?.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900">{u.name}</span>
          {isTeacherReply && (
            <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-full font-semibold uppercase">
              {u.role}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
          {canDelete && (
            <button onClick={() => onDelete(comment._id)}
              className="ml-auto text-xs text-red-500 hover:text-red-600 bg-transparent border-none cursor-pointer">
              Delete
            </button>
          )}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">{comment.text}</p>
      </div>
    </div>
  );
};

export default CourseDetailPage;
