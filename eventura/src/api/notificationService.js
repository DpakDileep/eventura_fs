/**
 * notificationService.js — Notification API calls
 */

import api from "./api";

export const getNotifications = async () => {
  const { data } = await api.get("/notifications/");
  return data; // { notifications: [...], unread_count: N }
};

export const markNotificationRead = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read/`);
  return data;
};

export const deleteNotification = async (id) => {
  await api.delete(`/notifications/${id}/read/`);
};
