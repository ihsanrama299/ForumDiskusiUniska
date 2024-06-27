import { useEffect, useState } from "react";

import AdForm from "./components/AdForm";
import AdFull from "./components/AdFull";
import AdInfoCard from "./components/AdInfoCard";

import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

const Ad = () => {
  const [acceptAd, setAcceptAd] = useState(true);

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
        if (!jsonData.acceptAdForm) {
          setAcceptAd(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  return (
    <div
      className="d-flex flex-column align-items-center"
      style={{ backgroundColor: "#e0e0e0", minHeight: "100vh" }}
    >
      <Tabs defaultActiveKey="form" id="uncontrolled-tab-example">
        <Tab eventKey="form" title="Daftar Iklan Baru">
          {acceptAd ? <AdForm /> : <AdFull />}
        </Tab>
        <Tab eventKey="info" title="Info Iklan Anda">
          <AdInfoCard />
        </Tab>
      </Tabs>
    </div>
  );
};

export default Ad;
