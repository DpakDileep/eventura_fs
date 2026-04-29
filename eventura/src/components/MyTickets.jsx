import React, { useEffect, useRef, useState } from "react";
import {
  Card, Col, Container, Row, Toast, ToastContainer,
  Badge, Modal, Button, Spinner,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { getMyTickets, cancelTicket } from "../api/ticketService";
import { getCurrentUser, isLoggedIn } from "../api/api";

// ─────────────────────────────────────────────────────────────────────────────
// PDF Generation — uses jsPDF + html2canvas loaded from CDN
// Strategy: render a hidden off-screen ticket div → html2canvas → embed in jsPDF
// ─────────────────────────────────────────────────────────────────────────────

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function ensureLibsLoaded() {
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
}

// Build a self-contained ticket HTML element (injected into DOM temporarily)
function createTicketElement(t) {
  const isFree = Number(t.totalPrice) === 0;
  const price = isFree ? "Free" : `₹${Number(t.totalPrice).toLocaleString("en-IN")}`;
  const seats = t.seatNumbers
    ? t.seatNumbers.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const el = document.createElement("div");
  el.style.cssText = `
    width: 900px;
    background: #fff;
    font-family: 'Segoe UI', Arial, sans-serif;
    display: flex;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(0,0,0,0.18);
    position: fixed;
    top: -9999px;
    left: -9999px;
    z-index: -1;
  `;

  // Build seat badges HTML
  const seatBadges = seats.length
    ? seats.map((s) => `
        <span style="display:inline-block;background:#212529;color:#fff;
          font-size:13px;font-weight:700;padding:4px 10px;border-radius:6px;margin:2px 3px;">
          ${s}
        </span>`).join("")
    : `<span style="color:#888;font-size:14px;">General Admission</span>`;

  el.innerHTML = `
    <!-- LEFT: image panel -->
    <div style="flex:1.1;position:relative;min-height:380px;background:#111;">
      <img
        src="${t.eventImage}"
        crossorigin="anonymous"
        style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;"
        onerror="this.style.display='none'"
      />
      <!-- gradient overlay -->
      <div style="position:absolute;inset:0;
        background:linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.25) 55%,transparent 100%);">
      </div>
      <!-- category badge -->
      <div style="position:absolute;top:20px;left:20px;
        background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);
        color:#fff;font-size:12px;font-weight:700;padding:5px 14px;
        border-radius:20px;text-transform:capitalize;border:1px solid rgba(255,255,255,0.3);">
        ${t.eventOrganizer || "Eventura"}
      </div>
      <!-- status badge -->
      <div style="position:absolute;top:20px;right:20px;
        background:${t.status === "cancelled" ? "#dc3545" : "#198754"};
        color:#fff;font-size:12px;font-weight:700;padding:5px 14px;border-radius:20px;">
        ${t.status === "cancelled" ? "✕ Cancelled" : "✓ Confirmed"}
      </div>
      <!-- event info bottom -->
      <div style="position:absolute;bottom:0;left:0;right:0;padding:24px 28px;color:#fff;">
        <h2 style="margin:0 0 10px;font-size:22px;font-weight:800;line-height:1.25;
          text-shadow:0 2px 8px rgba(0,0,0,.5);">
          ${t.eventTitle}
        </h2>
        <p style="margin:0 0 4px;font-size:14px;opacity:.9;">
          📅 ${t.eventDate} &nbsp;|&nbsp; 🕐 ${t.eventTime}
        </p>
        <p style="margin:0;font-size:14px;opacity:.85;">
          📍 ${t.eventLocation}
        </p>
      </div>
    </div>

    <!-- DASHED DIVIDER -->
    <div style="width:2px;background:repeating-linear-gradient(
      to bottom,#e0e0e0 0px,#e0e0e0 9px,transparent 9px,transparent 18px);
      position:relative;flex-shrink:0;">
      <!-- top notch -->
      <div style="position:absolute;top:-13px;left:50%;transform:translateX(-50%);
        width:26px;height:26px;border-radius:50%;background:#f4f4f4;"></div>
      <!-- bottom notch -->
      <div style="position:absolute;bottom:-13px;left:50%;transform:translateX(-50%);
        width:26px;height:26px;border-radius:50%;background:#f4f4f4;"></div>
    </div>

    <!-- RIGHT: details panel -->
    <div style="width:300px;background:#f8f9fa;padding:28px 24px;
      display:flex;flex-direction:column;justify-content:space-between;flex-shrink:0;">

      <!-- Eventura brand -->
      <div style="text-align:center;margin-bottom:20px;">
        <div style="font-size:20px;font-weight:900;color:#212529;letter-spacing:-0.5px;">
          Eventura
        </div>
        <div style="font-size:10px;color:#aaa;letter-spacing:1.5px;text-transform:uppercase;
          margin-top:2px;">E-Ticket</div>
      </div>

      <!-- Price badge -->
      <div style="text-align:center;margin-bottom:20px;">
        <span style="display:inline-block;background:${isFree ? "#198754" : "#0d6efd"};
          color:#fff;font-size:18px;font-weight:800;padding:8px 20px;border-radius:30px;">
          ${price}
        </span>
      </div>

      <!-- Detail rows -->
      <div style="flex:1;">

        ${[
          { label: "Name", value: `${t.userFirstName} ${t.userLastName}`, icon: "👤" },
          { label: "Email", value: t.userEmail, icon: "✉️", small: true },
          { label: "Tickets", value: `${t.quantity} ticket${t.quantity > 1 ? "s" : ""}`, icon: "🎟️" },
        ].map(({ label, value, icon, small }) => `
          <div style="margin-bottom:14px;">
            <div style="font-size:10px;color:#999;font-weight:700;text-transform:uppercase;
              letter-spacing:0.5px;margin-bottom:3px;">${icon} ${label}</div>
            <div style="font-size:${small ? "12px" : "14px"};font-weight:700;color:#212529;
              word-break:break-all;">${value}</div>
          </div>
        `).join("")}

        <!-- Seats section -->
        <div style="margin-bottom:14px;">
          <div style="font-size:10px;color:#999;font-weight:700;text-transform:uppercase;
            letter-spacing:0.5px;margin-bottom:6px;">🪑 Seats</div>
          <div>${seatBadges}</div>
        </div>

      </div>

      <!-- Ticket ID footer -->
      <div style="border-top:2px dashed #dee2e6;padding-top:14px;margin-top:10px;">
        <div style="font-size:10px;color:#999;font-weight:700;text-transform:uppercase;
          letter-spacing:0.5px;margin-bottom:5px;">📋 Ticket ID</div>
        <div style="font-family:monospace;font-size:13px;font-weight:800;color:#212529;
          background:#e9ecef;padding:6px 10px;border-radius:7px;word-break:break-all;">
          #${t.ticketId}
        </div>
      </div>

    </div>
  `;

  return el;
}

async function downloadTicketPDF(t, setDownloading) {
  setDownloading(t.ticketId);
  try {
    await ensureLibsLoaded();

    const el = createTicketElement(t);
    document.body.appendChild(el);

    // Wait for image to load
    const img = el.querySelector("img");
    if (img) {
      await new Promise((resolve) => {
        if (img.complete) { resolve(); return; }
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 3000); // max 3s wait
      });
    }

    // Small settle delay
    await new Promise((r) => setTimeout(r, 200));

    const canvas = await window.html2canvas(el, {
      scale: 2,           // 2× for crisp PDF
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
    });

    document.body.removeChild(el);

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const { jsPDF } = window.jspdf;

    // Landscape A4: 297mm × 210mm
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    // Scale canvas to fit page
    const canvasAspect = canvas.width / canvas.height;
    let imgW = pdfW;
    let imgH = imgW / canvasAspect;
    if (imgH > pdfH) {
      imgH = pdfH;
      imgW = imgH * canvasAspect;
    }
    const xOffset = (pdfW - imgW) / 2;
    const yOffset = (pdfH - imgH) / 2;

    pdf.addImage(imgData, "JPEG", xOffset, yOffset, imgW, imgH);
    pdf.save(`Eventura_Ticket_${t.eventTitle.replace(/\s+/g, "_")}_${t.ticketId}.pdf`);
  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("PDF download failed. Please try again.");
  } finally {
    setDownloading(null);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function MyTickets() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastBg, setToastBg] = useState("success");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [downloading, setDownloading] = useState(null); // ticketId being downloaded
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login", { state: { messageMyTicket: "Please login to view your tickets" } });
      return;
    }
    fetchTickets();
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setToastMsg(location.state.message);
      setToastBg("success");
      setShowToast(true);
    }
  }, [location.state]);

  async function fetchTickets() {
    try {
      const data = await getMyTickets();
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await cancelTicket(cancelTarget.ticketId);
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketId === cancelTarget.ticketId ? { ...t, status: "cancelled" } : t
        )
      );
      setToastMsg(`Ticket for "${cancelTarget.eventTitle}" has been cancelled.`);
      setToastBg("warning");
      setShowToast(true);
    } catch (err) {
      setToastMsg(err.response?.data?.detail || "Cancellation failed. Please try again.");
      setToastBg("danger");
      setShowToast(true);
    } finally {
      setCancelLoading(false);
      setCancelTarget(null);
    }
  }

  const activeTickets = tickets.filter((t) => t.status !== "cancelled");
  const totalSpent = activeTickets.reduce((sum, t) => sum + Number(t.totalPrice || 0), 0);
  const totalTickets = activeTickets.reduce((sum, t) => sum + Number(t.quantity || 0), 0);

  return (
    <>
      {currentUser && (
        <Container style={{ marginTop: "120px", marginBottom: "60px" }}>

          {/* Toast */}
          <ToastContainer position="top-end" className="p-3" style={{ marginTop: "90px" }}>
            <Toast
              onClose={() => setShowToast(false)}
              show={showToast}
              delay={4000}
              autohide
              bg={toastBg}
            >
              <Toast.Body
                className={`${toastBg === "warning" ? "text-dark" : "text-light"} bi bi-${
                  toastBg === "success"
                    ? "check-circle-fill"
                    : toastBg === "warning"
                    ? "info-circle-fill"
                    : "x-circle-fill"
                }`}
              >
                {" "}{toastMsg}
              </Toast.Body>
            </Toast>
          </ToastContainer>

          {/* Page header */}
          <div className="mb-5">
            <h2 style={{ fontWeight: "800", fontSize: "clamp(22px, 4vw, 32px)" }}>
              <i className="bi bi-ticket-perforated me-2"></i>My Tickets
            </h2>
            <p className="text-muted mb-0">All your event bookings in one place</p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>

          ) : tickets.length === 0 ? (
            <div
              className="text-center py-5 rounded-4"
              style={{ background: "#f8f9fa", border: "2px dashed #dee2e6" }}
            >
              <i className="bi bi-ticket-perforated display-3 text-muted d-block mb-3"></i>
              <h4 style={{ fontWeight: "700" }}>No tickets yet</h4>
              <p className="text-muted mb-4">
                You haven't booked any events. Explore what's on!
              </p>
              <button
                className="btn btn-dark rounded-pill px-4"
                onClick={() => navigate("/events")}
              >
                <i className="bi bi-search me-2"></i>Browse Events
              </button>
            </div>

          ) : (
            <>
              {/* Summary stats */}
              <Row className="g-3 mb-5">
                {[
                  { value: activeTickets.length, label: "Events Booked", icon: "bi-calendar-event", color: "#212529" },
                  { value: totalTickets, label: "Total Tickets", icon: "bi-ticket", color: "#198754" },
                  {
                    value: totalSpent === 0 ? "Free" : `₹${totalSpent.toLocaleString("en-IN")}`,
                    label: "Total Spent", icon: "bi-cash", color: "#0d6efd",
                  },
                ].map(({ value, label, icon, color }) => (
                  <Col xs={12} sm={4} key={label}>
                    <div
                      className="rounded-3 p-3 text-center"
                      style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
                    >
                      <div style={{ fontSize: "26px", fontWeight: "800", color }}>{value}</div>
                      <div className="text-muted" style={{ fontSize: "13px" }}>
                        <i className={`bi ${icon} me-1`}></i>{label}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* Ticket cards */}
              <div className="d-flex flex-column gap-4">
                {tickets.map((t) => {
                  const isFree = Number(t.totalPrice) === 0;
                  const isCancelled = t.status === "cancelled";
                  const seats = t.seatNumbers
                    ? t.seatNumbers.split(",").map((s) => s.trim()).filter(Boolean)
                    : [];
                  const isThisDownloading = downloading === t.ticketId;

                  return (
                    <Card
                      key={t.ticketId}
                      className="overflow-hidden"
                      style={{
                        maxWidth: "1000px",
                        border: "none",
                        borderRadius: "16px",
                        boxShadow: isCancelled
                          ? "0 2px 12px rgba(0,0,0,0.06)"
                          : "0 4px 24px rgba(0,0,0,0.10)",
                        opacity: isCancelled ? 0.78 : 1,
                      }}
                    >
                      <Row className="g-0">

                        {/* Left: image */}
                        <Col md={7} className="position-relative" style={{ minHeight: "260px" }}>
                          <img
                            src={t.eventImage}
                            alt={t.eventTitle}
                            style={{
                              position: "absolute", inset: 0,
                              width: "100%", height: "100%", objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute", inset: 0,
                              background: isCancelled
                                ? "rgba(0,0,0,0.65)"
                                : "linear-gradient(to top,rgba(0,0,0,0.80) 0%,rgba(0,0,0,0.30) 60%,transparent 100%)",
                            }}
                          />
                          {/* Dashed separator + notch */}
                          <div
                            style={{
                              position: "absolute", top: "10%", bottom: "10%", right: 0,
                              width: "2px", borderRight: "2px dashed rgba(255,255,255,0.35)",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute", right: "-12px", top: "50%",
                              transform: "translateY(-50%)", width: "24px", height: "24px",
                              borderRadius: "50%", background: "#fff", zIndex: 2,
                              boxShadow: "0 0 0 1px #e0e0e0",
                            }}
                          />
                          {/* Event info overlay */}
                          <div
                            className="position-absolute text-white px-4 pb-4"
                            style={{ left: 0, right: 0, bottom: 0, zIndex: 1 }}
                          >
                            <Badge
                              bg={isCancelled ? "danger" : "light"}
                              text={isCancelled ? "white" : "dark"}
                              className="mb-2"
                              style={{ fontSize: "11px", fontWeight: "700", borderRadius: "20px", padding: "4px 10px" }}
                            >
                              {isCancelled
                                ? <><i className="bi bi-x-circle me-1"></i>Cancelled</>
                                : <><i className="bi bi-check-circle-fill text-success me-1"></i>Confirmed</>}
                            </Badge>
                            <h4
                              style={{
                                fontWeight: "800", marginBottom: "8px", lineHeight: "1.2",
                                fontSize: "clamp(15px, 2.5vw, 21px)",
                              }}
                            >
                              {t.eventTitle}
                            </h4>
                            <div className="d-flex flex-wrap gap-3" style={{ fontSize: "13px" }}>
                              <span><i className="bi bi-calendar3 me-1"></i>{t.eventDate}</span>
                              <span><i className="bi bi-clock me-1"></i>{t.eventTime}</span>
                            </div>
                            <div style={{ fontSize: "13px", marginTop: "4px", opacity: 0.85 }}>
                              <i className="bi bi-geo-alt me-1"></i>{t.eventLocation}
                            </div>
                          </div>
                        </Col>

                        {/* Right: details */}
                        <Col
                          md={5}
                          className="d-flex flex-column justify-content-between"
                          style={{ background: "#f8f9fa", padding: "24px 24px" }}
                        >
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-4">
                              <h6
                                style={{
                                  fontWeight: "700", textTransform: "uppercase",
                                  letterSpacing: "1px", fontSize: "11px", color: "#888", margin: 0,
                                }}
                              >
                                Ticket Details
                              </h6>
                              <Badge
                                bg={isFree ? "success" : "primary"}
                                style={{ fontSize: "13px", borderRadius: "20px", padding: "5px 12px" }}
                              >
                                {isFree ? "Free" : `₹${Number(t.totalPrice).toLocaleString("en-IN")}`}
                              </Badge>
                            </div>

                            {[
                              { icon: "bi-person", label: "Name", value: `${t.userFirstName} ${t.userLastName}` },
                              { icon: "bi-envelope", label: "Email", value: t.userEmail, small: true },
                              { icon: "bi-ticket", label: "Tickets", value: `${t.quantity} ticket${t.quantity > 1 ? "s" : ""}` },
                              ...(seats.length > 0
                                ? [{ icon: "bi-grid-3x3-gap", label: "Seats", value: seats.join(", ") }]
                                : []),
                            ].map(({ icon, label, value, small }) => (
                              <div key={label} className="d-flex align-items-start gap-3 mb-3">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                  style={{
                                    width: "32px", height: "32px",
                                    background: "#e9ecef", fontSize: "13px", color: "#495057",
                                  }}
                                >
                                  <i className={`bi ${icon}`}></i>
                                </div>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "10px", color: "#999", fontWeight: "600",
                                      textTransform: "uppercase", letterSpacing: "0.5px",
                                    }}
                                  >
                                    {label}
                                  </div>
                                  <div
                                    style={{
                                      fontWeight: "600",
                                      fontSize: small ? "12px" : "13px",
                                      color: "#212529",
                                      wordBreak: "break-all",
                                    }}
                                  >
                                    {value}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Ticket ID */}
                          <div className="pt-3 mb-3" style={{ borderTop: "2px dashed #dee2e6" }}>
                            <div
                              style={{
                                fontSize: "10px", color: "#999", fontWeight: "600",
                                textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px",
                              }}
                            >
                              <i className="bi bi-qr-code me-1"></i>Ticket ID
                            </div>
                            <code
                              style={{
                                fontSize: "12px", fontWeight: "700", color: "#212529",
                                background: "#e9ecef", padding: "3px 8px", borderRadius: "5px",
                                display: "inline-block", wordBreak: "break-all",
                              }}
                            >
                              #{t.ticketId}
                            </code>
                          </div>

                          {/* Action buttons */}
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-dark"
                              size="sm"
                              className="flex-fill"
                              onClick={() => downloadTicketPDF(t, setDownloading)}
                              disabled={isThisDownloading}
                            >
                              {isThisDownloading ? (
                                <><Spinner animation="border" size="sm" className="me-1" />Generating…</>
                              ) : (
                                <><i className="bi bi-file-earmark-pdf me-1"></i>Download PDF</>
                              )}
                            </Button>

                            {!isCancelled && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="flex-fill bi bi-x-circle"
                                onClick={() => setCancelTarget(t)}
                              >
                                {" "}Cancel
                              </Button>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </Container>
      )}

      {/* Cancel confirmation modal */}
      <Modal show={!!cancelTarget} onHide={() => setCancelTarget(null)} centered size="sm">
        <Modal.Body className="text-center p-4">
          <div className="mb-3">
            <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: "42px" }}></i>
          </div>
          <h5 style={{ fontWeight: "700" }}>Cancel Ticket?</h5>
          <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
            You're about to cancel your ticket for
          </p>
          <p className="fw-semibold mb-3" style={{ fontSize: "14px" }}>
            "{cancelTarget?.eventTitle}"
          </p>
          <p className="text-muted mb-4" style={{ fontSize: "12px" }}>
            This cannot be undone. The seat(s) will be released back to the pool.
          </p>
          <div className="d-flex gap-2">
            <Button
              variant="outline-secondary"
              className="flex-fill"
              onClick={() => setCancelTarget(null)}
              disabled={cancelLoading}
            >
              Keep Ticket
            </Button>
            <Button
              variant="danger"
              className="flex-fill"
              onClick={handleCancel}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <><Spinner animation="border" size="sm" className="me-1" />Cancelling…</>
              ) : (
                "Yes, Cancel"
              )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
