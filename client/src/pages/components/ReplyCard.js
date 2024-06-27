import { useEffect, useState } from "react";

import TimeAgo from "javascript-time-ago";
import idTime from "javascript-time-ago/locale/id.json";
import ReactTimeAgo from "react-time-ago";

const ReplyCard = ({ reply }) => {
  const [author, setAuthor] = useState("");

  const date = new Date(reply.replyDate ? reply.replyDate : 0);
  TimeAgo.setDefaultLocale(idTime.locale);
  TimeAgo.addLocale(idTime);

  function getAuthor() {
    async function fetchAuthor() {
      try {
        if (reply.replyUserId != null) {
          const res = await fetch(`../../api/users/${reply.replyUserId}/true`);
          const data = await res.json();
          setAuthor(data.name);
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchAuthor();
  }

  useEffect(getAuthor, [reply.replyUserId]);

  return (
    <div
      style={{
        padding: "10px",
        borderBottom: "1px solid black",
        marginTop: "10px",
      }}
    >
      <div className="d-flex justify-content-between">
        <h6>{reply.replyUserId ? author : "Anonymous"}</h6>
        <span>
          <ReactTimeAgo date={date} locale="en-US" />
        </span>
      </div>
      <div className="d-flex justify-content-between">
        <p>{reply.replyBody}</p>
        <span>...</span>
      </div>
    </div>
  );
};

export default ReplyCard;
