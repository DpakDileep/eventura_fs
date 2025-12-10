import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Container,
  Row,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";

export default function MyTickets() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const tickets = JSON.parse(localStorage.getItem("tickets")) || [];
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  const userTickets = tickets.filter((t) => t.userEmail === currentUser?.email);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", {
        state: { messageMyTicket: "Please login to view your tickets" },
      });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (location.state?.message) {
      setShowToast(true);
    }
  }, [location.state]);

  return (
    <>
      {currentUser && (
        <Container style={{ marginTop: "140px" }}>
          <h2 className="bi bi-ticket-perforated">Here are your tickets!</h2>
          {userTickets.length === 0 ? (
            <p className="text-muted">
              You have no tickets yet. Browse events and book your first one!
            </p>
          ) : (
            <>
              <ToastContainer
                position="top-end"
                className="p-3"
                style={{ marginTop: "90px" }}
              >
                <Toast
                  onClose={() => setShowToast(false)}
                  show={showToast}
                  delay={3000}
                  autohide
                  bg="success"
                >
                  <Toast.Body className="text-light bi bi-check-circle-fill">{location.state?.message}</Toast.Body>
                </Toast>
              </ToastContainer>
              {tickets
                .filter((t) => t.userEmail === currentUser.email)
                .map((t) => {
                  return (
                    <Card
                      key={t.ticketId}
                      style={{
                        maxWidth: "1250px",
                        overflow: "hidden",
                        marginTop: "50px",
                        marginBottom: "50px",
                      }}
                    >
                      <Row>
                        <Col md={8} className="position-relative px-0" >
                          <img
                            src={t.eventImage}
                            style={{
                              height: "350px",
                              width: "100%",
                              objectFit: "cover",
                              borderRight: "2px dashed #444444ff",
                            }}
                          ></img>
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: "rgba(0,0,0,0.55)",
                            }}
                          ></div>
                          <div
                            className="position-absolute text-white z-3 px-5 pb-3"
                            style={{
                              left: 0,
                              bottom: 0,
                            }}
                          >
                            <h2 className="fw-bold">{t.eventTitle}</h2>
                            <h6 className="m-0">{t.eventLocation}</h6>
                            <h6>
                              {t.eventDate}
                              {" | "}
                              {t.eventTime}
                            </h6>
                          </div>
                        </Col>
                        <Col
                          md={4}
                          className="position-relative d-flex align-items-center"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          <div className="p-4 w-100">
                            <h5 className="fw-bold mb-3">Ticket Details</h5>

                            <div className="mb-2">
                              <span className="text-muted">Full Name:</span>
                              <h6 className="m-0">
                                {t.userFirstName} {t.userLastName}
                              </h6>
                            </div>

                            <div className="mb-2">
                              <span className="text-muted">Email:</span>
                              <h6 className="m-0">{t.userEmail}</h6>
                            </div>

                            <div className="mb-2">
                              <span className="text-muted">
                                Number of Tickets:
                              </span>
                              <h6 className="m-0">{t.quantity}</h6>
                            </div>

                            <div className="mt-3 pt-3 border-top">
                              <span className="text-muted">Ticket ID</span>
                              <h6 className="m-0 fw-bold">{t.ticketId}</h6>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  );
                })}
            </>
          )}
        </Container>
      )}
    </>
  );
}
