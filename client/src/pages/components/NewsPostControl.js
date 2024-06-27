import { useState, useEffect } from "react";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import Cookies from "universal-cookie";

const NewsPostControl = ({ user }) => {
  const cookie = new Cookies();

  //Modal state
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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

  const [titleValue, setTitleValue] = useState("");
  const [bodyValue, setBodyValue] = useState("");

  const submitNews = (e) => {
    e.preventDefault();

    const post = {
      title: titleValue,
      body: bodyValue,
      authorId: user._id,
    };

    async function fetchPost() {
      await fetch("api/news", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
        body: JSON.stringify(post),
      });
    }
    fetchPost();
    setBodyValue("");
    setTitleValue("");
  };

  return (
    <>
      <Container className="p-4 mb-5 border rounded bg-light">
        <div
          className="mb-3 align-items-center"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <h2>Daftar Berita</h2>
          {user.level === "Admin" ? (
            <Button size="sm" variant="dark" onClick={handleShow}>
              Buat Berita
            </Button>
          ) : (
            ""
          )}
        </div>
      </Container>

      <Modal
        show={show}
        onHide={handleClose}
        animation={true}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Buat Berita Baru</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={submitNews} id="newsForm">
            <Form.Label htmlFor="judulBerita">
              <b>Judul Berita:</b>
            </Form.Label>
            <Form.Control
              type="text"
              id="judulBerita"
              className="mb-3 input"
              onChange={(e) => {
                setTitleValue(e.target.value);
              }}
              autoFocus
            />

            <Form.Label htmlFor="isiBerita">
              <b>Isi Berita:</b>
            </Form.Label>
            <ReactQuill
              modules={module}
              formats={formats}
              id="isiBerita"
              className="mb-3"
              theme="snow"
              value={bodyValue}
              onChange={setBodyValue}
            />
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            type="submit"
            onClick={handleClose}
            form="newsForm"
          >
            Post
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NewsPostControl;
