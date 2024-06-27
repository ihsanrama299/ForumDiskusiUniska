import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Cookies from "universal-cookie";
import jwt from "jwt-decode";

import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";

import AdminSidebar from "./components/AdminSidebar";
import AdminTable from "./components/AdminTable";

import { FaPrint, FaChartBar } from "react-icons/fa";
import { Button } from "react-bootstrap";

import ReportFilter from "./components/ReportFilter";

const AdminAds = () => {
  const toUnixPath = (path) =>
    path.replace(/[\\/]+/g, "/").replace(/^([a-zA-Z]+:|\.\/)/, "");

  const [showActiveAds, setShowActiveAds] = useState(false);
  const handleCloseActiveAds = () => setShowActiveAds(false);
  const handleShowActiveAds = () => setShowActiveAds(true);

  const [showActiveAdsChart, setShowActiveAdsChart] = useState(false);
  const handleCloseActiveAdsChart = () => setShowActiveAdsChart(false);
  const handleShowActiveAdsChart = () => setShowActiveAdsChart(true);

  const [showExtensions, setShowExtensions] = useState(false);
  const handleCloseExtensions = () => setShowExtensions(false);
  const handleShowExtensions = () => setShowExtensions(true);

  const [showExtensionsChart, setShowExtensionsChart] = useState(false);
  const handleCloseExtensionsChart = () => setShowExtensionsChart(false);
  const handleShowExtensionsChart = () => setShowExtensionsChart(true);

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

  useEffect(() => {
    fetchConfig();
  }, []);

  const [acceptAd, setAcceptAd] = useState(false);
  const [bankNumber, setBankNumber] = useState("");

  const fetchConfig = () => {
    fetch("../api/config")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((jsonData) => {
        setAcceptAd(jsonData.acceptAdForm);
        setBankNumber(jsonData.bankNumber);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const editAcceptAd = (e) => {
    e.preventDefault();

    const newData = { value: e.target.checked };

    fetch("/api/config/acceptAdForm", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        setAcceptAd(!acceptAd);
      })
      .catch((error) => {
        console.error("Error writing data:", error);
      });
  };

  const editBankNumber = (e) => {
    e.preventDefault();

    const newData = { value: bankNumber };

    fetch("/api/config/bankNumber", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
      })
      .catch((error) => {
        console.error("Error writing data:", error);
      });
  };

  const [data, setData] = useState([]);
  data.forEach((row) => {
    row.firstTransDate = row.transaction[0]
      ? row.transaction[0].transactionDate
      : null;
  });
  const [extensions, setExtensions] = useState([]);
  const [extensionsSuccess, setExtensionsSuccess] = useState([]);

  function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  }

  const [nearExpAds, setNearExpAds] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`../../api/ad`);
      const jsonData = await response.json();

      jsonData.forEach((element) => {
        element.firstTransaction =
          element.transaction.length > 0
            ? "http://localhost:5000/" +
              toUnixPath(
                element.transaction.filter((item) => {
                  return item.transactionType === "first-payment";
                })[0].transactionImageUrl
              )
            : "Belum di Upload";
      });

      jsonData.forEach((element) => {
        element.imageUrl =
          "http://localhost:5000/" + toUnixPath(element.imageUrl);
      });

      setData(jsonData);

      setExtensions(
        jsonData.filter((element) => {
          return element.transaction.some(
            (subItem) =>
              subItem.transactionType === "extension" &&
              subItem.extensionsStatus === "pending"
          );
        })
      );

      setExtensionsSuccess(
        jsonData.filter((element) => {
          return element.transaction.some(
            (subItem) =>
              subItem.transactionType === "extension" &&
              subItem.extensionsStatus === "success"
          );
        })
      );

      setNearExpAds(
        jsonData.filter((element) => {
          if (monthDiff(new Date(), new Date(element.finishedDate)) < 2) {
            return element;
          }
        })
      );

      nearExpAds.forEach((row) => {
        row.remaining = monthDiff(new Date(), new Date(row.finishedDate));
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [activeAds, setActiveAds] = useState([]);

  useEffect(() => {
    setActiveAds(
      data
        .filter((row) => {
          return row.status === "active";
        })
        .sort(
          (objA, objB) =>
            Number(new Date(objA.firstTransDate)) -
            Number(new Date(objB.firstTransDate))
        )
    );
  }, [data]);

  const [pendingAds, setPendingAds] = useState([]);

  useEffect(() => {
    setPendingAds(
      data.filter((row) => {
        return !row.status;
      })
    );
  }, [data]);

  const pendingFields = [
    { name: "Judul", key: "adTitle" },
    { name: "Link", key: "adLink" },
    { name: "Nama pemilik", key: "name" },
    { name: "Nomor Hp.", key: "phone" },
    { name: "Email", key: "email" },
    { name: "Alamat", key: "address" },
    { name: "Gambar Iklan", key: "imageUrl" },
    { name: "Paket iklan", key: "plan" },
    { name: "Tanggal mulai", key: "startDate" },
    { name: "Jangka bulan", key: "duration" },
    { name: "Harga per bulan", key: "price" },
    { name: "Total harga", key: "totalPrice" },
    { name: "Tanggal Pendaftaran", key: "regDate" },
    { name: "Bukti Pembayaran", key: "firstTransaction" },
  ];

  const customerFields = [
    { name: "Nama", key: "name" },
    { name: "Nomor Hp.", key: "phone" },
    { name: "Email", key: "email" },
    { name: "Alamat", key: "address" },
  ];

  const activeFields = [
    { name: "Judul", key: "adTitle" },
    { name: "Link", key: "adLink" },
    { name: "Nama pemilik", key: "name" },
    { name: "Nomor Hp.", key: "phone" },
    { name: "Email", key: "email" },
    { name: "Alamat", key: "address" },
    { name: "Gambar Iklan", key: "imageUrl" },
    { name: "Paket iklan", key: "plan" },
    { name: "Tanggal mulai", key: "startDate" },
    { name: "Tanggal selesai", key: "finishedDate" },
    { name: "Jangka bulan", key: "duration" },
    { name: "Harga per bulan", key: "price" },
    { name: "Bukti Pembayaran", key: "firstTransaction" },
    { name: "Tanggal Transaksi", key: "firstTransDate" },
  ];

  const nearExpAdsFields = [
    { name: "Judul", key: "adTitle" },
    { name: "Link", key: "adLink" },
    { name: "Nama pemilik", key: "name" },
    { name: "Nomor Hp.", key: "phone" },
    { name: "Email", key: "email" },
    { name: "Alamat", key: "address" },
    { name: "Paket iklan", key: "plan" },
    { name: "Tanggal mulai", key: "startDate" },
    { name: "Tanggal selesai", key: "finishedDate" },
  ];

  const extensionsField = [
    { name: "Judul", key: "adTitle" },
    { name: "Nama Pemilik", key: "name" },
  ];

  const [extensionsType, setExtensionsType] = useState("pending");

  const selectedExtension =
    extensionsType === "pending" ? extensions : extensionsSuccess;

  const handleExtensionsType = (e) => {
    setExtensionsType(e.target.value);
  };

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const activeAdsGeneratePDF = () => {
    fetch(
      `../../api/report/active-ads-report/${selectedYear}/${selectedMonth}/${filter}`
    )
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
    handleCloseActiveAds();
  };

  const customerGeneratePDF = () => {
    fetch(`../../api/report/customer-report/`)
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

  const activeAdsGeneratePDFChart = () => {
    fetch(
      `../../api/report/active-ads-chart/${selectedYear}/${selectedMonth}/${filter}`
    )
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
    handleCloseActiveAdsChart();
  };

  const extensionsGeneratePDF = () => {
    fetch(
      `../../api/report/extensions-report/${selectedYear}/${selectedMonth}/${filter}`
    )
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
    handleCloseExtensions();
  };

  const extensionsGeneratePDFChart = () => {
    fetch(
      `../../api/report/extensions-chart/${selectedYear}/${selectedMonth}/${filter}`
    )
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
    handleCloseExtensions();
  };

  const nearExpGeneratePDF = () => {
    fetch(`../../api/report/near-exp-ads-report/`)
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

  const [filter, setFilter] = useState(false);

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div
        className="container-fluid"
        style={{
          marginLeft: "17vw",
          overflowX: "auto",
        }}
      >
        <Card className="mx-3 my-5 p-3 bg-light d-flex flex-row justify-content-between">
          <Card.Title>Terima pendaftaran iklan</Card.Title>
          <Form.Check
            type="switch"
            id="custom-switch"
            checked={acceptAd}
            onChange={editAcceptAd}
          />
        </Card>

        <Card className="mx-3 my-5 p-3 bg-light d-flex flex-row justify-content-between">
          <Card.Title>Nomor Rekening</Card.Title>
          <Form.Group className="d-flex">
            <Form.Control
              type="text"
              defaultValue={bankNumber}
              className="me-3"
              onChange={(e) => {
                setBankNumber(e.target.value);
              }}
            />
            <Button size="sm" onClick={editBankNumber}>
              Simpan
            </Button>
          </Form.Group>
        </Card>

        <Card className="mx-3 my-5 p-3 bg-light">
          <div className="d-flex justify-content-between px-3">
            <Card.Title>Tabel Data Pendaftaran Iklan</Card.Title>
            {/* <Button>
              <FaPrint />
            </Button> */}
          </div>

          <Card.Body>
            <AdminTable
              data={pendingAds}
              desiredFields={pendingFields}
              tableType={"ads"}
            />
          </Card.Body>
        </Card>

        <Card className="mx-3 my-5 p-3 bg-light">
          <div className="d-flex justify-content-between px-3">
            <Card.Title>Tabel Data Pelanggan</Card.Title>
            <div className="d-flex">
              <Button onClick={customerGeneratePDF}>
                <FaPrint />
              </Button>
            </div>
          </div>

          <Card.Body>
            <AdminTable
              data={activeAds}
              desiredFields={customerFields}
              tableType={"ads"}
              active={true}
            />
          </Card.Body>
        </Card>

        <ReportFilter
          show={showActiveAds}
          close={handleCloseActiveAds}
          filter={filter}
          setFilter={setFilter}
          year={selectedYear}
          month={selectedMonth}
          setYear={setSelectedYear}
          setMonth={setSelectedMonth}
          generate={activeAdsGeneratePDF}
        />

        <ReportFilter
          show={showActiveAdsChart}
          close={handleCloseActiveAdsChart}
          filter={filter}
          setFilter={setFilter}
          year={selectedYear}
          month={selectedMonth}
          setYear={setSelectedYear}
          setMonth={setSelectedMonth}
          generate={activeAdsGeneratePDFChart}
        />

        <Card className="mx-3 my-5 p-3 bg-light">
          <div className="d-flex justify-content-between px-3">
            <Card.Title>Tabel Data Iklan Aktif</Card.Title>
            <div className="d-flex">
              <Button className="mx-3" onClick={handleShowActiveAdsChart}>
                <FaChartBar />
              </Button>
              <Button onClick={handleShowActiveAds}>
                <FaPrint />
              </Button>
            </div>
          </div>

          <Card.Body>
            <AdminTable
              data={activeAds}
              desiredFields={activeFields}
              tableType={"ads"}
              active={true}
            />
          </Card.Body>
        </Card>

        <Card className="mx-3 my-5 p-3 bg-light">
          <div className="d-flex justify-content-between px-3">
            <Card.Title>Tabel Data Iklan Masa Tenggang</Card.Title>
            <div className="d-flex">
              <Button onClick={nearExpGeneratePDF}>
                <FaPrint />
              </Button>
            </div>
          </div>

          <Card.Body>
            <AdminTable
              data={nearExpAds}
              desiredFields={nearExpAdsFields}
              tableType={"near-exp-ads"}
              active={true}
            />
          </Card.Body>
        </Card>

        <ReportFilter
          show={showExtensions}
          close={handleCloseExtensions}
          filter={filter}
          setFilter={setFilter}
          year={selectedYear}
          month={selectedMonth}
          setYear={setSelectedYear}
          setMonth={setSelectedMonth}
          generate={extensionsGeneratePDF}
        />

        <ReportFilter
          show={showExtensionsChart}
          close={handleCloseExtensionsChart}
          filter={filter}
          setFilter={setFilter}
          year={selectedYear}
          month={selectedMonth}
          setYear={setSelectedYear}
          setMonth={setSelectedMonth}
          generate={extensionsGeneratePDFChart}
        />

        <Card className="mx-3 my-5 p-3 bg-light">
          <div className="d-flex justify-content-between px-3">
            <Card.Title>Tabel Permintaan Perpanjangan Jangka Iklan</Card.Title>
            <div className="d-flex">
              <Form.Select className="mx-3" onChange={handleExtensionsType}>
                <option value="pending">Belum Dikonfirmasi</option>
                <option value="success">Sukses</option>
              </Form.Select>
              <div className="d-flex">
                <Button className="mx-3" onClick={handleShowExtensionsChart}>
                  <FaChartBar />
                </Button>
                <Button onClick={handleShowExtensions}>
                  <FaPrint />
                </Button>
              </div>
            </div>
          </div>

          <Card.Body>
            <AdminTable
              data={selectedExtension}
              desiredFields={extensionsField}
              tableType={"ads-extension"}
              status={extensionsType}
            />
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AdminAds;
