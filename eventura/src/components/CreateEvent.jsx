import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import { Card, CardBody, Container } from "react-bootstrap";

export default function CreateEvent() {
  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);
  };

  //   const navigate = useNavigate();
  //   const [events, setEvents] = useState(
  //     JSON.parse(localStorage.getItem("events")) || []
  //   );
  //   const newEvent = {
  //     id: 111,
  //     title: "Introduction to Quantum Computing & Qubits",
  //     imageUrl:
  //       "https://placehold.co/400x200/007bff/FFFFFF?text=Quantum+Computing",
  //     date: "Wed, May 20, 2026",
  //     time: "10:00 AM - 11:30 AM IST",
  //     location: "Online / Zoom",
  //     organizer: "The Physics Institute",
  //     price: "$15.00",
  //     capacity: 250,
  //   };
  //   function handleAddNewEvent(event) {
  //     event.preventDefault();
  //     setEvents([...events, newEvent]);
  //     localStorage.setItem("events", JSON.stringify([...events, newEvent]));
  //     navigate("/");
  //   }

  return (
    <div>
      <Container
        style={{
          paddingTop: "120px",
          paddingBottom: "20px",
        }}
        className="d-flex justify-content-center align-items-center"
      >
        <Card className="shadow-sm" style={{ width: "75%"}}>
          <CardBody className="p-4">
            <h3 className="text-center mb-4">Host a New Event</h3>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Form.Group as={Col} md="7" controlId="validationCustom01">
                  <Form.Label>Event Title</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g., Laugh Out Loud: Stand-up Comedy Night"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide an event title.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="4" controlId="validationCustom02">
                  <Form.Label>Organizer Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="e.g., Siva Tech Events"
                    name="organizer"
                  />
                  <Form.Control.Feedback>
                    Please provide the organizer's name.
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} md="4" controlId="validationCustom03">
                  <Form.Label>Date</Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Sat, May 20, 2026"
                      name="date"
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a date.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group as={Col} md="4" controlId="validationCustom04">
                  <Form.Label>Time</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 10:00 AM - 11:30 AM IST"
                    name="time"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a time.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="4" controlId="validationCustom05">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., The Comedy Lounge, Mumbai"
                    name="location"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a location
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} md="7" controlId="validationCustom06">
                  <Form.Label>Image URL</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>
                      <i className="bi bi-link-45deg"></i>
                    </InputGroup.Text>
                    <Form.Control
                      required
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      name="imageUrl"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a valid image URL.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group as={Col} md="5" controlId="validationCustom07">
                  <Form.Label>Contact Email</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>@ </InputGroup.Text>
                    <Form.Control
                      required
                      type="email"
                      placeholder="contact@example.com"
                      name="email"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a valid contact email.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group as={Col} md="4" controlId="validationCustom08">
                  <Form.Label>Price</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>₹ </InputGroup.Text>
                    <Form.Control
                      required
                      type="text"
                      placeholder="e.g., 750 or Free"
                      name="price"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a price.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group as={Col} md="4" controlId="validationCustom09">
                  <Form.Label>Capacity</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    placeholder="e.g., 150"
                    name="capacity"
                    min="1"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide the event capacity.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="4" controlId="validationCustom10">
                  <Form.Label>Category</Form.Label>
                  <Form.Select required name="category">
                    <option value="">Select Category...</option>
                    <option value="tech">Tech</option>
                    <option value="music">Music</option>
                    <option value="comedy">Comedy</option>
                    <option value="gaming">Gaming</option>
                    <option value="dance">Dance</option>
                    <option value="party">Party</option>
                    <option value="other">Other</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select an event category.
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
              <Row className="mb-4">
                <Form.Group as={Col} md="12" controlId="validationCustom11">
                  <Form.Label>Event Description</Form.Label>
                  <Form.Control
                    required
                    as="textarea"
                    rows={3}
                    placeholder="A brief and exciting description of the event..."
                    name="description"
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a detailed description.
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Button type="submit" className="w-100 mt-3  btn-dark" size="lg" >
                <i className="bi bi-calendar-plus me-2"></i> Publish New Event
              </Button>
            </Form>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}
