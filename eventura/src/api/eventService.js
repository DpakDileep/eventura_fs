/**
 * eventService.js — Event API calls
 */

import api from "./api";

export const getEvents = async (filters = {}) => {
  // filters: { title, location, category }
  const { data } = await api.get("/events/", { params: filters });
  return data;
};

export const getEvent = async (id) => {
  const { data } = await api.get(`/events/${id}/`);
  return data;
};

export const createEvent = async (eventData) => {
  const { data } = await api.post("/events/", eventData);
  return data;
};

export const updateEvent = async (id, eventData) => {
  const { data } = await api.put(`/events/${id}/`, eventData);
  return data;
};

export const deleteEvent = async (id) => {
  await api.delete(`/events/${id}/`);
};

export const getEventAttendees = async (id) => {
  const { data } = await api.get(`/events/${id}/attendees/`);
  return data;
};
