import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/api.config";

function NavbarComponent() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}
  const isLoggedIn = !!token && !!user;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("You have been logged out");
    setTimeout(() => { window.location.href = "/login"; }, 500);
  };

  const avatarUrl = user?.avatar ? `${API_BASE_URL}${user.avatar}` : null;
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[70px] px-5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <span className="text-3xl">🎓</span>
          <span className="text-xl font-bold text-gray-900">CourseMS</span>
        </Link>

        {/* Nav Links - Desktop */}
        <div className="hidden md:flex gap-8">
          <Link to="/" className={`text-sm font-medium transition-colors ${isActive("/") ? "text-indigo-500 font-semibold" : "text-gray-500 hover:text-gray-900"}`}>
            Browse
          </Link>
          {isLoggedIn && user?.role === "student" && (
            <Link to="/learning" className={`text-sm font-medium transition-colors ${isActive("/learning") ? "text-indigo-500 font-semibold" : "text-gray-500 hover:text-gray-900"}`}>
              My Learning
            </Link>
          )}
          {isLoggedIn && user?.role === "teacher" && (
            <Link to="/teacher" className={`text-sm font-medium transition-colors ${isActive("/teacher") ? "text-indigo-500 font-semibold" : "text-gray-500 hover:text-gray-900"}`}>
              Teach
            </Link>
          )}
          {isLoggedIn && user?.role === "admin" && (
            <Link to="/admin" className={`text-sm font-medium transition-colors ${isActive("/admin") ? "text-indigo-500 font-semibold" : "text-gray-500 hover:text-gray-900"}`}>
              Admin
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2.5 cursor-pointer bg-transparent border-none p-1">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-gray-200" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden md:inline text-sm font-medium text-gray-700">{user.name}</span>
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold uppercase">
                        {user.role}
                      </span>
                    </div>
                    <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Profile
                    </Link>
                    {user.role === "student" && (
                      <Link to="/learning" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/></svg>
                        My Learning
                      </Link>
                    )}
                    {user.role === "teacher" && (
                      <Link to="/teacher" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 010 5.844L12 14z"/></svg>
                        Teacher Dashboard
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Log In
              </Link>
              <Link to="/register" className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavbarComponent;
