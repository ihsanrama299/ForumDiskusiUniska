const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionType: {
    type: String,
    required: true,
  },
  transactionImageUrl: {
    type: String,
    required: true,
  },
  transactionDate: {
    type: Date,
    default: Date.now,
  },
  extensionsAmount: {
    type: Number,
  },
  extensionsPrice: {
    type: Number,
  },
  extensionsStatus: {
    type: String,
  },
});

const adSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    lowercase: true,
    required: true,
  },
  address: {
    type: String,
    lowercase: true,
    required: true,
  },
  adTitle: {
    type: String,
    required: true,
  },
  adLink: {
    type: String,
    required: true,
  },
  adDesc: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  plan: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  regDate: {
    type: Date,
    default: Date.now,
  },
  startDate: {
    type: Date,
    required: true,
  },
  finishedDate: {
    type: Date,
  },
  status: {
    type: String,
  },
  transaction: [transactionSchema],
});

adSchema.pre("save", function (next) {
  if (this.isNew && !this.finishedDate) {
    const startDate = this.startDate;
    const duration = this.duration;

    if (startDate && duration) {
      const finishedDate = new Date(startDate);
      finishedDate.setMonth(finishedDate.getMonth() + duration);
      this.finishedDate = finishedDate;
    }
  }
  next();
});

module.exports = mongoose.model("Ad", adSchema);
