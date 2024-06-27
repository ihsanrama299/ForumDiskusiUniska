const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  commentUserId: {
    type: String,
  },
  commentBody: {
    type: String,
    required: true,
  },
  commentDate: {
    type: Date,
    default: Date.now,
  },
  commentUpvotes: [String],
  commentDownvotes: [String],
  replies: [
    {
      replyUserId: {
        type: String,
      },
      replyBody: {
        type: String,
        required: true,
      },
      replyDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  category: [
    {
      categoryId: String,
      categoryName: String,
      subCategoryOf: String,
    },
  ],
  authorId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  upvotes: [String],
  downvotes: [String],
  comments: [commentSchema],
});

postSchema.virtual("voteCount").get(function () {
  return this.upvotes.length - this.downvotes.length;
});

commentSchema.virtual("commentVoteCount").get(function () {
  return this.commentUpvotes.length - this.commentDownvotes.length;
});

module.exports = mongoose.model("Post", postSchema);
