const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Activity = require("../models/Activity");

router.get("/", async (req, res) => {
  try {
    const data = await User.find();
    res.json(data);
  } catch (err) {
    res.status(500);
  }
});

router.get("/activity", async (req, res) => {
  try {
    const data = await Activity.find();
    res.json(data);
  } catch (err) {
    res.status(500);
  }
});

router.get("/:id/:name?", async (req, res) => {
  try {
    if (req.params.name) {
      const data = await User.findById(req.params.id, { name: 1, level: 1 });
      res.json(data);
    } else {
      const data = await User.findById(req.params.id);
      res.json(data);
    }
  } catch (err) {
    res.status(400).send({ msg: "No Id" });
  }
});

//register user
router.post("/", async (req, res) => {
  try {
    if (await User.exists({ npm: req.body.npm })) {
      res.status(400).json({ msg: "npm duplicate" });
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        phone: req.body.phone,
        npm: req.body.npm,
        prodi: req.body.prodi,
        level: req.body.level,
        status: req.body.status,
      });

      await newUser.save();
      res.status(200).json({ msg: "success" });
    }
  } catch (err) {
    res.status(400).json({ msg: "something is wrong" });
  }
});

//register admin
router.post("/register-admin", async (req, res) => {
  try {
    if (await User.exists({ username: req.body.username })) {
      res.status(400).json({ msg: "username duplicate" });
    } else {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
        level: req.body.level,
        status: req.body.status,
      });

      await newUser.save();
      res.status(200).json({ msg: "success" });
    }
  } catch (err) {
    res.status(400).json({ msg: "something is wrong" });
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    if (await User.exists({ npm: req.body.npm, status: "active" })) {
      const user = await User.find({ npm: req.body.npm });

      if (await bcrypt.compare(req.body.password, user[0].password)) {
        jwt.sign({ user }, "003a398c71", (err, token) => {
          res.send({ token });

          const activity = new Activity({
            userId: user[0]._id,
            activityType: "login",
          });

          activity.save();
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

router.put("/edit", async (req, res) => {
  try {
    const data = await User.updateOne(
      { _id: req.body.id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          prodi: req.body.prodi,
        },
      }
    );
    res.json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

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
