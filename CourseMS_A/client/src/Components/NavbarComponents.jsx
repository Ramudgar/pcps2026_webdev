import { useState } from "react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky w-full z-50 ">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="text-xl font-bold text-indigo-600">EduCMS</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              Home
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              Courses
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-indigo-600 font-medium"
            >
              Contact
            </a>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <a
            href="#"
            className="block px-4 py-3 text-gray-600 hover:bg-indigo-50"
          >
            Home
          </a>
          <a
            href="#"
            className="block px-4 py-3 text-gray-600 hover:bg-indigo-50"
          >
            Courses
          </a>
          <a
            href="#"
            className="block px-4 py-3 text-gray-600 hover:bg-indigo-50"
          >
            About
          </a>
          <a
            href="#"
            className="block px-4 py-3 text-gray-600 hover:bg-indigo-50"
          >
            Contact
          </a>
          <button className="w-full text-left px-4 py-3 bg-indigo-600 text-white">
            Login
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
