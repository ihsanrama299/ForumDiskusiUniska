import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";

const ReportFilter = ({
  show,
  close,
  filter,
  setFilter,
  year,
  month,
  setYear,
  setMonth,
  generate,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, index) => currentYear - index);

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  // const currentMonth = new Date().getMonth();

  const reset = () => {
    close();
    setFilter(false);
  };

  return (
    <Modal show={show} onHide={reset} centered>
      <Modal.Header closeButton>
        <Modal.Title>Buat Laporan</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="my-3">
          <Form.Label htmlFor="filter">Filter</Form.Label>
          <Form.Select id="filter" onChange={(e) => setFilter(e.target.value)}>
            <option value={false}>Semua</option>
            <option value={true}>Filter</option>
          </Form.Select>
        </Form.Group>
        <div hidden={!(filter === "true")}>
          <Form.Group className="my-3">
            <Form.Label htmlFor="yearFilter">Pilih Tahun</Form.Label>
            <Form.Select
              id="yearFilter"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="my-3">
            <Form.Label htmlFor="monthFilter">Pilih Bulan</Form.Label>
            <Form.Select
              id="monthFilter"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={reset}>
          Close
        </Button>
        <Button variant="primary" onClick={generate}>
          Cetak
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportFilter;
