import React from "react";
import { Card, CardBody, CardImg } from "react-bootstrap";

export default function EventCard({ event }) {
  return (
    <Card style={{ maxWidth: "350px" }}>
      <CardImg
        src={event.imageUrl}
        alt={event.title}
        style={{ height: "150px", objectFit: "cover" }}
      />

      <CardBody>
        <h1 style={{ fontSize: "25px", fontWeight: "bold" }}>{event.title}</h1>

        <p className="text-muted" style={{ fontWeight: "600px" }}>
          {event.date}
        </p>

        <p className="text-muted">{event.location}</p>

        <p style={{ fontSize: "20px", fontWeight: "bold" }}>{event.price}</p>
      </CardBody>
    </Card>
  );
}
