import { Link, useLocation } from "react-router-dom";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import "./PostCard.css";

import TimeAgo from "javascript-time-ago";
import idTime from "javascript-time-ago/locale/id.json";
import ReactTimeAgo from "react-time-ago";

import { useEffect, useState } from "react";

import Cookies from "universal-cookie";

const NewsCard = ({ news }) => {
  const location = useLocation();

  const cookie = new Cookies();
  const date = new Date(news.date ? news.date : 0);

  TimeAgo.setDefaultLocale(idTime.locale);
  TimeAgo.addLocale(idTime);

  const regex = /(<([^>]+)>)/gi;

  return (
    <Card className="d-flex flex-row align-items-top mb-5">
      <div className="flex-grow-1" style={{ overflow: "auto" }}>
        <Card.Header className="d-flex justify-content-between">
          <span className="me-3">
            <ReactTimeAgo date={date} locale="en-US" />
          </span>
        </Card.Header>

        <Card.Body>
          <Card.Title>{news.title && news.title}</Card.Title>

          <Card.Text>
            {news.body &&
              news.body.substring(0, 200).replace(regex, "") + "..."}
          </Card.Text>

          <div className="d-flex justify-content-between">
            <Link
              to={`/news/${news._id}`}
              variant="primary"
              style={{ cursor: "pointer", textDecoration: "none" }}
            >
              {news.comments && news.comments.length} Komentar
            </Link>
          </div>
        </Card.Body>
      </div>
    </Card>
  );
};

export default NewsCard;
