import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Cookies from "universal-cookie";
import jwt from "jwt-decode";

import Card from "react-bootstrap/Card";

import AdminSidebar from "./components/AdminSidebar";
import AdminTable from "./components/AdminTable";

import { FaPrint } from "react-icons/fa";
import { Button } from "react-bootstrap";

import ReportFilter from "./components/ReportFilter";

const AdminPosts = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showPost, setShowPost] = useState(false);
  const handleClosePost = () => setShowPost(false);
  const handleShowPost = () => setShowPost(true);

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
      const response = await fetch(`../../api/post/1`);
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const desiredFields = [
    { name: "Id", key: "_id" },
    { name: "Judul", key: "title" },
    { name: "Id Pengirim", key: "authorId" },
    { name: "Tanggal", key: "date" },
  ];

  const handleGeneratePDF = () => {
    fetch(
      `../../api/report/trending-post-report/${selectedYear}/${selectedMonth}/${filter}`
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

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div
        className="container-fluid"
        style={{ marginLeft: "17vw", overflowX: "auto" }}
      >
        <ReportFilter
          show={showPost}
          close={handleClosePost}
          year={selectedYear}
          month={selectedMonth}
          filter={filter}
          setFilter={setFilter}
          setYear={setSelectedYear}
          setMonth={setSelectedMonth}
          generate={handleGeneratePDF}
        />

        <Card className="mx-3 my-5 p-3 bg-light">
          <div className="d-flex justify-content-between px-3">
            <Card.Title>Tabel Data Topik</Card.Title>
            <Button onClick={handleShowPost}>
              <FaPrint />
            </Button>
          </div>

          <Card.Body>
            <AdminTable
              data={data}
              desiredFields={desiredFields}
              tableType={"posts"}
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AdminPosts;
