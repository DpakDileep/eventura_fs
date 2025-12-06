import React, { useState, useEffect } from "react";
import axios from "axios";
import EventList from "./EventList";
import { Container } from "react-bootstrap";

export default function Homepage() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    axios.get("/sampleEvents.json").then((response) => {
      setEvents(response.data);
    });
  },[]);
  
  return (
  <div>
    <Container className="mt-4">
      <EventList events={events}/>
    </Container>
  </div>

  );
}
