import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [events, setEvents] = useState(
    JSON.parse(localStorage.getItem("events")) || []
  );
  const newEvent = {
    id: 111,
    title: "Introduction to Quantum Computing & Qubits",
    imageUrl:
      "https://placehold.co/400x200/007bff/FFFFFF?text=Quantum+Computing",
    date: "Wed, May 20, 2026",
    time: "10:00 AM - 11:30 AM IST",
    location: "Online / Zoom",
    organizer: "The Physics Institute",
    price: "$15.00",
    capacity: 250,
  };
  function handleAddNewEvent(event) {
    event.preventDefault();
    setEvents([...events, newEvent]);
    localStorage.setItem("events", JSON.stringify([...events, newEvent]));
    navigate("/")
  }

  return (
    <div>
      <button
        className="btn btn-primary"
        type="submit"
        onClick={handleAddNewEvent}
      >
        add
      </button>
    </div>
  );
}
