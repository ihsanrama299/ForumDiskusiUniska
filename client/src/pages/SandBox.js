import Container from "react-bootstrap/Container";

import CRUD from "./components/CRUD";

const SandBox = () => {
  const input = [
    {
      label: "namaPegawai",
      type: "text",
    },
    {
      label: "nik",
      type: "text",
    },
    {
      label: "jamMasuk",
      type: "text",
    },
    {
      label: "jamPulang",
      type: "text",
    },
    {
      label: "keterangan",
      type: "text",
    },
  ];

  const columns = [
    { field: "namaPegawai", label: "Nama Pegawai" },
    { field: "nik", label: "NIK" },
    { field: "jamMasuk", label: "Jam Masuk" },
    { field: "jamPulang", label: "Jam Pulang" },
    { field: "tanggal", label: "Tanggal" },
    { field: "keterangan", label: "Keterangan" },
  ];

  return (
    <Container className="my-5">
      <CRUD
        input={input}
        columns={columns}
        route={"/api/sandbox/absen"}
        title={"Data Absensi"}
      />
    </Container>
  );
};

export default SandBox;
