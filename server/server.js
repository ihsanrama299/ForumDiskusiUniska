const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const twilio = require("twilio");

const app = express();

const postRouter = require("./routes/posts");
const userRouter = require("./routes/users");
const categoryRouter = require("./routes/categories");
const admin = require("./routes/admin");
const report = require("./routes/reports");
const reported = require("./routes/reporteds");
const news = require("./routes/news");
const sandbox = require("./routes/sandbox");

mongoose.connect(
  "mongodb://127.0.0.1:27017/fdm",
  console.log("database connected")
);

// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use("/api/post", postRouter);
app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/admin", admin);
app.use("/api/report", report);
app.use("/api/reported", reported);
app.use("/api/news", news);
app.use("/api/sandbox", sandbox);

app.get("/api/config", (req, res) => {
  fs.readFile("config.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ error: "Error reading file" });
    }

    try {
      const jsonData = JSON.parse(data);
      return res.json(jsonData);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return res.status(500).json({ error: "Error parsing JSON" });
    }
  });
});

app.put("/api/config/:property", (req, res) => {
  const property = req.params.property;
  const value = req.body.value;

  fs.readFile("config.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ error: "Error reading file" });
    }

    try {
      const jsonData = JSON.parse(data);

      if (jsonData.hasOwnProperty(property)) {
        jsonData[property] = value;
      } else {
        return res.status(404).json({ error: "Property not found" });
      }

      const jsonString = JSON.stringify(jsonData, null, 2);

      fs.writeFile("config.json", jsonString, "utf8", (err) => {
        if (err) {
          console.error("Error writing file:", err);
          return res.status(500).json({ error: "Error writing file" });
        }

        return res.json({ message: "Data written successfully" });
      });
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return res.status(500).json({ error: "Error parsing JSON" });
    }
  });
});

const Ad = require("./models/Ad");
const { file } = require("pdfkit");

app.get("/api/ad", async (req, res) => {
  try {
    const data = await Ad.find();
    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/api/ad/:id", async (req, res) => {
  try {
    const data = await Ad.findById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put("/api/ad/edit", async (req, res) => {
  try {
    const data = await Ad.updateOne(
      { _id: req.body.id },
      {
        $set: {
          adTitle: req.body.adTitle,
          adDesc: req.body.adDesc,
          adLink: req.body.adLink,
        },
      }
    );
    res.json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

app.use("/images", express.static(path.join(__dirname, "images")));

const AdStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/ads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadAdImage = multer({ storage: AdStorage });

const accountSid = "AC85c439ed9693fe003032f4d67d5b0b8b"; //token expired
const authToken = "64e218799aa071bb36f95cf8f0732982"; //token expired
const client = twilio(accountSid, authToken);

function convertPhoneNumber(phoneNumber) {
  return phoneNumber.replace(/^0/, "+62");
}

app.post("/api/ad", uploadAdImage.single("image"), async (req, res) => {
  try {
    const imageUrl = req.file.path;

    const newAd = new Ad({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      adTitle: req.body.adTitle,
      adLink: req.body.adLink,
      adDesc: req.body.adDesc,
      plan: req.body.plan,
      duration: req.body.duration,
      price: req.body.price,
      totalPrice: req.body.totalPrice,
      startDate: req.body.startDate,
      imageUrl: imageUrl,
    });

    const savedAd = await newAd.save();

    const newAdId = savedAd._id;

    const message = await client.messages.create({
      body: `Id iklan anda: ${newAdId}`,
      from: "whatsapp:+14155238886",
      to: `whatsapp:${convertPhoneNumber(req.body.phone)}`,
    });

    res.status(200).json(message.sid);
  } catch (error) {
    res.status(400).json(error);
  }
});

const transactionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/transactions");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadTransactionImage = multer({ storage: transactionStorage });

app.put(
  "/api/ad/firstPayment/:id",
  uploadTransactionImage.single("firstPayment"),
  async (req, res) => {
    try {
      const imageUrl = req.file.path;

      const data = {
        transactionType: "first-payment",
        transactionImageUrl: imageUrl,
      };

      await Ad.findOne({
        _id: req.params.id,
        "transaction.transactionType": "first-payment",
      })
        .then((ad) => {
          if (!ad) {
            // Handle the case where the ad is not found
            return Ad.updateOne(
              { _id: req.params.id },
              { $push: { transaction: data } }
            );
          } else {
            // Do something with the found ad document
            ad.transaction = data;
            ad.save();
          }
        })
        .catch((err) => {
          console.error("Error finding ad:", err);
          // Handle the error
        });
      res.status(200).json({ imageUrl: imageUrl });
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

app.put(
  "/api/ad/extend/:id",
  uploadTransactionImage.single("transactionImage"),
  async (req, res) => {
    const imageUrl = req.file.path;

    const data = {
      transactionType: "extension",
      transactionImageUrl: imageUrl,
      extensionsAmount: req.body.months,
      extensionsPrice: req.body.extensionsPrice,
      extensionsStatus: "pending",
    };

    await Ad.updateOne(
      { _id: req.params.id },
      { $push: { transaction: data } }
    );
  }
);

const deleteExpiredAds = async () => {
  try {
    const currentDate = new Date();
    const expiredAds = await Ad.find({
      duration: { $lte: 0 },
      finishedDate: { $lte: currentDate },
    });

    for (const ad of expiredAds) {
      const message = await client.messages.create({
        body: "Maaf jangka pemasangan iklan anda sudah berakhir. Iklan anda telah terhapus, silahkan daftar kembali.",
        from: "whatsapp:+14155238886",
        to: `whatsapp:${convertPhoneNumber(ad.phone)}`,
      });
    }

    await Ad.deleteMany({
      duration: { $lte: 0 },
      finishedDate: { $lte: currentDate },
    });
  } catch (error) {
    console.error("Error deleting expired ads:", error);
  }
};

deleteExpiredAds();

app.listen(5000, () => console.log("server running"));
