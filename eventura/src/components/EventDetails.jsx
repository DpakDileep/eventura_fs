import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";

export default function EventDetails() {
  const location = useLocation();
  const event = location?.state?.event;

  return (
    <>
      <Container
        className="d-flex justify-content-center"
        style={{ paddingTop: "140px", position: "relative" }}
      >
        <div
          style={{
            backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "450px",
            filter: "blur(15px)",
            transform: "scale(1.2)",
            position: "absolute",
            marginTop: "140px",
            top: 28,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}
        ></div>

        <img
          src={event.imageUrl}
          alt="Event image"
          className="rounded-5"
          style={{
            objectFit: "cover",
            width: "100%",
            height: "500px",
            zIndex: 1,
          }}
        />
      </Container>
      <Container style={{ marginTop: "50px", marginBottom: "40px" }}>
        <Row>
          <Col md={8}>
            <h1 style={{ fontWeight: "bold", marginBottom: "16px" }}>
              {event.title}
            </h1>

            <p className="text-muted" style={{ marginBottom: "4px" }}>
              <strong>Date:</strong> {event.date}
            </p>

            <p className="text-muted" style={{ marginBottom: "4px" }}>
              <strong>Time:</strong> {event.time}
            </p>

            <p className="text-muted" style={{ marginBottom: "12px" }}>
              <strong>Location:</strong> {event.location}
            </p>

            <p className="text-muted" style={{ marginBottom: "12px" }}>
              <strong>Organizer:</strong> {event.organizer}
            </p>

            {event.description && (
              <p style={{ marginTop: "16px" }}>{event.description}</p>
            )}
          </Col>
          <Col md={4}>
            <div
              className="p-4 rounded-4"
              style={{
                border: "1px solid #e0e0e0",
                backgroundColor: "white",
              }}
            >
              <h4 style={{ marginBottom: "16px" }}>Event Details</h4>

              <p style={{ marginBottom: "8px" }}>
                <strong>Price:</strong> {event.price}
              </p>

              <p style={{ marginBottom: "8px" }}>
                <strong>Capacity:</strong> {event.capacity}
              </p>

              <p style={{ marginBottom: "8px" }}>
                <strong>Contact Email:</strong>{" "}
                <a href={`mailto:${event.email}`}>{event.email}</a>
              </p>
              <Button
                variant="primary"
                className="w-100 mt-3 fw-bold py-2"
              >
                Reserve a Seat
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
