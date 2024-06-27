import { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { Link } from "react-router-dom";

const TrendingCard = () => {
  const [posts, setPosts] = useState([{}]);
  const [authors, setAuthors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  async function fetchPost() {
    try {
      const response = await fetch(`/api/post/3`);
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchPost();
  }, []);

  useEffect(() => {
    const fetchAuthorsForPosts = async () => {
      const authorsData = {};
      for (const post of posts) {
        if (post.authorId && !authorsData[post.authorId]) {
          const authorName = await getAuthor(post.authorId);
          authorsData[post.authorId] = authorName;
        }
      }
      setAuthors(authorsData);
      setIsLoading(false);
    };
    fetchAuthorsForPosts();
  }, [posts]);

  async function getAuthor(id) {
    if (!id) {
      return "";
    }

    try {
      const response = await fetch(`/api/users/${id}/true`);
      const data = await response.json();

      return data.name;
    } catch (err) {
      console.log(err);
      return "";
    }
  }

  return (
    <ListGroup className="mb-5">
      <ListGroup.Item>
        <b>Post Trending</b>
      </ListGroup.Item>
      {posts[0].title &&
        posts.map((post, i) => {
          const authorName = authors[post.authorId] || "";
          const linkTo = authorName ? `/post/${authorName}/${post._id}` : "";

          return (
            <ListGroup.Item key={i}>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <Link to={linkTo}>{post.title.substring(0, 25) + "..."}</Link>
              )}
            </ListGroup.Item>
          );
        })}
    </ListGroup>
  );
};

export default TrendingCard;
