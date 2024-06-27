import { useEffect, useState } from "react";

import ReplyCard from "./ReplyCard";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
import Badge from "react-bootstrap/Badge";

import TimeAgo from "javascript-time-ago";
import idTime from "javascript-time-ago/locale/id.json";
import ReactTimeAgo from "react-time-ago";

import parse from "html-react-parser";

import Cookies from "universal-cookie";

import { FaAngleUp, FaAngleDown, FaUserCircle } from "react-icons/fa";

const CommentCard = ({ post, comment, user, refreshPosts }) => {
  const cookie = new Cookies();

  const date = new Date(comment.commentDate ? comment.commentDate : 0);
  TimeAgo.setDefaultLocale(idTime.locale);
  TimeAgo.addLocale(idTime);

  const [open, setOpen] = useState(false);

  const btnPressed = {
    textDecoration: "none",
    backgroundColor: "#cfd8e8",
    borderRadius: "500px",
  };
  const btnNotPressed = { textDecoration: "none", padding: "0" };

  const btnStyle = open ? btnPressed : btnNotPressed;

  const [author, setAuthor] = useState("");

  const [replyValue, setReplyValue] = useState("");
  const [isAnonymousReply, setIsAnonymousReply] = useState(false);

  const [upvote, setUpvote] = useState(false);
  const [downvote, setDownvote] = useState(false);
  const [voteCount, setVoteCount] = useState(0);

  const sendReply = (e) => {
    e.preventDefault();

    const reply = {
      replyUserId: isAnonymousReply ? null : user._id,
      replyBody: replyValue,
    };

    async function fetchReply() {
      await fetch(`../../api/post/reply/${post._id}/${comment._id}`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
          Authorization: `Bearer ${cookie.get("token")}`,
        },
        body: JSON.stringify(reply),
      });
    }
    fetchReply();
    setReplyValue("");
    refreshPosts();
  };

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

  function getVoteStatus() {
    async function fetchVoteStatus() {
      try {
        if (!post._id || !user._id) {
          return;
        }
        const response = await fetch(
          `../../api/post/${post._id}/comments-vote-status/${comment._id}/${user._id}`
        );
        const data = await response.json();
        setUpvote(data.upvoted);
        setDownvote(data.downvoted);
        setVoteCount(data.voteCount);
      } catch (err) {
        console.log(err);
      }
    }
    fetchVoteStatus();
  }

  useEffect(getVoteStatus, [post._id, comment._id, user._id]);

  const handleVote = async (voteType) => {
    try {
      const response = await fetch(
        `../../api/post/giveCommentVotes/${voteType}/${post._id}/${comment._id}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${cookie.get("token")}`,
          },
          body: JSON.stringify({ userId: user._id }),
        }
      );
      if (response.ok) {
        const responseData = await response.json();
        setVoteCount(responseData.voteCount);
        setUpvote(responseData.upvoted);
        setDownvote(responseData.downvoted);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpvote = () => {
    if (!upvote) {
      if (downvote) {
        setVoteCount(voteCount + 2);
      } else {
        setVoteCount(voteCount + 1);
      }
      setUpvote(true);
      setDownvote(false);
      handleVote("upvote");
    } else {
      setVoteCount(voteCount - 1);
      setUpvote(false);
      handleVote("remove-vote");
    }
    getVoteStatus();
    getVoteStatus();
  };

  const handleDownvote = () => {
    if (!downvote) {
      if (upvote) {
        setVoteCount(voteCount - 2);
      } else {
        setVoteCount(voteCount - 1);
      }
      setUpvote(false);
      setDownvote(true);
      handleVote("downvote");
    } else {
      setVoteCount(voteCount + 1);
      setDownvote(false);
      handleVote("remove-vote");
    }
    getVoteStatus();
    getVoteStatus();
  };

  return (
    <Card className="d-flex flex-row align-items-top mb-5">
      <div className="d-flex flex-column align-items-center p-3">
        <FaUserCircle size={30} />
        <Button variant="link">
          <FaAngleUp
            size={20}
            color={upvote ? "red" : "gray"}
            onClick={handleUpvote}
          />
        </Button>
        {voteCount}
        <Button variant="link">
          <FaAngleDown
            size={20}
            color={downvote ? "red" : "gray"}
            onClick={handleDownvote}
          />
        </Button>
      </div>

      <div
        className="d-flex flex-column flex-grow-1"
        style={{ overflow: "auto", borderLeft: "1px solid 	#B2BEB5" }}
      >
        <Card.Header className={"d-flex justify-content-between"}>
          <span className="me-3">
            <b>{comment.commentUserId ? author.name : "Anonymous"}</b>
            <span className="ms-2">
              <Badge bg="danger">
                {author.level === "Admin" ? "Admin" : ""}
              </Badge>
            </span>
          </span>
          <span>
            <ReactTimeAgo date={date} locale="en-US" />
          </span>
        </Card.Header>

        <Card.Body className="d-flex flex-column justify-content-between">
          {comment.commentBody ? parse(comment.commentBody) : ""}

          <div className="d-flex justify-content-between">
            <Button
              variant="link"
              onClick={() => setOpen(!open)}
              style={btnStyle}
            >
              {comment.replies ? comment.replies.length : 0} Balasan
            </Button>
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                id="dropdown-basic"
                className="custom-toggle"
              >
                <h6>...</h6>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {comment.commentUserId === user._id && (
                  <>
                    <Dropdown.Item href="#/action-1">Ubah</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Hapus</Dropdown.Item>
                  </>
                )}

                {comment.commentUserId !== user._id && (
                  <>
                    <Dropdown.Item href="#/action-3">Laporkan</Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <Collapse
            in={open}
            style={{ borderTop: "1px solid black", marginTop: "10px" }}
          >
            <div>
              <Form>
                <Form.Control
                  as="textarea"
                  placeholder="Tulis Balasan"
                  style={{ height: "70px", marginTop: "10px" }}
                  onChange={(e) => setReplyValue(e.target.value)}
                  value={replyValue}
                />
                <div className="py-2 d-flex justify-content-between">
                  <Form.Check // prettier-ignore
                    type="switch"
                    id="custom-switch"
                    label="Kirim Secara Anonymous"
                    onChange={() => {
                      setIsAnonymousReply(!isAnonymousReply);
                    }}
                  />

                  <Button
                    size="sm"
                    variant="dark"
                    type="submit"
                    onClick={sendReply}
                  >
                    Kirim
                  </Button>
                </div>
              </Form>

              {comment
                ? comment.replies.map((reply, i) => {
                    return <ReplyCard key={i} reply={reply} />;
                  })
                : ""}
            </div>
          </Collapse>
        </Card.Body>
      </div>
    </Card>
  );
};

export default CommentCard;
