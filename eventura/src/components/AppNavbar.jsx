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
  const [eventLocation,setEventLocation]=useState("")

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
                e.target.value=""
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
                e.target.value=""
              }
            }}
          />
          <InputGroup.Text className="bg-light border-end">
            <i className="bi bi-geo-alt"></i>
          </InputGroup.Text>
        </InputGroup>
        <Nav className="ms-auto">
          <NavLink>My Tickets</NavLink>
          <NavLink onClick={() => navigate("/create-event")}>
            Create Event
          </NavLink>
          {isLoggedIn ? (
            <>
              <NavLink>Dashboard</NavLink>
              <NavLink>
                <span
                  ref={target}
                  style={{ cursor: "pointer" }}
                  onClick={() => setShow(!show)}
                >
                  <i className="bi bi-person-circle"> </i>
                  {currentUser.firstName}
                </span>
                {target.current && (
                  <Overlay
                    target={target.current}
                    show={show}
                    placement="bottom"
                  >
                    {(props) => (
                      <div
                        {...props}
                        style={{
                          position: "absolute",
                          padding: "2px 10px",
                          color: "black",
                          borderRadius: 3,
                          zIndex: 2000,
                          ...props.style,
                        }}
                      >
                        <Button
                          variant="danger"
                          style={{ fontSize: 15 }}
                          onClick={handleLogout}
                        >
                          LogOut
                        </Button>
                      </div>
                    )}
                  </Overlay>
                )}
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
