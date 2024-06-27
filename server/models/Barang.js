const mongoose = require("mongoose");

const barangSchema = new mongoose.Schema({
  kode: {
    type: String,
  },
  nama: {
    type: String,
  },
  harga: {
    type: String,
  },
  stok: {
    type: String,
  },
});

module.exports = mongoose.model("Barang", barangSchema);
