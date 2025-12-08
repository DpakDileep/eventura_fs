import React, { useEffect, useState } from "react";
import { Row, Col, Container, Button } from "react-bootstrap";
import EventCard from "./EventCard";

export default function Dashboard() {
  const [allevents, setAllEvents] = useState(
    JSON.parse(localStorage.getItem("events")) || []
  );
  const currentUser = JSON.parse(sessionStorage?.getItem("currentUser"));
  const [events,setEvents]=useState(allevents.filter((e)=>e.email==currentUser.email)||[])
  
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
    </Container>
  );
}
