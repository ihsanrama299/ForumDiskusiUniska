import { useEffect, useState } from "react";

import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Offcanvas from "react-bootstrap/Offcanvas";
import Modal from "react-bootstrap/Modal";

const AdInfoCard = () => {
  const [adId, setAdId] = useState("");

  const [data, setData] = useState();

  const [open, setOpen] = useState(false);

  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  useEffect(() => {
    if (
      data &&
      data.transaction &&
      data.transaction.filter((item) => {
        return item.transactionType === "first-payment";
      }).length > 0
    ) {
      setUploadedImageUrl(data.transaction[0].transactionImageUrl);
    } else {
      setUploadedImageUrl(
        "https://dummyimage.com/400x100/ffffff/000&text=Bukti+Transfer+Belum+Ditambahkan"
      );
    }
  }, [data]);

  async function fetchAd(id) {
    try {
      const response = await fetch(`../api/ad/${id}`);
      const jsonData = await response.json();
      setData(jsonData);
      setAdTitle(jsonData.adTitle);
      setAdDesc(jsonData.adDesc);
      setAdLink(jsonData.adLink);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const getAd = (e) => {
    e.preventDefault();
    fetchAd(adId);
  };

  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  const [offcanvasTitle, setOffcanvasTitle] = useState("");
  const [offcanvasBody, setOffcanvasBody] = useState("");

  const [firstPayment, setFirstPayment] = useState();

  const uploadFirstPayment = (e) => {
    const formData = new FormData();
    formData.append("firstPayment", firstPayment);

    async function fetchForm() {
      const res = await fetch(`../api/ad/firstPayment/${adId}`, {
        method: "PUT",
        body: formData,
      });

      if (res.status === 200) {
        setOffcanvasTitle("Bukti Terupload");
        setOffcanvasBody(
          "Bukti bayar terkirim, tunggu informasi pengaktifan oleh admin lewat WhatsApp"
        );
      } else if (res.status === 400) {
        setOffcanvasTitle("Daftar Gagal");
        setOffcanvasBody(
          "Cek kembali isian form anda, lalu silahkan coba lagi"
        );
      }

      const data = await res.json();

      if (data.imageUrl) {
        setUploadedImageUrl(data.imageUrl);
      }
    }
    fetchForm();
  };

  const calculateDayDifference = (date) => {
    const today = new Date();
    const finishedDate = new Date(date);
    const timeDifference = finishedDate.getTime() - today.getTime();
    const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return dayDifference;
  };

  const [extensionMonths, setExtensionMonths] = useState();
  const [extensionTransaction, setExtensionTransaction] = useState();
  const [extensionPrice, setExtensionPrice] = useState(0);

  const submitExtension = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("months", extensionMonths);
    formData.append("transactionImage", extensionTransaction);
    formData.append("extensionsPrice", extensionPrice);

    async function fetchForm() {
      const res = await fetch(`../api/ad/extend/${adId}`, {
        method: "PUT",
        body: formData,
      });

      handleShowOffcanvas();
    }

    fetchForm();
  };

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [adTitle, setAdTitle] = useState("");
  const [adDesc, setAdDesc] = useState("");
  const [adLink, setAdLink] = useState("");

  const editAd = async (e) => {
    e.preventDefault();

    const edited = {
      id: data._id,
      adTitle: adTitle,
      adDesc: adDesc,
      adLink: adLink,
    };

    try {
      await fetch(`../api/ad/edit/`, {
        method: "PUT",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
        body: JSON.stringify(edited),
      });
      fetchAd(adId);
    } catch (error) {
      console.log(error);
    }
  };

  const [bankNumber, setBankNumber] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = () => {
    fetch("../api/config")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((jsonData) => {
        setBankNumber(jsonData.bankNumber);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  return (
    <Card
      className="py-2 px-5 my-auto"
      style={{ width: "750px", minHeight: "150px" }}
    >
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

      <h2 className="mb-3">Info Iklan</h2>
      <Form className="d-flex">
        <Form.Control
          type="text"
          placeholder="Masukan ID Anda"
          onChange={(e) => {
            setAdId(e.target.value);
          }}
        />
        <Button variant="outline-secondary" className="mx-2" onClick={getAd}>
          Ok
        </Button>
      </Form>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Iklan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="editAd" onSubmit={editAd}>
            <Form.Group className="mb-3">
              <Form.Label>Judul Iklan</Form.Label>
              <Form.Control
                type="text"
                defaultValue={data && data.adTitle}
                onChange={(e) => {
                  setAdTitle(e.target.value);
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Deskripsi Iklan</Form.Label>
              <Form.Control
                as="textarea"
                defaultValue={data && data.adDesc}
                onChange={(e) => {
                  setAdDesc(e.target.value);
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Link Iklan</Form.Label>
              <Form.Control
                type="text"
                defaultValue={data && data.adLink}
                onChange={(e) => {
                  setAdLink(e.target.value);
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleClose}
            type="submit"
            form="editAd"
          >
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>

      {data && (
        <Container className="py-3">
          <Row className="py-2">
            <Col>Judul Iklan</Col>
            <Col>: {data.adTitle}</Col>
          </Row>
          <Row className="py-2">
            <Col>Deskripsi Iklan</Col>
            <Col>: {data.adDesc}</Col>
          </Row>
          <Row className="py-2">
            <Col>Link Iklan</Col>
            <Col>: {data.adLink}</Col>
          </Row>
          <Row className="py-2">
            <Col>Status</Col>
            <Col>: {data.status ? "Aktif" : "Tidak Aktif"}</Col>
          </Row>
          <Row className="py-2">
            <Col>Sisa Jangka Iklan</Col>
            <Col>
              :{" "}
              {data.status === "active"
                ? calculateDayDifference(data.finishedDate) + " hari"
                : ""}
            </Col>
            <Button
              variant="dark"
              className="my-3"
              size="sm"
              onClick={handleShow}
            >
              Edit Iklan
            </Button>
          </Row>
          <Row className="pb-2 d-flex flex-column align-items-center">
            <p>Transfer ke no rekening: {bankNumber}</p>
            <a
              className="mb-3 mx-auto"
              href={"http://localhost:5000/" + uploadedImageUrl}
              target="_blank"
              style={{ width: "250px" }}
            >
              <img
                style={{
                  height: "150px",
                  border: "1px solid black",
                }}
                src={uploadedImageUrl}
                alt="bukti pembayaran"
              ></img>
            </a>
            <Form.Control
              type="file"
              name="firstPayment"
              accept="image/*"
              onChange={(e) => {
                setFirstPayment(e.target.files[0]);
              }}
            />
            <Button
              variant="dark"
              className="my-2"
              onClick={uploadFirstPayment}
            >
              Upload
            </Button>
          </Row>
          <hr />
          <Row className="py-3">
            <Button
              onClick={() => setOpen(!open)}
              aria-controls="example-collapse-text"
              aria-expanded={open}
              variant="outline-dark"
            >
              Perpanjang Jangka Iklan
            </Button>
            <Collapse in={open}>
              <div className="py-5" id="example-collapse-text">
                <Row className="py-2">
                  <Col>Jumlah Bulan</Col>
                  <Col>
                    <Form.Select
                      aria-label="Default select example"
                      onChange={(e) => {
                        setExtensionMonths(e.target.value);
                        setExtensionPrice(data.price * e.target.value);
                      }}
                    >
                      <option value={0}>Pilih Jumlah Bulan</option>
                      <option value="1">1 bulan</option>
                      <option value="2">2 bulan</option>
                      <option value="3">3 bulan</option>
                      <option value="4">4 bulan</option>
                      <option value="5">5 bulan</option>
                      <option value="6">6 bulan</option>
                      <option value="7">7 bulan</option>
                    </Form.Select>
                  </Col>
                </Row>
                <Row className="py-2">
                  <Col>Bukti Pembayaran</Col>
                  <Col>
                    <Form.Control
                      type="file"
                      name="image"
                      accept="image/*"
                      size="sm"
                      onChange={(e) => {
                        setExtensionTransaction(e.target.files[0]);
                      }}
                    />
                  </Col>
                </Row>
                <Row className="py-2">
                  <Col>Harga Iklan:</Col>
                  <Col>{extensionPrice}</Col>
                </Row>
                <Row className="py-2">
                  <Button variant="dark" onClick={submitExtension}>
                    Kirim Permintaan Perpanjangan
                  </Button>
                </Row>
              </div>
            </Collapse>
          </Row>
        </Container>
      )}
    </Card>
  );
};

export default AdInfoCard;
