import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Cookies from "universal-cookie";
import jwt from "jwt-decode";

import Card from "react-bootstrap/Card";

import AdminSidebar from "./components/AdminSidebar";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const Admin = () => {
  const location = useLocation();
  const navigate = useNavigate();

  function getToken() {
    const cookie = new Cookies();
    const decoded = cookie.get("token") ? jwt(cookie.get("token")) : null;
    if (decoded === null) {
      return navigate("/admin-login");
    }
    if (location.pathname === "/admin") {
      navigate("../admin/dashboard");
    }
  }
  useEffect(getToken, [navigate, location.pathname]);

  const [ad, setAd] = useState([]);

  useEffect(() => {
    fetchAd();
  }, []);

  const fetchAd = async () => {
    try {
      const response = await fetch(`../../api/ad`);
      const jsonData = await response.json();
      setAd(
        jsonData.filter((item) => {
          return item.status === "active";
        })
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  ad.forEach((row) => {
    row.firstTransDate = row.transaction[0]
      ? row.transaction[0].transactionDate
      : null;
  });

  const [activity, setActivity] = useState([]);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const response = await fetch(`../../api/users/activity`);
      const jsonData = await response.json();
      setActivity(jsonData);
      console.log(activity);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const activitySums = {};

  activity.forEach((activity) => {
    const { date, activityType } = activity;
    const dateString = new Date(date).toISOString().substring(0, 10); // Extract the date string

    if (!activitySums[activityType]) {
      activitySums[activityType] = {};
    }

    if (!activitySums[activityType][dateString]) {
      activitySums[activityType][dateString] = 0;
    }

    activitySums[activityType][dateString]++;
  });

  // Convert the sums object to the desired array format
  const loginArray = [];
  const postArray = [];
  const commentArray = [];

  for (const activityType in activitySums) {
    for (const date in activitySums[activityType]) {
      const sum = activitySums[activityType][date];
      const data = { date, sum };

      if (activityType === "login") {
        loginArray.push(data);
      } else if (activityType === "post") {
        postArray.push(data);
      } else if (activityType === "comment") {
        commentArray.push(data);
      }
    }
  }

  // Create an array of unique dates from all datasets
  const allDatesSet = new Set([
    ...loginArray.map((item) => item.date),
    ...postArray.map((item) => item.date),
    ...commentArray.map((item) => item.date),
  ]);
  const allDates = Array.from(allDatesSet).sort();

  // Align data for each dataset based on the common set of dates
  const alignedLoginData = allDates.map((date) => {
    const matchingData = loginArray.find((item) => item.date === date);
    return matchingData ? matchingData.sum : 0;
  });

  const alignedPostData = allDates.map((date) => {
    const matchingData = postArray.find((item) => item.date === date);
    return matchingData ? matchingData.sum : 0;
  });

  const alignedCommentData = allDates.map((date) => {
    const matchingData = commentArray.find((item) => item.date === date);
    return matchingData ? matchingData.sum : 0;
  });

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div
        className="container-fluid d-flex"
        style={{
          marginLeft: "17vw",
          overflowX: "auto",
        }}
      >
        <Card className="mx-3 my-5 p-3 bg-light">
          <Card.Title>Penghasilan dari iklan bulan ini:</Card.Title>

          <Card.Body>
            <div style={{ width: "500px" }}>
              <Line
                height={400}
                width={600}
                data={{
                  labels: ad
                    .map((row) => {
                      return new Date(row.firstTransDate).getDate();
                    })
                    .sort((a, b) => parseInt(a) - parseInt(b)),
                  datasets: [
                    {
                      label: "Jumlah Penghasilan",
                      data: ad
                        .map((row) => {
                          return row.price * row.duration;
                        })
                        .sort((a, b) => parseInt(a) - parseInt(b)),
                    },
                  ],
                }}
              />
            </div>
          </Card.Body>
        </Card>

        <Card className="mx-3 my-5 p-3 bg-light">
          <Card.Title>Aktifitas User Bulan Ini:</Card.Title>

          <Card.Body>
            <div style={{ width: "500px" }}>
              <Line
                height={400}
                width={600}
                data={{
                  labels: allDates.map((date) => new Date(date).getDate()),
                  datasets: [
                    {
                      label: "Login",
                      data: alignedLoginData,
                      backgroundColor: "yellow",
                      borderColor: "yellow",
                    },
                    {
                      label: "Post",
                      data: alignedPostData,
                      backgroundColor: "blue",
                      borderColor: "blue",
                    },
                    {
                      label: "Comment",
                      data: alignedCommentData,
                      backgroundColor: "green",
                      borderColor: "green",
                    },
                  ],
                }}
              />
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
