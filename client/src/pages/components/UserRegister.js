import { useState } from "react";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Offcanvas from "react-bootstrap/Offcanvas";

const UserRegister = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  const [offcanvasTitle, setOffcanvasTitle] = useState("");
  const [offcanvasBody, setOffcanvasBody] = useState("");

  const [name, setName] = useState("");
  const [npm, setNpm] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [prodi, setProdi] = useState("Teknik Informatika");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submitForm = (e) => {
    e.preventDefault();

    const user = {
      name: name,
      npm: parseInt(npm),
      email: email,
      phone: phone,
      prodi: prodi,
      username: username,
      password: password,
      level: "User",
      status: "pending",
    };

    async function fetchForm() {
      const res = await fetch("../api/users/", {
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (res.status === 200) {
        setOffcanvasTitle("Daftar Berhasil");
        setOffcanvasBody(
          "Akun anda telah terdaftar tunggu pengaktifan dari admin untuk bisa login"
        );
      } else if (res.status === 400) {
        setOffcanvasTitle("Daftar Gagal");
        setOffcanvasBody(
          "Cek kembali isian form anda, lalu silahkan coba lagi"
        );
      }

      handleShowOffcanvas();
    }

    fetchForm();
    // console.log(user);
  };

  return (
    <Card className="py-2 px-5 my-auto" style={{ maxWidth: "1000px" }}>
      <h1 className="mb-3">Daftar Akun Baru</h1>

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

      <Form>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="nama">
            <Form.Label>Nama</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukan nama"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </Form.Group>
        </Row>
        <Row className="mb-3">
          <Form.Group as={Col} controlId="npm">
            <Form.Label>NPM</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukan NPM"
              onChange={(e) => {
                setNpm(e.target.value);
              }}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="address">
            <Form.Label>Program Studi</Form.Label>
            <Form.Select
              aria-label="Default select example"
              onChange={(e) => {
                setProdi(e.target.value);
              }}
            >
              <option value="Teknik Informatika">Teknik Informatika</option>
              <option value="Sistem Informasi">Sistem Informasi</option>
            </Form.Select>
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Masukan alamat email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="phone">
            <Form.Label>No. Hp</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukan nomor Hp"
              onChange={(e) => {
                setPhone(e.target.value);
              }}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} controlId="adTitle">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukan Username"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="adLink">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Masukan Password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </Form.Group>
        </Row>

        <Row className="my-4">
          <Button variant="dark" type="submit" onClick={submitForm}>
            Submit
          </Button>
        </Row>
      </Form>
    </Card>
  );
};

export default UserRegister;
