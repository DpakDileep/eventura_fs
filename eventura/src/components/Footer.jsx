import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Footer() {
  const headingStyle = {
    color: "#DBDAE3",
    fontSize: "16px",
    marginBottom: "20px",
    fontWeight: "bold",
  };
  const linkStyle = {
    textDecoration: "none",
    color: "#C2C2CC",
    fontSize: "14px",
    display: "block",
    marginBottom: "12px",
  };
  return (
    <div>
      <footer
        style={{
          backgroundColor: "#202020",
          color: "white",
          marginTop: "100px",
        }}
      >
        <Container>
          <Row className="pt-5">
            <Col md={3} lg={3} sm={6}>
              <h5 style={headingStyle}>Use Eventura</h5>
              <Link to="/events" style={linkStyle}>
                Browse All Events
              </Link>
              <Link to="/my-tickets" style={linkStyle}>
                My Tickets
              </Link>
              <Link to="/login" style={linkStyle}>
                Log In
              </Link>
              <Link to="/signup" style={linkStyle}>
                Sign Up
              </Link>
            </Col>
            <Col md={3} lg={3} sm={6}>
              <h5 style={headingStyle}>Plan Events</h5>
              <Link to="/create-event" style={linkStyle}>
                Host an Event
              </Link>
              <Link to="/dashboard" style={linkStyle}>
                Organizer Dashboard
              </Link>
              <Link to="create-event" style={linkStyle}>
                Sell Tickets
              </Link>
              <Link to="/dashboard" style={linkStyle}>
                Manage Your Events
              </Link>
            </Col>
            <Col md={3} lg={3} sm={6}>
              <h5 style={headingStyle}>Find Your Vibe</h5>
              <Link
                to="/events"
                state={{ category: "music" }}
                style={linkStyle}
              >
                Music & Concerts
              </Link>
              <Link
                to="/events"
                state={{ category: "party" }}
                style={linkStyle}
              >
                Parties & Nightlife
              </Link>
              <Link
                to="/events"
                state={{ category: "dance" }}
                style={linkStyle}
              >
                Dance & Theatre
              </Link>
              <Link
                to="/events"
                state={{ category: "comedy" }}
                style={linkStyle}
              >
                Stand-up Comedy
              </Link>
              <Link
                to="/events"
                state={{ category: "gaming" }}
                style={linkStyle}
              >
                Gaming & Esports
              </Link>
              <Link to="/events" state={{ category: "tech" }} style={linkStyle}>
                Tech Workshops
              </Link>
            </Col>
            <Col md={3} lg={3} sm={6}>
              <h5 style={headingStyle}>Connect With Us</h5>
              <div className="d-flex gap-3 mb-3">
                <a href="https://facebook.com">
                  <i className="bi bi-facebook fs-5 text-light"></i>
                </a>
                <a href="https://twitter.com">
                  <i className="bi bi-twitter-x fs-5 text-light"></i>
                </a>
                <a href="https://instagram.com">
                  <i className="bi bi-instagram fs-5 text-light"></i>
                </a>
                <a href="https://linkedin.com">
                  <i className="bi bi-linkedin fs-5 text-light"></i>
                </a>
              </div>
              <p
                style={{ fontSize: "14px", color: "#C2C2CC" }}
                className="mb-0"
              >
                <strong>Need Help?</strong>
              </p>
              <a
                href="mailto:support@eventura.com"
                style={{
                  color: "#C2C2CC",
                  textDecoration: "none",
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                support@eventura.com
              </a>
            </Col>
          </Row>
          <hr style={{ borderColor: "#C2C2CC" }} />
          <Row className="mt-4">
            <Col lg={6} md={6} sm={12}>
              <p style={{ fontSize: "12px", color: "#C2C2CC" }}>
                © 2026 Eventura. All rights reserved.
              </p>
            </Col>
            <Col lg={6} md={6} sm={12} className="text-end">
              <span
                style={{
                  fontSize: "12px",
                  color: "#C2C2CC",
                  marginRight: "15px",
                  cursor: "pointer",
                }}
              >
                Privacy Policy
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "#C2C2CC",
                  cursor: "pointer",
                }}
              >
                Terms of Service
              </span>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}
