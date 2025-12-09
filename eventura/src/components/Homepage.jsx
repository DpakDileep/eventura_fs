import React, { useState, useEffect } from "react";
import axios from "axios";
import EventList from "./EventList";
import { Button, Col, Container, Row, Toast, ToastContainer } from "react-bootstrap";
import Banner from "../assets/images/banner2.png";
import Music from "../assets/images/music.svg";
import Dance from "../assets/images/dance.svg";
import Gaming from "../assets/images/gaming.svg";
import Comedy from "../assets/images/comedy.svg";
import Party from "../assets/images/party.svg";
import Tech from "../assets/images/tech.svg";
import { useLocation, useNavigate } from "react-router-dom";

export default function Homepage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
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

  useEffect(() => {
      if (location.state?.message) {
        setShowToast(true);
      }
    }, [location.state]);

  function handleShowMore() {
    setVisibleCard(events.length);
  }

  function handleShowLess() {
    setVisibleCard(4);
  }

  return (
    <div>
      <ToastContainer
          position="top-end"
          className="p-3"
          style={{ marginTop: "90px" }}
        >
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={5000}
            autohide
            bg="success"
          >
            <Toast.Body className="text-light bi bi-check-circle-fill">{" "}{location.state?.message}</Toast.Body>
          </Toast>
        </ToastContainer>
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
        <Row>
          <Col md={2} className="text-center">
            <img
              src={Music}
              alt="music"
              className="img-fluid rounded-circle shadow-lg mb-2"
              style={{ width: "100px", height: "100px", objectFit: "cover", cursor:"pointer" }}
              onClick={() =>
                navigate("/events", { state: { category: "music" } })
              }
            />
            <p>Music</p>
          </Col>
          <Col md={2} className="text-center">
            <img
              src={Dance}
              alt="dance"
              className="img-fluid rounded-circle shadow-lg mb-2"
              style={{ width: "100px", height: "100px", objectFit: "cover", cursor:"pointer" }}
              onClick={() =>
                navigate("/events", { state: { category: "dance" } })
              }
            />
            <p>Dance</p>
          </Col>
          <Col md={2} className="text-center">
            <img
              src={Gaming}
              alt="gaming"
              className="img-fluid rounded-circle shadow-lg mb-2"
              style={{ width: "100px", height: "100px", objectFit: "cover", cursor:"pointer" }}
              onClick={() =>
                navigate("/events", { state: { category: "gaming" } })
              }
            />
            <p>Gaming</p>
          </Col>
          <Col md={2} className="text-center">
            <img
              src={Comedy}
              alt="comedy"
              className="img-fluid rounded-circle shadow-lg mb-2"
              style={{ width: "100px", height: "100px", objectFit: "cover", cursor:"pointer" }}
              onClick={() =>
                navigate("/events", { state: { category: "comedy" } })
              }
            />
            <p>Comedy</p>
          </Col>
          <Col md={2} className="text-center">
            <img
              src={Party}
              alt="party"
              className="img-fluid rounded-circle shadow-lg mb-2"
              style={{ width: "100px", height: "100px", objectFit: "cover", cursor:"pointer" }}
              onClick={() =>
                navigate("/events", { state: { category: "party" } })
              }
            />
            <p>Party</p>
          </Col>
          <Col md={2} className="text-center">
            <img
              src={Tech}
              alt="tech"
              className="img-fluid rounded-circle shadow-lg mb-2"
              style={{ width: "100px", height: "100px", objectFit: "cover", cursor:"pointer" }}
              onClick={() =>
                navigate("/events", { state: { category: "tech" } })
              }
            />
            <p>Tech</p>
          </Col>
        </Row>
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
