import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import signupImage from "../assets/images/signup-image.png";
import { useNavigate } from "react-router-dom";
import { signup } from "../api/authService";

export default function Signup() {
  const [validated, setValidated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "attendee",
  });

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
    setError("");
    try {
      await signup(user);
      navigate("/", { state: { message: "Account created successfully!" } });
    } catch (err) {
      const data = err.response?.data;
      if (data?.email) setError(data.email[0]);
      else setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  function handleChange(event) {
    setUser({ ...user, [event.target.name]: event.target.value });
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "calc(100vh - 108px)", marginTop: "80px" }}
    >
      <Card style={{ width: "80%", maxWidth: "900px" }}>
        <Row className="g-0">
          <Col md={6}>
            <Card.Img
              src={signupImage}
              alt="Signup Illustration"
              style={{ height: "100%", objectFit: "cover" }}
            />
          </Col>
          <Col md={6}>
            <Card.Body>
              <h3 className="text-center mb-4">Create Account</h3>
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} md="6" controlId="validationCustom01">
                    <Form.Label>First name</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="First name"
                      name="firstName"
                      onChange={handleChange}
                      value={user.firstName}
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} md="6" controlId="validationCustom02">
                    <Form.Label>Last name</Form.Label>
                    <Form.Control
                      required
                      type="text"
                      placeholder="Last name"
                      name="lastName"
                      onChange={handleChange}
                      value={user.lastName}
                    />
                    <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                  </Form.Group>
                </Row>

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
                      value={user.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid email.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

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
                        value={user.password}
                        minLength={6}
                      />
                      <Button
                        variant="outline-secondary border-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                      </Button>
                      <Form.Control.Feedback type="invalid">
                        Password must be at least 6 characters.
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Row>

                {/* ── Role Selection ── */}
                <Form.Group className="mb-3">
                  <Form.Label>I want to</Form.Label>
                  <div className="d-flex gap-4">
                    <Form.Check
                      type="radio"
                      label="Attend Events"
                      name="role"
                      value="attendee"
                      id="role-attendee"
                      checked={user.role === "attendee"}
                      onChange={handleChange}
                    />
                    <Form.Check
                      type="radio"
                      label="Organize Events"
                      name="role"
                      value="organizer"
                      id="role-organizer"
                      checked={user.role === "organizer"}
                      onChange={handleChange}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    required
                    label="Agree to terms and conditions"
                    feedback="You must agree before submitting."
                    feedbackType="invalid"
                  />
                </Form.Group>

                <Button type="submit" className="w-100 mb-2" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
                <p>
                  Have an account? <a href="/login">Login</a>
                </p>
              </Form>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
