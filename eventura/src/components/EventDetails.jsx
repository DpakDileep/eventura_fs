import React, { useState } from "react";
import {
  Button, Col, Container, Row, Modal, Card, Form,
  Toast, ToastContainer, Table, Badge, ProgressBar,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { deleteEvent, getEventAttendees } from "../api/eventService";
import { bookTicket, getSeatMap } from "../api/ticketService";
import { getCurrentUser, isLoggedIn } from "../api/api";

// ─────────────────────────────────────────────────────────────────────────────
// SeatGrid — renders the organizer-defined layout with aisles
// layout shape: { row_labels, seats_per_row, aisles_after_seats, general_admission }
// ─────────────────────────────────────────────────────────────────────────────
function SeatGrid({ seats, layout, selected, onToggle, maxSelectable }) {
  const rows        = layout?.row_labels        || ["A","B","C","D","E","F","G","H"];
  const seatsPerRow = layout?.seats_per_row     || 10;
  const aislesSet   = new Set((layout?.aisles_after_seats || []).map(Number));
  const colNums     = Array.from({ length: seatsPerRow }, (_, i) => i + 1);

  const takenCount     = Object.values(seats).filter((v) => v === "taken").length;
  const availableCount = Object.values(seats).filter((v) => v === "available").length;

  return (
    <div>
      {/* ── Legend ── */}
      <div className="d-flex gap-3 mb-3 flex-wrap" style={{ fontSize: "12px" }}>
        {[
          { bg: "#e9ecef", border: "1px solid #ced4da", label: `Available (${availableCount})` },
          { bg: "#0d6efd", border: "none",              label: `Selected (${selected.length})` },
          { bg: "#dc3545", border: "none",              label: `Taken (${takenCount})` },
        ].map(({ bg, border, label }) => (
          <div key={label} className="d-flex align-items-center gap-1">
            <div style={{ width: 14, height: 14, borderRadius: 3, background: bg, border, flexShrink: 0 }} />
            <span className="text-muted">{label}</span>
          </div>
        ))}
        {aislesSet.size > 0 && (
          <div className="d-flex align-items-center gap-1">
            <div style={{
              width: 10, height: 14, borderRadius: 2, flexShrink: 0,
              background: "repeating-linear-gradient(to bottom,#dee2e6 0px,#dee2e6 3px,transparent 3px,transparent 6px)",
            }} />
            <span className="text-muted">Aisle</span>
          </div>
        )}
      </div>

      {/* ── Stage ── */}
      <div
        className="text-center mb-4 py-2 rounded-2"
        style={{
          background: "linear-gradient(135deg,#212529,#495057)",
          color: "#fff", fontSize: "12px", fontWeight: "700", letterSpacing: "3px",
        }}
      >
        ★ STAGE ★
      </div>

      {/* ── Seat grid ── */}
      <div style={{ overflowX: "auto", paddingBottom: "8px" }}>
        <div style={{ display: "inline-block" }}>
          {rows.map((row) => (
            <div
              key={row}
              style={{ display: "flex", alignItems: "center", gap: "3px", marginBottom: "5px" }}
            >
              {/* Left row label */}
              <span style={{
                width: 22, fontSize: 11, fontWeight: 700, color: "#888",
                flexShrink: 0, textAlign: "center", userSelect: "none",
              }}>
                {row}
              </span>

              {colNums.map((col) => {
                const seatId   = `${row}${col}`;
                const isTaken  = seats[seatId] === "taken";
                const isSel    = selected.includes(seatId);
                const isMaxed  = !isSel && selected.length >= maxSelectable;
                const showAisle = aislesSet.has(col - 1) && col > 1;

                return (
                  <React.Fragment key={col}>
                    {/* Aisle gap — striped vertical lane */}
                    {showAisle && (
                      <div
                        title="Aisle / Walkway"
                        style={{
                          width: 18,
                          height: 30,
                          flexShrink: 0,
                          borderLeft:  "2px dashed #ced4da",
                          borderRight: "2px dashed #ced4da",
                          background: "repeating-linear-gradient(to bottom,#f8f9fa 0px,#f8f9fa 4px,transparent 4px,transparent 8px)",
                          borderRadius: 2,
                          position: "relative",
                        }}
                      >
                        {/* tiny arrow hint */}
                        <div style={{
                          position: "absolute", top: "50%", left: "50%",
                          transform: "translate(-50%,-50%)",
                          fontSize: "8px", color: "#bbb", userSelect: "none",
                        }}>↕</div>
                      </div>
                    )}

                    {/* Seat button */}
                    <button
                      title={isTaken ? `Seat ${seatId} — Taken` : isSel ? `Seat ${seatId} — Selected` : `Seat ${seatId}`}
                      disabled={isTaken || isMaxed}
                      onClick={() => { if (!isTaken && !isMaxed) onToggle(seatId); }}
                      style={{
                        width:  30,
                        height: 30,
                        borderRadius: "4px 4px 6px 6px",  // slight chair-back shape
                        border: isSel    ? "2px solid #0a58ca"
                              : isTaken  ? "none"
                              :            "1px solid #ced4da",
                        background: isTaken  ? "#dc3545"
                                  : isSel    ? "#0d6efd"
                                  : isMaxed  ? "#f0f0f0"
                                  :            "#e9ecef",
                        cursor: isTaken || isMaxed ? "not-allowed" : "pointer",
                        opacity: isMaxed && !isSel ? 0.4 : 1,
                        fontSize: "8px",
                        color: isSel || isTaken ? "#fff" : "#777",
                        fontWeight: 700,
                        transition: "all 0.1s",
                        padding: 0,
                        flexShrink: 0,
                        boxShadow: isSel ? "0 0 0 2px rgba(13,110,253,0.3)" : "none",
                      }}
                    >
                      {col}
                    </button>
                  </React.Fragment>
                );
              })}

              {/* Right row label */}
              <span style={{
                width: 22, fontSize: 11, fontWeight: 700, color: "#888",
                flexShrink: 0, textAlign: "center", userSelect: "none", marginLeft: 2,
              }}>
                {row}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Aisle positions legend ── */}
      {aislesSet.size > 0 && (
        <div className="mt-3 d-flex align-items-center gap-2 flex-wrap">
          <span style={{ fontSize: "11px", color: "#888" }}>Aisles after seat:</span>
          {[...aislesSet].sort((a, b) => a - b).map((a) => (
            <Badge key={a} bg="secondary" style={{ fontSize: "11px" }}>{a}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function EventDetails() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const currentUser = getCurrentUser();
  const loggedIn   = isLoggedIn();
  const [event]    = useState(location?.state?.event);
  const ownEvent   = event?.email === currentUser?.email && currentUser?.role === "organizer";

  // Modal & UI state
  const [show,        setShow]        = useState(false);
  const [listshow,    setListShow]    = useState(false);
  const [showToast,   setShowToast]   = useState(false);
  const [showAlert,   setShowAlert]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Booking state
  const [step,          setStep]          = useState(1);
  const [quantity,      setQuantity]      = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatData,      setSeatData]      = useState(null);  // { seats, layout }
  const [loadingSeats,  setLoadingSeats]  = useState(false);
  const [bookingError,  setBookingError]  = useState("");
  const [bookingLoading,setBookingLoading]= useState(false);

  // Attendees
  const [attendees, setAttendees] = useState([]);

  if (!event) {
    return (
      <Container style={{ paddingTop: "140px" }} className="text-center">
        <h3>Event not found.</h3>
      </Container>
    );
  }

  // Derived from event
  const availableSeats   = event.available_capacity !== undefined
                           ? event.available_capacity
                           : event.capacity;
  const capacityPercent  = event.capacity
                           ? Math.round(((event.capacity - availableSeats) / event.capacity) * 100)
                           : 0;
  const isSoldOut        = availableSeats === 0;
  const isLowStock       = !isSoldOut && availableSeats <= 10;

  // Seating info from event's saved layout
  const eventLayout      = event.seat_layout || {};
  const isGeneralAdmission = eventLayout.general_admission === true
                           || Object.keys(eventLayout).length === 0;

  // ── Helpers ────────────────────────────────────────────────────────────────

  async function handleDelete(id) {
    try {
      await deleteEvent(id);
      navigate("/dashboard", { state: { message: "Event deleted successfully!" } });
    } catch (err) { console.error(err); }
  }

  function handleShowModal() {
    if (loggedIn) { resetBooking(); setShow(true); }
    else setShowToast(true);
  }

  function handleHideModal() {
    setShow(false); setListShow(false); setDeleteConfirm(false); resetBooking();
  }

  function resetBooking() {
    setStep(1); setQuantity(1); setSelectedSeats([]);
    setSeatData(null); setBookingError("");
  }

  async function handlelistmodal() {
    if (!loggedIn) return;
    try {
      const data = await getEventAttendees(event.id);
      setAttendees(data);
      setListShow(true);
    } catch (err) { console.error(err); }
  }

  function calculateTotal() {
    if (!event?.price || event.price.toLowerCase() === "free") return 0;
    return Number(event.price.replace(/[^0-9.-]+/g, "")) * quantity;
  }

  // Step 1 → Step 2 (or skip to confirm for general admission)
  async function handleProceedToSeats() {
    if (quantity < 1) { setShowAlert(true); return; }
    setBookingError("");

    if (isGeneralAdmission) {
      // Skip seat selection — go straight to confirm
      await handleRegisterDirect(Number(quantity), []);
      return;
    }

    setLoadingSeats(true);
    try {
      const data = await getSeatMap(event.id);
      // data shape: { eventId, layout: { row_labels, seats_per_row, aisles_after_seats, ... }, seats: {...} }
      setSeatData(data);
      setSelectedSeats([]);
      setStep(2);
    } catch (err) {
      setBookingError("Could not load seat map. Please try again.");
    } finally {
      setLoadingSeats(false);
    }
  }

  function toggleSeat(seatId) {
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
    );
  }

  async function handleRegister() {
    if (selectedSeats.length !== Number(quantity)) {
      setBookingError(`Please select exactly ${quantity} seat(s). You've selected ${selectedSeats.length}.`);
      return;
    }
    await handleRegisterDirect(Number(quantity), selectedSeats);
  }

  async function handleRegisterDirect(qty, seats) {
    setBookingError("");
    setBookingLoading(true);
    try {
      await bookTicket(event.id, qty, seats);
      navigate("/my-tickets", {
        state: { message: "Ticket Reserved Successfully! A confirmation email has been sent." },
      });
      handleHideModal();
    } catch (err) {
      const msg = err.response?.data?.detail || "Booking failed. Please try again.";
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  }

  // Derived layout for SeatGrid (from API response)
  const gridLayout = seatData?.layout || null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Hero ── */}
      <Container
        className="d-flex justify-content-center"
        style={{ paddingTop: "140px", position: "relative", overflow: "hidden" }}
      >
        <div style={{
          backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : "none",
          backgroundSize: "cover", backgroundPosition: "center",
          height: "450px", filter: "blur(15px)", transform: "scale(1.2)",
          position: "absolute", marginTop: "140px",
          top: 28, left: 0, right: 0, bottom: 0, zIndex: 0,
        }} />
        <img
          src={event.imageUrl} alt="Event image" className="rounded-5"
          style={{ objectFit: "cover", width: "100%", height: "500px", zIndex: 1 }}
        />
        {event.category && (
          <Badge bg="dark" style={{
            position: "absolute", bottom: "24px", left: "24px", zIndex: 2,
            fontSize: "13px", textTransform: "capitalize",
            padding: "6px 14px", borderRadius: "20px", opacity: 0.92,
          }}>
            <i className="bi bi-tag me-1"></i>{event.category}
          </Badge>
        )}
      </Container>

      {/* ── Content ── */}
      <Container style={{ marginTop: "50px", marginBottom: "60px" }}>
        <Row className="g-4">

          {/* Left: event info */}
          <Col md={8}>
            <h1 style={{ fontWeight: "800", marginBottom: "20px", fontSize: "clamp(24px,4vw,36px)" }}>
              {event.title}
            </h1>
            <div className="d-flex flex-wrap gap-3 mb-4">
              {[
                { icon: "bi-calendar3", text: event.date },
                { icon: "bi-clock",     text: event.time },
                { icon: "bi-geo-alt",   text: event.location },
              ].map(({ icon, text }) => (
                <div key={icon} className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                  style={{ background: "#f0f4ff", color: "#1a3eb8" }}>
                  <i className={`bi ${icon}`}></i>
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>{text}</span>
                </div>
              ))}
            </div>

            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="d-flex align-items-center justify-content-center rounded-circle bg-dark text-white"
                style={{ width: "36px", height: "36px", fontSize: "15px", flexShrink: 0 }}>
                {event.organizer?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#888" }}>Organized by</div>
                <div style={{ fontWeight: "700", fontSize: "14px" }}>{event.organizer}</div>
              </div>
            </div>

            <hr style={{ borderColor: "#e9ecef", marginBottom: "24px" }} />

            {event.description && (
              <div className="mb-4">
                <h5 style={{ fontWeight: "700", marginBottom: "12px" }}>About this event</h5>
                <p style={{ lineHeight: "1.8", color: "#444", fontSize: "15px" }}>{event.description}</p>
              </div>
            )}

            {/* Seating info badge */}
            <div className="d-flex align-items-center gap-2 mb-4">
              {isGeneralAdmission ? (
                <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                  style={{ background: "#fff8e1", border: "1px solid #ffe08a" }}>
                  <i className="bi bi-people-fill text-warning"></i>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#856404" }}>
                    General Admission — open seating
                  </span>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                  style={{ background: "#f0f4ff", border: "1px solid #c5d3f6" }}>
                  <i className="bi bi-grid-3x3-gap text-primary"></i>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a3eb8" }}>
                    Reserved Seating —{" "}
                    {eventLayout.num_rows || "?"} rows ×{" "}
                    {eventLayout.seats_per_row || "?"} seats
                    {eventLayout.aisles_after_seats?.length > 0
                      ? `, ${eventLayout.aisles_after_seats.length} aisle(s)`
                      : ""}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-2 p-3 rounded-3" style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}>
              <span style={{ fontSize: "13px", color: "#666" }}>
                <i className="bi bi-envelope me-2"></i>
                For enquiries:{" "}
                <a href={`mailto:${event.email}`} style={{ color: "#0d6efd", fontWeight: "600" }}>
                  {event.email}
                </a>
              </span>
            </div>
          </Col>

          {/* Right: booking card */}
          <Col md={4}>
            <div className="rounded-4 overflow-hidden" style={{
              border: "1px solid #e0e0e0", backgroundColor: "white",
              position: "sticky", top: "90px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}>
              <div className="px-4 py-3" style={{ background: "#212529", color: "white" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7 }}>
                  Ticket Price
                </div>
                <div style={{ fontSize: "26px", fontWeight: "800" }}>{event.price}</div>
              </div>
              <div className="p-4">
                {showToast && (
                  <ToastContainer position="middle-center" className="mt-2 shadow-lg" style={{ zIndex: 9999 }}>
                    <Toast onClose={() => setShowToast(false)} show={showToast} autohide={false} bg="light" style={{ minWidth: "240px" }}>
                      <Toast.Body>
                        <p className="mb-2 text-center fw-semibold">Please login to reserve a seat</p>
                        <div className="d-flex justify-content-center gap-3">
                          <Button size="sm" variant="secondary" onClick={() => navigate("/login")}>Login</Button>
                          <Button size="sm" variant="outline-secondary" onClick={() => setShowToast(false)}>Cancel</Button>
                        </div>
                      </Toast.Body>
                    </Toast>
                  </ToastContainer>
                )}

                {/* Availability bar */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: "13px", fontWeight: "600" }}>Availability</span>
                    <span style={{
                      fontSize: "13px", fontWeight: "700",
                      color: isSoldOut ? "#dc3545" : isLowStock ? "#fd7e14" : "#198754",
                    }}>
                      {isSoldOut ? "Sold Out" : isLowStock ? `Only ${availableSeats} left!` : `${availableSeats} seats`}
                    </span>
                  </div>
                  <ProgressBar
                    now={capacityPercent}
                    variant={isSoldOut ? "danger" : isLowStock ? "warning" : "success"}
                    style={{ height: "6px", borderRadius: "3px" }}
                  />
                  <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>
                    {capacityPercent}% filled · {event.capacity} total capacity
                  </div>
                </div>

                <hr style={{ borderColor: "#f0f0f0" }} />

                {ownEvent ? (
                  <div className="d-flex flex-column gap-2">
                    <Button variant="outline-primary" className="w-100 bi bi-people-fill" onClick={handlelistmodal}>
                      {" "}View Attendees
                    </Button>
                    <Button variant="outline-secondary" className="w-100 bi bi-pencil"
                      onClick={() => navigate("/create-event", { state: { value: event } })}>
                      {" "}Edit Event
                    </Button>
                    {!deleteConfirm ? (
                      <Button variant="outline-danger" className="w-100 bi bi-trash" onClick={() => setDeleteConfirm(true)}>
                        {" "}Delete Event
                      </Button>
                    ) : (
                      <div className="p-3 rounded-3" style={{ background: "#fff5f5", border: "1px solid #ffcccc" }}>
                        <p className="mb-2 text-danger fw-semibold" style={{ fontSize: "13px" }}>
                          Are you sure? This cannot be undone.
                        </p>
                        <div className="d-flex gap-2">
                          <Button size="sm" variant="danger" className="flex-fill" onClick={() => handleDelete(event.id)}>
                            Yes, Delete
                          </Button>
                          <Button size="sm" variant="outline-secondary" className="flex-fill" onClick={() => setDeleteConfirm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Button
                      variant={isSoldOut ? "secondary" : "primary"}
                      className="w-100 fw-bold py-2" style={{ fontSize: "16px" }}
                      onClick={handleShowModal} disabled={isSoldOut}
                    >
                      {isSoldOut
                        ? <><i className="bi bi-x-circle me-2"></i>Sold Out</>
                        : <><i className="bi bi-ticket-perforated me-2"></i>Reserve a Seat</>}
                    </Button>
                    {!isSoldOut && (
                      <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: "12px" }}>
                        <i className="bi bi-shield-check me-1 text-success"></i>
                        {isGeneralAdmission
                          ? "Open seating · Confirmation email on booking"
                          : "Choose your seats · Confirmation email on booking"}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* ── Booking Modal ── */}
      <Modal show={show} onHide={handleHideModal} size="xl" contentClassName="rounded-0">
        <ToastContainer position="top-center" className="p-3 mt-2">
          <Toast onClose={() => setShowAlert(false)} show={showAlert} delay={3000} autohide bg="warning">
            <Toast.Body className="text-light bi bi-exclamation-triangle">
              {" "}Please select at least 1 ticket
            </Toast.Body>
          </Toast>
        </ToastContainer>

        <Modal.Body className="p-0">
          <Row style={{ minHeight: "80vh" }}>

            {/* Left panel */}
            <Col lg={8} md={8} className="p-5 d-flex flex-column">

              {/* Step indicator — only show when seat selection step exists */}
              {!isGeneralAdmission && (
                <div className="d-flex align-items-center gap-2 mb-4">
                  {[{ n: 1, label: "Quantity" }, { n: 2, label: "Select Seats" }].map(({ n, label }, i) => (
                    <React.Fragment key={n}>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%",
                          background: step >= n ? "#212529" : "#e9ecef",
                          color: step >= n ? "#fff" : "#999",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "13px", fontWeight: "700",
                        }}>
                          {n}
                        </div>
                        <span style={{
                          fontSize: "13px",
                          fontWeight: step === n ? "700" : "400",
                          color: step === n ? "#212529" : "#aaa",
                        }}>
                          {label}
                        </span>
                      </div>
                      {i < 1 && (
                        <div style={{
                          flex: 1, height: 2,
                          background: step > 1 ? "#212529" : "#e9ecef",
                          borderRadius: 2,
                        }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1" style={{ fontSize: "clamp(16px,2.5vw,22px)" }}>
                  {event.title}
                </h2>
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  <i className="bi bi-calendar3 me-1"></i>{event.date}
                  <i className="bi bi-clock ms-3 me-1"></i>{event.time}
                </p>
              </div>

              {bookingError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span style={{ fontSize: "14px" }}>{bookingError}</span>
                </div>
              )}

              {/* ── Step 1: Quantity ── */}
              {step === 1 && (
                <>
                  <Card style={{ borderColor: "#0d6efd", borderWidth: "2px" }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <div className="fw-bold">
                            {isGeneralAdmission ? "General Admission" : "Reserved Seat"}
                          </div>
                          <div className="text-muted" style={{ fontSize: "13px" }}>
                            {availableSeats} seats remaining
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Button variant="outline-secondary" size="sm"
                            style={{ width: 32, height: 32, padding: 0, lineHeight: 1 }}
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}>–</Button>
                          <span style={{ minWidth: 28, textAlign: "center", fontWeight: "700", fontSize: "18px" }}>
                            {quantity}
                          </span>
                          <Button variant="outline-secondary" size="sm"
                            style={{ width: 32, height: 32, padding: 0, lineHeight: 1 }}
                            onClick={() => setQuantity(Math.min(availableSeats, quantity + 1))}>+</Button>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-bold">{event.price}</span>
                          <span className="text-muted ms-1" style={{ fontSize: "13px" }}>per ticket</span>
                        </div>
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>Sales end shortly
                        </small>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Info notice */}
                  <div className="mt-3 p-3 rounded-3 d-flex align-items-start gap-2"
                    style={{ background: "#f0f7ff", border: "1px solid #cce5ff" }}>
                    <i className={`bi ${isGeneralAdmission ? "bi-people-fill" : "bi-grid-3x3-gap"} text-primary mt-1`}></i>
                    <p className="mb-0" style={{ fontSize: "13px", color: "#1a5276" }}>
                      {isGeneralAdmission
                        ? "This is a general admission event. Your ticket grants entry — find any open spot."
                        : "After selecting quantity you'll pick your exact seats on the venue seat map."}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 d-flex justify-content-between align-items-end">
                    <div className="text-muted small">Powered by <strong>Eventura</strong></div>
                    <Button
                      className={`px-5 py-2 fw-bold btn-lg ${isGeneralAdmission ? "btn-danger" : "btn-dark"}`}
                      onClick={handleProceedToSeats}
                      disabled={loadingSeats || bookingLoading}
                    >
                      {loadingSeats || bookingLoading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>
                          {isGeneralAdmission ? "Booking..." : "Loading seats..."}</>
                      ) : isGeneralAdmission ? (
                        "Confirm & Register"
                      ) : (
                        <><i className="bi bi-grid-3x3-gap me-2"></i>Choose Seats</>
                      )}
                    </Button>
                  </div>
                </>
              )}

              {/* ── Step 2: Seat Selection ── */}
              {step === 2 && seatData && (
                <>
                  <div className="mb-3 d-flex align-items-center justify-content-between">
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "15px" }}>
                        Select {quantity} seat{quantity > 1 ? "s" : ""}
                      </div>
                      <div className="text-muted" style={{ fontSize: "13px" }}>
                        {selectedSeats.length}/{quantity} selected
                        {selectedSeats.length > 0 && (
                          <span className="ms-2 text-primary fw-semibold">
                            → {selectedSeats.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="outline-secondary" size="sm"
                      onClick={() => { setStep(1); setSelectedSeats([]); setBookingError(""); }}>
                      <i className="bi bi-arrow-left me-1"></i>Back
                    </Button>
                  </div>

                  {/* ── The seat grid with real layout + aisles from organizer ── */}
                  <SeatGrid
                    seats={seatData.seats}
                    layout={gridLayout}
                    selected={selectedSeats}
                    onToggle={toggleSeat}
                    maxSelectable={Number(quantity)}
                  />

                  <div className="mt-auto pt-4 d-flex justify-content-between align-items-end">
                    <div className="text-muted small">Powered by <strong>Eventura</strong></div>
                    <Button
                      className="px-5 py-2 fw-bold btn-danger btn-lg"
                      onClick={handleRegister}
                      disabled={bookingLoading || selectedSeats.length !== Number(quantity)}
                    >
                      {bookingLoading
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Booking...</>
                        : "Confirm & Register"}
                    </Button>
                  </div>
                </>
              )}
            </Col>

            {/* Right panel: order summary */}
            <Col lg={4} md={4} className="position-relative px-0" style={{ backgroundColor: "#f8f9fa" }}>
              <div style={{
                height: "200px", backgroundImage: `url(${event.imageUrl})`,
                backgroundSize: "cover", backgroundPosition: "center",
              }} />
              <Button
                className="btn-light position-absolute top-0 end-0 m-3 rounded-circle"
                onClick={handleHideModal} style={{ width: "36px", height: "36px", padding: 0 }}
              >✕</Button>
              <div className="p-4">
                <h5 className="fw-bold mb-4">Order Summary</h5>
                <div className="d-flex justify-content-between mb-2 text-secondary">
                  <span>{quantity} × ticket</span>
                  <span>{calculateTotal() === 0 ? "Free" : `₹${calculateTotal().toLocaleString("en-IN")}`}</span>
                </div>
                {selectedSeats.length > 0 && (
                  <div className="mb-3">
                    <div className="text-muted mb-1" style={{ fontSize: "12px" }}>Selected seats</div>
                    <div className="d-flex flex-wrap gap-1">
                      {selectedSeats.map((s) => (
                        <Badge key={s} bg="dark" style={{ fontSize: "12px", borderRadius: "5px" }}>
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2 text-secondary" style={{ fontSize: "13px" }}>
                  <span>Service fee</span><span>₹0</span>
                </div>
                <hr className="my-3" />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span>{calculateTotal() === 0 ? "Free" : `₹${calculateTotal().toLocaleString("en-IN")}`}</span>
                </div>
                <div className="mt-4 pt-3" style={{ borderTop: "1px dashed #ccc" }}>
                  <div className="text-muted mb-2" style={{ fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    What you get
                  </div>
                  {[
                    "Entry to the event",
                    isGeneralAdmission ? "Open seating" : "Your chosen seats",
                    "Email confirmation",
                    "Ticket ID for check-in",
                  ].map((item) => (
                    <div key={item} className="d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "12px" }}></i>
                      <span style={{ fontSize: "13px" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* ── Attendees Modal ── */}
      <Modal show={listshow} onHide={handleHideModal} size="xl" contentClassName="rounded-0">
        <Modal.Header className="px-4 py-3" style={{ background: "#212529", color: "white" }}>
          <Modal.Title style={{ fontSize: "18px", fontWeight: "700" }}>
            <i className="bi bi-people-fill me-2"></i>Attendees — {event.title}
          </Modal.Title>
          <Button variant="outline-light" size="sm" className="rounded-circle ms-auto"
            style={{ width: "32px", height: "32px", padding: 0 }} onClick={handleHideModal}>✕</Button>
        </Modal.Header>
        <Modal.Body className="p-4">
          {attendees.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-people display-4 d-block mb-3"></i>
              No attendees have registered yet.
            </div>
          ) : (
            <>
              <div className="mb-3 d-flex gap-3">
                <div className="px-3 py-2 rounded-3 text-center" style={{ background: "#f0f4ff", minWidth: "100px" }}>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a3eb8" }}>
                    {attendees.reduce((s, a) => s + a.quantity, 0)}
                  </div>
                  <div style={{ fontSize: "11px", color: "#555" }}>Total Tickets</div>
                </div>
                <div className="px-3 py-2 rounded-3 text-center" style={{ background: "#f0fff4", minWidth: "100px" }}>
                  <div style={{ fontSize: "22px", fontWeight: "800", color: "#198754" }}>
                    {attendees.length}
                  </div>
                  <div style={{ fontSize: "11px", color: "#555" }}>Attendees</div>
                </div>
              </div>
              <Table bordered className="text-center" variant="dark">
                <thead>
                  <tr>
                    <th>#</th><th>Name</th><th>Email</th>
                    <th>Tickets</th><th>Seats</th><th>Ticket ID</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((a, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{a.name}</td>
                      <td>{a.email}</td>
                      <td>{a.quantity}</td>
                      <td>
                        {a.seat_numbers
                          ? a.seat_numbers.split(",").map((s) => (
                              <Badge key={s} bg="secondary" className="me-1" style={{ fontSize: "11px" }}>
                                {s.trim()}
                              </Badge>
                            ))
                          : <span className="text-muted">General</span>}
                      </td>
                      <td><code style={{ fontSize: "11px" }}>#{a.ticketId}</code></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
