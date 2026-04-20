const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const ENDPOINTS = {
  courses: {
    list: `${API_BASE_URL}/api/courses`,
    detail: (id) => `${API_BASE_URL}/api/courses/${id}`,
    create: `${API_BASE_URL}/api/courses`,
    update: (id) => `${API_BASE_URL}/api/courses/${id}`,
    delete: (id) => `${API_BASE_URL}/api/courses/${id}`,
    enroll: (id) => `${API_BASE_URL}/api/courses/${id}/enroll`,
    students: (id) => `${API_BASE_URL}/api/courses/${id}/students`,
    comments: (id) => `${API_BASE_URL}/api/courses/${id}/comments`,
    byInstructor: (id) => `${API_BASE_URL}/api/courses/instructor/${id}`,
  },

  users: {
    register: `${API_BASE_URL}/api/users/register`,
    login: `${API_BASE_URL}/api/users/login`,
    profile: `${API_BASE_URL}/api/users/profile`,
    adminStats: `${API_BASE_URL}/api/users/admin/stats`,
    all: `${API_BASE_URL}/api/users`,
  },
};

export { API_BASE_URL, ENDPOINTS };
