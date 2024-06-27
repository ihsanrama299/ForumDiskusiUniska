import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import PostCard from "./components/PostCard";
import TrendingCard from "./components/TrendingCard";
import { useParams } from "react-router-dom";

const SearchResult = ({ user, getPosts, setSort }) => {
  const { query } = useParams();

  const [posts, setPosts] = useState([{}]);

  function getPosts() {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/post/search/${query}`);
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchPost();
  }

  useEffect(getPosts, []);

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/ad`);
      const jsonData = await response.json();
      setData(
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

  const [firstHalf, secondHalf] = splitArray(data);

  return (
    <Container className="mt-5">
      <Row>
        <Col className="d-flex flex-column align-items-center">
          <TrendingCard />
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
                  src={`../${item.imageUrl}`}
                  alt="ad"
                ></img>
              </a>
            );
          })}
        </Col>

        <Col lg={8} className="px-3">
          <h1 className="mb-5">Hasil Pencarian: {`'${query}'`}</h1>
          {posts.map((post, i) => {
            return <PostCard key={i} post={post} user={user} />;
          })}
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
                  src={`../${item.imageUrl}`}
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

export default SearchResult;
