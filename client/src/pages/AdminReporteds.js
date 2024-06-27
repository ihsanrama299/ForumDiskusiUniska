import AdminSidebar from "./components/AdminSidebar";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Cookies from "universal-cookie";
import jwt from "jwt-decode";

import { FaPrint } from "react-icons/fa";
import { Button } from "react-bootstrap";
import Card from "react-bootstrap/Card";

import AdminTable from "./components/AdminTable";

const AdminReporteds = ({ user }) => {
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

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("../../api/reported");
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const desiredFields = [
    { name: "Id Pelapor", key: "reporterId" },
    { name: "Id Post Terlapor", key: "postId" },
    { name: "Alasan Pelaporan", key: "body" },
  ];

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div
        className="container-fluid"
        style={{ marginLeft: "17vw", overflowX: "auto" }}
      >
        <Card className="mx-3 my-5 p-3 bg-light">
          <div className="d-flex justify-content-between px-3">
            <Card.Title>Tabel Data Terlapor</Card.Title>
            <div>
              {/* <Button className="ms-3">
                <FaPrint />
              </Button> */}
            </div>
          </div>

          <Card.Body>
            <AdminTable
              data={data}
              desiredFields={desiredFields}
              tableType={"reporteds"}
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AdminReporteds;
