import React from "react";
import { Card, CardBody, CardImg } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function EventCard({ event }) {
  const navigate = useNavigate();
  return (
    <Card className="h-100" style={{ maxWidth: "350px" }} onClick={()=>navigate("/eventdetails", { state : {event : event}})}>
      <CardImg
        src={event.imageUrl}
        alt={event.title}
        style={{ height: "150px", objectFit: "cover" }}
      />

      <CardBody className="d-flex flex-column">
        <h1 style={{ fontSize: "25px", fontWeight: "bold" }}>{event.title}</h1>

        <p className="text-muted" style={{ fontWeight: "600px" }}>
          {event.date}
        </p>

        <p className="text-muted">{event.location}</p>

        <p style={{ fontSize: "20px", fontWeight: "bold", marginTop: "auto" }}>
          {event.price}
        </p>
      </CardBody>
    </Card>
  );
}
