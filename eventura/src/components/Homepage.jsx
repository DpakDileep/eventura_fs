import React, { useState, useEffect } from "react";
import axios from "axios";
import EventList from "./EventList";
import { Container } from "react-bootstrap";

export default function Homepage() {
  const [events, setEvents] = useState(
    JSON.parse(localStorage.getItem("events")) || []
  );
  useEffect(() => {
    if (events.length === 0) {
      axios.get("/sampleEvents.json").then((response) => {
        setEvents([...response.data]);
        localStorage.setItem("events", JSON.stringify([...response.data]));
      });
    }
  }, []);

  return (
    <div>
      <Container className="mt-4">
        <EventList events={events} />
      </Container>
    </div>
  );
}
