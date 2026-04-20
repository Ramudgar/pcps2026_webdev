import axios from "axios";
import { API_BASE_URL } from "../config/api.config";

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// List courses taught by a specific instructor (public)
export const getInstructorCourses = async (instructorId) => {
  const { data } = await axios.get(
    `${API_BASE_URL}/api/courses/instructor/${instructorId}`
  );
  return data;
};

export const createCourse = async (token, courseData) => {
  const { data } = await axios.post(`${API_BASE_URL}/api/courses`, courseData, {
    headers: { "Content-Type": "application/json", ...authHeader(token) },
  });
  return data;
};

export const updateCourse = async (token, id, courseData) => {
  const { data } = await axios.put(`${API_BASE_URL}/api/courses/${id}`, courseData, {
    headers: { "Content-Type": "application/json", ...authHeader(token) },
  });
  return data;
};

export const deleteCourse = async (token, id) => {
  const { data } = await axios.delete(`${API_BASE_URL}/api/courses/${id}`, {
    headers: authHeader(token),
  });
  return data;
};

export const uploadCourseThumbnail = async (token, id, file) => {
  const formData = new FormData();
  formData.append("thumbnail", file);
  const { data } = await axios.patch(
    `${API_BASE_URL}/api/courses/${id}/thumbnail`,
    formData,
    { headers: { "Content-Type": "multipart/form-data", ...authHeader(token) } }
  );
  return data;
};

// List enrolled students for a course (instructor or admin)
export const getCourseStudents = async (token, id) => {
  const { data } = await axios.get(`${API_BASE_URL}/api/courses/${id}/students`, {
    headers: authHeader(token),
  });
  return data;
};

export const addLesson = async (token, courseId, lesson) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/api/courses/${courseId}/lessons`,
    lesson,
    { headers: { "Content-Type": "application/json", ...authHeader(token) } }
  );
  return data;
};

export const deleteLesson = async (token, courseId, lessonId) => {
  const { data } = await axios.delete(
    `${API_BASE_URL}/api/courses/${courseId}/lessons/${lessonId}`,
    { headers: authHeader(token) }
  );
  return data;
};
