import { useState, useEffect, useCallback } from "react";
import { fetchCourses } from "../services/courseApi";

/**
 * CourseComponent - Modern Course Listing with Search & Filters
 * 
 * Features:
 * - Real-time search by keyword
 * - Filter by category and level
 * - Modern card design with hover effects
 * - Loading skeletons
 * - Responsive grid layout
 */

// Icons as components for better control
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
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

function CourseComponent() {
  // State management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Debounce search input (wait 300ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch courses when filters change
  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      
      const options = {};
      if (debouncedSearch) options.search = debouncedSearch;
      if (selectedCategory) options.category = selectedCategory;
      if (selectedLevel) options.level = selectedLevel;
      
      const response = await fetchCourses(options);
      setCourses(response.data.courses || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedCategory, selectedLevel]);

  // Load courses on mount and when filters change
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLevel("");
  };

  // Extract unique categories from courses for filter dropdown
  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];
  const levels = ["beginner", "intermediate", "advanced"];

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <h1 style={styles.title}>Explore Courses</h1>
        <p style={styles.subtitle}>Discover your next skill from our expert-led courses</p>
      </div>

      {/* Search and Filter Section */}
      <div style={styles.filterSection}>
        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <div style={styles.searchIcon}><SearchIcon /></div>
          <input
            type="text"
            placeholder="Search courses by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div style={styles.filtersRow}>
          <div style={styles.filterGroup}>
            <FilterIcon />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={styles.select}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              style={styles.select}
            >
              <option value="">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(selectedCategory || selectedLevel || searchQuery) && (
            <button onClick={clearFilters} style={styles.clearFiltersBtn}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div style={styles.resultsInfo}>
        {loading ? (
          <span>Loading courses...</span>
        ) : (
          <span>
            Showing <strong>{courses.length}</strong> course{courses.length !== 1 ? 's' : ''}
            {(debouncedSearch || selectedCategory || selectedLevel) && ' matching your criteria'}
          </span>
        )}
      </div>

      {/* Content Area */}
      {error ? (
        <ErrorState message={error} onRetry={loadCourses} />
      ) : loading ? (
        <LoadingGrid />
      ) : courses.length === 0 ? (
        <EmptyState onClear={clearFilters} />
      ) : (
        <div style={styles.grid}>
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * CourseCard - Modern course card with hover effects
 */
function CourseCard({ course }) {
  const [isHovered, setIsHovered] = useState(false);

  const priceDisplay = course.price === 0 ? "Free" : `$${course.price}`;
  const priceColor = course.price === 0 ? "#10b981" : "#6366f1";
  
  const formatDuration = (minutes) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.round(minutes / 60);
    return `${hours}h`;
  };

  return (
    <div
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div style={styles.thumbnailContainer}>
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            style={styles.thumbnail}
          />
        ) : (
          <div style={styles.thumbnailPlaceholder}>
            <span style={styles.placeholderText}>📚</span>
          </div>
        )}
        
        {/* Level Badge */}
        <span style={{
          ...styles.levelBadge,
          backgroundColor: getLevelColor(course.level)
        }}>
          {course.level}
        </span>
      </div>

      {/* Content */}
      <div style={styles.cardContent}>
        {/* Category */}
        <span style={styles.category}>{course.category}</span>
        
        {/* Title */}
        <h3 style={styles.cardTitle}>{course.title}</h3>
        
        {/* Description */}
        <p style={styles.description}>
          {course.shortDescription || course.description?.substring(0, 100)}...
        </p>

        {/* Stats Row */}
        <div style={styles.statsRow}>
          {course.totalDuration > 0 && (
            <span style={styles.stat}>
              <ClockIcon /> {formatDuration(course.totalDuration)}
            </span>
          )}
          {course.totalLessons > 0 && (
            <span style={styles.stat}>
              <BookIcon /> {course.totalLessons} lessons
            </span>
          )}
          {course.averageRating > 0 && (
            <span style={styles.stat}>
              <StarIcon /> {course.averageRating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Footer */}
        <div style={styles.cardFooter}>
          <div style={styles.instructor}>
            {course.instructor?.avatar && (
              <img 
                src={course.instructor.avatar} 
                alt={course.instructor.name}
                style={styles.avatar}
              />
            )}
            <span style={styles.instructorName}>
              {course.instructor?.name || "Unknown Instructor"}
            </span>
          </div>
          
          <span style={{...styles.price, color: priceColor}}>
            {priceDisplay}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton Grid
 */
function LoadingGrid() {
  return (
    <div style={styles.grid}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={styles.skeletonCard}>
          <div style={styles.skeletonThumbnail} />
          <div style={styles.skeletonContent}>
            <div style={styles.skeletonLine} />
            <div style={{...styles.skeletonLine, width: '60%'}} />
            <div style={{...styles.skeletonLine, width: '80%'}} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty State - No courses found
 */
function EmptyState({ onClear }) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>🔍</div>
      <h3 style={styles.emptyTitle}>No courses found</h3>
      <p style={styles.emptyText}>
        Try adjusting your search or filters to find what you're looking for.
      </p>
      <button onClick={onClear} style={styles.clearFiltersBtn}>
        Clear All Filters
      </button>
    </div>
  );
}

/**
 * Error State
 */
function ErrorState({ message, onRetry }) {
  return (
    <div style={styles.errorState}>
      <div style={styles.errorIcon}>⚠️</div>
      <h3 style={styles.errorTitle}>Oops! Something went wrong</h3>
      <p style={styles.errorText}>{message}</p>
      <button onClick={onRetry} style={styles.retryButton}>
        Try Again
      </button>
    </div>
  );
}

// Helper function for level colors
function getLevelColor(level) {
  const colors = {
    beginner: '#10b981',
    intermediate: '#f59e0b',
    advanced: '#ef4444'
  };
  return colors[level] || '#6b7280';
}

// Styles object
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#6b7280',
  },
  filterSection: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '16px',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  },
  searchInput: {
    width: '100%',
    padding: '14px 16px 14px 48px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.2s',
    ':focus': {
      borderColor: '#6366f1',
    },
  },
  clearButton: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6b7280',
  },
  select: {
    padding: '10px 16px',
    fontSize: '14px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '150px',
  },
  clearFiltersBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    color: '#6366f1',
    backgroundColor: '#eef2ff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  resultsInfo: {
    marginBottom: '20px',
    color: '#6b7280',
    fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  thumbnailContainer: {
    position: 'relative',
    height: '180px',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: '48px',
  },
  levelBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  cardContent: {
    padding: '20px',
  },
  category: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: '8px 0 12px 0',
    lineHeight: '1.4',
  },
  description: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  statsRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    color: '#6b7280',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructor: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  instructorName: {
    fontSize: '13px',
    color: '#4b5563',
    fontWeight: '500',
  },
  price: {
    fontSize: '18px',
    fontWeight: '700',
  },
  skeletonCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  skeletonThumbnail: {
    height: '180px',
    backgroundColor: '#e5e7eb',
    animation: 'pulse 1.5s infinite',
  },
  skeletonContent: {
    padding: '20px',
  },
  skeletonLine: {
    height: '16px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    marginBottom: '12px',
    animation: 'pulse 1.5s infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '24px',
  },
  errorState: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px',
  },
  errorText: {
    fontSize: '16px',
    color: '#ef4444',
    marginBottom: '24px',
  },
  retryButton: {
    padding: '12px 24px',
    fontSize: '16px',
    color: 'white',
    backgroundColor: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
  },
};

export default CourseComponent;
