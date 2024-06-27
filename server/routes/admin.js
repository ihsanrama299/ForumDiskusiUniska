const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Post = require("../models/Post");
const Ad = require("../models/Ad");
const Category = require("../models/Category");
const Reported = require("../models/Reported");
const Activity = require("../models/Activity");

const twilio = require("twilio");

router.get("/user-activity", async (req, res) => {
  try {
    const data = await Activity.find();
    res.json(data);
  } catch (error) {
    res.status(500);
  }
});

router.post("/delete/:type/:id", async (req, res) => {
  try {
    if (req.params.type === "users" || "admins") {
      const data = await User.deleteOne({ _id: req.params.id });
      res.json(data);
    }

    if (req.params.type === "posts") {
      const data = await Post.deleteOne({ _id: req.params.id });
      res.json(data);
    }

    if (req.params.type === "ads") {
      const data = await Ad.deleteOne({ _id: req.params.id });
      res.json(data);
    }

    if (req.params.type === "categories") {
      const data = await Category.deleteOne({ _id: req.params.id });
      res.json(data);
    }

    if (req.params.type === "reporteds") {
      const data = await Reported.deleteOne({ _id: req.params.id });
      res.json(data);
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

const accountSid = "AC85c439ed9693fe003032f4d67d5b0b8b";
const authToken = "64e218799aa071bb36f95cf8f0732982";
const client = twilio(accountSid, authToken);

function convertPhoneNumber(phoneNumber) {
  return phoneNumber.replace(/^0/, "+62");
}

router.post("/activate-ad/:id", async (req, res) => {
  try {
    const row = await Ad.findById(req.params.id);
    const number = row.phone;

    const data = await Ad.updateOne(
      { _id: req.params.id },
      { status: "active" }
    );

    const message = await client.messages.create({
      body: `Iklan anda telah aktif`,
      from: "whatsapp:+14155238886",
      to: `whatsapp:${convertPhoneNumber(number)}`,
    });

    message();

    res.json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/activate-user/:id", async (req, res) => {
  try {
    const row = await User.findById(req.params.id);
    const number = row.phone;

    const data = await User.updateOne(
      { _id: req.params.id },
      { status: "active" }
    );

    const message = await client.messages.create({
      body: `Akun Forum Diskusi anda telah berhasil diaktifkan oleh admin`,
      from: "whatsapp:+14155238886",
      to: `whatsapp:${convertPhoneNumber(number)}`,
    });

    message();

    res.json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    if (await User.exists({ username: req.body.username })) {
      const user = await User.find({ username: req.body.username });

      if (await bcrypt.compare(req.body.password, user[0].password)) {
        jwt.sign({ user }, "003a398c71", (err, token) => {
          res.send({ token });
        });
      } else {
        res.json({ msg: "wrong password" });
      }
    } else {
      res.json({ msg: "no npm" });
    }
  } catch (err) {
    res.status(400).json({ msg: "error" });
  }
});

router.put("/extend-ad/:adId/:transactionId", async (req, res) => {
  const adId = req.params.adId;
  const transactionId = req.params.transactionId;

  try {
    const ad = await Ad.findById(adId);

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    const transaction = ad.transaction.id(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    ad.duration += transaction.extensionsAmount;

    const date = new Date(ad.finishedDate);
    date.setFullYear(date.getFullYear() + Math.floor(ad.duration / 12));
    date.setMonth(date.getMonth() + (ad.duration % 12));
    ad.finishedDate = date;

    transaction.extensionsStatus = "success";

    await ad.save();

    return res.status(200).json({ message: "Update successful" });
  } catch (error) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/delete-extension/:adId/:transactionId", async (req, res) => {
  const adId = req.params.adId;
  const transactionId = req.params.transactionId;

  try {
    const ad = await Ad.findById(adId);

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    await Ad.findOneAndUpdate(
      { _id: adId },
      { $pull: { transaction: { _id: transactionId } } },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: "Transaction subdocument deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/add-subcategory/", async (req, res) => {
  try {
    const data = await Category.updateOne(
      { _id: req.body.id },
      {
        $push: {
          subCategory: {
            subAuthorId: req.body.author,
            subCategoryName: req.body.name,
            subCategoryOf: req.body.id,
          },
        },
      }
    );
    res.json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
