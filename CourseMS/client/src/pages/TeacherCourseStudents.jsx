import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getCourseStudents } from "../services/teacherApi";
import {
  getCourseComments,
  addComment,
  deleteComment,
} from "../services/commentApi";

const TeacherCourseStudents = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("students");
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [studentsRes, commentsRes] = await Promise.all([
        getCourseStudents(token, id),
        getCourseComments(id),
      ]);
      setCourse(studentsRes.course);
      setStudents(studentsRes.students || []);
      setComments(commentsRes.comments || commentsRes || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const handleReply = async (parentId) => {
    if (!replyText.trim()) return;
    setPosting(true);
    try {
      await addComment(token, id, replyText.trim(), parentId);
      setReplyText("");
      setReplyTo(null);
      const fresh = await getCourseComments(id);
      setComments(fresh.comments || fresh || []);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to reply");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(token, id, commentId);
      const fresh = await getCourseComments(id);
      setComments(fresh.comments || fresh || []);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete");
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading…</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-[1100px] mx-auto">
        <Link
          to="/teacher"
          className="text-sm text-indigo-600 hover:underline mb-4 inline-block"
        >
          ← Back to dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900">
            {course?.title || "Course"}
          </h1>
          <p className="text-gray-500 mt-1">
            {students.length} enrolled student{students.length !== 1 && "s"}
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { key: "students", label: `Students (${students.length})` },
            { key: "comments", label: `Comments (${comments.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
                tab === t.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "students" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {students.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                No students enrolled yet.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Student</th>
                    <th className="text-left px-5 py-3 font-medium">Email</th>
                    <th className="text-left px-5 py-3 font-medium">Progress</th>
                    <th className="text-left px-5 py-3 font-medium">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const u = s.user || s.student || s;
                    return (
                      <motion.tr
                        key={s._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                              {u.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <span className="font-medium text-gray-900">
                              {u.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-600">{u.email}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 w-40">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500"
                                style={{ width: `${s.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-10 text-right">
                              {s.progress || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-500">
                          {s.enrolledAt || s.createdAt
                            ? new Date(
                                s.enrolledAt || s.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </motion.div>
        )}

        {tab === "comments" && (
          <div className="space-y-4">
            {comments.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
                No comments yet.
              </div>
            )}
            {comments.map((c) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                    {c.user?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {c.user?.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-700 text-sm whitespace-pre-wrap">
                      {c.text}
                    </p>

                    <div className="flex gap-3 mt-2 text-xs">
                      <button
                        onClick={() =>
                          setReplyTo(replyTo === c._id ? null : c._id)
                        }
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        {replyTo === c._id ? "Cancel" : "Reply"}
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="text-rose-600 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </div>

                    {replyTo === c._id && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply…"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleReply(c._id)}
                          disabled={posting || !replyText.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {posting ? "…" : "Send"}
                        </button>
                      </div>
                    )}

                    {c.replies && c.replies.length > 0 && (
                      <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-100">
                        {c.replies.map((r) => (
                          <div key={r._id} className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                              {r.user?.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {r.user?.name}
                                </span>
                                {(r.user?.role === "teacher" ||
                                  r.user?.role === "admin") && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold uppercase">
                                    {r.user.role}
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">
                                  {new Date(r.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">
                                {r.text}
                              </p>
                              <button
                                onClick={() => handleDelete(r._id)}
                                className="text-xs text-rose-600 hover:underline mt-1"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseStudents;
