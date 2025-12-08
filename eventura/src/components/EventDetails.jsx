import React, { use, useState } from "react";
import {
  Button,
  Col,
  Container,
  Row,
  Modal,
  Card,
  Form,
  Image,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";

export default function EventDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(location?.state?.event);
  const [allEvents, setAllEvents] = useState(
    JSON.parse(localStorage.getItem("events")) || []
  );
  const [ownEvent, setOwnEvent] = useState(event.email == currentUser.email);
  function handleDelete(id) {
    const deletedEvents = allEvents.filter((e) => e.id !== id);
    localStorage.setItem("events", JSON.stringify(deletedEvents));
    navigate("/dashboard");
  }
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || {};
  const isLoggedIn = JSON.parse(sessionStorage.getItem("isLoggedIn")) || "";

  const [show, setShow] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [tickets, setTickets] = useState(
    JSON.parse(localStorage.getItem("tickets")) || []
  );

  function handleShowModal() {
    if (isLoggedIn === true) {
      setShow(true);
    } else {
      alert("please Login to reserve a seat");
      navigate("/login");
    }
  }
  function handleHideModal() {
    setShow(false);
  }

  function calculateTotal() {
    if (event.price.toLowerCase() === "free") {
      return 0;
    } else {
      return Number(event.price.replace(/[^0-9.-]+/g, "")) * quantity;
    }
  }

  function handleRegister() {
    if (quantity < 1) {
      alert("Please select at least 1 ticket.");
      return;
    } else {
      const ticket = {
        ticketId: Date.now(),
        eventId: event.id,
        userEmail: currentUser.email,
        userFirstName: currentUser.firstName,
        userLastName: currentUser.lastName,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location,
        eventImage: event.imageUrl,
        quantity: Number(quantity),
        totalPrice: calculateTotal(),
      };
      const updatedTickets = [...tickets, ticket];
      setTickets(updatedTickets);
      console.log(ticket);
      console.log(tickets);
      localStorage.setItem("tickets", JSON.stringify(updatedTickets));
      alert("Ticket Reserved Successfully!");
      handleHideModal();
    }
  }

  return (
    <>
      <Container
        className="d-flex justify-content-center"
        style={{ paddingTop: "140px", position: "relative" }}
      >
        <div
          style={{
            backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "450px",
            filter: "blur(15px)",
            transform: "scale(1.2)",
            position: "absolute",
            marginTop: "140px",
            top: 28,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}
        ></div>

        <img
          src={event.imageUrl}
          alt="Event image"
          className="rounded-5"
          style={{
            objectFit: "cover",
            width: "100%",
            height: "500px",
            zIndex: 1,
          }}
        />
      </Container>
      <Container style={{ marginTop: "50px", marginBottom: "40px" }}>
        <Row>
          <Col md={8}>
            <h1 style={{ fontWeight: "bold", marginBottom: "16px" }}>
              {event.title}
            </h1>

            <p className="text-muted" style={{ marginBottom: "4px" }}>
              <strong>Date:</strong> {event.date}
            </p>

            <p className="text-muted" style={{ marginBottom: "4px" }}>
              <strong>Time:</strong> {event.time}
            </p>

            <p className="text-muted" style={{ marginBottom: "12px" }}>
              <strong>Location:</strong> {event.location}
            </p>

            <p className="text-muted" style={{ marginBottom: "12px" }}>
              <strong>Organizer:</strong> {event.organizer}
            </p>

            {event.description && (
              <p style={{ marginTop: "16px" }}>{event.description}</p>
            )}
          </Col>
          <Col md={4}>
            <div
              className="p-4 rounded-4"
              style={{
                border: "1px solid #e0e0e0",
                backgroundColor: "white",
              }}
            >
              <h4 style={{ marginBottom: "16px" }}>Event Details</h4>

              <p style={{ marginBottom: "8px" }}>
                <strong>Price:</strong> {event.price}
              </p>

              <p style={{ marginBottom: "8px" }}>
                <strong>Capacity:</strong> {event.capacity}
              </p>

              <p style={{ marginBottom: "8px" }}>
                <strong>Contact Email:</strong>{" "}
                <a href={`mailto:${event.email}`}>{event.email}</a>
              </p>
              {ownEvent ? (
                <>
                  <div className="d-flex justify-content-between mx-5">
                    <Button
                      variant="danger"
                      className=" mt-3 fw-bold py-2 bi bi-trash"
                      onClick={() => handleDelete(event.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="warning"
                      className=" mt-3 fw-bold py-2 bi bi-pencil"
                      onClick={() => {
                        handleShowModal();
                        navigate("/create-event", { state: { value: event } });
                      }}
                    >
                      Update
                    </Button>
                  </div>
                  <div className="text-center mt-4">
                    <a href="">Have Assistence ?</a>
                  </div>
                </>
              ) : (
                <Button variant="primary" className="w-100 mt-3 fw-bold py-2">
                  Reserve a Seat
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      <Modal
        show={show}
        onHide={handleHideModal}
        size="xl"
        aria-labelledby="example-custom-modal-styling-title"
        contentClassName="rounded-0"
      >
        <Modal.Body className="p-0">
          <Row style={{ minHeight: "80vh" }}>
            <Col lg={8} md={8} className="p-5 d-flex flex-column">
              <div className="text-center mb-5">
                <h2 className="fw-bold mb-2">{event.title}</h2>
                <p className="text-muted">
                  {event.date} {event.time}
                </p>
              </div>
              <Card style={{ borderColor: "blue", borderWidth: "2px" }}>
                <Card.Body>
                  <Form className="d-flex justify-content-between mb-3">
                    <Form.Label className="fw-bold">
                      Number of Tickets
                    </Form.Label>
                    <Form.Control
                      className="text-center"
                      type="number"
                      min="1"
                      style={{ width: "80px", borderColor: "black" }}
                      name="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    ></Form.Control>
                  </Form>
                  <div className="text-start">
                    <p className="fw-bold mb-1">{event.price}</p>
                    <small className="text-muted">Sales end shortly</small>
                  </div>
                </Card.Body>
              </Card>
              <div className="mt-auto d-flex justify-content-between align-items-end ">
                <div className="text-muted small">
                  Powered by <strong>Eventura</strong>
                </div>

                <Button
                  className="px-5 py-2 fw-bold btn-danger btn-lg"
                  onClick={handleRegister}
                >
                  Register
                </Button>
              </div>
            </Col>
            <Col
              lg={4}
              md={4}
              className="positon-relative px-0"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <div
                style={{
                  height: "200px",
                  backgroundImage: "url(" + event.imageUrl + ")",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
              <Button
                className="btn-light position-absolute top-0 end-0 m-3 rounded-circle"
                onClick={handleHideModal}
              >
                X
              </Button>
              <div className="p-4">
                <h5 className="fw-bold mb-4">Order summary</h5>

                <div className="d-flex justify-content-between mb-2 text-secondary">
                  <span>{quantity || 0} tickets</span>
                  <span>₹{calculateTotal()}</span>
                </div>

                <hr className="my-4" />

                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </>
  );
}
