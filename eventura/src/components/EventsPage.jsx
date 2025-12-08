import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Container } from "react-bootstrap";
import EventCard from "./EventCard";

export default function EventsPage() {
  const [events, setEvents] = useState(
    JSON.parse(localStorage.getItem("events")) || []
  );
  const location = useLocation();

  return (
    <>
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
      </Container>
    </>
  );
}
