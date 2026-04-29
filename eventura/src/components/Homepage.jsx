import React, { useState, useEffect } from "react";
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
import { getEvents } from "../api/eventService";

export default function Homepage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const [events, setEvents] = useState([]);
  const [visibleCard, setVisibleCard] = useState(4);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
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
      <ToastContainer position="top-end" className="p-3" style={{ marginTop: "90px" }}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Body className="text-light bi bi-check-circle-fill">
            {" "}{location.state?.message}
          </Toast.Body>
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
          style={{ position: "absolute", bottom: 40, right: 255, opacity: "0", zIndex: 1 }}
          onClick={() => navigate("/events")}
        >
          Explore
        </Button>
      </Container>
      <Container className="mt-5">
        <Row>
          {[
            { src: Music, alt: "music", label: "Music" },
            { src: Dance, alt: "dance", label: "Dance" },
            { src: Gaming, alt: "gaming", label: "Gaming" },
            { src: Comedy, alt: "comedy", label: "Comedy" },
            { src: Party, alt: "party", label: "Party" },
            { src: Tech, alt: "tech", label: "Tech" },
          ].map(({ src, alt, label }) => (
            <Col md={2} className="text-center" key={alt}>
              <img
                src={src}
                alt={alt}
                className="img-fluid rounded-circle shadow-lg mb-2"
                style={{ width: "100px", height: "100px", objectFit: "cover", cursor: "pointer" }}
                onClick={() => navigate("/events", { state: { category: alt } })}
              />
              <p>{label}</p>
            </Col>
          ))}
        </Row>
      </Container>
      <Container className="mt-5">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            <EventList events={events.slice(0, visibleCard)} />
            <div className="text-center mb-3">
              {visibleCard >= events.length ? (
                <Button
                  variant="outline-dark"
                  className="bi bi-arrow-up rounded-pill"
                  onClick={handleShowLess}
                >
                  {" "}Show less
                </Button>
              ) : (
                <Button
                  variant="outline-dark"
                  className="bi bi-arrow-down rounded-pill"
                  onClick={handleShowMore}
                >
                  {" "}Show more
                </Button>
              )}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
