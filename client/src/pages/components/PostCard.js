import { Link, useLocation } from "react-router-dom";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Dropdown from "react-bootstrap/Dropdown";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/FloatingLabel";

import "./PostCard.css";

import TimeAgo from "javascript-time-ago";
import idTime from "javascript-time-ago/locale/id.json";
import ReactTimeAgo from "react-time-ago";

import { FaAngleUp, FaAngleDown, FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";

import Cookies from "universal-cookie";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const PostCard = ({ post, user, getPosts }) => {
  //Modal state
  const [showEdit, setShowEdit] = useState(false);
  const handleCloseEdit = () => setShowEdit(false);
  const handleShowEdit = () => setShowEdit(true);

  const toolBarOptions = [
    [{ font: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    ["bold", "italic", "underline", "strike"],
    ["code-block", "link"],

    [{ list: "ordered" }, { list: "bullet" }],

    [{ color: [] }, { background: [] }],

    ["clean"],
  ];

  const formats = [
    "font",
    "header",

    "bold",
    "italic",
    "underline",
    "strike",
    "code-block",
    "link",

    "list",
    "bullet",

    "color",
    "background",
  ];

  const module = {
    toolbar: toolBarOptions,
  };

  const location = useLocation();

  const cookie = new Cookies();
  const date = new Date(post.date ? post.date : 0);
  const categories = post.category;

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const regex = /(<([^>]+)>)/gi;

  const [upvote, setUpvote] = useState(false);
  const [downvote, setDownvote] = useState(false);
  const [voteCount, setVoteCount] = useState(0);

  TimeAgo.setDefaultLocale(idTime.locale);
  TimeAgo.addLocale(idTime);

  const [author, setAuthor] = useState({});

  function getAuthor() {
    async function fetchAuthor() {
      try {
        if (!post.authorId) {
          return;
        }
        const response = await fetch(
          `${location.pathname === "/" ? "" : "../../"}api/users/${
            post.authorId
          }/true`
        );
        const data = await response.json();
        setAuthor(data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchAuthor();
  }

  useEffect(getAuthor, [post.authorId, location.pathname]);

  function getVoteStatus() {
    async function fetchVoteStatus() {
      try {
        if (!post._id || !user._id) {
          return;
        }
        const response = await fetch(
          `${location.pathname === "/" ? "" : "../../"}api/post/${
            post._id
          }/vote-status/${user._id}`
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

  useEffect(getVoteStatus, [post._id, user._id, location.pathname]);

  const handleVote = async (voteType) => {
    try {
      const response = await fetch(
        `${
          location.pathname === "/" ? "" : "../../"
        }api/post/giveVotes/${voteType}/${post._id}`,
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

  const [report, setReport] = useState();

  const submitReport = (e) => {
    e.preventDefault();

    const newReport = {
      reporterId: user._id,
      body: report,
      postId: post._id,
    };

    async function fetchReport() {
      await fetch(`${location.pathname === "/" ? "" : "../../"}api/reported`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
        body: JSON.stringify(newReport),
      });
    }
    fetchReport();
  };

  async function deletePost() {
    await fetch(
      `${location.pathname === "/" ? "" : "../../"}api/post/delete/${post._id}`
    );
    await getPosts();
  }

  const [titleValue, setTitleValue] = useState("");
  const [bodyValue, setBodyValue] = useState("");

  useEffect(() => {
    setTitleValue(post.title);
    setBodyValue(post.body);
  }, [post.title, post.body]);

  const editPost = async (e) => {
    e.preventDefault();

    const edited = {
      id: post._id,
      title: titleValue,
      body: bodyValue,
    };
    console.log(edited);
    try {
      await fetch(`/api/post/edit/`, {
        method: "PUT",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
        body: JSON.stringify(edited),
      });
      await getPosts();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card className="d-flex flex-row align-items-top mb-5">
      <div className="d-flex flex-column align-items-center mx-auto p-3">
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
        className="flex-grow-1"
        style={{ borderLeft: "1px solid 	#B2BEB5", overflow: "auto" }}
      >
        <Card.Header className="d-flex justify-content-between">
          <span className="me-3">
            <Link
              style={{ textDecoration: "none", color: "black" }}
              to={`/profile/${author._id}`}
            >
              <b>{author.name}</b>
            </Link>

            <span className="ms-2">
              <Badge bg="danger">
                {author.level === "Admin" ? "Admin" : ""}
              </Badge>
            </span>
          </span>
          <span className="me-3">
            <ReactTimeAgo date={date} locale="en-US" />
          </span>
        </Card.Header>

        <Card.Body>
          <Card.Title>{post.title}</Card.Title>

          <Card.Text>
            {post.body &&
              post.body.substring(0, 200).replace(regex, "") + "..."}
          </Card.Text>

          <div className="my-3">
            {categories &&
              categories.map((category, i) => {
                return (
                  <Badge key={i} className="me-3" bg="secondary">
                    {category.categoryName}
                  </Badge>
                );
              })}
          </div>

          <Modal
            show={showEdit}
            onHide={handleCloseEdit}
            animation={true}
            centered
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Ubah Topik</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Form id="editPost" onSubmit={editPost}>
                <Form.Label htmlFor="judulTopik">
                  <b>Judul Topik:</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  id="judulTopik"
                  className="mb-3 input"
                  defaultValue={post.title}
                  onChange={(e) => {
                    setTitleValue(e.target.value);
                  }}
                  autoFocus
                />

                <Form.Label htmlFor="isiTopik">
                  <b>Isi Topik:</b>
                </Form.Label>
                <ReactQuill
                  modules={module}
                  formats={formats}
                  id="isiTopik"
                  className="mb-3"
                  theme="snow"
                  defaultValue={post.body}
                  onChange={setBodyValue}
                />
              </Form>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseEdit}>
                Batal
              </Button>
              <Button
                variant="primary"
                type="submit"
                onClick={handleCloseEdit}
                form="editPost"
              >
                Edit
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
              <Modal.Title>Laporkan Post</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form id="report" onSubmit={submitReport}>
                <FloatingLabel
                  controlId="floatingTextarea2"
                  label="Tulis Alasan"
                >
                  <Form.Control
                    as="textarea"
                    placeholder="Tulis Alasan"
                    style={{ height: "100px" }}
                    onChange={(e) => {
                      setReport(e.target.value);
                    }}
                  />
                </FloatingLabel>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button
                variant="primary"
                type="submit"
                onClick={handleClose}
                form="report"
              >
                Kirim
              </Button>
            </Modal.Footer>
          </Modal>

          <div className="d-flex justify-content-between">
            <Link
              to={`/post/${author.name}/${post._id}`}
              variant="primary"
              style={{ cursor: "pointer", textDecoration: "none" }}
            >
              {post.comments && post.comments.length} Komentar
            </Link>
            <Dropdown>
              <Dropdown.Toggle
                variant="link"
                id="dropdown-basic"
                className="custom-toggle"
              >
                <h6>...</h6>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {post.authorId === user._id && (
                  <>
                    <Dropdown.Item onClick={handleShowEdit}>Ubah</Dropdown.Item>
                    <Dropdown.Item onClick={deletePost}>Hapus</Dropdown.Item>
                  </>
                )}

                {post.authorId !== user._id && (
                  <>
                    <Dropdown.Item onClick={handleShow}>Laporkan</Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Card.Body>
      </div>
    </Card>
  );
};

export default PostCard;
