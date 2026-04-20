import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCourses } from "../services/courseApi";
import { enrollInCourse } from "../services/userApi";

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const levelBadgeClass = (level) => {
  switch (level) {
    case "beginner": return "bg-emerald-500";
    case "intermediate": return "bg-amber-500";
    case "advanced": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

const sortCourses = (list, sortBy) => {
  const arr = [...list];
  switch (sortBy) {
    case "price-asc": return arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price-desc": return arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "rating": return arr.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    case "newest": return arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    case "title": return arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    default: return arr;
  }
};

function CourseComponent() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const options = {};
      if (debouncedSearch) options.search = debouncedSearch;
      if (selectedCategory) options.category = selectedCategory;
      if (selectedLevel) options.level = selectedLevel;

      const response = await fetchCourses(options);
      setCourses(response.data?.courses || response.courses || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedLevel]);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLevel("");
    setSortBy("");
  };

  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];
  const levels = ["beginner", "intermediate", "advanced"];
  const displayCourses = sortCourses(courses, sortBy);
  const hasFilters = !!(selectedCategory || selectedLevel || searchQuery || sortBy);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
      className="max-w-[1200px] mx-auto px-5 py-10"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 mb-3"
        >
          Explore Courses
        </motion.h1>
        <p className="text-lg text-gray-500">Discover your next skill from our expert-led courses</p>
      </div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6"
      >
        <div className="relative mb-4">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text" placeholder="Search courses by title, description, or tags..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 text-base border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-2xl bg-transparent border-none cursor-pointer w-6 h-6 flex items-center justify-center">
              ×
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white cursor-pointer outline-none focus:border-indigo-500 min-w-[150px]">
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white cursor-pointer outline-none focus:border-indigo-500 min-w-[150px]">
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
            ))}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white cursor-pointer outline-none focus:border-indigo-500 min-w-[160px]">
            <option value="">Sort By</option>
            <option value="title">Title (A–Z)</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>

          {hasFilters && (
            <motion.button
              onClick={clearFilters} whileTap={{ scale: 0.97 }}
              className="px-5 py-2.5 text-sm text-indigo-600 bg-indigo-50 border-none rounded-lg cursor-pointer font-medium hover:bg-indigo-100 transition-colors"
            >
              Clear Filters
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Results */}
      <div className="mb-5 text-gray-500 text-sm">
        {loading ? (
          <span>Loading courses...</span>
        ) : (
          <span>
            Showing <strong className="text-gray-900">{displayCourses.length}</strong> course{displayCourses.length !== 1 ? 's' : ''}
            {hasFilters && ' matching your criteria'}
          </span>
        )}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={loadCourses} />
      ) : loading ? (
        <LoadingGrid />
      ) : displayCourses.length === 0 ? (
        <EmptyState onClear={clearFilters} />
      ) : (
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {displayCourses.map((course) => (
              <CourseCard key={course._id} course={course} navigate={navigate} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}

function CourseCard({ course, navigate }) {
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState("");

  const priceDisplay = course.price === 0 ? "Free" : `$${course.price}`;
  const priceColor = course.price === 0 ? "text-emerald-500" : "text-indigo-500";

  const formatDuration = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    return `${Math.round(minutes / 60)}h`;
  };

  const handleEnroll = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    setEnrolling(true);
    setEnrollMsg("");
    try {
      await enrollInCourse(token, course._id);
      setEnrollMsg("Enrolled!");
      setTimeout(() => navigate("/learning"), 800);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Enrollment failed";
      setEnrollMsg(msg.includes("already") ? "Already enrolled" : msg);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer flex flex-col"
    >
      <div className="relative h-[180px] overflow-hidden bg-gray-100">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📚</div>
        )}
        <span className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white capitalize ${levelBadgeClass(course.level)}`}>
          {course.level}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
          {course.category}
        </span>
        <h3 className="text-lg font-bold text-gray-900 mt-2 mb-3 leading-[1.4]">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {course.shortDescription || course.description?.substring(0, 100)}...
        </p>

        <div className="flex gap-4 pb-4 mb-4 border-b border-gray-200">
          {course.totalDuration > 0 && (
            <span className="flex items-center gap-1 text-[13px] text-gray-500">
              <ClockIcon /> {formatDuration(course.totalDuration)}
            </span>
          )}
          {course.totalLessons > 0 && (
            <span className="flex items-center gap-1 text-[13px] text-gray-500">
              <BookIcon /> {course.totalLessons} lessons
            </span>
          )}
          {course.averageRating > 0 && (
            <span className="flex items-center gap-1 text-[13px] text-gray-500">
              <StarIcon /> {course.averageRating.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            {course.instructor?.avatar && (
              <img src={course.instructor.avatar} alt={course.instructor.name}
                className="w-7 h-7 rounded-full object-cover" />
            )}
            <span className="text-[13px] text-gray-600 font-medium">
              {course.instructor?.name || "Unknown Instructor"}
            </span>
          </div>
          <span className={`text-lg font-bold ${priceColor}`}>{priceDisplay}</span>
        </div>

        <motion.button
          onClick={handleEnroll} disabled={enrolling}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="mt-auto w-full py-2.5 bg-linear-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border-none"
        >
          {enrolling ? "Enrolling..." : enrollMsg || "Enroll Now"}
        </motion.button>
      </div>
    </motion.div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="h-[180px] bg-gray-200 animate-pulse" />
          <div className="p-5">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/5" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20 px-5"
    >
      <div className="text-6xl mb-5">🔍</div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">No courses found</h3>
      <p className="text-base text-gray-500 mb-6">
        Try adjusting your search or filters to find what you're looking for.
      </p>
      <motion.button
        onClick={onClear} whileTap={{ scale: 0.97 }}
        className="px-6 py-2.5 text-sm text-indigo-600 bg-indigo-50 border-none rounded-lg cursor-pointer font-medium hover:bg-indigo-100 transition-colors"
      >
        Clear All Filters
      </motion.button>
    </motion.div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="text-center py-20 px-5"
    >
      <div className="text-6xl mb-5">⚠️</div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
      <p className="text-base text-red-500 mb-6">{message}</p>
      <motion.button
        onClick={onRetry} whileTap={{ scale: 0.97 }}
        className="px-6 py-3 text-base text-white bg-indigo-500 border-none rounded-lg cursor-pointer font-medium hover:bg-indigo-600 transition-colors"
      >
        Try Again
      </motion.button>
    </motion.div>
  );
}

export default CourseComponent;
