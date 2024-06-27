import { Link, useLocation, useNavigate } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";

import Cookies from "universal-cookie";
import { useState } from "react";

const NavbarMenu = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const cookie = new Cookies();

  const [search, setSearch] = useState("");

  function logout() {
    cookie.remove("token");
    navigate("/login");
    window.location.reload(false);
  }

  if (!user.name) {
    return null;
  }

  return (
    <>
      <Navbar
        expand="lg"
        className="bg-body-tertiary"
        data-bs-theme="dark"
        sticky="top"
      >
        <Container fluid className="mx-lg-5 px-lg-5">
          <Navbar.Brand href="#" className="me-5">
            {user.level === "User" ? "Forum Diskusi Mahasiswa" : "Admin FDM"}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-md`} />

          <Navbar.Offcanvas
            id={`offcanvasNavbar-expand-md`}
            aria-labelledby={`offcanvasNavbarLabel-expand-md`}
            placement="end"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id={`offcanvasNavbarLabel-expand-md`}>
                Menu
              </Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body>
              <Nav>
                <Link
                  to="/"
                  className="nav-link"
                  onClick={window.scrollTo(0, 0)}
                >
                  {location.pathname === "/" ? <u>Topik</u> : "Topik"}
                </Link>
                <Link to="/news" className="nav-link">
                  {location.pathname === "/news" ? <u>Berita</u> : "Berita"}
                </Link>
              </Nav>

              <Nav className="justify-content-end flex-grow-1 pe-3">
                <Form className="d-flex mx-5">
                  <Form.Control
                    type="search"
                    placeholder="Pencarian"
                    className="me-2"
                    aria-label="Search"
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                  />
                  <a
                    href={search ? `../search/${search}` : ""}
                    className="btn btn-outline-secondary"
                  >
                    Cari
                  </a>
                </Form>

                {/* <NavDropdown
                  title="Notif"
                  id={`offcanvasNavbarDropdown-expand-md`}
                >
                  <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
                  <NavDropdown.Item href="#action4">
                    Another action
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#action5">
                    Something else here
                  </NavDropdown.Item>
                </NavDropdown> */}

                <NavDropdown
                  title={user.name ? user.name : "Nama User"}
                  id={`offcanvasNavbarDropdown-expand-md`}
                >
                  <NavDropdown.Item href={`/profile/${user._id}`}>
                    Profil
                  </NavDropdown.Item>
                  {user.level === "Admin" && (
                    <NavDropdown.Item href="/admin">
                      Menu Admin
                    </NavDropdown.Item>
                  )}
                  {/* <NavDropdown.Item href="#action4">
                    Pengaturan
                  </NavDropdown.Item> */}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logout}>Keluar</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
};

export default NavbarMenu;
