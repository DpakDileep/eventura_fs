import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import { Card, CardBody, Container, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { createEvent, updateEvent } from "../api/eventService";
import { getCurrentUser, isLoggedIn } from "../api/api";

// ─────────────────────────────────────────────────────────────────────────────
// Live Seat Preview — renders the grid exactly as attendees will see it
// ─────────────────────────────────────────────────────────────────────────────
function SeatPreview({ layout }) {
  const { num_rows, seats_per_row, row_labels, aisles_after_seats, general_admission } = layout;

  if (general_admission) {
    return (
      <div
        className="text-center py-4 rounded-3"
        style={{ background: "#f8f9fa", border: "2px dashed #dee2e6" }}
      >
        <i className="bi bi-people-fill display-6 text-muted d-block mb-2"></i>
        <p className="text-muted mb-0" style={{ fontSize: "14px", fontWeight: "600" }}>
          General Admission — no fixed seating
        </p>
        <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
          Attendees can sit/stand anywhere
        </p>
      </div>
    );
  }

  const rows = row_labels.slice(0, num_rows);
  const cols = Array.from({ length: seats_per_row }, (_, i) => i + 1);
  const aislesSet = new Set(aisles_after_seats.map(Number));
  const totalSeats = num_rows * seats_per_row;

  return (
    <div>
      {/* Stats row */}
      <div className="d-flex gap-3 mb-3 flex-wrap">
        <div className="px-3 py-2 rounded-2 text-center" style={{ background: "#f0f4ff", minWidth: 80 }}>
          <div style={{ fontWeight: "800", fontSize: "18px", color: "#1a3eb8" }}>{rows.length}</div>
          <div style={{ fontSize: "11px", color: "#555" }}>Rows</div>
        </div>
        <div className="px-3 py-2 rounded-2 text-center" style={{ background: "#f0f4ff", minWidth: 80 }}>
          <div style={{ fontWeight: "800", fontSize: "18px", color: "#1a3eb8" }}>{seats_per_row}</div>
          <div style={{ fontSize: "11px", color: "#555" }}>Per Row</div>
        </div>
        <div className="px-3 py-2 rounded-2 text-center" style={{ background: "#f0fff4", minWidth: 80 }}>
          <div style={{ fontWeight: "800", fontSize: "18px", color: "#198754" }}>{totalSeats}</div>
          <div style={{ fontSize: "11px", color: "#555" }}>Total Seats</div>
        </div>
        <div className="px-3 py-2 rounded-2 text-center" style={{ background: "#fff8e1", minWidth: 80 }}>
          <div style={{ fontWeight: "800", fontSize: "18px", color: "#b8860b" }}>
            {aisles_after_seats.length}
          </div>
          <div style={{ fontSize: "11px", color: "#555" }}>Aisles</div>
        </div>
      </div>

      {/* Stage */}
      <div
        className="text-center mb-3 py-2 rounded-2"
        style={{
          background: "linear-gradient(135deg,#212529,#495057)",
          color: "#fff",
          fontSize: "12px",
          fontWeight: "700",
          letterSpacing: "3px",
        }}
      >
        ★ STAGE ★
      </div>

      {/* Grid */}
      <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
        <div style={{ display: "inline-block", minWidth: "100%" }}>
          {rows.map((rowLabel) => (
            <div
              key={rowLabel}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                marginBottom: "4px",
              }}
            >
              {/* Row label */}
              <span
                style={{
                  width: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#888",
                  flexShrink: 0,
                  textAlign: "center",
                }}
              >
                {rowLabel}
              </span>

              {cols.map((col) => (
                <React.Fragment key={col}>
                  {/* Aisle gap — rendered as empty space BEFORE this seat if previous col is in aislesSet */}
                  {aislesSet.has(col - 1) && (
                    <div style={{ width: 14, flexShrink: 0 }} />
                  )}
                  {/* Seat */}
                  <div
                    title={`${rowLabel}${col}`}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      background: "#e9ecef",
                      border: "1px solid #ced4da",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "8px",
                      color: "#777",
                      fontWeight: 700,
                    }}
                  >
                    {col}
                  </div>
                </React.Fragment>
              ))}

              {/* Row label right */}
              <span style={{ width: 20, fontSize: 11, fontWeight: 700, color: "#888", textAlign: "center" }}>
                {rowLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Aisle markers legend */}
      {aisles_after_seats.length > 0 && (
        <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
          <span style={{ fontSize: "11px", color: "#888" }}>Aisles after seat:</span>
          {aisles_after_seats.map((a) => (
            <Badge key={a} bg="warning" text="dark" style={{ fontSize: "11px" }}>
              {a}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Aisle selector — chip-style toggles for each column position
// ─────────────────────────────────────────────────────────────────────────────
function AisleSelector({ seatsPerRow, aislesAfter, onChange }) {
  const cols = Array.from({ length: seatsPerRow - 1 }, (_, i) => i + 1);
  return (
    <div>
      <div className="d-flex flex-wrap gap-2 mb-1">
        {cols.map((col) => {
          const active = aislesAfter.includes(col);
          return (
            <button
              key={col}
              type="button"
              onClick={() =>
                onChange(
                  active ? aislesAfter.filter((a) => a !== col) : [...aislesAfter, col].sort((a, b) => a - b)
                )
              }
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: active ? "2px solid #212529" : "1px solid #ced4da",
                background: active ? "#212529" : "#f8f9fa",
                color: active ? "#fff" : "#555",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.12s",
              }}
              title={`Toggle aisle after seat ${col}`}
            >
              {col}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: "12px", color: "#888" }}>
        Click a number to add/remove an aisle gap after that seat position in every row.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function CreateEvent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updateId, setUpdateId] = useState(null);
  const currentUser = getCurrentUser();

  const [newEvent, setNewEvent] = useState({
    title: "",
    organizer: "",
    imageUrl: "",
    date: "",
    time: "",
    location: "",
    email: "",
    price: "",
    capacity: "",
    category: "",
    description: "",
  });

  // Seating layout state — managed separately for clarity
  const [generalAdmission, setGeneralAdmission] = useState(false);
  const [numRows, setNumRows] = useState(8);
  const [seatsPerRow, setSeatsPerRow] = useState(10);
  const [rowLabels, setRowLabels] = useState("A,B,C,D,E,F,G,H");
  const [aislesAfter, setAislesAfter] = useState([]);

  useEffect(() => {
    if (!isLoggedIn() || currentUser?.role !== "organizer") {
      navigate("/login", {
        state: { messageEventCreation: "Please login as an organizer to create an event" },
      });
    }
  }, []);

  useEffect(() => {
    if (location?.state?.value) {
      const event = location.state.value;
      setNewEvent({
        ...event,
        price: event.price ? event.price.replace(/^₹\s*/, "") : "",
      });
      setUpdateId(event.id);

      // Restore layout from saved event
      if (event.seat_layout && Object.keys(event.seat_layout).length > 0) {
        const sl = event.seat_layout;
        setGeneralAdmission(sl.general_admission || false);
        setNumRows(sl.num_rows || 8);
        setSeatsPerRow(sl.seats_per_row || 10);
        setRowLabels((sl.row_labels || ["A","B","C","D","E","F","G","H"]).join(","));
        setAislesAfter(sl.aisles_after_seats || []);
      }
    }
  }, [location.state]);

  // Derive row labels array from the text input
  const parsedRowLabels = useMemo(() => {
    const labels = rowLabels
      .split(",")
      .map((l) => l.trim().toUpperCase())
      .filter((l) => l.length > 0);
    // If user provided fewer labels than numRows, auto-extend with A, B, C...
    while (labels.length < numRows) {
      const next = String.fromCharCode(65 + labels.length);
      labels.push(next);
    }
    return labels.slice(0, numRows);
  }, [rowLabels, numRows]);

  // Live layout object passed to preview
  const layout = useMemo(() => ({
    num_rows: Number(numRows) || 1,
    seats_per_row: Number(seatsPerRow) || 1,
    row_labels: parsedRowLabels,
    aisles_after_seats: aislesAfter,
    general_admission: generalAdmission,
  }), [numRows, seatsPerRow, parsedRowLabels, aislesAfter, generalAdmission]);

  function handleChange(e) {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    const form = e.currentTarget;
    e.preventDefault();
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    setValidated(true);
    setLoading(true);
    setError("");

    const priceFormatted =
      newEvent.price.toLowerCase() === "free" ? "Free" : `₹${newEvent.price}`;

    // Auto-calculate capacity from layout (unless general admission where organizer sets it manually)
    const autoCapacity = generalAdmission
      ? Number(newEvent.capacity)
      : Number(numRows) * Number(seatsPerRow);

    const payload = {
      ...newEvent,
      price: priceFormatted,
      email: newEvent.email || currentUser?.email,
      capacity: autoCapacity,
      seat_layout: layout,
    };

    try {
      if (updateId) {
        await updateEvent(updateId, payload);
        navigate("/dashboard", { state: { messageUpdate: "Event updated successfully!" } });
      } else {
        await createEvent(payload);
        navigate("/dashboard", { state: { messagePublish: "Event published successfully!" } });
      }
    } catch (err) {
      const detail = err.response?.data?.detail || "Failed to save event. Please try again.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Container
        style={{ paddingTop: "120px", paddingBottom: "40px" }}
        className="d-flex justify-content-center align-items-center"
      >
        <Card className="shadow-sm" style={{ width: "85%" }}>
          <CardBody className="p-4">
            <h3 className="text-center mb-4">
              {updateId ? "Update Event" : "Host a New Event"}
            </h3>
            {error && <div className="alert alert-danger">{error}</div>}

            <Form noValidate validated={validated} onSubmit={handleSubmit}>

              {/* ── Basic info ── */}
              <Row className="mb-3">
                <Form.Group as={Col} md="7" controlId="validationCustom01">
                  <Form.Label>Event Title</Form.Label>
                  <Form.Control
                    required type="text"
                    placeholder="e.g., Laugh Out Loud: Stand-up Comedy Night"
                    name="title" value={newEvent.title} onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">Please provide an event title.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="4" controlId="validationCustom02">
                  <Form.Label>Organizer Name</Form.Label>
                  <Form.Control
                    required type="text" placeholder="e.g., Siva Tech Events"
                    name="organizer" value={newEvent.organizer} onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">Please provide the organizer's name.</Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="4" controlId="validationCustom03">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="text" placeholder="e.g., Sat, May 20, 2026"
                    name="date" required value={newEvent.date} onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">Please provide a date.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="4" controlId="validationCustom04">
                  <Form.Label>Time</Form.Label>
                  <Form.Control
                    type="text" placeholder="e.g., 10:00 AM - 11:30 AM IST"
                    name="time" required value={newEvent.time} onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">Please provide a time.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="4" controlId="validationCustom05">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text" placeholder="e.g., The Comedy Lounge, Mumbai"
                    name="location" required value={newEvent.location} onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">Please provide a location.</Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="7" controlId="validationCustom06">
                  <Form.Label>Image URL</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text><i className="bi bi-link-45deg"></i></InputGroup.Text>
                    <Form.Control
                      required type="url" placeholder="https://images.unsplash.com/..."
                      name="imageUrl" value={newEvent.imageUrl} onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">Please provide a valid image URL.</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group as={Col} md="5" controlId="validationCustom07">
                  <Form.Label>Contact Email</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>@</InputGroup.Text>
                    <Form.Control
                      required type="email" placeholder="contact@example.com"
                      name="email" value={newEvent.email || currentUser?.email || ""} onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">Please provide a valid contact email.</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Row>

              <Row className="mb-3">
                <Form.Group as={Col} md="4" controlId="validationCustom08">
                  <Form.Label>Price</Form.Label>
                  <InputGroup hasValidation>
                    <InputGroup.Text>₹</InputGroup.Text>
                    <Form.Control
                      required type="text" placeholder="e.g., 750 or Free"
                      name="price" value={newEvent.price} onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">Please provide a price.</Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group as={Col} md="4" controlId="validationCustom09">
                  <Form.Label>
                    Capacity
                    {!generalAdmission && (
                      <Badge bg="secondary" className="ms-2" style={{ fontSize: "10px" }}>
                        Auto from layout
                      </Badge>
                    )}
                  </Form.Label>
                  <Form.Control
                    required={generalAdmission}
                    type="number"
                    placeholder={generalAdmission ? "e.g., 500" : "Set by seating layout"}
                    name="capacity"
                    min="1"
                    value={generalAdmission ? newEvent.capacity : layout.num_rows * layout.seats_per_row}
                    onChange={handleChange}
                    readOnly={!generalAdmission}
                    style={!generalAdmission ? { background: "#f8f9fa", color: "#6c757d" } : {}}
                  />
                  {!generalAdmission && (
                    <div style={{ fontSize: "11px", color: "#888", marginTop: 3 }}>
                      {layout.num_rows} rows × {layout.seats_per_row} seats = {layout.num_rows * layout.seats_per_row} seats
                    </div>
                  )}
                  <Form.Control.Feedback type="invalid">Please provide the event capacity.</Form.Control.Feedback>
                </Form.Group>
                <Form.Group as={Col} md="4" controlId="validationCustom10">
                  <Form.Label>Category</Form.Label>
                  <Form.Select required name="category" value={newEvent.category} onChange={handleChange}>
                    <option value="">Select Category...</option>
                    <option value="tech">Tech</option>
                    <option value="music">Music</option>
                    <option value="comedy">Comedy</option>
                    <option value="gaming">Gaming</option>
                    <option value="dance">Dance</option>
                    <option value="party">Party</option>
                    <option value="other">Other</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">Please select an event category.</Form.Control.Feedback>
                </Form.Group>
              </Row>

              <Row className="mb-4">
                <Form.Group as={Col} md="12" controlId="validationCustom11">
                  <Form.Label>Event Description</Form.Label>
                  <Form.Control
                    required as="textarea" rows={3}
                    placeholder="A brief and exciting description of the event..."
                    name="description" value={newEvent.description} onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">Please provide a detailed description.</Form.Control.Feedback>
                </Form.Group>
              </Row>

              {/* ── Seating Layout Section ── */}
              <hr className="my-4" />
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h5 style={{ fontWeight: "700", margin: 0 }}>
                    <i className="bi bi-grid-3x3-gap me-2 text-primary"></i>
                    Seating Layout
                  </h5>
                  <Badge bg="primary" style={{ fontSize: "10px" }}>New</Badge>
                </div>
                <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                  Configure how seats are arranged at your venue. Attendees will see and pick from this layout when booking.
                </p>

                {/* General admission toggle */}
                <div
                  className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-4"
                  style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
                >
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "14px" }}>General Admission</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      No fixed seats — attendees can sit or stand anywhere
                    </div>
                  </div>
                  <Form.Check
                    type="switch"
                    id="general-admission-switch"
                    checked={generalAdmission}
                    onChange={(e) => setGeneralAdmission(e.target.checked)}
                    style={{ transform: "scale(1.3)" }}
                  />
                </div>

                {!generalAdmission && (
                  <Row className="g-4">
                    {/* Left: controls */}
                    <Col md={5}>
                      <div className="d-flex flex-column gap-3">

                        {/* Num rows */}
                        <Form.Group>
                          <Form.Label style={{ fontWeight: "600", fontSize: "13px" }}>
                            Number of Rows
                            <OverlayTrigger placement="right" overlay={<Tooltip>How many rows of seats your venue has.</Tooltip>}>
                              <i className="bi bi-question-circle ms-1 text-muted" style={{ cursor: "help" }}></i>
                            </OverlayTrigger>
                          </Form.Label>
                          <div className="d-flex align-items-center gap-2">
                            <Button
                              variant="outline-secondary" size="sm"
                              style={{ width: 32, height: 32, padding: 0 }}
                              onClick={() => setNumRows(Math.max(1, numRows - 1))}
                            >–</Button>
                            <Form.Control
                              type="number" min="1" max="26"
                              value={numRows}
                              onChange={(e) => setNumRows(Math.min(26, Math.max(1, Number(e.target.value))))}
                              style={{ width: 64, textAlign: "center" }}
                            />
                            <Button
                              variant="outline-secondary" size="sm"
                              style={{ width: 32, height: 32, padding: 0 }}
                              onClick={() => setNumRows(Math.min(26, numRows + 1))}
                            >+</Button>
                          </div>
                        </Form.Group>

                        {/* Seats per row */}
                        <Form.Group>
                          <Form.Label style={{ fontWeight: "600", fontSize: "13px" }}>
                            Seats per Row
                            <OverlayTrigger placement="right" overlay={<Tooltip>How many seats are in each row (excluding aisles).</Tooltip>}>
                              <i className="bi bi-question-circle ms-1 text-muted" style={{ cursor: "help" }}></i>
                            </OverlayTrigger>
                          </Form.Label>
                          <div className="d-flex align-items-center gap-2">
                            <Button
                              variant="outline-secondary" size="sm"
                              style={{ width: 32, height: 32, padding: 0 }}
                              onClick={() => setSeatsPerRow(Math.max(1, seatsPerRow - 1))}
                            >–</Button>
                            <Form.Control
                              type="number" min="1" max="50"
                              value={seatsPerRow}
                              onChange={(e) => setSeatsPerRow(Math.min(50, Math.max(1, Number(e.target.value))))}
                              style={{ width: 64, textAlign: "center" }}
                            />
                            <Button
                              variant="outline-secondary" size="sm"
                              style={{ width: 32, height: 32, padding: 0 }}
                              onClick={() => setSeatsPerRow(Math.min(50, seatsPerRow + 1))}
                            >+</Button>
                          </div>
                        </Form.Group>

                        {/* Row labels */}
                        <Form.Group>
                          <Form.Label style={{ fontWeight: "600", fontSize: "13px" }}>
                            Row Labels
                            <OverlayTrigger placement="right" overlay={<Tooltip>Comma-separated labels for each row, e.g. A,B,C or P1,P2,P3</Tooltip>}>
                              <i className="bi bi-question-circle ms-1 text-muted" style={{ cursor: "help" }}></i>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={rowLabels}
                            onChange={(e) => setRowLabels(e.target.value)}
                            placeholder="A,B,C,D,E,F,G,H"
                          />
                          <div style={{ fontSize: "11px", color: "#888", marginTop: 3 }}>
                            Separate with commas. Auto-extended if fewer than row count.
                          </div>
                        </Form.Group>

                        {/* Aisles */}
                        <Form.Group>
                          <Form.Label style={{ fontWeight: "600", fontSize: "13px" }}>
                            Aisle Gaps
                            <OverlayTrigger placement="right" overlay={<Tooltip>Click seat numbers where an aisle/walkway should appear after that seat in every row.</Tooltip>}>
                              <i className="bi bi-question-circle ms-1 text-muted" style={{ cursor: "help" }}></i>
                            </OverlayTrigger>
                          </Form.Label>
                          {seatsPerRow > 1 ? (
                            <AisleSelector
                              seatsPerRow={seatsPerRow}
                              aislesAfter={aislesAfter}
                              onChange={setAislesAfter}
                            />
                          ) : (
                            <p className="text-muted" style={{ fontSize: "12px" }}>
                              Add more seats per row to configure aisles.
                            </p>
                          )}
                        </Form.Group>

                      </div>
                    </Col>

                    {/* Right: live preview */}
                    <Col md={7}>
                      <div
                        className="p-3 rounded-3 h-100"
                        style={{
                          border: "1px solid #e9ecef",
                          background: "#fff",
                          position: "sticky",
                          top: "90px",
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span style={{ fontWeight: "700", fontSize: "13px" }}>
                            <i className="bi bi-eye me-1 text-primary"></i>Live Preview
                          </span>
                          <Badge bg="light" text="dark" style={{ fontSize: "11px", border: "1px solid #dee2e6" }}>
                            As attendees see it
                          </Badge>
                        </div>
                        <SeatPreview layout={layout} />
                      </div>
                    </Col>
                  </Row>
                )}
              </div>

              {/* Submit */}
              {updateId ? (
                <Button type="submit" className="w-100 mt-3 btn-warning bi bi-pencil" size="lg" disabled={loading}>
                  {" "}{loading ? "Updating..." : "Update Event"}
                </Button>
              ) : (
                <Button type="submit" className="w-100 mt-3 btn-dark" size="lg" disabled={loading}>
                  <i className="bi bi-calendar-plus me-2"></i>
                  {loading ? "Publishing..." : "Publish New Event"}
                </Button>
              )}
            </Form>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}
