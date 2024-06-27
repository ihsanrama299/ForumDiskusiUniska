const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit-table");

const Barang = require("../models/Barang");
const Absen = require("../models/Absen");

const { Title } = require("chart.js");

// router.get("/barang", async (req, res) => {
//   try {
//     const data = await Barang.find();
//     res.json(data);
//   } catch (err) {
//     res.status(500);
//   }
// });

// router.post("/barang", async (req, res) => {
//   try {
//     const newBarang = new Barang({
//       kode: req.body.kode,
//       nama: req.body.nama,
//       harga: req.body.harga,
//       stok: req.body.stok,
//     });

//     await newBarang.save();
//     res.status(200).json({ msg: "success" });
//   } catch (err) {
//     res.status(400).json(err);
//   }
// });

// router.post("/barang/delete/:id", async (req, res) => {
//   try {
//     const data = await Barang.deleteOne({ _id: req.params.id });
//     res.json(data);
//   } catch (error) {
//     res.status(400).json(error);
//   }
// });

// router.put("/barang/edit/:id", async (req, res) => {
//   try {
//     const data = await Barang.updateOne(
//       { _id: req.params.id },
//       {
//         $set: {
//           kode: req.body.kode,
//           nama: req.body.nama,
//           harga: req.body.harga,
//           stok: req.body.stok,
//         },
//       }
//     );
//     res.json(data);
//   } catch (error) {
//     res.status(400).json(error);
//   }
// });

// router.get("/barang/report/:title", async (req, res) => {
//   try {
//     const data = await Barang.find().lean();

//     const doc = new PDFDocument({ margin: 50 });

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", "inline; filename=report.pdf");

//     doc.pipe(res);

//     const date = new Date();

//     doc.fontSize(25).text("Nama Perusahaan", { align: "center" });

//     doc
//       .moveTo(doc.x, doc.y)
//       .lineTo(doc.page.width - 50, doc.y)
//       .stroke()
//       .moveDown();

//     doc
//       .fontSize(20)
//       .text(`Laporan ${req.params.title}`, {
//         align: "center",
//         underline: true,
//       })
//       .moveDown();

//     const table = {
//       headers: ["Kode", "Nama", "Harga", "Stok"],
//       rows: data.map((item) => [item.kode, item.nama, item.harga, item.stok]),
//     };

//     await doc.table(table, {
//       columnsSize: [100, 100, 100, 100],
//     });

//     doc.end();
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     res.status(500).send("Error generating PDF");
//   }
// });

//
router.get("/absen", async (req, res) => {
  try {
    const data = await Absen.find();
    res.json(data);
  } catch (err) {
    res.status(500);
  }
});

router.post("/absen", async (req, res) => {
  try {
    const newAbsen = new Absen({
      namaPegawai: req.body.namaPegawai,
      nik: req.body.nik,
      jamMasuk: req.body.jamMasuk,
      jamPulang: req.body.jamPulang,
      tanggal: req.body.tanggal,
      keterangan: req.body.keterangan,
    });

    await newAbsen.save();
    res.status(200).json({ msg: "success" });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/absen/delete/:id", async (req, res) => {
  try {
    const data = await Absen.deleteOne({ _id: req.params.id });
    res.json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/absen/edit/:id", async (req, res) => {
  try {
    const data = await Absen.updateOne(
      { _id: req.params.id },
      {
        $set: {
          namaPegawai: req.body.namaPegawai,
          nik: req.body.nik,
          jamMasuk: req.body.jamMasuk,
          jamPulang: req.body.jamPulang,
          keterangan: req.body.keterangan,
        },
      }
    );
    res.json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/absen/report/:title", async (req, res) => {
  try {
    const data = await Absen.find().lean();

    const doc = new PDFDocument({ margin: 50, layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    doc.pipe(res);

    const date = new Date();

    doc.fontSize(25).text("Nama Perusahaan", { align: "center" });

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(20)
      .text(`Laporan ${req.params.title}`, {
        align: "center",
        underline: true,
      })
      .moveDown();

    const table = {
      headers: [
        "nama pegawai",
        "nik",
        "jam masuk",
        "jam pulang",
        "tanggal",
        "keterangan",
      ],
      rows: data.map((item) => [
        item.namaPegawai,
        item.nik,
        item.jamMasuk,
        item.jamPulang,
        item.tanggal,
        item.keterangan,
      ]),
    };

    await doc.table(table, {
      columnsSize: [100, 100, 50, 50, 250, 100],
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

module.exports = router;
