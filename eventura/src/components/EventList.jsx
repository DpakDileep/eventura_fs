import React from "react";
import { Col, Row } from "react-bootstrap";
import EventCard from "./EventCard";

export default function EventList({ events }) {
  return (
    <div>
      <Row>
        {events.map((event) => {
          return (
            <Col key={event.id} xs={12} sm={8} md={6} lg={3} className="mb-4"> 
              <EventCard event={event} />
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
