const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentType: {
    type: String,
    enum: ["COD", "Online"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
});

module.exports = mongoose.model("Payment", paymentSchema);
