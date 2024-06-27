import { useState, useEffect } from "react";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { Button } from "react-bootstrap";

import { useParams } from "react-router-dom";

import PostCard from "./components/PostCard";

const Profile = ({ user }) => {
  const { id } = useParams();

  const [thisUser, setThisUser] = useState({});

  function getUser() {
    async function fetchUser() {
      try {
        const response = await fetch(`../../api/users/${id}`);
        const data = await response.json();
        setThisUser(data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchUser();
  }

  useEffect(getUser, [id]);

  const [posts, setPosts] = useState([{}]);

  function getPosts() {
    async function fetchPost() {
      try {
        const response = await fetch(`../../api/post/userPost/${id}`);
        const data = await response.json();
        setPosts(data);
        setName(thisUser.name);
        setEmail(thisUser.email);
        setProdi(thisUser.prodi);
      } catch (err) {
        console.log(err);
      }
    }
    fetchPost();
  }

  useEffect(getPosts, [id, thisUser.name, thisUser.email, thisUser.prodi]);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [prodi, setProdi] = useState("");

  const editProfile = async (e) => {
    e.preventDefault();

    const updatedProfile = {
      id: thisUser._id,
      name: name,
      email: email,
      prodi: prodi,
    };

    try {
      await fetch(`../api/users/edit`, {
        method: "PUT",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });
      getUser();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="editProfile" onSubmit={editProfile}>
            {user.level === "User" ? (
              <Form.Group className="mb-3">
                <Form.Label>NPM</Form.Label>
                <Form.Control type="text" disabled value={thisUser.npm} />
              </Form.Group>
            ) : (
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control disabled type="text" value={thisUser.username} />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Nama</Form.Label>
              <Form.Control
                type="text"
                defaultValue={thisUser.name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Program Studi</Form.Label>
              <Form.Control
                type="text"
                defaultValue={thisUser.prodi}
                onChange={(e) => {
                  setProdi(e.target.value);
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                defaultValue={thisUser.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="editProfile"
            onClick={handleClose}
          >
            Simpan
          </Button>
        </Modal.Footer>
      </Modal>
      <Row
        className="align-items-center p-3"
        style={{
          backgroundColor: "#e0e0e0",
          borderBottom: "1px solid #bbbdbb",
          width: "100vw",
        }}
      >
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ width: "70vw" }}
        >
          <Col>
            <div
              className="mx-5"
              style={{
                width: "150px",
                height: "150px",
                backgroundColor: "black",
              }}
            ></div>
          </Col>

          <Col>
            <Row className="py-2">
              <Col>Nama</Col>
              <Col xs={8}>: {thisUser.name}</Col>
            </Row>
            {thisUser.level === "User" ? (
              <>
                <Row className="py-2">
                  <Col>NPM</Col>
                  <Col xs={8}>: {thisUser.npm}</Col>
                </Row>
                <Row className="py-2">
                  <Col>Prodi</Col>
                  <Col xs={8}>: {thisUser.prodi}</Col>
                </Row>
              </>
            ) : (
              <Row className="py-2">
                <Col>Username</Col>
                <Col xs={8}>: {thisUser.username}</Col>
              </Row>
            )}
            <Row className="py-2">
              <Col>Email</Col>
              <Col xs={8}>: {thisUser.email}</Col>
            </Row>
            <Row className="py-2">
              <Col>Level</Col>
              <Col xs={8}>: {thisUser.level}</Col>
            </Row>
            {user.npm === thisUser.npm ||
            user.username === thisUser.username ? (
              <Button size="sm" onClick={handleShow} variant="dark">
                Edit Profil
              </Button>
            ) : (
              ""
            )}
          </Col>
        </div>
      </Row>
      <Row className="p-4">
        <h2 className="mb-3">Daftar Post Dari {thisUser.name}</h2>
        {posts &&
          posts.map((post, i) => {
            return <PostCard key={i} post={post} user={user} />;
          })}
      </Row>
    </>
  );
};

export default Profile;
