import React, { useEffect, useState } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import EventCard from "./EventCard";
import { useLocation } from "react-router-dom";

export default function EventsPage() {
  const location = useLocation();
  const [allEvents, setAllEvents] = useState(
    JSON.parse(localStorage.getItem("events")) || []
  );
  const [eventName, setEventName] = useState(location?.state?.value);
  const [eventLocation, setEventLocation] = useState(location?.state?.location);
  const [error, setError] = useState(false);

  const [events, setEvents] = useState(allEvents);
  useEffect(() => {
    if (eventName) {
      const filteredEvents = allEvents.filter((e) =>
        e.title.toLowerCase().includes(eventName.toLowerCase())
      );
      setEvents(filteredEvents);
      setError(filteredEvents.length == 0);
    }
  }, [eventName]);
  useEffect(() => {
    if (eventLocation) {
      const filteredEvents = allEvents.filter((e) =>
        e.location.toLowerCase().includes(eventLocation.toLowerCase())
      );
      setEvents(filteredEvents);
      setError(filteredEvents.length == 0);
    }
  }, [eventLocation]);

  useEffect(() => {
    setEventName(location?.state?.value);
    setEventLocation(location?.state?.location);
  }, [location.state]);

  return (
    <Container style={{ paddingTop: "120px" }}>
      <Row>
        {events.map((event) => {
          return (
            <Col key={event.id} xs={12} sm={8} md={6} lg={3} className="mb-4">
              <EventCard event={event} />
            </Col>
          );
        })}
      </Row>
      <div className="d-flex justify-content-center flex-column text-center align-items-center">
      {error && <h1>No Event Found</h1>}
      {location.state && <Button variant="secondary" className="mb-5" style={{width:"25%"}} onClick={()=>{setEvents(allEvents),setError(false),location.state=""}}>Show Full Events</Button>}
      </div>
    </Container>
  );
}
