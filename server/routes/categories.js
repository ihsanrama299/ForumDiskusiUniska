const express = require("express");
const router = express.Router();

const Category = require("../models/Category");

router.get("/", async (req, res) => {
  try {
    const data = await Category.find();
    res.json(data);
  } catch (err) {
    res.status(500);
  }
});

router.post("/", async (req, res) => {
  try {
    const newCategory = new Category({
      name: req.body.name,
      authorId: req.body.authorId,
    });

    await newCategory.save();
  } catch (err) {
    res.status(400).json({ msg: "something is wrong" });
  }
});

module.exports = router;
