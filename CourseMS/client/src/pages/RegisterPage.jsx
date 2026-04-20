import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { registerUser } from "../services/authApi";

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem("token");
  let storedUser = null;
  try { storedUser = JSON.parse(localStorage.getItem("user")); } catch {}
  if (token && storedUser) return <Navigate to="/" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    if (!["student", "teacher"].includes(form.role)) return "Invalid role selected";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.warn(err);
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });

      if (!data?.token || !data?.user) {
        throw new Error("Server returned an unexpected response");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user.role;
      toast.success(
        `Account created! Welcome ${data.user.name} (${role})`
      );

      const dest =
        role === "teacher" ? "/teacher" : role === "admin" ? "/admin" : "/";

      setTimeout(() => {
        window.location.href = dest;
      }, 700);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err?.message ||
        "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-[960px] min-h-[600px] rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Left Panel */}
        <div className="hidden md:flex w-[340px] shrink-0 flex-col justify-center bg-linear-to-br from-indigo-600 via-purple-600 to-violet-600 p-10 relative overflow-hidden text-white">
          <div className="absolute w-52 h-52 rounded-full bg-white/10 -top-16 -right-16" />
          <div className="absolute w-40 h-40 rounded-full bg-white/5 -bottom-10 -left-10" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-1">CourseMS</h1>
            <p className="text-sm opacity-80 mb-10">Your gateway to knowledge</p>
            <h2 className="text-2xl font-semibold mb-3">Join Us Today!</h2>
            <p className="text-sm leading-relaxed opacity-85 max-w-[280px]">
              Create an account as a student to enroll in courses, or as a teacher to publish your own.
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white flex items-center justify-center p-8 md:p-10">
          <div className="w-full max-w-[420px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
            <p className="text-sm text-gray-500 mb-6">Fill in your details to get started</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Full Name</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required autoComplete="name"
                    className="w-full pl-11 pr-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required autoComplete="email"
                    className="w-full pl-11 pr-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                </div>
              </div>

              {/* Password Row */}
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Min 6 chars" value={form.password} onChange={handleChange} required autoComplete="new-password"
                      className="w-full pl-11 pr-9 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1 text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {showPassword ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Confirm</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Re-enter" value={form.confirmPassword} onChange={handleChange} required autoComplete="new-password"
                      className="w-full pl-11 pr-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                  </div>
                </div>
              </div>

              {/* Role Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">I want to join as</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "student", label: "Student", desc: "Learn from courses", icon: "🎓" },
                    { key: "teacher", label: "Teacher", desc: "Publish & teach", icon: "👨‍🏫" },
                  ].map((r) => (
                    <motion.button
                      key={r.key} type="button" whileTap={{ scale: 0.97 }}
                      onClick={() => setForm({ ...form, role: r.key })}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl text-left border-[1.5px] cursor-pointer transition-all ${
                        form.role === r.key
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl">{r.icon}</span>
                      <span className={`text-sm font-semibold ${form.role === r.key ? "text-indigo-600" : "text-gray-700"}`}>
                        {r.label}
                      </span>
                      <span className="text-xs text-gray-500">{r.desc}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold mt-1 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Account"}
              </motion.button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-500 font-semibold hover:text-indigo-600">Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
