const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  npm: {
    type: Number,
  },
  status: {
    type: String,
  },
  prodi: String,
  level: String,
});

module.exports = mongoose.model("User", userSchema);
