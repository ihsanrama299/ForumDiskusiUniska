import React, { useState } from "react";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { FaTrash, FaEdit } from "react-icons/fa";

const DataTable = ({ data, input, columns, title, route, refresh }) => {
  //modal
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const handleClose = () => {
    setShowModal(false);
    setModalItem(null);
  };
  const handleShow = (item) => {
    const initialInputValues = input.map(
      (inputItem) => item[inputItem.label] || ""
    );
    setInputValues(initialInputValues);
    setModalItem(item); // Save the item data for the modal
    setShowModal(true);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [sortedField, setSortedField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtering and sorting logic
  const filteredData = data.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = sortedField
    ? filteredData
        .slice()
        .sort((a, b) =>
          sortDirection === "asc"
            ? a[sortedField].toString().localeCompare(b[sortedField].toString())
            : b[sortedField].toString().localeCompare(a[sortedField].toString())
        )
    : filteredData;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Event handlers
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (field === sortedField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortedField(field);
      setSortDirection("asc");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const deleteData = async (e, id) => {
    try {
      await fetch(`${route}/delete/${id}`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
      });
      refresh();
    } catch (error) {
      console.log(error);
    }
  };

  const initialStates = input.map((item) => item.defaultValue || "");

  const [inputValues, setInputValues] = useState(initialStates);

  const handleInputChange = (index, value) => {
    const newInputValues = [...inputValues];
    newInputValues[index] = value;
    setInputValues(newInputValues);
  };

  const editData = async (e, id) => {
    e.preventDefault();

    const formData = {};

    input.forEach((item, index) => {
      formData[item.label] = inputValues[index];
    });

    try {
      await fetch(`${route}/edit/${id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      refresh();
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-3">
      <h2 className="mb-5">Tabel {title}</h2>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <table className="table table-striped">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.field} onClick={() => handleSort(column.field)}>
                {column.label}{" "}
                {sortedField === column.field && (
                  <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
            ))}
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, i) => (
            <tr key={i}>
              {columns.map((column) => (
                <td key={column.field}>{item[column.field]}</td>
              ))}
              <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Edit {title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form
                    onSubmit={(e) => {
                      editData(e, modalItem._id);
                    }}
                    id="edit"
                  >
                    {input.map((inputItem, index) => {
                      return (
                        <Form.Group className="mb-3" key={index}>
                          <Form.Label>{inputItem.label}</Form.Label>
                          <Form.Control
                            type={inputItem.type}
                            placeholder={inputItem.label}
                            value={inputValues[index]}
                            onChange={(e) =>
                              handleInputChange(index, e.target.value)
                            }
                          />
                        </Form.Group>
                      );
                    })}
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Batal
                  </Button>
                  <Button variant="primary" type="submit" form="edit">
                    Edit
                  </Button>
                </Modal.Footer>
              </Modal>
              <td>
                <Button className="me-3" onClick={() => handleShow(item)}>
                  <FaEdit />
                </Button>
                <Button
                  variant="danger"
                  className="me-3"
                  onClick={(e) => {
                    deleteData(e, item._id);
                  }}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="pagination">
        {Array.from({ length: totalPages }).map((_, index) => (
          <li
            key={index}
            className={`page-item ${index + 1 === currentPage ? "active" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataTable;
