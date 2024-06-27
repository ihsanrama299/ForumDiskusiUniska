const express = require("express");
const router = express.Router();

const News = require("../models/News");

router.get("/", async (req, res) => {
  try {
    const data = await News.find().sort({ date: -1 });
    res.json(data);
  } catch (error) {
    res.status(500);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await News.findById({ _id: req.params.id });
    res.json(data);
  } catch (error) {
    res.status(500);
  }
});

//create a news
router.post("/", async (req, res) => {
  try {
    const newPost = new News({
      title: req.body.title,
      body: req.body.body,
      authorId: req.body.authorId,
    });

    await newPost.save();
  } catch (err) {
    res.status(400).json({ msg: "something is wrong" });
  }
});

router.post("/comment/:id", async (req, res) => {
  try {
    await News.updateOne(
      { _id: req.params.id },
      { $push: { comments: req.body } }
    );
    res.status(200).json({ msg: "success" });
  } catch (err) {
    res.status(400).json({ msg: "something is wrong" });
  }
});

module.exports = router;
