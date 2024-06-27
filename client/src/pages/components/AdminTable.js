import React, { useEffect, useState } from "react";
import { Table, Form, Pagination } from "react-bootstrap";
import Button from "react-bootstrap/Button";

import { FaTrash, FaPlus, FaCheck, FaPlay } from "react-icons/fa";

import Modal from "react-bootstrap/Modal";

const isValidUrl = (urlString) => {
  try {
    return Boolean(new URL(urlString));
  } catch (e) {
    return false;
  }
};

function getFileNameFromURL(url) {
  // Split the URL by slashes to get an array of parts
  const parts = url.split("/");

  // Get the last part of the array, which should be the file name
  const fileName = parts[parts.length - 1];

  return fileName;
}

const ITEMS_PER_PAGE = 10;

const AdminTable = ({
  data,
  desiredFields,
  tableType,
  active,
  status,
  user,
}) => {
  const toUnixPath = (path) =>
    path.replace(/[\\/]+/g, "/").replace(/^([a-zA-Z]+:|\.\/)/, "");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    const updatedFilteredData = data.filter((item) => {
      if (tableType === "users") {
        return (
          item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (tableType === "posts") {
        return (
          item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (tableType === "ads") {
        return (
          item._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.adTitle.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    });
    setFilteredData(updatedFilteredData);
    setCurrentPage(1);
  }, [data, searchQuery, tableType]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fields = desiredFields.filter(
    (field) => data.length > 0 && field.key in data[0]
  );

  const deleteData = async (e, id) => {
    try {
      await fetch(`../../../api/admin/delete/${tableType}/${id}`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
      });

      const updatedFilteredData = filteredData.filter(
        (item) => item._id !== id
      );
      setFilteredData(updatedFilteredData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAction = async (arg) => {
    try {
      if (tableType === "ads") {
        const obj = JSON.parse(arg);

        await fetch(`../../../api/admin/activate-ad/${obj._id}`, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-type": "application/json",
          },
        });

        const updatedFilteredData = filteredData.filter(
          (item) => item._id !== obj._id
        );

        setFilteredData(updatedFilteredData);
      }

      if (tableType === "users") {
        const obj = JSON.parse(arg);

        await fetch(`../../../api/admin/activate-user/${obj._id}`, {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-type": "application/json",
          },
        });

        const updatedFilteredData = filteredData.filter(
          (item) => item._id !== obj._id
        );

        setFilteredData(updatedFilteredData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [expandedRows, setExpandedRows] = useState({});

  const handleExpandRow = (rowId) => {
    setExpandedRows((prevExpandedRows) => ({
      ...prevExpandedRows,
      [rowId]: !prevExpandedRows[rowId],
    }));
  };

  const extendAd = async (e, adId, extensionId) => {
    const res = await fetch(
      `../../api/admin/extend-ad/${adId}/${extensionId}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
      }
    );
  };

  const deleteExtension = async (e, adId, extensionId) => {
    const res = await fetch(
      `../../api/admin/delete-extension/${adId}/${extensionId}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
      }
    );
  };

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = (id) => {
    setsubCatId(id);
    setShow(true);
  };

  const [subCategory, setSubCategory] = useState("");
  const [subCatId, setsubCatId] = useState("");

  const addSubCat = async (e) => {
    e.preventDefault();
    const newSubCategory = {
      id: subCatId,
      author: user._id,
      name: subCategory,
    };
    try {
      await fetch(`../../api/admin/add-subcategory`, {
        method: "PUT",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-type": "application/json",
        },
        body: JSON.stringify(newSubCategory),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <Form.Control
          type="text"
          placeholder="Cari"
          value={searchQuery}
          onChange={handleSearch}
          className="mb-3"
        />

        <div style={{ overflowX: "scroll" }}>
          {currentItems.length > 0 ? (
            <Table striped bordered>
              <thead>
                <tr>
                  {tableType === "ads-extension" ? (
                    <th style={{ width: "20px" }}></th>
                  ) : (
                    ""
                  )}
                  <th>No</th>
                  {fields.map((field) => (
                    <th key={field.key} style={{ minWidth: "100px" }}>
                      {field.name}
                    </th>
                  ))}
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, i) => (
                  <React.Fragment key={item._id}>
                    <tr key={item._id}>
                      {tableType === "ads-extension" ? (
                        <td onClick={() => handleExpandRow(item._id)}>
                          {/* Step 3: Toggle the icon based on expandedRows state */}
                          {expandedRows[item._id] ? (
                            <FaPlay
                              style={{
                                cursor: "pointer",
                                transform: "rotate(90deg)",
                              }}
                            />
                          ) : (
                            <FaPlay
                              style={{
                                cursor: "pointer",
                              }}
                            />
                          )}
                        </td>
                      ) : (
                        ""
                      )}
                      <td>{i + 1}</td>
                      {fields.map((field) => (
                        <td key={field.key}>
                          {isValidUrl(item[field.key]) ? (
                            <a
                              href={item[field.key]}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {getFileNameFromURL(item[field.key])}
                            </a>
                          ) : item[field.key].length > 60 ? (
                            item[field.key].substring(0, 60) + "..."
                          ) : (
                            item[field.key]
                          )}
                          <Modal show={show} onHide={handleClose} centered>
                            <Modal.Header closeButton>
                              <Modal.Title>Tambah Kategori</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              <Form id="category" onSubmit={addSubCat}>
                                <Form.Group
                                  className="mb-3"
                                  controlId="formBasicEmail"
                                >
                                  <Form.Label>Nama Sub Kategori</Form.Label>
                                  <Form.Control
                                    type="text"
                                    onChange={(e) => {
                                      setSubCategory(e.target.value);
                                    }}
                                  />
                                </Form.Group>
                              </Form>
                            </Modal.Body>
                            <Modal.Footer>
                              <Button variant="secondary" onClick={handleClose}>
                                Close
                              </Button>
                              <Button
                                variant="primary"
                                onClick={handleClose}
                                type="submit"
                                form="category"
                              >
                                Tambah
                              </Button>
                            </Modal.Footer>
                          </Modal>
                          {field.key === "subCat" ? (
                            <Button
                              size="sm"
                              className="ms-3"
                              onClick={() => {
                                handleShow(item._id);
                              }}
                            >
                              <FaPlus />
                            </Button>
                          ) : (
                            ""
                          )}
                        </td>
                      ))}
                      <td>
                        {tableType === "ads" && !active ? (
                          <Button
                            variant="primary"
                            className="m-1"
                            onClick={() => {
                              handleAction(JSON.stringify(item));
                            }}
                          >
                            <FaCheck />
                          </Button>
                        ) : (
                          ""
                        )}

                        {tableType === "users" && !active ? (
                          <Button
                            variant="primary"
                            className="m-1"
                            onClick={() => {
                              handleAction(JSON.stringify(item));
                            }}
                          >
                            <FaCheck />
                          </Button>
                        ) : (
                          ""
                        )}

                        <Button
                          variant="danger"
                          className="m-1"
                          onClick={(e) => {
                            deleteData(e, item._id);
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                    {expandedRows[item._id] && (
                      <tr>
                        <td colSpan={fields.length + 2}>
                          <div>
                            <Table>
                              <thead>
                                <tr>
                                  <th>Bukti Pembayaran</th>
                                  <th>Tanggal</th>
                                  <th>Jumlah Perpanjangan</th>
                                  <th>Harga Perpanjangan</th>
                                  <th>Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.transaction.map((extension, i) => {
                                  if (
                                    extension.transactionType === "extension" &&
                                    extension.extensionsStatus === status
                                  ) {
                                    return (
                                      <tr key={i}>
                                        <td>
                                          <a
                                            href={`http://localhost:5000/${extension.transactionImageUrl}`}
                                            target="_blank"
                                          >
                                            {getFileNameFromURL(
                                              `http://localhost:5000/${toUnixPath(
                                                extension.transactionImageUrl
                                              )}`
                                            )}
                                          </a>
                                        </td>
                                        <td>{extension.transactionDate}</td>
                                        <td>{extension.extensionsAmount}</td>
                                        <td>{extension.extensionsPrice}</td>
                                        <td>
                                          {extension.extensionsStatus ===
                                          "pending" ? (
                                            <Button
                                              className="m-1"
                                              onClick={(e) => {
                                                extendAd(
                                                  e,
                                                  item._id,
                                                  extension._id
                                                );
                                              }}
                                            >
                                              <FaCheck />
                                            </Button>
                                          ) : (
                                            ""
                                          )}
                                          {tableType !== "near-exp-ads" ? (
                                            <Button
                                              variant="danger"
                                              className="m-1"
                                              onClick={(e) => {
                                                deleteExtension(
                                                  e,
                                                  item._id,
                                                  extension._id
                                                );
                                              }}
                                            >
                                              <FaTrash />
                                            </Button>
                                          ) : (
                                            ""
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  }
                                })}
                              </tbody>
                            </Table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          ) : (
            <h2 className="mb-3 mx-auto">Tabel Kosong</h2>
          )}
        </div>
      </div>

      <Pagination className="mt-3">
        {Array.from({ length: totalPages }, (_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </div>
  );
};

export default AdminTable;
