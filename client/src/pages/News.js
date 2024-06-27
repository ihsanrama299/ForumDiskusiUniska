import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import NewsPostControl from "./components/NewsPostControl";
import NewsCard from "./components/NewsCard";

const News = ({ user }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`../api/news/`);
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col className="d-flex flex-column align-items-center"></Col>

        <Col lg={8} className="px-3">
          <NewsPostControl user={user} />

          {data.map((newsPost, i) => {
            return <NewsCard key={i} news={newsPost} />;
          })}
        </Col>

        <Col className="d-flex flex-column align-items-center"></Col>
      </Row>
    </Container>
  );
};

export default News;
