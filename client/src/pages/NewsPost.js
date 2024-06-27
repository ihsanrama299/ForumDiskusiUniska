import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import parse from "html-react-parser";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import FloatingLabel from "react-bootstrap/FloatingLabel";

import CommentCard from "./components/CommentCard";

import Cookies from "universal-cookie";

import "react-quill/dist/quill.snow.css";
import "./Quill.css";
import NewsCommentCard from "./components/NewsCommentCard";

const NewsPost = ({ user }) => {
  const cookie = new Cookies();

  const { id } = useParams();

  //collapse state
  const [open, setOpen] = useState(false);

  const btnPressed = {
    textDecoration: "none",
    backgroundColor: "#cfd8e8",
    borderRadius: "500px",
  };
  const btnNotPressed = { textDecoration: "none" };

  const btnStyle = open ? btnPressed : btnNotPressed;

  const [news, setNews] = useState();

  function getNews() {
    async function fetchData() {
      try {
        const res = await fetch(`../../api/news/${id}`);
        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }

  useEffect(getNews, [id]);

  let formattedDate = null;
  if (news) {
    const originalDate = news.date;
    const dateObject = new Date(originalDate);
    const options = { day: "numeric", month: "long", year: "numeric" };

    formattedDate = dateObject.toLocaleDateString("id", options);
  }

  const [comment, setComment] = useState();

  const sendComment = () => {
    const newComment = {
      commentUserId: user._id,
      commentBody: comment,
    };

    async function fetchComment() {
      await fetch(`../../api/news/comment/${id}`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
        body: JSON.stringify(newComment),
      });
    }
    fetchComment();
    setComment("");
  };

  let commentsList = [];

  commentsList =
    news &&
    news.comments.sort(
      (a, b) => new Date(b.commentDate) - new Date(a.commentDate)
    );

  console.log(commentsList);
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <Container className="mt-5">
      <Row>
        <Col className="d-flex flex-column align-items-center"></Col>

        <Col lg={8} className="px-3">
          <div className="p-3 d-flex justify-content-between align-items-center border-bottom">
            <h1>{news && news.title}</h1>
          </div>

          <div className="p-3 border-bottom ql-snow">
            {news && parse(news.body)}
          </div>

          <div className="p-3 border-bottom">
            <span className="me-3">{formattedDate}</span>
          </div>

          <div className="p-3 border-bottom">
            <div className="d-flex flex-column align-items-center">
              <h4 className="mb-3">{news && news.comments.length} Komentar</h4>
            </div>

            <div>
              <Button
                className="mt-3"
                variant="link"
                style={btnStyle}
                onClick={() => {
                  setOpen(!open);
                }}
              >
                Buat Komentar
              </Button>
              <Collapse in={open} className="p-3">
                <div id="example-collapse-text">
                  <FloatingLabel controlId="floatingTextarea2" label="Komentar">
                    <Form.Control
                      as="textarea"
                      placeholder="Leave a comment here"
                      style={{ height: "100px" }}
                      onChange={(e) => {
                        setComment(e.target.value);
                      }}
                    />
                  </FloatingLabel>

                  <Button className="my-3" variant="dark" onClick={sendComment}>
                    Kirim
                  </Button>
                </div>
              </Collapse>

              {commentsList &&
                commentsList.map((comment, i) => {
                  return (
                    <NewsCommentCard
                      key={i}
                      news={news}
                      comment={comment}
                      user={user}
                    />
                  );
                })}
            </div>
          </div>
        </Col>

        <Col className="d-flex flex-column align-items-center"></Col>
      </Row>
    </Container>
  );
};

export default NewsPost;
