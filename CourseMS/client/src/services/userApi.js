import axios from "axios";
import { ENDPOINTS, API_BASE_URL } from "../config/api.config";

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export const getProfile = async (token) => {
  const { data } = await axios.get(ENDPOINTS.users.profile, {
    headers: authHeader(token),
  });
  return data;
};

export const updateProfile = async (token, profileData) => {
  const { data } = await axios.put(ENDPOINTS.users.profile, profileData, {
    headers: { "Content-Type": "application/json", ...authHeader(token) },
  });
  return data;
};

export const uploadAvatar = async (token, file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const { data } = await axios.patch(
    `${API_BASE_URL}/api/users/avatar`,
    formData,
    { headers: { "Content-Type": "multipart/form-data", ...authHeader(token) } }
  );
  return data;
};

export const deleteAvatar = async (token) => {
  const { data } = await axios.delete(`${API_BASE_URL}/api/users/avatar`, {
    headers: authHeader(token),
  });
  return data;
};

export const changePassword = async (token, passwords) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/api/users/change-password`,
    passwords,
    { headers: { "Content-Type": "application/json", ...authHeader(token) } }
  );
  return data;
};

export const getMyEnrollments = async (token, page = 1) => {
  const { data } = await axios.get(
    `${API_BASE_URL}/api/courses/my-enrollments?page=${page}`,
    { headers: authHeader(token) }
  );
  return data;
};

export const enrollInCourse = async (token, courseId) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/api/courses/${courseId}/enroll`,
    {},
    { headers: authHeader(token) }
  );
  return data;
};
