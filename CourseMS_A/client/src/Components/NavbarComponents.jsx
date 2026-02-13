import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md sticky w-full z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <h1 className="text-2xl font-bold text-indigo-600">EduCMS</h1>

          {/* Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-600 hover:text-indigo-600 transition"
            >
              Home
            </Link>
            <Link
              to="/courses"
              className="text-gray-600 hover:text-indigo-600 transition"
            >
              Courses
            </Link>
            <Link
              to="#"
              className="text-gray-600 hover:text-indigo-600 transition"
            >
              About
            </Link>
            <Link
              to="#"
              className="text-gray-600 hover:text-indigo-600 transition"
            >
              Contact
            </Link>

            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-xl text-gray-600 hover:text-indigo-600"
              >
                <i className="ri-search-line"></i>
              </button>

              {/* Search Box */}
              <div
                className={`absolute right-0 mt-3 w-72 bg-white border rounded-xl shadow-xl p-3 transition-all duration-300 ${
                  isSearchOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
                  <i className="ri-search-line text-gray-400 mr-2"></i>
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full outline-none text-sm"
                  />
                </div>
              </div>
            </div>
            <ul>
              <li className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                <Link to="/login">Login</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
