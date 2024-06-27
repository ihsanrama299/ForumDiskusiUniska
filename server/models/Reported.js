const mongoose = require("mongoose");

const reportedSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
  },
  reporterId: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Report", reportedSchema);
