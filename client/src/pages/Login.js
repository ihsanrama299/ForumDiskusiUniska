import { useState } from "react";
import { Col, Button, Row, Container, Card, Form } from "react-bootstrap";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useNavigate, useLocation } from "react-router-dom";

import { Link } from "react-router-dom";

import Cookies from "universal-cookie";

export default function Login() {
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  const [offcanvasTitle, setOffcanvasTitle] = useState("");
  const [offcanvasBody, setOffcanvasBody] = useState("");

  const location = useLocation();
  const cookie = new Cookies();

  const navigate = useNavigate();

  const [npm, setNpm] = useState();
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  const submitLogin = (e) => {
    e.preventDefault();

    const login = {
      password: password,
    };

    if (location.pathname === "/admin-login") {
      login.username = username;
    } else {
      login.npm = parseInt(npm);
    }

    async function fetchLogin() {
      const loginData = await fetch(
        `${
          location.pathname === "/login" ? "api/users/login" : "api/admin/login"
        }`,
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-type": "application/json",
          },
          body: JSON.stringify(login),
        }
      );

      const response = await loginData.json();

      if (response.token) {
        cookie.set("token", response.token);
        navigate("/");
        window.location.reload();
      } else {
        console.log(response);
      }

      if (loginData.status === 200) {
        setOffcanvasTitle("Login Gagal");
        setOffcanvasBody("Silahkan Cek Kembali Form Login Anda");
      }

      handleShowOffcanvas();
    }

    fetchLogin();
  };

  return (
    <div>
      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffcanvas}
        placement="top"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{offcanvasTitle}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{offcanvasBody}</Offcanvas.Body>
      </Offcanvas>
      <Container>
        <Row className="vh-100 d-flex justify-content-center align-items-center">
          <Col md={8} lg={6} xs={12}>
            <div
              className={`border border-3 border-${
                location.pathname === "/admin-login" ? "primary" : "dark"
              }`}
            ></div>
            <Card className="shadow">
              <Card.Body>
                <div className="mb-3 mt-md-4">
                  <h2 className="fw-bold mb-2 text-uppercase ">
                    {location.pathname === "/admin-login"
                      ? "FDM Login Admin"
                      : "Forum Diskusi Mahasiswa Uniska"}
                  </h2>
                  <p className=" mb-5">
                    {location.pathname === "/admin-login"
                      ? "Masukan Username dan Password untuk login"
                      : "Masukan NPM dan Password untuk login"}
                  </p>
                  <div className="mb-3">
                    <Form onSubmit={submitLogin}>
                      <Form.Group className="mb-3" controlId="formBasicInput">
                        {location.pathname === "/admin-login" ? (
                          <>
                            <Form.Label className="text-center">
                              Username
                            </Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Username"
                              onChange={(e) => setUsername(e.target.value)}
                            />
                          </>
                        ) : (
                          <>
                            <Form.Label className="text-center">NPM</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="NPM"
                              onChange={(e) => setNpm(e.target.value)}
                            />
                          </>
                        )}
                      </Form.Group>

                      <Form.Group
                        className="mb-3"
                        controlId="formBasicPassword"
                      >
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group
                        className="mb-3"
                        controlId="formBasicCheckbox"
                      >
                        {/* <p className="small">
                          <a className="text-primary" href="#!">
                            Forgot password?
                          </a>
                        </p> */}
                      </Form.Group>
                      <div className="d-grid">
                        <Button
                          variant={
                            location.pathname === "/admin-login"
                              ? "primary"
                              : "dark"
                          }
                          type="submit"
                        >
                          Login
                        </Button>
                      </div>
                    </Form>
                    <div className="mt-3">
                      {location.pathname === "/admin-login" ? (
                        ""
                      ) : (
                        <p className="mb-0  text-center">
                          Belum punya akun?{" "}
                          <Link to="/register" className="text-primary fw-bold">
                            Daftar
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      {location.pathname === "/login" ? (
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{
            backgroundColor: "black",
            color: "white",
            width: "100vw",
            height: "10vh",
            position: "fixed",
            bottom: "0",
          }}
        >
          Anda ingin sewa space iklan? <Link to={"/ad"}>klik disini</Link>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
