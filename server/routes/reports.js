const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit-table");
const fs = require("fs");

const User = require("../models/User");
const Activity = require("../models/Activity");
const Post = require("../models/Post");
const Ad = require("../models/Ad");
const Category = require("../models/Category");

const tmp = require("tmp");
const MemoryStream = require("memorystream");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

function getMonthName(monthNumber) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return date.toLocaleString("id", { month: "long" });
}

function monthDiff(d1, d2) {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

router.get("/user-report", async (req, res) => {
  try {
    const data = await User.find().lean();

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    doc.pipe(res);

    const date = new Date();

    doc
      .fontSize(25)
      .text(
        "Universitas Islam Kalimantan Muhammad Arsyad Al Banjari Banjarmasin",
        { align: "center" }
      );

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(20)
      .text("Laporan Profil Pengguna", {
        align: "center",
        underline: true,
      })
      .moveDown();

    doc
      .fontSize(10)
      .text(`Tahun        : ${date.getFullYear()}`)
      .text(`Bulan        : ${getMonthName(date.getMonth())}`)
      .moveDown();

    const table = {
      headers: ["ID", "Nama", "NPM", "Email", "Program Studi"],
      rows: data.map((item) => [
        item._id,
        item.name,
        item.npm,
        item.email,
        item.prodi,
      ]),
    };

    await doc.table(table, {
      columnsSize: [130, 100, 60, 100, 100],
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

router.get("/categories-report", async (req, res) => {
  try {
    const data = await Category.find().lean();

    data.forEach((element) => {
      element.subCat =
        element.subCategory.length > 0
          ? element.subCategory.map((obj) => obj.subCategoryName).join(", ")
          : "-";
    });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    doc.pipe(res);

    doc
      .fontSize(25)
      .text(
        "Universitas Islam Kalimantan Muhammad Arsyad Al Banjari Banjarmasin",
        { align: "center" }
      );

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(20)
      .text("Laporan Data Kategori", {
        align: "center",
        underline: true,
      })
      .moveDown();

    const table = {
      headers: ["ID Kategori", "Nama Kategori", "Sub Kategori"],
      rows: data.map((item) => [item._id, item.name, item.subCat]),
    };

    await doc.table(table, {
      columnsSize: [130, 130, 200],
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

router.get("/activity-report/:year/:month/:filter", async (req, res) => {
  try {
    const filter = req.params.filter === "true";
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    const data = await Activity.find().lean();

    const filteredData = filter
      ? data.filter((row) => {
          const date = new Date(row.date);
          return date.getFullYear() === year && date.getMonth() === month - 1;
        })
      : data;

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    doc.pipe(res);

    doc
      .fontSize(25)
      .text(
        "Universitas Islam Kalimantan Muhammad Arsyad Al Banjari Banjarmasin",
        { align: "center" }
      );

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(20)
      .text("Laporan Aktifitas Pengguna", {
        align: "center",
        underline: true,
      })
      .moveDown();

    if (filter) {
      doc
        .fontSize(10)
        .text(`Tahun        : ${year}`)
        .text(`Bulan        : ${getMonthName(month)}`)
        .moveDown();
    }

    const table = {
      headers: ["ID Aktifitas", "ID User", "Tipe Aktifitas", "tanggal"],
      rows: filteredData.map((item) => [
        item._id,
        item.userId,
        item.activityType,
        new Date(item.date)
          .toLocaleDateString("id", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          })
          .replace(/\//g, "-"),
      ]),
    };

    await doc.table(table, {
      columnsSize: [130, 130, 60, 200],
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

router.get("/activity-chart/:year/:month/:filter", async (req, res) => {
  try {
    const filter = req.params.filter === "true";
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    const data = await Activity.find().lean();

    const filteredData = filter
      ? data.filter((row) => {
          const date = new Date(row.date);
          return date.getFullYear() === year && date.getMonth() === month - 1;
        })
      : data;

    const activitySums = {};

    filteredData.forEach((activity) => {
      const { date, activityType } = activity;
      const dateString = new Date(date).toISOString().substring(0, 10); // Extract the date string

      if (!activitySums[activityType]) {
        activitySums[activityType] = {};
      }

      if (!activitySums[activityType][dateString]) {
        activitySums[activityType][dateString] = 0;
      }

      activitySums[activityType][dateString]++;
    });

    // Convert the sums object to the desired array format
    const loginArray = [];
    const postArray = [];
    const commentArray = [];

    for (const activityType in activitySums) {
      for (const date in activitySums[activityType]) {
        const sum = activitySums[activityType][date];
        const data = { date, sum };

        if (activityType === "login") {
          loginArray.push(data);
        } else if (activityType === "post") {
          postArray.push(data);
        } else if (activityType === "comment") {
          commentArray.push(data);
        }
      }
    }

    // Create an array of unique dates from all datasets
    const allDatesSet = new Set([
      ...loginArray.map((item) => item.date),
      ...postArray.map((item) => item.date),
      ...commentArray.map((item) => item.date),
    ]);
    const allDates = Array.from(allDatesSet).sort();

    // Align data for each dataset based on the common set of dates
    const alignedLoginData = allDates.map((date) => {
      const matchingData = loginArray.find((item) => item.date === date);
      return matchingData ? matchingData.sum : 0;
    });

    const alignedPostData = allDates.map((date) => {
      const matchingData = postArray.find((item) => item.date === date);
      return matchingData ? matchingData.sum : 0;
    });

    const alignedCommentData = allDates.map((date) => {
      const matchingData = commentArray.find((item) => item.date === date);
      return matchingData ? matchingData.sum : 0;
    });

    // Sample chart with ChartJS
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      type: "png",
      width: 800,
      height: 600,
    });
    const configuration = {
      type: "line",
      data: {
        labels: allDates.map((date) => new Date(date).getDate()),
        datasets: [
          {
            label: "Login",
            data: alignedLoginData,
            backgroundColor: "blue",
            borderColor: "blue",
          },
          {
            label: "Post",
            data: alignedPostData,
            backgroundColor: "yellow",
            borderColor: "yellow",
          },
          {
            label: "Comment",
            data: alignedCommentData,
            backgroundColor: "green",
            borderColor: "green",
          },
        ],
      },
    };

    // Generate chart image
    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

    // Write the chart image to the system because the PDF needs a path
    const tempImg = tmp.fileSync({ postfix: ".png" });
    fs.writeFileSync(tempImg.name, imageBuffer);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    doc.pipe(res);

    doc
      .fontSize(25)
      .text(
        "Universitas Islam Kalimantan Muhammad Arsyad Al Banjari Banjarmasin",
        { align: "center" }
      );

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(20)
      .text("Grafis Aktifitas Pengguna", {
        align: "center",
        underline: true,
      })
      .moveDown();

    if (filter) {
      doc
        .fontSize(10)
        .text(`Tahun        : ${year}`)
        .text(`Bulan        : ${getMonthName(month)}`)
        .moveDown();
    }

    doc.image(tempImg.name, 110, 210, { width: 400 });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

router.get("/trending-post-report/:year/:month/:filter", async (req, res) => {
  try {
    const filter = req.params.filter === "true";
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

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

    const date = new Date();
    data = await Post.aggregate(aggregationPipeline);

    const filteredData = filter
      ? data.filter((row) => {
          const date = new Date(row.date);
          return date.getFullYear() === year && date.getMonth() === month - 1;
        })
      : data;

    const doc = new PDFDocument({ layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    doc.pipe(res);

    doc
      .fontSize(25)
      .text(
        "Universitas Islam Kalimantan Muhammad Arsyad Al Banjari Banjarmasin",
        { align: "center" }
      );

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(20)
      .text("Laporan Topik Trending", {
        align: "center",
        underline: true,
      })
      .moveDown();

    if (filter) {
      doc
        .fontSize(10)
        .text(`Tahun        : ${year}`)
        .text(`Bulan        : ${getMonthName(month)}`)
        .moveDown();
    }

    const table = {
      headers: [
        "ID Topik",
        "ID Pengirim",
        "Jumlah Komentar",
        "Jumlah Upvote",
        "Jumlah Downvote",
        "Tanggal",
      ],
      rows: filteredData.map((item) => [
        item._id,
        item.authorId,
        item.comments.length,
        item.upvotes.length,
        item.downvotes.length,
        new Date(item.date)
          .toLocaleDateString("id", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })
          .replace(/\//g, "-"),
      ]),
    };

    await doc.table(table, {
      columnsSize: [130, 130, 60, 100, 100, 150],
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

router.get("/customer-report", async (req, res) => {
  try {
    const data = await Ad.find({ status: "active" }).lean();

    const doc = new PDFDocument({ margin: 50, layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    doc.pipe(res);

    doc
      .fontSize(25)
      .text(
        "Universitas Islam Kalimantan Muhammad Arsyad Al Banjari Banjarmasin",
        { align: "center" }
      );

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(20)
      .text("Laporan Data Pelanggan", {
        align: "center",
        underline: true,
      })
      .moveDown();

    const table = {
      headers: ["Nama", "Telepon", "Email", "Alamat"],
      rows: data.map((item) => [
        item.name,
        item.phone,
        item.email,
        item.address,
      ]),
    };

    await doc.table(table, {
      columnsSize: [130, 100, 100, 320],
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

router.get("/active-ads-report/:year/:month/:filter", async (req, res) => {
  try {
    const filter = req.params.filter === "true";
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    const data = await Ad.find({ status: "active" }).lean();

    data.forEach((row) => {
      row.firstTransDate = row.transaction[0].transactionDate;
    });

    const filteredData = filter
      ? data.filter((row) => {
          const firstTransDate = new Date(row.transaction[0].transactionDate);
          return (
            firstTransDate.getFullYear() === year &&
            firstTransDate.getMonth() === month - 1
          );
        })
      : data;

    const doc = new PDFDocument({ margin: 50, layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    doc.pipe(res);

    doc
      .fontSize(25)
      .text(
        "Universitas Islam Kalimantan Muhammad Arsyad Al Banjari Banjarmasin",
        { align: "center" }
      );

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(20)
      .text("Laporan Penghasilan dari Iklan", {
        align: "center",
        underline: true,
      })
      .moveDown();

    if (filter) {
      doc
        .fontSize(10)
        .text(`Tahun        : ${year}`)
        .text(`Bulan        : ${getMonthName(month)}`)
        .moveDown();
    }

    const totalHargaBayar = filteredData.reduce(
      (total, item) => total + item.price * item.duration,
      0
    );

    const table = {
      headers: [
        "ID Iklan",
        "Nama Pemilik",
        "Telepon",
        "Judul Iklan",
        "Tgl Akhir Iklan",
        "Tgl Transaksi",
        "Harga Bayar",
      ],
      rows: filteredData.map((item) => [
        item._id,
        item.name,
        item.phone,
        item.adTitle,
        new Date(item.finishedDate)
          .toLocaleDateString("id", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })
          .replace(/\//g, "-"),
        new Date(item.firstTransDate)
          .toLocaleDateString("id", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })
          .replace(/\//g, "-"),
        item.price * item.duration,
      ]),
    };

    table.rows.push(["", "", "", "", "", "Total:", totalHargaBayar]);

    await doc.table(table, {
      columnsSize: [130, 100, 80, 100, 80, 80, 100],
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

router.get("/active-ads-chart/:year/:month/:filter", async (req, res) => {
  try {
    const filter = req.params.filter === "true";
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    const data = await Ad.find({ status: "active" }).lean();

    data.forEach((row) => {
      row.firstTransDate = row.transaction[0].transactionDate;
    });

    const filteredData = filter
      ? data
          .filter((row) => {
            const firstTransDate = new Date(row.transaction[0].transactionDate);
            return (
              firstTransDate.getFullYear() === year &&
              firstTransDate.getMonth() === month - 1
            );
          })
          .sort(
            (objA, objB) =>
              Number(new Date(objA.firstTransDate)) -
              Number(new Date(objB.firstTransDate))
          )
      : data;

    const groupedData = {};

    filteredData.forEach((ad) => {
      const dayKey = new Date(ad.firstTransDate).getDate(); // Extract day number from the date

      if (!groupedData[dayKey]) {
        groupedData[dayKey] = {
          wholeDate: new Date(ad.firstTransDate).toISOString().split("T")[0],
          day: dayKey,
          sum: 0,
        };
      }

      groupedData[dayKey].sum += ad.price * ad.duration;
    });

    const groupedArray = Object.values(groupedData);

    // Sample chart with ChartJS
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      type: "png",
      width: 800,
      height: 600,
    });
    const configuration = {
      type: "line",
      data: {
        labels: groupedArray.map((item) => item.day),
        datasets: [
          {
            label: "Jumlah Pemasukan",
            data: groupedArray.map((item) => item.sum),
            backgroundColor: "blue",
            borderColor: "blue",
          },
        ],
      },
    };

    // Generate chart image
    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

    // Write the chart image to the system because the PDF needs a path
    const tempImg = tmp.fileSync({ postfix: ".png" });
    fs.writeFileSync(tempImg.name, imageBuffer);

    const doc = new PDFDocument({ margin: 50, layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    doc.pipe(res);

    doc
      .fontSize(25)
      .text(
        "Universitas Islam Kalimantan Muhammad Arsyad Al Banjari Banjarmasin",
        { align: "center" }
      );

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(20)
      .text("Grafis Penghasilan dari Iklan", {
        align: "center",
        underline: true,
      })
      .moveDown();

    if (filter) {
      doc
        .fontSize(10)
        .text(`Tahun        : ${year}`)
        .text(`Bulan        : ${getMonthName(month)}`)
        .moveDown();
    }

    doc.image(tempImg.name, 170, 210, { width: 400 });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

router.get("/near-exp-ads-report/", async (req, res) => {
  try {
    let data = await Ad.find({ status: "active" }).lean();

    data = data.filter((row) => {
      if (monthDiff(new Date(), new Date(row.finishedDate)) < 2) {
        return row;
      }
    });

    const doc = new PDFDocument({ margin: 50, layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    doc.pipe(res);

    doc
      .fontSize(25)
      .text(
        "Universitas Islam Kalimantan Muhammad Arsyad Al Banjari Banjarmasin",
        { align: "center" }
      );

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(20)
      .text("Laporan Iklan Masa Tenggang", {
        align: "center",
        underline: true,
      })
      .moveDown();

    const table = {
      headers: [
        "ID Iklan",
        "Nama Pemilik",
        "Telepon",
        "Judul Iklan",
        "Tgl Akhir Iklan",
      ],
      rows: data.map((item) => [
        item._id,
        item.name,
        item.phone,
        item.adTitle,
        new Date(item.finishedDate)
          .toLocaleDateString("id", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })
          .replace(/\//g, "-"),
      ]),
    };

    await doc.table(table, {
      columnsSize: [130, 145, 140, 145, 100],
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

router.get("/extensions-report/:year/:month/:filter", async (req, res) => {
  try {
    const filter = req.params.filter === "true";
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    const data = await Ad.aggregate([
      {
        $unwind: "$transaction",
      },
      {
        $match: {
          "transaction.transactionType": "extension",
          "transaction.extensionsStatus": "success",
        },
      },
      {
        $addFields: {
          mainId: "$_id",
          mainName: "$name",
          mainTitle: "$adTitle",
          transactionType: "$transaction.transactionType",
          transactionImageUrl: "$transaction.transactionImageUrl",
          transactionDate: "$transaction.transactionDate",
          extensionsAmount: "$transaction.extensionsAmount",
          extensionsPrice: "$transaction.extensionsPrice",
          extensionsStatus: "$transaction.extensionsStatus",
        },
      },
      {
        $project: {
          _id: 0,
          "transaction.transactionType": 0,
          "transaction.transactionImageUrl": 0,
          "transaction.transactionDate": 0,
          "transaction.extensionsAmount": 0,
          "transaction.extensionsPrice": 0,
          "transaction.extensionsStatus": 0,
        },
      },
      {
        $sort: {
          transactionDate: 1,
        },
      },
    ]);

    const filteredData = filter
      ? data.filter((row) => {
          const transactionDate = new Date(row.transactionDate);
          return (
            transactionDate.getFullYear() === year &&
            transactionDate.getMonth() === month - 1
          );
        })
      : data;

    const doc = new PDFDocument({ margin: 50, layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    doc.pipe(res);

    doc
      .fontSize(25)
      .text(
        "Universitas Islam Kalimantan Muhammad Arsyad Al Banjari Banjarmasin",
        { align: "center" }
      );

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(20)
      .text("Laporan Penghasilan Perpanjangan Iklan", {
        align: "center",
        underline: true,
      })
      .moveDown();

    if (filter) {
      doc
        .fontSize(10)
        .text(`Tahun        : ${year}`)
        .text(`Bulan        : ${getMonthName(month)}`)
        .moveDown();
    }

    const totalHargaBayar = filteredData.reduce(
      (total, item) => total + item.extensionsPrice,
      0
    );

    const table = {
      headers: [
        "Id Iklan",
        "Judul Iklan",
        "Nama Pemilik",
        "Tanggal Pembayaran",
        "Jumlah Perpanjangan",
        "Harga Bayar",
      ],
      rows: filteredData.map((item) => [
        item.mainId,
        item.adTitle,
        item.mainName,
        new Date(item.transactionDate)
          .toLocaleDateString("id", {
            day: "numeric",
            month: "numeric",
            year: "numeric",
          })
          .replace(/\//g, "-"),
        item.extensionsAmount + " Bulan",
        item.extensionsPrice,
      ]),
    };

    table.rows.push(["", "", "", "", "Total:", totalHargaBayar]);

    await doc.table(table, {
      columnsSize: [130, 100, 100, 100, 100, 100],
    });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

router.get("/extensions-chart/:year/:month/:filter", async (req, res) => {
  try {
    const filter = req.params.filter === "true";
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    const data = await Ad.aggregate([
      {
        $unwind: "$transaction",
      },
      {
        $match: {
          "transaction.transactionType": "extension",
          "transaction.extensionsStatus": "success",
        },
      },
      {
        $addFields: {
          mainId: "$_id",
          mainName: "$name",
          mainTitle: "$adTitle",
          transactionType: "$transaction.transactionType",
          transactionImageUrl: "$transaction.transactionImageUrl",
          transactionDate: "$transaction.transactionDate",
          extensionsAmount: "$transaction.extensionsAmount",
          extensionsPrice: "$transaction.extensionsPrice",
          extensionsStatus: "$transaction.extensionsStatus",
        },
      },
      {
        $project: {
          _id: 0,
          "transaction.transactionType": 0,
          "transaction.transactionImageUrl": 0,
          "transaction.transactionDate": 0,
          "transaction.extensionsAmount": 0,
          "transaction.extensionsPrice": 0,
          "transaction.extensionsStatus": 0,
        },
      },
      {
        $sort: {
          transactionDate: 1,
        },
      },
    ]);

    const filteredData = filter
      ? data.filter((row) => {
          const transactionDate = new Date(row.transactionDate);
          return (
            transactionDate.getFullYear() === year &&
            transactionDate.getMonth() === month - 1
          );
        })
      : data;

    const groupedData = {};

    filteredData.forEach((ext) => {
      const dayKey = new Date(ext.transactionDate).getDate(); // Extract day number from the date

      if (!groupedData[dayKey]) {
        groupedData[dayKey] = {
          wholeDate: new Date(ext.transactionDate).toISOString().split("T")[0],
          day: dayKey,
          sum: 0,
        };
      }

      groupedData[dayKey].sum += ext.extensionsPrice;
    });

    const groupedArray = Object.values(groupedData);

    // Sample chart with ChartJS
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      type: "png",
      width: 800,
      height: 600,
    });
    const configuration = {
      type: "line",
      data: {
        labels: groupedArray.map((item) => item.day),
        datasets: [
          {
            label: "Jumlah Pemasukan",
            data: groupedArray.map((item) => item.sum),
            backgroundColor: "blue",
            borderColor: "blue",
          },
        ],
      },
    };

    // Generate chart image
    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

    // Write the chart image to the system because the PDF needs a path
    const tempImg = tmp.fileSync({ postfix: ".png" });
    fs.writeFileSync(tempImg.name, imageBuffer);

    const doc = new PDFDocument({ margin: 50, layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=report.pdf");

    doc.pipe(res);

    doc
      .fontSize(25)
      .text(
        "Universitas Islam Kalimantan Muhammad Arsyad Al Banjari Banjarmasin",
        { align: "center" }
      );

    doc
      .moveTo(doc.x, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown();

    doc
      .fontSize(20)
      .text("Grafis Penghasilan Perpanjangan Iklan", {
        align: "center",
        underline: true,
      })
      .moveDown();

    if (filter) {
      doc
        .fontSize(10)
        .text(`Tahun        : ${year}`)
        .text(`Bulan        : ${getMonthName(month)}`)
        .moveDown();
    }

    doc.image(tempImg.name, 170, 210, { width: 400 });

    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
});

module.exports = router;
