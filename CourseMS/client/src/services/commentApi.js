import axios from "axios";
import { API_BASE_URL } from "../config/api.config";

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export const getCourseComments = async (courseId) => {
  const { data } = await axios.get(`${API_BASE_URL}/api/courses/${courseId}/comments`);
  return data;
};

export const addComment = async (token, courseId, text, parentComment = null) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/api/courses/${courseId}/comments`,
    { text, parentComment },
    { headers: { "Content-Type": "application/json", ...authHeader(token) } }
  );
  return data;
};

export const deleteComment = async (token, courseId, commentId) => {
  const { data } = await axios.delete(
    `${API_BASE_URL}/api/courses/${courseId}/comments/${commentId}`,
    { headers: authHeader(token) }
  );
  return data;
};
