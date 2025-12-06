import React, { useState, useEffect } from "react";
import axios from "axios";
import EventList from "./EventList";
import { Button, Container } from "react-bootstrap";
import Banner from "../assets/images/banner2.png";

export default function Homepage() {
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
      <Container>
        <img
          src={Banner}
          alt="Homepage Banner"
          width={"100%"}
          style={{ marginTop: "100px" }}
        />
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
