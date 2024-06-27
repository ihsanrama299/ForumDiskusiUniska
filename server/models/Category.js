const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  subCategory: [
    {
      subCategoryName: {
        type: String,
        required: true,
      },
      subAuthorId: {
        type: String,
        required: true,
      },
      subDateCreated: {
        type: Date,
        default: Date.now,
      },
      subCategoryOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    },
  ],
});

module.exports = mongoose.model("Category", categorySchema);
