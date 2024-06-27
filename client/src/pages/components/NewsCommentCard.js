import { useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import TimeAgo from "javascript-time-ago";
import idTime from "javascript-time-ago/locale/id.json";
import ReactTimeAgo from "react-time-ago";

import parse from "html-react-parser";

import Cookies from "universal-cookie";

const NewsCommentCard = ({ comment }) => {
  const cookie = new Cookies();

  const date = new Date(comment.commentDate ? comment.commentDate : 0);
  TimeAgo.setDefaultLocale(idTime.locale);
  TimeAgo.addLocale(idTime);

  const [author, setAuthor] = useState("");

  function getAuthor() {
    async function fetchAuthor() {
      try {
        if (comment.commentUserId != null) {
          const res = await fetch(
            `../../api/users/${comment.commentUserId}/true`
          );
          const data = await res.json();
          setAuthor(data);
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchAuthor();
  }

  useEffect(getAuthor, [comment.commentUserId]);

  return (
    <Card className="d-flex flex-row align-items-top mb-5">
      <div
        className="d-flex flex-column flex-grow-1"
        style={{ overflow: "auto", borderLeft: "1px solid 	#B2BEB5" }}
      >
        <Card.Header className={"d-flex justify-content-between"}>
          <span className="me-3">
            <b>{comment.commentUserId ? author.name : ""}</b>
          </span>
          <span>
            <ReactTimeAgo date={date} locale="en-US" />
          </span>
        </Card.Header>

        <Card.Body className="d-flex flex-column justify-content-between">
          {comment.commentBody ? parse(comment.commentBody) : ""}
        </Card.Body>
      </div>
    </Card>
  );
};

export default NewsCommentCard;
