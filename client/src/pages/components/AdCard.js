import Card from "react-bootstrap/Card";

const AdCard = () => {
  return (
    <Card className="mb-5">
      <Card.Body>
        <Card.Title>Judul Iklan</Card.Title>
        <Card.Text>
          Some quick example text to build on the card title and make up the
          bulk of the card's content.
        </Card.Text>
        <Card.Link href="#">Card Link</Card.Link>
      </Card.Body>
    </Card>
  );
};

export default AdCard;
