import React, { useState } from "react";
import { Card, Col, Row, Form, InputGroup, Button } from "react-bootstrap";
import loginimage from "../assets/images/login-image.png";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [validated, setValidated] = useState(false);
  const [user, setUser] = useState({ email: "", password: "" });
  const [users, setUsers] = useState(
    JSON.parse(localStorage.getItem("users")) || []
  );
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    event.preventDefault();
    setValidated(true);
    const existUser = users.find(
      (u) => u.email == user.email && u.password == user.password
    );
    if (existUser) {
      alert("Login Succesfull");
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("currentUser", JSON.stringify(existUser));
      navigate("/");
    } else {
      alert("Invalid Email or Password");
    }
  };

  function handleChange(event) {
    setUser({ ...user, [event.target.name]: [event.target.value] });
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "calc(100vh - 108px )" }}
    >
      <Card style={{ width: "80%", maxWidth: "900px" }}>
        <Row className="g-0">
          <Col md={6}>
            <Card.Img
              src={loginimage}
              alt="Signup Illustration"
              style={{ height: "100%", objectFit: "cover" }}
            />
          </Col>
          <Col md={6}>
            <Card.Body>
              <h3 className="text-center mb-4">USER LOGIN</h3>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group
                    className="mb-3"
                    controlId="validationCustomUsername"
                  >
                    <Form.Label>Email</Form.Label>
                    <InputGroup hasValidation>
                      <InputGroup.Text>@</InputGroup.Text>
                      <Form.Control
                        type="email"
                        placeholder="Email"
                        required
                        name="email"
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter a valid email.
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} md="12" controlId="validationCustom03">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="********"
                      required
                      name="password"
                      onChange={handleChange}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a valid password.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                <Button type="submit" className="w-100">
                  LOGIN
                </Button>
              </Form>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
