import React from "react";
import { Card, CardBody, CardImg, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function EventCard({ event }) {
  const navigate = useNavigate();

  const availableSeats =
    event.available_capacity !== undefined ? event.available_capacity : event.capacity;

  const isSoldOut = availableSeats === 0;
  const isLowStock = !isSoldOut && availableSeats <= 10;

  return (
    <Card
      className="h-100"
      style={{ maxWidth: "350px", cursor: "pointer", position: "relative", overflow: "hidden" }}
      onClick={() => navigate("/event-details", { state: { event: event } })}
    >
      {/* ── Event image ── */}
      <div style={{ position: "relative" }}>
        <CardImg
          src={event.imageUrl}
          alt={event.title}
          style={{ height: "150px", objectFit: "cover", display: "block" }}
        />
        {/* Sold out overlay */}
        {isSoldOut && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: "18px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                border: "2px solid #fff",
                padding: "4px 14px",
                borderRadius: "4px",
              }}
            >
              Sold Out
            </span>
          </div>
        )}
        {/* Category badge */}
        {event.category && (
          <Badge
            bg="dark"
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              textTransform: "capitalize",
              fontSize: "11px",
              opacity: 0.9,
            }}
          >
            {event.category}
          </Badge>
        )}
      </div>

      <CardBody className="d-flex flex-column">
        <h1 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "6px", lineHeight: "1.3" }}>
          {event.title}
        </h1>

        <p className="text-muted mb-1" style={{ fontSize: "13px" }}>
          <i className="bi bi-calendar3 me-1"></i>
          {event.date}
        </p>

        <p className="text-muted mb-2" style={{ fontSize: "13px" }}>
          <i className="bi bi-geo-alt me-1"></i>
          {event.location}
        </p>

        {/* ── Available seats row ── */}
        <div className="d-flex align-items-center mb-2">
          <i
            className="bi bi-ticket-perforated me-1"
            style={{ fontSize: "13px", color: isSoldOut ? "#dc3545" : isLowStock ? "#fd7e14" : "#198754" }}
          ></i>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: isSoldOut ? "#dc3545" : isLowStock ? "#fd7e14" : "#198754",
            }}
          >
            {isSoldOut
              ? "Sold Out"
              : isLowStock
              ? `Only ${availableSeats} seat${availableSeats === 1 ? "" : "s"} left!`
              : `${availableSeats} seats available`}
          </span>
        </div>

        <p style={{ fontSize: "18px", fontWeight: "bold", marginTop: "auto", marginBottom: 0 }}>
          {event.price}
        </p>
      </CardBody>
    </Card>
  );
}
