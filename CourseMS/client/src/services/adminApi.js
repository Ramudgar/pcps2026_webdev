import axios from "axios";
import { API_BASE_URL } from "../config/api.config";

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export const getAdminStats = async (token) => {
  const { data } = await axios.get(`${API_BASE_URL}/api/users/admin/stats`, {
    headers: authHeader(token),
  });
  return data;
};

export const getAllUsers = async (token, page = 1, includeInactive = true) => {
  const { data } = await axios.get(
    `${API_BASE_URL}/api/users?page=${page}&includeInactive=${includeInactive}`,
    { headers: authHeader(token) }
  );
  return data;
};

export const deactivateUser = async (token, userId) => {
  const { data } = await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
    headers: authHeader(token),
  });
  return data;
};

export const reactivateUser = async (token, userId) => {
  const { data } = await axios.patch(
    `${API_BASE_URL}/api/users/${userId}/reactivate`,
    {},
    { headers: authHeader(token) }
  );
  return data;
};
