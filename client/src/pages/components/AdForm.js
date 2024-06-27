import { useState } from "react";

import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Placeholder from "react-bootstrap/Placeholder";
import Offcanvas from "react-bootstrap/Offcanvas";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AdForm = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  const [offcanvasTitle, setOffcanvasTitle] = useState("");
  const [offcanvasBody, setOffcanvasBody] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [adTitle, setAdTitle] = useState("");
  const [adLink, setAdLink] = useState("");
  const [adDesc, setAdDesc] = useState("");
  const [image, setImage] = useState();

  const planList = [
    {
      id: "001",
      name: "Paket 1",
      desc: "this is plan 1",
      price: 100000,
      size: "180x300",
    },
    {
      id: "002",
      name: "Paket 2",
      desc: "this is plan 2",
      price: 150000,
      size: "180x500",
    },
  ];

  const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  });

  const [selectedPlan, setSelectedPlan] = useState({});
  const [planDescription, setPlanDescription] = useState({});
  const [durations, setDurations] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const handlePlan = (e) => {
    const plan = JSON.parse(e.target.dataset.plan);

    setSelectedPlan(plan);

    const planDesc = {
      name: plan.name,
      durations: durations,
      price: plan.price * durations,
    };
    setPlanDescription(planDesc);

    setTotalPrice(plan.price * durations);
  };

  const handleDurations = (e) => {
    const duration = e.target.value;
    setDurations(duration);

    const planDesc = {
      name: selectedPlan.name,
      durations: duration,
      price: selectedPlan.price * duration,
    };
    setPlanDescription(planDesc);

    setTotalPrice(selectedPlan.price * duration);
  };

  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const submitForm = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("adTitle", adTitle);
    formData.append("adLink", adLink);
    formData.append("adDesc", adDesc);
    formData.append("plan", selectedPlan.id);
    formData.append("duration", durations);
    formData.append("price", selectedPlan.price);
    formData.append("totalPrice", totalPrice);
    formData.append("startDate", selectedDate);
    formData.append("image", image);

    async function fetchForm() {
      const res = await fetch("../api/ad", {
        method: "POST",
        body: formData,
      });

      if (res.status === 200) {
        setOffcanvasTitle("Daftar Berhasil");
        setOffcanvasBody(
          "ID pendaftaran iklan anda akan segera dikirim ke nomor WhatsApp anda. Gunakan ID untuk mengecek status iklan lebih lanjut"
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
  };

  return (
    <Card className="py-2 px-5 my-auto" style={{ maxWidth: "1000px" }}>
      <h1 className="mb-3">Form Pemesanan Space Iklan</h1>

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

      <Form onSubmit={submitForm}>
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
            <Form.Label>Nomor Hp</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukan nomor Hp"
              onChange={(e) => {
                setPhone(e.target.value);
              }}
            />
          </Form.Group>
        </Row>

        <Form.Group className="mb-3" controlId="address">
          <Form.Label>Alamat</Form.Label>
          <Form.Control
            as="textarea"
            placeholder="Masukan alamat"
            onChange={(e) => {
              setAddress(e.target.value);
            }}
          />
        </Form.Group>

        <Row className="mb-3">
          <Form.Group as={Col} controlId="adTitle">
            <Form.Label>Judul iklan</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukan judul iklan"
              onChange={(e) => {
                setAdTitle(e.target.value);
              }}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="adLink">
            <Form.Label>Link Iklan</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukan link iklan"
              onChange={(e) => {
                setAdLink(e.target.value);
              }}
            />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} controlId="adDesc">
            <Form.Label>Deskripsi iklan</Form.Label>
            <Form.Control
              as="textarea"
              placeholder="Masukan deskripsi iklan"
              onChange={(e) => {
                setAdDesc(e.target.value);
              }}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="uploadImage">
            <Form.Label>Gambar iklan</Form.Label>
            <Form.Control
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) => {
                setImage(e.target.files[0]);
              }}
            />
          </Form.Group>
        </Row>

        <Form.Group className="my-4" controlId="plan">
          <Button variant="success" onClick={handleShow}>
            Pilih Paket
          </Button>
          <span className="ms-3">
            {planDescription.name &&
              `${planDescription.name} | ${
                planDescription.durations
              } bulan | harga: ${rupiah.format(planDescription.price)}`}
          </span>
        </Form.Group>

        <Modal show={show} onHide={handleClose} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Pilih Jenis Paket Iklan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex justify-content-around">
              {planList.map((plan, i) => {
                return (
                  <div key={i} className="d-flex flex-column">
                    <img
                      data-plan={JSON.stringify(plan)}
                      style={{
                        width: "220px",
                        height: "120px",
                        border: "1px solid black",
                        cursor: "pointer",
                      }}
                      src={`https://dummyimage.com/400x100/ffffff/000&text=${plan.size}`}
                      alt="Plan"
                      onClick={handlePlan}
                    />
                    <Placeholder
                      xs={12}
                      size="xs"
                      bg={plan.id === selectedPlan.id ? "primary" : "dark"}
                    />
                  </div>
                );
              })}
            </div>

            <Row className="mb-3">
              <Form.Group as={Col} className="mt-3" controlId="range">
                <Form.Label>Jangka iklan</Form.Label>
                <Form.Select defaultValue="pilih" onChange={handleDurations}>
                  <option>Pilih jangka iklan</option>
                  <option value={1}>1 bulan</option>
                  <option value={2}>2 bulan</option>
                  <option value={3}>3 bulan</option>
                  <option value={4}>4 bulan</option>
                  <option value={5}>5 bulan</option>
                  <option value={6}>6 bulan</option>
                  <option value={7}>7 bulan</option>
                  <option value={9}>9 bulan</option>
                  <option value={10}>10 bulan</option>
                  <option value={11}>11 bulan</option>
                  <option value={12}>12 bulan</option>
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} className="mt-3" controlId="startDate">
                <Form.Label>Mulai tanggal</Form.Label>
                <br />
                <DatePicker
                  className="form-control"
                  wrapperClassName="react-datepicker-wrapper"
                  selected={selectedDate}
                  onChange={handleDateChange}
                />
              </Form.Group>
            </Row>

            <span>
              Harga paket iklan:
              {planDescription.name && rupiah.format(planDescription.price)}
            </span>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <Row className="my-4">
          <Button variant="dark" type="submit">
            Submit
          </Button>
        </Row>
      </Form>
    </Card>
  );
};

export default AdForm;
