import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import parse from "html-react-parser";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Offcanvas from "react-bootstrap/Offcanvas";

import CommentCard from "./components/CommentCard";

import Cookies from "universal-cookie";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Quill.css";

const Post = ({ user, refreshPosts }) => {
  const cookie = new Cookies();

  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  const [offcanvasTitle, setOffcanvasTitle] = useState("");
  const [offcanvasBody, setOffcanvasBody] = useState("");

  //collapse state
  const [open, setOpen] = useState(false);

  //text editor state
  const [commentValue, setCommentValue] = useState("");
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);

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

  const { name, id } = useParams();
  const [post, setPost] = useState([{}]);

  const [sort, setSort] = useState(1);

  let commentsList = [];

  if (sort === 1) {
    commentsList =
      post.comments &&
      post.comments.sort(
        (a, b) =>
          b.commentUpvotes.length -
          b.commentDownvotes.length -
          (a.commentUpvotes.length - a.commentDownvotes.length)
      );
  } else {
    commentsList =
      post.comments &&
      post.comments.sort(
        (a, b) => new Date(b.commentDate) - new Date(a.commentDate)
      );
  }

  let formattedDate = null;
  if (post.date) {
    const originalDate = post.date;
    const dateObject = new Date(originalDate);
    const options = { day: "numeric", month: "long", year: "numeric" };

    formattedDate = dateObject.toLocaleDateString("id", options);
  }

  const btnPressed = {
    textDecoration: "none",
    backgroundColor: "#cfd8e8",
    borderRadius: "500px",
  };
  const btnNotPressed = { textDecoration: "none" };

  const btnStyle = open ? btnPressed : btnNotPressed;

  function sendComment() {
    const comment = {
      commentUserId: isAnonymousComment ? null : user._id,
      commentBody: commentValue,
    };

    async function fetchComment() {
      await fetch(`../../api/post/comment/${id}`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
          Authorization: `Bearer ${cookie.get("token")}`,
        },
        body: JSON.stringify(comment),
      });
    }
    if (comment.commentBody !== "") {
      fetchComment();
    } else {
      setOffcanvasTitle("Komentar gagal dikirim");
      setOffcanvasBody("Silahkan Cek Kembali Isi Komentar Anda");

      handleShowOffcanvas();
    }
    getPost();
    setCommentValue("");
    refreshPosts();
  }

  function getPost() {
    async function fetchData() {
      try {
        const res = await fetch(`../../api/post/post/${id}`);
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }

  useEffect(getPost, [id]);

  useEffect(() => window.scrollTo(0, 0), []);

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

  function splitArray(arr) {
    const middleIndex = Math.floor(arr.length / 2);
    const firstHalf = arr.slice(0, middleIndex);
    const secondHalf = arr.slice(middleIndex);

    return [firstHalf, secondHalf];
  }

  const [firstHalf, secondHalf] = splitArray(ad);

  return (
    <Container className="mt-5">
      <Offcanvas
        show={showOffcanvas}
        onHide={handleCloseOffcanvas}
        placement="top"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{offcanvasTitle}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>{offcanvasBody}</Offcanvas.Body>
      </Offcanvas>
      <Row>
        <Col className="d-flex flex-column align-items-center">
          {firstHalf.map((item, i) => {
            return (
              <a key={i} href={item.adLink} className="mb-5">
                <img
                  key={i}
                  style={{
                    width: "180px",
                    height: "300px",
                    border: "1px solid black",
                  }}
                  src={"../../" + item.imageUrl}
                  alt="ad"
                ></img>
              </a>
            );
          })}
        </Col>

        <Col lg={8} className="px-3">
          <div className="p-3 d-flex justify-content-between align-items-center border-bottom">
            <h1>{post.title}</h1>
          </div>

          <div className="p-3 border-bottom ql-snow">
            {post.body && parse(post.body)}
          </div>

          <div className="p-3 border-bottom">
            <span className="me-3">
              <b>{name}</b>
            </span>
            <span className="me-3">{formattedDate}</span>
            <span className="me-3">
              {post.upvotes && post.upvotes.length - post.downvotes.length}{" "}
              Upvote
            </span>
          </div>

          <div className="p-3 border-bottom">
            <div className="d-flex flex-column align-items-center">
              <h4 className="mb-3">
                {post.comments && post.comments.length} Komentar
              </h4>
              <Form.Select
                aria-label="Default select example"
                style={{ maxWidth: "350px" }}
                onChange={(e) => {
                  setSort(parseInt(e.target.value));
                }}
              >
                <option value="1">Vote Teratas</option>
                <option value="2">Terbaru</option>
              </Form.Select>
            </div>

            <div>
              <Button
                className="mt-3"
                style={btnStyle}
                onClick={() => {
                  setOpen(!open);
                }}
                variant="link"
              >
                Buat Komentar
              </Button>
              <Collapse in={open} className="p-3">
                <div id="example-collapse-text">
                  <ReactQuill
                    modules={module}
                    formats={formats}
                    id="isiTopik"
                    theme="snow"
                    value={commentValue}
                    onChange={setCommentValue}
                  />

                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Check // prettier-ignore
                      type="switch"
                      id="custom-switch"
                      label="Kirim Secara Anonymous"
                      onChange={() => {
                        setIsAnonymousComment(!isAnonymousComment);
                      }}
                    />
                    <Button
                      className="my-3"
                      variant="dark"
                      onClick={sendComment}
                    >
                      Kirim
                    </Button>
                  </div>
                </div>
              </Collapse>

              {commentsList &&
                commentsList.map((comment, i) => {
                  return (
                    <CommentCard
                      key={i}
                      post={post}
                      comment={comment}
                      user={user}
                      refreshPosts={getPost}
                    />
                  );
                })}
            </div>
          </div>
        </Col>

        <Col className="d-flex flex-column align-items-center">
          {secondHalf.map((item, i) => {
            return (
              <a key={i} href={item.adLink} className="mb-5">
                <img
                  key={i}
                  style={{
                    width: "180px",
                    height: "300px",
                    border: "1px solid black",
                  }}
                  src={"../../" + item.imageUrl}
                  alt="ad"
                ></img>
              </a>
            );
          })}
        </Col>
      </Row>
    </Container>
  );
};

export default Post;
