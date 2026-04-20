import axios from "axios";
import { ENDPOINTS } from "../config/api.config";

const api = axios.create({
  headers: { "Content-Type": "application/json" },
});

// Backend wraps responses as { success, message, data: { token, user } }.
// Unwrap once here so callers can use { token, user } directly.
const unwrap = (res) => res?.data?.data ?? res?.data;

export const registerUser = async ({ name, email, password, role }) => {
  const res = await api.post(ENDPOINTS.users.register, {
    name,
    email,
    password,
    role,
  });
  return unwrap(res);
};

export const loginUser = async ({ email, password }) => {
  const res = await api.post(ENDPOINTS.users.login, { email, password });
  return unwrap(res);
};
