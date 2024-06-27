import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Cookies from "universal-cookie";
import jwt from "jwt-decode";

import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Card from "react-bootstrap/Card";

import AdminSidebar from "./components/AdminSidebar";
import AdminTable from "./components/AdminTable";

import { FaPrint, FaChartBar, FaPlus } from "react-icons/fa";
import { Button } from "react-bootstrap";

import ReportFilter from "./components/ReportFilter";

const AdminUsers = () => {
  const location = useLocation();
  const navigate = useNavigate();

  function getToken() {
    const cookie = new Cookies();
    const decoded = cookie.get("token") ? jwt(cookie.get("token")) : null;
    if (decoded === null) {
      return navigate("/admin-login");
    }
  }
  useEffect(getToken, [navigate, location.pathname]);

  const [showActivity, setShowActivity] = useState(false);
  const handleCloseActivity = () => setShowActivity(false);
  const handleShowActivity = () => setShowActivity(true);

  const [showActivityChart, setShowActivityChart] = useState(false);
  const handleCloseActivityChart = () => setShowActivityChart(false);
  const handleShowActivityChart = () => setShowActivityChart(true);

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const handleCloseAddAdmin = () => setShowAddAdmin(false);
  const handleShowAddAdmin = () => setShowAddAdmin(true);

  const [data, setData] = useState([]);
  const [admin, setAdmin] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("../../api/users");
      const jsonData = await response.json();
      setData(jsonData.filter((row) => row.level === "User"));
      setAdmin(jsonData.filter((row) => row.level === "Admin"));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [activity, setActivity] = useState([]);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const response = await fetch("../../api/admin/user-activity");
      const jsonData = await response.json();
      setActivity(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const desiredFields = [
    { name: "Id", key: "_id" },
    { name: "Nama", key: "name" },
    { name: "NPM", key: "npm" },
    { name: "Email", key: "email" },
    { name: "No. Hp", key: "phone" },
    { name: "Program Studi", key: "prodi" },
    { name: "Status", key: "status" },
  ];

  const adminFields = [
    { name: "Id", key: "_id" },
    { name: "Nama", key: "name" },
    { name: "Username", key: "username" },
    { name: "Email", key: "email" },
    { name: "Status", key: "status" },
  ];

  const activityFields = [
    { name: "Id User", key: "userId" },
    { name: "Tipe Aktifitas", key: "activityType" },
    { name: "Tanggal", key: "date" },
  ];

  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    setActiveUsers(
      data.filter((row) => {
        return row.status === "active";
      })
    );
  }, [data]);

  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    setPendingUsers(
      data.filter((row) => {
        return row.status === "pending";
      })
    );
  }, [data]);

  const handleGeneratePDF = () => {
    fetch("../../api/report/user-report")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.arrayBuffer();
      })
      .then((data) => {
        // Create a Blob from the response data
        const file = new Blob([data], { type: "application/pdf" });

        // Build a URL from the Blob
        const fileURL = URL.createObjectURL(file);

        // Open the PDF in a new tab or window
        window.open(fileURL);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  const activityGeneratePDF = () => {
    fetch(
      `../../api/report/activity-report/${selectedYear}/${selectedMonth}/${filter}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.arrayBuffer();
      })
      .then((data) => {
        // Create a Blob from the response data
        const file = new Blob([data], { type: "application/pdf" });

        // Build a URL from the Blob
        const fileURL = URL.createObjectURL(file);

        // Open the PDF in a new tab or window
        window.open(fileURL);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  const activityGeneratePDFChart = () => {
    fetch(
      `../../api/report/activity-chart/${selectedYear}/${selectedMonth}/${filter}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.arrayBuffer();
      })
      .then((data) => {
        // Create a Blob from the response data
        const file = new Blob([data], { type: "application/pdf" });

        // Build a URL from the Blob
        const fileURL = URL.createObjectURL(file);

        // Open the PDF in a new tab or window
        window.open(fileURL);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [filter, setFilter] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitAddAdmin = (e) => {
    e.preventDefault();

    const admin = {
      name: name,
      email: email,
      username: username,
      password: password,
      level: "Admin",
      status: "active",
    };

    async function fetchForm() {
      const res = await fetch("../../api/users/register-admin", {
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
        body: JSON.stringify(admin),
      });
    }

    fetchForm();
    fetchData();
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div
        className="container-fluid"
        style={{ marginLeft: "17vw", overflowX: "auto" }}
      >
        <Card className="mx-3 my-5 p-3 bg-light">
          <div className="d-flex justify-content-between px-3">
            <Card.Title>Pendaftaran</Card.Title>
            <Button onClick={handleGeneratePDF}>
              <FaPrint />
            </Button>
          </div>

          <Card.Body>
            <AdminTable
              data={pendingUsers}
              desiredFields={desiredFields}
              tableType={"users"}
              active={false}
            />
          </Card.Body>
        </Card>

        <Card className="mx-3 my-5 p-3 bg-light">
          <div className="d-flex justify-content-between px-3">
            <Card.Title>Tabel Data Pengguna</Card.Title>
            {/* <Button onClick={handleGeneratePDF}>
              <FaPrint />
            </Button> */}
          </div>

          <Card.Body>
            <AdminTable
              data={activeUsers}
              desiredFields={desiredFields}
              tableType={"users"}
              active={true}
            />
          </Card.Body>
        </Card>

        <Modal show={showAddAdmin} onHide={handleCloseAddAdmin} centered>
          <Modal.Header closeButton>
            <Modal.Title>Tambah Akun Admin</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form id="addAdmin" onSubmit={submitAddAdmin}>
              <Form.Group className="mb-3">
                <Form.Label>Nama</Form.Label>
                <Form.Control
                  type="text"
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="text"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddAdmin}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleCloseAddAdmin}
              type="submit"
              form="addAdmin"
            >
              Tambah
            </Button>
          </Modal.Footer>
        </Modal>

        <Card className="mx-3 my-5 p-3 bg-light">
          <div className="d-flex justify-content-between px-3">
            <Card.Title>Tabel Data Admin</Card.Title>
            <div>
              <Button className="ms-3" onClick={handleShowAddAdmin}>
                <FaPlus />
              </Button>
              <Button className="ms-3" onClick={handleGeneratePDF}>
                <FaPrint />
              </Button>
            </div>
          </div>

          <Card.Body>
            <AdminTable
              data={admin}
              desiredFields={adminFields}
              tableType={"admins"}
              active={true}
            />
          </Card.Body>
        </Card>

        <ReportFilter
          show={showActivity}
          close={handleCloseActivity}
          filter={filter}
          setFilter={setFilter}
          year={selectedYear}
          month={selectedMonth}
          setYear={setSelectedYear}
          setMonth={setSelectedMonth}
          generate={activityGeneratePDF}
        />

        <ReportFilter
          show={showActivityChart}
          close={handleCloseActivityChart}
          filter={filter}
          setFilter={setFilter}
          year={selectedYear}
          month={selectedMonth}
          setYear={setSelectedYear}
          setMonth={setSelectedMonth}
          generate={activityGeneratePDFChart}
        />

        <Card className="mx-3 my-5 p-3 bg-light">
          <div className="d-flex justify-content-between px-3">
            <Card.Title>Tabel Aktifitas Pengguna</Card.Title>
            <div className="d-flex">
              <Button className="mx-3" onClick={handleShowActivityChart}>
                <FaChartBar />
              </Button>
              <Button onClick={handleShowActivity}>
                <FaPrint />
              </Button>
            </div>
          </div>

          <Card.Body>
            <AdminTable
              data={activity}
              desiredFields={activityFields}
              tableType={"activity"}
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AdminUsers;
