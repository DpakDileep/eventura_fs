import api from "./api";

export const getSeatMap = async (eventId) => {
  const { data } = await api.get(`/events/${eventId}/seats/`);
  return data; // { eventId, rows, cols, seats: { A1: "available"|"taken", ... } }
};

export const bookTicket = async (eventId, quantity, selectedSeats = []) => {
  const { data } = await api.post("/tickets/book/", {
    eventId,
    quantity,
    selectedSeats,
  });
  return data;
};

export const getMyTickets = async () => {
  const { data } = await api.get("/tickets/my/");
  return data;
};

export const cancelTicket = async (ticketId) => {
  const { data } = await api.patch(`/tickets/${ticketId}/cancel/`);
  return data;
};
