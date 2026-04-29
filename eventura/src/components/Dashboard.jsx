import React, { useEffect, useState } from "react";
import {
  Row, Col, Container, Toast, ToastContainer, Card, Badge,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import api, { getCurrentUser } from "../api/api";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (
      location.state?.message ||
      location.state?.messageUpdate ||
      location.state?.messagePublish
    ) {
      setShowToast(true);
    }
  }, [location.state]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const { data } = await api.get("/dashboard/");
        setEvents(data.events);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const totalRevenue = events.reduce((sum, e) => sum + (e.total_revenue || 0), 0);
  const totalAttendees = events.reduce((sum, e) => sum + (e.attendee_count || 0), 0);

  return (
    <>
      <Container style={{ paddingTop: "120px" }}>
        <ToastContainer position="top-end" className="p-3" style={{ marginTop: "90px" }}>
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
            bg="success"
          >
            <Toast.Body className="text-light bi bi-check-circle-fill">
              {" "}
              {location.state?.message ||
                location.state?.messageUpdate ||
                location.state?.messagePublish}
            </Toast.Body>
          </Toast>
        </ToastContainer>

        <h2>
          Welcome{" "}
          {currentUser?.firstName
            ? currentUser.firstName.slice(0, 1).toUpperCase() +
              currentUser.firstName.slice(1).toLowerCase()
            : ""}
          !
        </h2>
        <h6 className="mb-4">Manage and update the events you've created below.</h6>

        {/* ── Summary stats bar ── */}
        {!loading && events.length > 0 && (
          <Row className="mb-5 g-3">
            <Col xs={12} sm={4}>
              <Card className="border-0 shadow-sm text-center py-3" style={{ background: "#f8f9fa" }}>
                <Card.Body>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#212529" }}>
                    {events.length}
                  </div>
                  <div className="text-muted" style={{ fontSize: "13px" }}>
                    <i className="bi bi-calendar-event me-1"></i>Total Events
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={4}>
              <Card className="border-0 shadow-sm text-center py-3" style={{ background: "#f8f9fa" }}>
                <Card.Body>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#198754" }}>
                    {totalAttendees}
                  </div>
                  <div className="text-muted" style={{ fontSize: "13px" }}>
                    <i className="bi bi-people me-1"></i>Total Attendees
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={4}>
              <Card className="border-0 shadow-sm text-center py-3" style={{ background: "#f8f9fa" }}>
                <Card.Body>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#0d6efd" }}>
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </div>
                  <div className="text-muted" style={{ fontSize: "13px" }}>
                    <i className="bi bi-cash-stack me-1"></i>Total Revenue
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <Row className="g-4">
            {events.map((event) => (
              <Col key={event.id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  className="h-100 shadow-sm"
                  style={{ cursor: "pointer", overflow: "hidden" }}
                  onClick={() => navigate("/event-details", { state: { event } })}
                >
                  {/* Image */}
                  <div style={{ position: "relative" }}>
                    <Card.Img
                      variant="top"
                      src={event.imageUrl}
                      alt={event.title}
                      style={{ height: "140px", objectFit: "cover" }}
                    />
                    {event.category && (
                      <Badge
                        bg="dark"
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          textTransform: "capitalize",
                          fontSize: "11px",
                        }}
                      >
                        {event.category}
                      </Badge>
                    )}
                  </div>

                  <Card.Body className="d-flex flex-column pb-0">
                    <h6 style={{ fontWeight: "700", fontSize: "14px", marginBottom: "6px" }}>
                      {event.title}
                    </h6>
                    <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                      <i className="bi bi-calendar3 me-1"></i>{event.date}
                    </p>
                    <p className="text-muted mb-2" style={{ fontSize: "12px" }}>
                      <i className="bi bi-geo-alt me-1"></i>{event.location}
                    </p>
                  </Card.Body>

                  {/* ── Per-event stats: attendees + revenue ── */}
                  <div style={{ borderTop: "1px solid #e9ecef", margin: "0 12px" }} />
                  <Card.Body className="pt-2">
                    <Row className="g-0 text-center">
                      <Col xs={6} style={{ borderRight: "1px solid #e9ecef" }}>
                        <div style={{ fontSize: "16px", fontWeight: "800", color: "#198754" }}>
                          {event.attendee_count ?? 0}
                        </div>
                        <div className="text-muted" style={{ fontSize: "10px" }}>
                          <i className="bi bi-people me-1"></i>Attendees
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div style={{ fontSize: "15px", fontWeight: "800", color: "#0d6efd" }}>
                          {event.total_revenue > 0
                            ? `₹${Number(event.total_revenue).toLocaleString("en-IN")}`
                            : event.price?.toLowerCase() === "free"
                            ? "Free"
                            : "₹0"}
                        </div>
                        <div className="text-muted" style={{ fontSize: "10px" }}>
                          <i className="bi bi-cash me-1"></i>Revenue
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {!loading && events.length === 0 && (
        <Container className="text-center mt-5">
          <h3>No Events Yet</h3>
          <p>Click "Create Event" to get started</p>
        </Container>
      )}
    </>
  );
}
