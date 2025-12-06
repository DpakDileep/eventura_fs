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

export default function AppNavbar() {
  const navigate = useNavigate();

  return (
    <Navbar className="shadow">
      <Container fluid className="mx-4 p-2">
        <NavbarBrand>Eventura</NavbarBrand>
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
          <NavLink>Create Event</NavLink>
          <Button variant="outline-dark rounded-pill ms-3">SignIn</Button>
          <Button
            variant="outline-dark rounded-pill ms-3"
            onClick={() => navigate("/signup")}
          >
            SignUp
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}
