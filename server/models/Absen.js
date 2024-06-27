const mongoose = require("mongoose");

const presensiSchema = new mongoose.Schema({
  namaPegawai: {
    type: String,
  },
  nik: {
    type: String,
  },
  jamMasuk: {
    type: String,
  },
  jamPulang: {
    type: String,
  },
  tanggal: {
    type: Date,
    default: Date.now,
  },
  keterangan: {
    type: String,
  },
});

module.exports = mongoose.model("Presensi", presensiSchema);
