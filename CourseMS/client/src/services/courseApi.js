/**
 * Course API Service
 * 
 * This service handles all HTTP communication with the backend for course operations.
 * Each function maps to a specific API endpoint and use case.
 */

import { ENDPOINTS } from "../config/api.config";

/**
 * fetchCourses - Get ALL courses (List View)
 * 
 * Use Case: Displaying a list/grid of courses on the homepage or browse page
 * Backend Endpoint: GET /api/courses
 * 
 * When to use:
 * - Course listing page (like you're seeing now)
 * - Browse/search results
 * - Home page "Featured Courses" section
 * - Anywhere you need to show multiple courses
 * 
 * Returns: Array of courses with pagination info
 * Example response: { courses: [{...}, {...}], pagination: {page: 1, total: 50} }
 */
export const fetchCourses = async (options = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add query parameters if provided
  if (options.page) queryParams.append("page", options.page);
  if (options.limit) queryParams.append("limit", options.limit);
  if (options.category) queryParams.append("category", options.category);
  if (options.level) queryParams.append("level", options.level);
  if (options.search) queryParams.append("search", options.search);
  if (options.priceType) queryParams.append("priceType", options.priceType);
  
  const queryString = queryParams.toString();
  const url = queryString ? 
    // http://localhost:8080/api/courses?page=1,limit=10
    `${ENDPOINTS.courses.list}?${queryString}` 
    : 
    // http://localhost:8080/api/courses
    ENDPOINTS.courses.list;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch courses");
  }
  
  return data;
};

/**
 * fetchCourseById - Get ONE specific course (Detail View)
 * 
 * Use Case: Displaying detailed information about a single course
 * Backend Endpoint: GET /api/courses/:id
 * 
 * When to use:
 * - When user clicks on a course card to see details
 * - Course detail page with full description, lessons, instructor info
 * - Enrollment page before signing up
 * - Anywhere you need complete info about ONE course
 * 
 * Parameters:
 * - courseId: The unique ID of the course (from the course._id field)
 * 
 * Returns: Single course object with full details including lessons
 * Example response: { course: { _id: "...", title: "...", lessons: [...], ... } }
 */
export const fetchCourseById = async (courseId) => {
  const response = await fetch(ENDPOINTS.courses.detail(courseId), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch course");
  }
  
  return data;
};

/**
 * searchCourses - Search courses by keyword
 * 
 * Use Case: When user types in a search box to find specific courses
 * This is actually a specialized version of fetchCourses with search query
 * 
 * When to use:
 * - Search bar functionality
 * - Finding courses by title, description, or tags
 * 
 * Parameters:
 * - searchTerm: The keyword to search for
 * - options: Additional filters (category, level, etc.)
 */
export const searchCourses = async (searchTerm, options = {}) => {
  return fetchCourses({ ...options, search: searchTerm });
};

/**
 * createCourse - Create a new course (Teacher/Admin only)
 * 
 * Use Case: When an instructor wants to create a new course
 * Requires: Authentication (JWT token)
 */
export const createCourse = async (courseData, token) => {
  const response = await fetch(ENDPOINTS.courses.create, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(courseData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Failed to create course");
  }
  
  return data;
};

/**
 * enrollInCourse - Enroll student in a course
 * 
 * Use Case: When a student clicks "Enroll" button
 * Requires: Authentication (JWT token)
 */
export const enrollInCourse = async (courseId, token) => {
  const response = await fetch(ENDPOINTS.courses.enroll(courseId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Failed to enroll in course");
  }
  
  return data;
};

/**
 * Quick Reference: When to use which function?
 * 
 * ┌─────────────────────────┬─────────────────────────────┐
 * │ Show multiple courses   │ Use fetchCourses()          │
 * │ Show one course detail  │ Use fetchCourseById(id)     │
 * │ Search courses          │ Use searchCourses(keyword)  │
 * │ Create new course       │ Use createCourse(data)      │
 * │ Enroll in course        │ Use enrollInCourse(id)      │
 * └─────────────────────────┴─────────────────────────────┘
 */
