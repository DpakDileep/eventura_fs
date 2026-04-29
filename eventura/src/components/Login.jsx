import React, { useEffect, useState } from "react";
import {
  Card, Col, Row, Form, InputGroup, Button,
  ToastContainer, Toast,
} from "react-bootstrap";
import loginimage from "../assets/images/login-image.png";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/authService";

export default function Login() {
  const [validated, setValidated] = useState(false);
  const [user, setUser] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.messageEventCreation || location.state?.messageMyTicket) {
      setToastMsg(location.state.messageEventCreation || location.state.messageMyTicket);
      setShowToast(true);
    }
  }, [location.state]);

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    setValidated(true);
    setLoading(true);
    try {
      await login(user.email, user.password);
      navigate("/", { state: { message: "Login successful!" } });
    } catch (err) {
      setToastMsg("Invalid email or password");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  function handleChange(event) {
    setUser({ ...user, [event.target.name]: event.target.value });
  }

  return (
    <>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "calc(100vh - 108px)", marginTop: "80px" }}
      >
        <ToastContainer position="top-end" className="p-3" style={{ marginTop: "90px" }}>
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
            bg="warning"
          >
            <Toast.Body className="bi bi-exclamation-triangle"> {toastMsg}</Toast.Body>
          </Toast>
        </ToastContainer>
        <Card style={{ width: "80%", maxWidth: "900px" }}>
          <Row className="g-0">
            <Col md={6}>
              <Card.Img
                src={loginimage}
                alt="Login Illustration"
                style={{ height: "100%", objectFit: "cover" }}
              />
            </Col>
            <Col md={6}>
              <Card.Body>
                <h3 className="text-center mb-4">USER LOGIN</h3>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Row className="mb-3">
                    <Form.Group className="mb-3" controlId="validationCustomUsername">
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
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          required
                          name="password"
                          onChange={handleChange}
                        />
                        <Button
                          variant="outline-secondary border-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          Please provide a valid password.
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>
                  </Row>
                  <Button type="submit" className="w-100 mb-2" disabled={loading}>
                    {loading ? "Logging in..." : "LOGIN"}
                  </Button>
                  <p>
                    New here? <a href="/signup">Create an account</a>
                  </p>
                </Form>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </>
  );
}
