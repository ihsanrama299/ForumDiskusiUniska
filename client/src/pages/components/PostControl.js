import { useState, useEffect } from "react";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Offcanvas from "react-bootstrap/Offcanvas";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import Cookies from "universal-cookie";

const PostControl = ({ user, getPosts, setSort, setCategoryFilter }) => {
  const cookie = new Cookies();

  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  const [offcanvasTitle, setOffcanvasTitle] = useState("");
  const [offcanvasBody, setOffcanvasBody] = useState("");

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

  const [categories, setCategories] = useState([{}]);

  function getCategory() {
    async function fetchCategory() {
      try {
        const response = await fetch(`/api/category`);
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchCategory();
  }

  useEffect(getCategory, []);

  const [titleValue, setTitleValue] = useState("");
  const [bodyValue, setBodyValue] = useState("");
  const [categoryValue, setCategoryValue] = useState([{}]);

  const submitPost = (e) => {
    e.preventDefault();

    const category = {
      categoryId: categoryValue._id,
      categoryName: categoryValue.name,
      subCategoryOf: null,
    };

    let subCategory = null;

    if (subValue) {
      subCategory = {
        categoryId: JSON.parse(subValue)._id,
        categoryName: JSON.parse(subValue).subCategoryName,
        subCategoryOf: JSON.parse(subValue).subCategoryOf,
      };
    }

    const post = {
      title: titleValue,
      body: bodyValue,
      category: category,
      authorId: user._id,
      sub: sub ? subCategory : null,
    };

    async function fetchPost() {
      const createdPost = await fetch("api/post", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
          Authorization: `Bearer ${cookie.get("token")}`,
        },
        body: JSON.stringify(post),
      });

      if (createdPost.status === 400) {
        setOffcanvasTitle("Posting topik gagal");
        setOffcanvasBody("Silahkan Cek Kembali Isi Topik Anda");

        handleShowOffcanvas();
      }
    }
    fetchPost();
    setBodyValue("");
    setSubValue(null);
    getPosts();
  };

  const [sub, setSub] = useState([{}]);
  const [subValue, setSubValue] = useState(null);

  function handleCategory(e) {
    const category = JSON.parse(e.target.value);
    setCategoryValue(category);

    if (category.subCategory && category.subCategory.length > 0) {
      setSub(category.subCategory);
    } else {
      setSub([{}]);
    }
  }

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
  };

  return (
    <>
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
      <Container className="p-4 mb-5 border rounded bg-light">
        <div
          className="mb-3 align-items-center"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <h2>Topik Diskusi</h2>
          <Button size="sm" variant="dark" onClick={handleShow}>
            Buat Topik
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "50px",
            justifyContent: "space-between",
          }}
        >
          <Form.Select
            aria-label="Default select example"
            onChange={handleCategoryFilter}
          >
            <option value="all">Semua Kategori</option>
            {categories &&
              categories.map((category, i) => {
                return (
                  <option key={i} value={category._id}>
                    {category.name}
                  </option>
                );
              })}
          </Form.Select>

          <Form.Select
            aria-label="Default select example"
            onChange={(e) => {
              setSort(e.target.value);
            }}
          >
            <option value="1">Terbaru</option>
            <option value="2">Vote Teratas</option>
          </Form.Select>
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
          <Modal.Title>Buat Topik Baru</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* New post form */}
          <Form onSubmit={submitPost} id="postForm">
            <Form.Label htmlFor="judulTopik">
              <b>Judul Topik:</b>
            </Form.Label>
            <Form.Control
              type="text"
              id="judulTopik"
              className="mb-3 input"
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
              value={bodyValue}
              onChange={setBodyValue}
            />

            <Form.Label htmlFor="kategoriTopik">
              <b>Kategori:</b>
            </Form.Label>
            <Form.Select
              id="kategoriTopik"
              aria-label="Default select example"
              onChange={(e) => handleCategory(e)}
            >
              <option value={"{}"}>Pilih Kategori</option>
              {categories &&
                categories.map((category, i) => {
                  return (
                    <option key={i} value={JSON.stringify(category)}>
                      {category.name}
                    </option>
                  );
                })}
            </Form.Select>
            {sub.length > 1 ? (
              <>
                <Form.Label htmlFor="subKategoriTopik" className="mt-3">
                  <b>Sub Kategori:</b>
                </Form.Label>
                <Form.Select
                  id="subKategoriTopik"
                  aria-label="Default select example"
                  onChange={(e) => {
                    setSubValue(e.target.value);
                  }}
                >
                  <option value={"{}"}>Pilih Sub Kategori</option>
                  {sub &&
                    sub.map((category, i) => {
                      return (
                        <option key={i} value={JSON.stringify(category)}>
                          {category.subCategoryName}
                        </option>
                      );
                    })}
                </Form.Select>
              </>
            ) : (
              ""
            )}
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
            form="postForm"
          >
            Post
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PostControl;
