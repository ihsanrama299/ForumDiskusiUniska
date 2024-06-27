const express = require("express");
const router = express.Router();

const Reported = require("../models/Reported");

router.get("/", async (req, res) => {
  try {
    const data = await Reported.find();
    res.json(data);
  } catch (err) {
    res.status(500);
  }
});

router.post("/", async (req, res) => {
  try {
    const reported = new Reported({
      body: req.body.body,
      reporterId: req.body.reporterId,
      postId: req.body.postId,
    });

    await reported.save();
  } catch (err) {
    res.status(400).json({ msg: "something is wrong" });
  }
});

module.exports = router;
