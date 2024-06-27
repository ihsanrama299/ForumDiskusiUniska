import AdminSidebar from "./components/AdminSidebar";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Cookies from "universal-cookie";
import jwt from "jwt-decode";

import { FaPrint, FaPlus } from "react-icons/fa";
import { Button } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

import AdminTable from "./components/AdminTable";

const AdminCategories = ({ user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function getToken() {
    const cookie = new Cookies();
    const decoded = cookie.get("token") ? jwt(cookie.get("token")) : null;
    if (decoded === null) {
      return navigate("/admin-login");
    }
  }
  useEffect(getToken, [navigate, location.pathname]);

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("../../api/category");
      const jsonData = await response.json();

      jsonData.forEach((element) => {
        element.subCat =
          element.subCategory.length > 0
            ? element.subCategory.map((obj) => obj.subCategoryName).join(", ")
            : "-";
      });

      setData(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const desiredFields = [
    { name: "Nama Kategori", key: "name" },
    { name: "Id Pembuat", key: "authorId" },
    { name: "Sub Kategori", key: "subCat" },
  ];

  const [category, setCategory] = useState("");

  const submitCategory = (e) => {
    e.preventDefault();

    const newCategory = {
      name: category,
      authorId: user._id,
    };

    async function fetchCategory() {
      await fetch("../../api/category", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });
    }
    fetchCategory();
  };

  const generatePDF = () => {
    fetch(`../../api/report/categories-report/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.arrayBuffer();
      })
      .then((data) => {
        const file = new Blob([data], { type: "application/pdf" });

        const fileURL = URL.createObjectURL(file);

        window.open(fileURL);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Kategori</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="category" onSubmit={submitCategory}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Nama Kategori</Form.Label>
              <Form.Control
                type="text"
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleClose}
            type="submit"
            form="category"
          >
            Tambah
          </Button>
        </Modal.Footer>
      </Modal>
      <div
        className="container-fluid"
        style={{ marginLeft: "17vw", overflowX: "auto" }}
      >
        <Card className="mx-3 my-5 p-3 bg-light">
          <div className="d-flex justify-content-between px-3">
            <Card.Title>Tabel Data Kategori</Card.Title>
            <div>
              <Button className="ms-3" onClick={handleShow}>
                <FaPlus />
              </Button>
              <Button className="ms-3" onClick={generatePDF}>
                <FaPrint />
              </Button>
            </div>
          </div>

          <Card.Body>
            <AdminTable
              data={data}
              desiredFields={desiredFields}
              tableType={"categories"}
              user={user}
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AdminCategories;
