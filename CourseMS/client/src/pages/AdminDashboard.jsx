import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAdminStats,
  getAllUsers,
  deactivateUser,
  reactivateUser,
} from "../services/adminApi";

const StatCard = ({ label, value, color }) => (
  <motion.div
    whileHover={{ y: -3 }}
    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
  >
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="text-sm text-gray-500 mt-1">{label}</div>
  </motion.div>
);

const RoleBadge = ({ role }) => {
  const styles = {
    admin: "bg-rose-100 text-rose-700",
    teacher: "bg-indigo-100 text-indigo-700",
    student: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[role] || "bg-gray-100 text-gray-700"}`}
    >
      {role}
    </span>
  );
};

const AdminDashboard = () => {
  const token = localStorage.getItem("token");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes] = await Promise.all([
        getAdminStats(token),
        getAllUsers(token, 1, true),
      ]);
      setStats(statsRes);
      setUsers(usersRes.users || usersRes.data || usersRes);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (user) => {
    setBusyId(user._id);
    try {
      if (user.isActive === false) {
        await reactivateUser(token, user._id);
      } else {
        await deactivateUser(token, user._id);
      }
      await loadData();
    } catch (e) {
      alert(e?.response?.data?.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = users.filter((u) => {
    if (filter !== "all" && u.role !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !u.name?.toLowerCase().includes(q) &&
        !u.email?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading admin data…</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Monitor users, courses, and platform activity
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        {stats && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard
              label="Total Users"
              value={stats.users?.total ?? 0}
              color="text-indigo-600"
            />
            <StatCard
              label="Students"
              value={stats.users?.students ?? 0}
              color="text-emerald-600"
            />
            <StatCard
              label="Teachers"
              value={stats.users?.teachers ?? 0}
              color="text-amber-600"
            />
            <StatCard
              label="Active Users"
              value={stats.users?.active ?? 0}
              color="text-sky-600"
            />
            <StatCard
              label="Total Courses"
              value={stats.courses?.total ?? 0}
              color="text-fuchsia-600"
            />
            <StatCard
              label="Published"
              value={stats.courses?.published ?? 0}
              color="text-emerald-600"
            />
            <StatCard
              label="Enrollments"
              value={stats.enrollments?.total ?? 0}
              color="text-indigo-600"
            />
            <StatCard
              label="Comments"
              value={stats.comments?.total ?? 0}
              color="text-rose-600"
            />
          </motion.div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              User Management
            </h2>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {["all", "student", "teacher", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilter(r)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    filter === r
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Role</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Joined</th>
                  <th className="text-right px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((u) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
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
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.isActive === false
                              ? "bg-gray-200 text-gray-600"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {u.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleToggleActive(u)}
                          disabled={busyId === u._id || u.role === "admin"}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                            u.isActive === false
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-rose-600 text-white hover:bg-rose-700"
                          }`}
                        >
                          {busyId === u._id
                            ? "…"
                            : u.isActive === false
                              ? "Reactivate"
                              : "Deactivate"}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-gray-400"
                    >
                      No users match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
