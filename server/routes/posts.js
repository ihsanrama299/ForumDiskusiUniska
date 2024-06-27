const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const News = require("../models/News");
const Activity = require("../models/Activity");

//get posts or 1 post
router.get("/:sort", async (req, res) => {
  sort = req.params.sort;
  let data;
  try {
    if (sort == 1) {
      data = await Post.find().sort({ date: -1 });
    } else if (sort == 2) {
      data = await Post.find();
      data = data.sort((a, b) => b.voteCount - a.voteCount);
    } else if (sort == 3) {
      const aggregationPipeline = [
        {
          $project: {
            _id: 1,
            title: 1,
            body: 1,
            category: 1,
            authorId: 1,
            date: 1,
            upvotes: 1,
            downvotes: 1,
            comments: 1,
            commentCount: { $size: "$comments" }, // Calculate the comment count
          },
        },
        {
          $sort: { commentCount: -1 }, // Sort by commentCount in descending order
        },
      ];

      data = await Post.aggregate(aggregationPipeline).limit(8);
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/edit", async (req, res) => {
  try {
    const data = await Post.updateOne(
      { _id: req.body.id },
      {
        $set: {
          title: req.body.title,
          body: req.body.body,
        },
      }
    );
    res.json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/post/:postId", async (req, res) => {
  try {
    const data = await Post.findById(req.params.postId);
    res.json(data);
  } catch (err) {
    res.status(400).send({ msg: "No Id" });
  }
});

//post by user
router.get("/userPost/:userId", async (req, res) => {
  try {
    const data = await Post.find({ authorId: req.params.userId });
    res.json(data);
  } catch (err) {
    res.status(400).send({ msg: "No Id" });
  }
});

router.get("/search/:query", async (req, res) => {
  const searchQuery = req.params.query;

  try {
    // Use the $text operator to perform the text search on 'title' and 'body'
    const searchResults = await Post.find({
      $text: { $search: searchQuery },
    }).exec();

    res.json(searchResults);
  } catch (err) {
    res
      .status(500)
      .json({ message: "An error occurred while searching.", error: err });
  }
});

//create a post
router.post("/", authToken, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      body: req.body.body,
      category: [],
      authorId: req.body.authorId,
    });

    newPost.category.push(req.body.category);

    if (req.body.sub) {
      newPost.category.push(req.body.sub);
    }

    await newPost.save();

    const activity = new Activity({
      userId: await req.body.authorId,
      activityType: "post",
    });

    await activity.save();

    res.json(newPost);
  } catch (err) {
    res.status(400).json({ msg: "something is wrong" });
  }
});

router.get("/delete/:id", async (req, res) => {
  try {
    const data = await Post.deleteOne({ _id: req.params.id });
    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

//create a comment
router.post("/comment/:postId", authToken, async (req, res) => {
  try {
    await Post.updateOne(
      { _id: req.params.postId },
      { $push: { comments: req.body } }
    );

    const activity = new Activity({
      userId: await req.body.commentUserId,
      activityType: "comment",
    });

    await activity.save();
  } catch (err) {
    res.status(400).json({ msg: "something is wrong" });
  }
});

//create a reply
router.post("/reply/:postId/:commentId", authToken, async (req, res) => {
  try {
    await Post.updateOne(
      { _id: req.params.postId, "comments._id": req.params.commentId },
      {
        $push: {
          "comments.$.replies": {
            replyUserId: req.body.replyUserId,
            replyBody: req.body.replyBody,
          },
        },
      }
    );
  } catch (err) {
    res.status(400).json({ msg: "something is wrong" });
  }
});

// handle post votes
router.post("/giveVotes/:voteType/:postId", authToken, async (req, res) => {
  try {
    const voteType = req.params.voteType;
    const postId = req.params.postId;
    const userId = req.body.userId;

    // Fetch the post from the database
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Update the vote status based on the vote type
    if (voteType === "upvote") {
      if (!post.upvotes.includes(userId)) {
        post.upvotes.push(userId);
      }
      if (post.downvotes.includes(userId)) {
        post.downvotes = post.downvotes.filter((id) => id !== userId);
      }
    } else if (voteType === "downvote") {
      if (!post.downvotes.includes(userId)) {
        post.downvotes.push(userId);
      }
      if (post.upvotes.includes(userId)) {
        post.upvotes = post.upvotes.filter((id) => id !== userId);
      }
    } else if (voteType === "remove-vote") {
      post.upvotes = post.upvotes.filter((id) => id !== userId);
      post.downvotes = post.downvotes.filter((id) => id !== userId);
    } else {
      return res.status(400).json({ error: "Invalid vote type" });
    }

    // Save the updated post in the database
    await post.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// handle comment votes
router.post(
  "/giveCommentVotes/:voteType/:postId/:commentId",
  authToken,
  async (req, res) => {
    try {
      const voteType = req.params.voteType;
      const postId = req.params.postId;
      const commentId = req.params.commentId;
      const userId = req.body.userId;

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const comment = post.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      if (voteType === "upvote") {
        if (!comment.commentUpvotes.includes(userId)) {
          comment.commentUpvotes.push(userId);
        }
        if (comment.commentDownvotes.includes(userId)) {
          comment.commentDownvotes.pull(userId);
        }
      } else if (voteType === "downvote") {
        if (!comment.commentDownvotes.includes(userId)) {
          comment.commentDownvotes.push(userId);
        }
        if (comment.commentUpvotes.includes(userId)) {
          comment.commentUpvotes.pull(userId);
        }
      } else if (voteType === "remove-vote") {
        comment.commentUpvotes.pull(userId);
        comment.commentDownvotes.pull(userId);
      } else {
        return res.status(400).json({ error: "Invalid vote type" });
      }

      await post.save();

      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

//get comments
router.get("/:postId/:commentId", authToken, async (req, res) => {
  try {
    const data = await Post.find({
      _id: req.params.postId,
      "comments._id": req.params.commentId,
    });
    if (data) {
      res.json(data);
    }
  } catch (err) {
    res.status(400).json({ msg: "something is wrong" });
  }
});

//get vote status
router.get("/:postId/vote-status/:userId", async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.params.userId;

    // Fetch the post and user data from the database
    const post = await Post.findById(postId);

    // Check if the user has upvoted or downvoted the post
    const upvoted = post.upvotes.includes(userId);
    const downvoted = post.downvotes.includes(userId);

    // Construct the response object
    const response = {
      upvoted,
      downvoted,
      voteCount: post.voteCount,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

//get comment vote status
router.get(
  "/:postId/comments-vote-status/:commentId/:userId",
  async (req, res) => {
    try {
      const postId = req.params.postId;
      const userId = req.params.userId;
      const commentId = req.params.commentId;

      // Fetch the post and user data from the database
      const post = await Post.find(
        { _id: postId },
        { comments: { $elemMatch: { _id: commentId } } }
      );

      // // Check if the user has upvoted or downvoted the post
      const upvoted = post[0].comments[0].commentUpvotes.includes(userId);
      const downvoted = post[0].comments[0].commentDownvotes.includes(userId);

      // Construct the response object
      const response = {
        upvoted,
        downvoted,
        voteCount: post[0].comments[0].commentVoteCount,
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  }
);

function authToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];

    req.token = bearerToken;

    next();
  } else {
    return res.status(403).json({ msg: "no access" });
  }
}

module.exports = router;
