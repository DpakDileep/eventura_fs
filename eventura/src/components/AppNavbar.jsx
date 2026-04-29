import React, { useRef, useState, useEffect } from "react";
import {
  Button, Container, FormControl, InputGroup, Nav, Navbar,
  NavbarBrand, NavLink, OverlayTrigger, Popover, PopoverBody,
  Badge, ListGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import { logout } from "../api/authService";
import { getNotifications, markNotificationRead } from "../api/notificationService";
import { getCurrentUser, isLoggedIn } from "../api/api";

export default function AppNavbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const currentUser = getCurrentUser();
  const isOrganizer = currentUser?.role === "organizer";
  const isAttendee = currentUser?.role === "attendee";

  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function handleLogout() {
    await logout();
    navigate("/", { state: { message: "Logged out successfully!" } });
  }

  useEffect(() => {
    if (!loggedIn) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [loggedIn]);

  async function fetchNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (_) {}
  }

  async function handleNotifClick(notif) {
    if (!notif.is_read) {
      await markNotificationRead(notif.id);
      fetchNotifications();
    }
  }

  const notifPopover = (
    <Popover style={{ minWidth: "320px", maxWidth: "360px" }}>
      <Popover.Header as="h6" className="d-flex justify-content-between align-items-center">
        Notifications
        {unreadCount > 0 && (
          <Badge bg="danger" pill>{unreadCount} new</Badge>
        )}
      </Popover.Header>
      <PopoverBody className="p-0">
        {notifications.length === 0 ? (
          <p className="text-muted text-center py-3 mb-0" style={{ fontSize: "14px" }}>
            No notifications yet
          </p>
        ) : (
          <ListGroup variant="flush" style={{ maxHeight: "280px", overflowY: "auto" }}>
            {notifications.map((n) => (
              <ListGroup.Item
                key={n.id}
                action
                onClick={() => handleNotifClick(n)}
                className={!n.is_read ? "bg-light" : ""}
                style={{ cursor: "pointer", fontSize: "13px" }}
              >
                <div className="d-flex gap-2 align-items-start">
                  {!n.is_read && (
                    <span
                      className="bg-primary rounded-circle mt-1 flex-shrink-0"
                      style={{ width: "8px", height: "8px", display: "inline-block" }}
                    />
                  )}
                  <div>
                    <p className="mb-0">{n.message}</p>
                    <small className="text-muted">
                      {new Date(n.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </PopoverBody>
    </Popover>
  );

  return (
    <Navbar className="shadow fixed-top bg-body-tertiary">
      <Container fluid className="mx-4 p-2">
        <NavbarBrand href="/">
          <img src={Logo} alt="Logo" width={"150px"} />
        </NavbarBrand>

        <InputGroup
          className="border rounded-pill overflow-hidden ms-auto"
          style={{ maxWidth: "750px" }}
        >
          <InputGroup.Text className="bg-light border-end">
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <FormControl
            className="btn btn-light"
            placeholder="Search by event"
            onChange={(e) => setEventName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate("/events", { state: { value: eventName } });
                e.target.value = "";
              }
            }}
          />
          <FormControl
            className="btn btn-light border-start"
            placeholder="Search by location"
            onChange={(e) => setEventLocation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate("/events", { state: { location: eventLocation } });
                e.target.value = "";
              }
            }}
          />
          <InputGroup.Text className="bg-light border-end">
            <i className="bi bi-geo-alt"></i>
          </InputGroup.Text>
        </InputGroup>

        <Nav className="ms-auto align-items-center">

          {/* ── My Tickets: only for attendees or logged-out users ── */}
          {(!loggedIn || isAttendee) && (
            <NavLink onClick={() => navigate("/my-tickets")}>My Tickets</NavLink>
          )}

          {/* ── Create Event: only for organizers ── */}
          {loggedIn && isOrganizer && (
            <NavLink onClick={() => navigate("/create-event")}>Create Event</NavLink>
          )}

          {/* ── Dashboard: only for organizers ── */}
          {loggedIn && isOrganizer && (
            <NavLink onClick={() => navigate("/dashboard")}>Dashboard</NavLink>
          )}

          {loggedIn ? (
            <>
              {/* ── Bell icon notifications ── */}
              <OverlayTrigger
                trigger="click"
                placement="bottom"
                rootClose
                overlay={notifPopover}
              >
                <NavLink className="position-relative" style={{ cursor: "pointer" }}>
                  <i className="bi bi-bell fs-5"></i>
                  {unreadCount > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      style={{
                        position: "absolute",
                        top: "-2px",
                        right: "-2px",
                        fontSize: "10px",
                        minWidth: "16px",
                        height: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                      }}
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </NavLink>
              </OverlayTrigger>

              {/* ── User avatar + role chip + logout ── */}
              <NavLink>
                <OverlayTrigger
                  trigger="click"
                  placement="bottom"
                  rootClose
                  overlay={
                    <Popover>
                      <PopoverBody>
                        <div className="mb-2">
                          <p className="mb-0 fw-semibold" style={{ fontSize: "14px" }}>
                            {currentUser?.firstName} {currentUser?.lastName}
                          </p>
                          <p className="mb-1 text-muted" style={{ fontSize: "12px" }}>
                            {currentUser?.email}
                          </p>
                          <Badge bg={isOrganizer ? "primary" : "success"} style={{ textTransform: "capitalize" }}>
                            {currentUser?.role}
                          </Badge>
                        </div>
                        <Button
                          variant="danger"
                          className="w-100 bi bi-door-closed-fill"
                          style={{ fontSize: 15 }}
                          onClick={handleLogout}
                        >
                          {" "}LogOut
                        </Button>
                      </PopoverBody>
                    </Popover>
                  }
                >
                  <span style={{ cursor: "pointer" }}>
                    <i className="bi bi-person-circle"></i>{" "}
                    {currentUser?.firstName}
                  </span>
                </OverlayTrigger>
              </NavLink>
            </>
          ) : (
            <>
              <Button
                variant="outline-dark rounded-pill ms-3"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                variant="outline-dark rounded-pill ms-3"
                onClick={() => navigate("/signup")}
              >
                SignUp
              </Button>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
