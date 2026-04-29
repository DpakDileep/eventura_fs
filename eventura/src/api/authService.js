/**
 * authService.js — Auth API calls
 */

import api, { setTokens, setCurrentUser, clearTokens } from "./api";

export const signup = async (userData) => {
  // userData: { firstName, lastName, email, password, role }
  const { data } = await api.post("/auth/signup/", userData);
  setTokens(data.access, data.refresh);
  setCurrentUser(data.user);
  return data.user;
};

export const login = async (email, password) => {
  const { data } = await api.post("/auth/login/", { email, password });
  setTokens(data.access, data.refresh);
  setCurrentUser(data.user);
  return data.user;
};

export const logout = async () => {
  try {
    const refresh = localStorage.getItem("refresh");
    await api.post("/auth/logout/", { refresh });
  } catch (_) {
    // swallow — we clear tokens regardless
  } finally {
    clearTokens();
  }
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me/");
  return data;
};
