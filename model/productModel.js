const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: "" },
  type: {
    type: String,
    required: true,
    enum: ["vegetable", "fruit", "flower","Tools","fertilizers"],
  },
  specification: [
    {
      _id: false,
      name: { type: String },
      value: { type: String },
    },
  ],
  image: { type: mongoose.Schema.Types.ObjectId, ref: "Image", default: null },

  status: {
    type: String,
    enum: ["In Stock", "Out of Stock"],
    default: "In Stock",
  },
});


module.exports = mongoose.model("Product", productSchema);

