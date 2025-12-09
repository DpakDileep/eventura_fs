import React, { useRef, useState } from "react";
import {
  Button,
  Container,
  FormControl,
  InputGroup,
  Nav,
  Navbar,
  NavbarBrand,
  NavLink,
  OverlayTrigger,
  Popover,
  PopoverBody,
  Tooltip,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import Overlay from "react-bootstrap/Overlay";

export default function AppNavbar() {
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  const currentUser = JSON.parse(sessionStorage?.getItem("currentUser"));
  const [show, setShow] = useState(false);
  const target = useRef(null);
  const [eventName, setEventName] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  function handleLogout() {
    sessionStorage.removeItem("currentUser");
    sessionStorage.removeItem("isLoggedIn");
    navigate("/");
  }

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
              if (e.key == "Enter") {
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
              if (e.key == "Enter") {
                navigate("/events", { state: { location: eventLocation } });
                e.target.value = "";
              }
            }}
          />
          <InputGroup.Text className="bg-light border-end">
            <i className="bi bi-geo-alt"></i>
          </InputGroup.Text>
        </InputGroup>
        <Nav className="ms-auto">
          <NavLink onClick={() => navigate("/my-tickets")}>My Tickets</NavLink>
          <NavLink onClick={() => navigate("/create-event")}>
            Create Event
          </NavLink>
          {isLoggedIn ? (
            <>
              <NavLink onClick={() => navigate("/dashboard")}>
                Dashboard
              </NavLink>
              <NavLink>
                <OverlayTrigger
                  trigger="click"
                  placement="bottom"
                  rootClose
                  overlay={
                    <Popover>
                      <PopoverBody>
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
                    {currentUser.firstName}
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
