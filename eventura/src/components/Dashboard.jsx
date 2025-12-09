import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Container,
  Button,
  ToastContainer,
  Toast,
} from "react-bootstrap";
import EventCard from "./EventCard";
import { useLocation } from "react-router-dom";

export default function Dashboard() {
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const [allevents, setAllEvents] = useState(
    JSON.parse(localStorage.getItem("events")) || []
  );
  const currentUser = JSON.parse(sessionStorage?.getItem("currentUser"));
  const [events, setEvents] = useState(
    allevents.filter((e) => e.email == currentUser.email) || []
  );

  useEffect(() => {
    if (
      location.state?.message ||
      location.state?.messageUpdate ||
      location.state?.messagePublish
    ) {
      setShowToast(true);
    }
  }, [location.state]);

  return (
    <>
      <Container style={{ paddingTop: "120px" }}>
        <ToastContainer
          position="top-end"
          className="p-3"
          style={{ marginTop: "90px" }}
        >
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
            bg="success"
          >
            <Toast.Body className="text-light bi bi-check-circle-fill">
              {" "}
              {location.state?.message ||
                location.state?.messageUpdate ||
                location.state?.messagePublish}
            </Toast.Body>
          </Toast>
        </ToastContainer>
        <h2>
          Welcome{" "}
          {currentUser.firstName.slice(0, 1).toUpperCase() +
            currentUser.firstName.slice(1).toLowerCase()}
          !
        </h2>
        <h6 className="mb-5">
          Manage and update the events you've created below.
        </h6>
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
