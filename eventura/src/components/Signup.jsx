import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import signupImage from "../assets/images/signup-image.png";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [validated, setValidated] = useState(false);
  const [showPassword,setShowPassword]=useState(false)
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [users, setUsers] = useState([]);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      setUsers([...users, user]);
      setUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      localStorage.setItem("users", JSON.stringify([...users, user]));
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("currentUser", JSON.stringify(user));
      navigate("/");
    }
    setValidated(true);
  };

  function handleChange(event) {
    setUser({ ...user, [event.target.name]: event.target.value });
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "calc(100vh - 108px)" }}
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
                      type={showPassword?"text":"password"}
                      placeholder="********"
                      required
                      name="password"
                      onChange={handleChange}
                      value={user.password}
                    />
                    <Button variant="outline-secondary border-0" onClick={()=>showPassword?setShowPassword(false):setShowPassword(true)}>
                      <i className={showPassword?"bi bi-eye-slash":"bi bi-eye"}></i>
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      Please provide a valid password.
                    </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Check
                    required
                    label="Agree to terms and conditions"
                    feedback="You must agree before submitting."
                    feedbackType="invalid"
                  />
                </Form.Group>

                <Button type="submit" className="w-100 mb-2">
                  Create Account
                </Button>
                <p>Have an account? <a href="/login">Login</a></p>
              </Form>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
