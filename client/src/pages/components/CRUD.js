import { useEffect, useState } from "react";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Collapse from "react-bootstrap/Collapse";

import { FaPlus, FaPrint } from "react-icons/fa";

import DataTable from "./DataTable";

const CRUD = ({ title, input, columns, route }) => {
  //collapse
  const [open, setOpen] = useState(false);

  const initialStates = input.map((item) => item.defaultValue || "");

  const [inputValues, setInputValues] = useState(initialStates);

  const handleInputChange = (index, value) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = value;
    setInputValues(newInputValues);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {};

    input.forEach((item, index) => {
      formData[item.label] = inputValues[index];
    });

    await fetch(route, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    getData();
  };

  const [data, setData] = useState([{}]);

  function getData() {
    async function fetchData() {
      try {
        const response = await fetch(route);
        const data = await response.json();
        setData(data);
      } catch (err) {
        console.log(err);
      }
    }
    fetchData();
  }

  useEffect(getData, [route]);

  const handleGeneratePDF = () => {
    fetch(`${route}/report/${title}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.arrayBuffer();
      })
      .then((data) => {
        // Create a Blob from the response data
        const file = new Blob([data], { type: "application/pdf" });

        // Build a URL from the Blob
        const fileURL = URL.createObjectURL(file);

        // Open the PDF in a new tab or window
        window.open(fileURL);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  return (
    <Card className="my-5">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <Card.Title>{title}</Card.Title>
        <Button onClick={handleGeneratePDF}>
          <FaPrint />
        </Button>
      </Card.Header>
      <Card.Body>
        <Button onClick={() => setOpen(!open)} className="mb-3">
          <FaPlus />
        </Button>
        <Collapse in={open}>
          <Form onSubmit={handleSubmit}>
            {input.map((item, index) => {
              return (
                <Form.Group className="mb-3" key={index}>
                  <Form.Label>{item.label}</Form.Label>
                  <Form.Control
                    type={item.type}
                    placeholder={item.label}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />
                </Form.Group>
              );
            })}
            <Button variant="primary" type="submit">
              Simpan
            </Button>
          </Form>
        </Collapse>
      </Card.Body>
      <hr />
      <DataTable
        data={data}
        input={input}
        columns={columns}
        title={title}
        route={route}
        refresh={getData}
      />
    </Card>
  );
};

export default CRUD;
