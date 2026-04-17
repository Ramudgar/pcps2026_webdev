/**
 * API Configuration
 * 
 * This file contains all the configuration settings for connecting
 * to the backend API. Centralizing config makes it easier to manage
 * environment-specific values.
 */

// Base URL for the backend API
// In development: http://localhost:8080
// In production: your deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// API endpoints organized by resource
const ENDPOINTS = {
  // Course-related endpoints
  courses: {
    list: `${API_BASE_URL}/api/courses`,           // GET all courses
    detail: (id) => `${API_BASE_URL}/api/courses/${id}`,  // GET single course
    create: `${API_BASE_URL}/api/courses`,         // POST create course
    update: (id) => `${API_BASE_URL}/api/courses/${id}`,   // PUT update course
    delete: (id) => `${API_BASE_URL}/api/courses/${id}`,   // DELETE course
    enroll: (id) => `${API_BASE_URL}/api/courses/${id}/enroll`, // POST enroll in course
  },
  
  // User-related endpoints
  users: {
    register: `${API_BASE_URL}/api/users/register`,
    login: `${API_BASE_URL}/api/users/login`,
    profile: `${API_BASE_URL}/api/users/profile`,
  }
};

export { API_BASE_URL, ENDPOINTS };
