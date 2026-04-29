import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Container, Button } from "react-bootstrap";
import EventCard from "./EventCard";
import { getEvents } from "../api/eventService";

export default function EventsPage() {
  const location = useLocation();
  const [allEvents, setAllEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all events once on mount
  useEffect(() => {
    async function fetchAllEvents() {
      try {
        const data = await getEvents();
        setAllEvents(data);
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllEvents();
  }, []);

  // Apply filters whenever location.state or allEvents changes
  useEffect(() => {
    if (!allEvents.length) return;
    const { value: eventName, category: eventCategory, location: eventLocation } = location.state || {};

    if (eventName) {
      const filtered = allEvents.filter((e) =>
        e.title.toLowerCase().includes(eventName.toLowerCase())
      );
      setEvents(filtered);
      setError(filtered.length === 0);
    } else if (eventCategory) {
      const filtered = allEvents.filter(
        (e) => e.category.toLowerCase() === eventCategory.toLowerCase()
      );
      setEvents(filtered);
      setError(filtered.length === 0);
    } else if (eventLocation) {
      const filtered = allEvents.filter((e) =>
        e.location.toLowerCase().includes(eventLocation.toLowerCase())
      );
      setEvents(filtered);
      setError(filtered.length === 0);
    } else {
      setEvents(allEvents);
      setError(false);
    }
  }, [location.state, allEvents]);

  if (loading) {
    return (
      <Container style={{ paddingTop: "150px" }} className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container style={{ paddingTop: "120px" }}>
      <Row>
        {events.map((event) => (
          <Col key={event.id} xs={12} sm={8} md={6} lg={3} className="mb-4">
            <EventCard event={event} />
          </Col>
        ))}
      </Row>
      <div className="d-flex justify-content-center flex-column text-center align-items-center">
        {error && <h1>No Event Found</h1>}
        {location.state && (
          <Button
            variant="outline-dark"
            className="mb-5 rounded-pill"
            style={{ width: "25%" }}
            onClick={() => {
              setEvents(allEvents);
              setError(false);
              window.history.replaceState({}, "");
            }}
          >
            Show Full Events
          </Button>
        )}
      </div>
    </Container>
  );
}
