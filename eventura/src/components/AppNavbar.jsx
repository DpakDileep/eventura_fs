import React from "react";
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

export default function AppNavbar() {
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  const currentUser = JSON.parse(sessionStorage?.getItem("currentUser"));

  return (
    <Navbar className="shadow fixed-top bg-body-tertiary">
      <Container fluid className="mx-4 p-2">
        <NavbarBrand href="/">
          <img src={Logo} alt="Logo" width={"150px"}/>
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
          />
          <FormControl
            className="btn btn-light border-start"
            placeholder="Search by location"
          />
          <InputGroup.Text className="bg-light border-end">
            <i className="bi bi-geo-alt"></i>
          </InputGroup.Text>
        </InputGroup>
        <Nav className="ms-auto">
          <NavLink>My Tickets</NavLink>
          <NavLink onClick={() => navigate("/CreateEvent")}>Create Event</NavLink>
          {isLoggedIn ? (
            <>
              <NavLink>Dashboard</NavLink>
              <NavLink>
                <i className="bi bi-person-circle"> {currentUser.firstName}</i>
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
