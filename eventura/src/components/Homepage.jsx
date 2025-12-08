import React, { useState, useEffect } from "react";
import axios from "axios";
import EventList from "./EventList";
import { Button, Container } from "react-bootstrap";
import Banner from "../assets/images/banner2.png";
import { Navigate, useNavigate } from "react-router-dom";

export default function Homepage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState(
    JSON.parse(localStorage.getItem("events")) || []
  );
  const [visibleCard, setVisibleCard] = useState(4);

  useEffect(() => {
    if (events.length === 0) {
      axios.get("/sampleEvents.json").then((response) => {
        setEvents([...response.data]);
        localStorage.setItem("events", JSON.stringify([...response.data]));
      });
    }
  }, []);

  function handleShowMore() {
    setVisibleCard(events.length);
  }

  function handleShowLess() {
    setVisibleCard(4);
  }

  return (
    <div>
      <Container style={{ position: "relative" }}>
        <img
          src={Banner}
          alt="Homepage Banner"
          width={"100%"}
          className="rounded-4"
          style={{ marginTop: "120px", zIndex: 0 }}
        />
        <Button
          style={{
            position: "absolute",
            bottom: 40,
            right: 255,
            opacity: "0",
            zIndex: 1,
          }}
          onClick={() => navigate("/events")}
        >
          Exploreb
        </Button>
      </Container>
      <Container className="mt-5">
        <EventList events={events.slice(0, visibleCard)} />
        <div className="text-center mb-3">
          {visibleCard === events.length ? (
            <Button
              variant="outline-dark"
              className="bi bi-arrow-up rounded-pill"
              onClick={handleShowLess}
            >
              Show less
            </Button>
          ) : (
            <Button
              variant="outline-dark"
              className="bi bi-arrow-down rounded-pill"
              onClick={handleShowMore}
            >
              Show more
            </Button>
          )}
        </div>
      </Container>
    </div>
  );
}
