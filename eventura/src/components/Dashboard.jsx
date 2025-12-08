import React, { useEffect, useState } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import EventCard from "./EventCard";

export default function Dashboard() {
  const [allevents, setAllEvents] = useState(
    JSON.parse(localStorage.getItem("events")) || []
  );
  const currentUser = JSON.parse(sessionStorage?.getItem("currentUser"));
  const [events, setEvents] = useState(
    allevents.filter((e) => e.email == currentUser.email) || []
  );

  return (
    <>
      <Container style={{ paddingTop: "120px" }}>
        <h2>Welcome {currentUser.firstName.slice(0,1).toUpperCase() + currentUser.firstName.slice(1).toLowerCase()}!</h2>
        <h6 className="mb-5">Manage and update the events you've created below.</h6>
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
      {events.length === 0 && (
        <Container className="text-center mt-5">
          <h3>No Events Available</h3>
          <p>Click "Create Event" to get started</p>
        </Container>
      )}
    </>
  );
}
