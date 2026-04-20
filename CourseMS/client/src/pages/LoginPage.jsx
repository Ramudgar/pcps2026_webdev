import { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { loginUser } from "../services/authApi";

const LoginPage = () => {
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const token = localStorage.getItem("token");
  let storedUser = null;
  try { storedUser = JSON.parse(localStorage.getItem("user")); } catch {}
  if (token && storedUser) {
    const from = location.state?.from || "/";
    return <Navigate to={from} replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password) {
      toast.warn("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(form);
      if (!data?.token || !data?.user) {
        throw new Error("Server returned an unexpected response");
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user.role;
      toast.success(`Welcome back, ${data.user.name}!`);

      const from =
        location.state?.from ||
        (role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/");

      setTimeout(() => {
        window.location.href = from;
      }, 600);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err?.message ||
        "Login failed. Please try again.";
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
        className="flex w-full max-w-[900px] min-h-[540px] rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Left Panel */}
        <div className="hidden md:flex flex-1 flex-col justify-center bg-linear-to-br from-indigo-600 via-purple-600 to-violet-600 p-12 relative overflow-hidden text-white">
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
            <h2 className="text-2xl font-semibold mb-3">Welcome Back!</h2>
            <p className="text-sm leading-relaxed opacity-85 max-w-[280px]">
              Log in to access your courses, track progress, and continue learning.
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 bg-white flex items-center justify-center p-10 md:p-12">
          <div className="w-full max-w-[340px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h2>
            <p className="text-sm text-gray-500 mb-7">Enter your credentials to continue</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input
                    type="email" name="email" placeholder="you@example.com"
                    value={form.email} onChange={handleChange} required autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input
                    type={showPassword ? "text" : "password"} name="password"
                    placeholder="Enter your password"
                    value={form.password} onChange={handleChange} required autoComplete="current-password"
                    className="w-full pl-11 pr-11 py-3 border-[1.5px] border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1 text-gray-400 hover:text-gray-600">
                    {showPassword ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold mt-1 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : "Sign In"}
              </motion.button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-indigo-500 font-semibold hover:text-indigo-600">Create one</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
