import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import PostControl from "./components/PostControl";
import PostCard from "./components/PostCard";
import TrendingCard from "./components/TrendingCard";

const Home = ({
  posts,
  user,
  getPosts,
  setSort,
  categoryFilter,
  setCategoryFilter,
}) => {
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

  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    if (categoryFilter !== "all") {
      setFilteredPosts(
        posts.filter((item) => {
          return item.category.some(
            (subItem) => subItem.categoryId === categoryFilter
          );
        })
      );
    }
  }, [categoryFilter]);

  return (
    <Container className="mt-5">
      <Row>
        <Col className="d-flex flex-column align-items-center">
          <TrendingCard />
          {firstHalf.map((item, i) => {
            return (
              <a key={i} href={"https://" + item.adLink} className="mb-5">
                <img
                  key={i}
                  style={{
                    width: "180px",
                    height: "300px",
                    border: "1px solid black",
                  }}
                  src={item.imageUrl}
                  alt="ad"
                ></img>
              </a>
            );
          })}
        </Col>

        <Col lg={8} className="px-3">
          <PostControl
            user={user}
            getPosts={getPosts}
            setSort={setSort}
            setCategoryFilter={setCategoryFilter}
          />

          {categoryFilter === "all"
            ? posts.map((post, i) => {
                return (
                  <PostCard
                    key={i}
                    post={post}
                    user={user}
                    getPosts={getPosts}
                  />
                );
              })
            : filteredPosts.map((post, i) => {
                return (
                  <PostCard
                    key={i}
                    post={post}
                    user={user}
                    getPosts={getPosts}
                  />
                );
              })}
        </Col>

        <Col className="d-flex flex-column align-items-center">
          {secondHalf.map((item, i) => {
            return (
              <a key={i} href={"https://" + item.adLink} className="mb-5">
                <img
                  key={i}
                  style={{
                    width: "180px",
                    height: "300px",
                    border: "1px solid black",
                  }}
                  src={item.imageUrl}
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

export default Home;
